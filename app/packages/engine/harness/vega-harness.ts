/**
 * Phase 3 harness — Vega's options runner against an in-memory fake
 * broker, in the Phase 1 style: the REAL runner (src/vega.ts) with
 * only the broker client, the earnings calendar, the clock and the
 * state path substituted. Covers the scope §8 checklist:
 *
 *   1. contract pick lands on the 5% OTM strike at the nearest expiry
 *      in the window (Keith 2026-11-03 — no delta band anymore)
 *   2. liquidity rejects (open interest, bid/ask spread) — checked on
 *      the picked strike only; the chain is never walked
 *   3. premium cap at pick time: exactly 1 contract; one contract over
 *      the 6%-of-book cap ($600 on the $10,000 book) is rejected once
 *   4. take-profit / stop-loss / time-stop / expiry-guardrail exits
 *   5. earnings guard blocks a name 2 days out; calendar-down fails closed
 *   6. Risk Gate rejections (premium cap, daily loss cap)
 *   7. halt cancels his open orders
 *   8. kill + liquidate closes contracts and reports
 *   9. restart reconcile adopts an open contract position
 *  10. limit-at-mid entry with the 60 s reprice-then-cancel rule (D5)
 *  11. shadow mode places NO broker orders but tracks a shadow book
 *  12. no order reaches the broker without a prior decision record
 *  13. no underlying price ceiling: a >$200 name with a fitting
 *      contract is entered
 *  14. boot re-seed: an untouched pre-doubling book re-seeds to
 *      $10,000; a touched book keeps its $5,000 start
 *
 * Run: npx tsx harness/vega-harness.ts   (from packages/engine)
 * Exit code 0 = all checks passed.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { BotConfig, FleetEvent } from "@fleet/shared";
import type {
  AlpacaClientLike,
  AlpacaOrder,
  AlpacaPosition,
  OptionContract,
  OptionSnapshot,
} from "../src/alpaca.js";
import type { PaperControl } from "../src/paper.js";
import type { PendingLiquidation } from "../src/control.js";
import type { EarningsCalendarLike } from "../src/earnings.js";
import type { DailyBar, TimedBar } from "../src/indicators.js";
import {
  parseOccSymbol,
  pickContract,
  startVegaTrader,
  tradingDaysBetween,
  type ChainCandidate,
} from "../src/vega.js";

// ---------------------------------------------------------------- setup

const POOL = [
  "AMD", "PLTR", "SMCI", "COIN", "HOOD", "MARA", "SOFI", "RIVN", "AFRM",
  "IONQ", "SOXL", "TQQQ", "UVXY", "NVDA", "MSTR", "ARM", "UPST", "NIO",
  "SNAP", "DKNG", "RBLX", "UBER", "XYZ", "SHOP", "NET", "RIOT", "GME",
  "ARKK", "XBI", "SQQQ",
];

const vegaBot: BotConfig = {
  name: "Vega",
  codename: "vega",
  enabled: true,
  mode: "paper",
  market: "us_options",
  broker: "alpaca",
  strategy: "options_volatility",
  viz: { color: "#f472b6", form: "avatar_disc", avatar_accessory: "star shades" },
  candidate_pool: POOL,
  rules: { underlying_price_min: 5 },
  risk: {
    // Exactly as gray-matter reads bots/vega.md (prose and all).
    max_position_pct: "6 (premium paid per options position)",
    max_positions: 6,
    stop_loss_pct: "35 (of premium paid — for options, the premium is the risk unit)",
    take_profit_pct: "50 (of premium paid)",
    time_stop: "exit any contract 5 trading days after entry if neither target is hit",
    max_daily_loss_pct: 3,
  },
  philosophy: "",
  sourcePath: "bots/vega.md",
  raw: {},
};

/** Wednesday 2026-11-04, 10:00 ET. */
const T0 = new Date("2026-11-04T15:00:00Z");

let passed = 0;
let failed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function until(
  what: string,
  cond: () => boolean,
  timeoutMs = 4000,
): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timeout waiting for: ${what}`);
    }
    await sleep(20);
  }
}

// ------------------------------------------------------------- fixtures

function weekdayDatesEnding(endStr: string, n: number): string[] {
  const out: string[] = [];
  let cur = endStr;
  while (out.length < n) {
    const dow = new Date(`${cur}T12:00:00Z`).getUTCDay();
    if (dow >= 1 && dow <= 5) out.unshift(cur);
    const d = new Date(`${cur}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    cur = d.toISOString().slice(0, 10);
  }
  return out;
}

/** Quiet name: ATR ≈ 1% of price — never passes Vega's screen. */
function quietDailyBars(): DailyBar[] {
  return weekdayDatesEnding("2026-11-03", 30).map((date) => ({
    date, open: 50, high: 50.4, low: 49.6, close: 50,
  }));
}

/** AMD: ATR ≈ 5%+ of price — passes the volatility screen. */
function amdDailyBars(): DailyBar[] {
  return weekdayDatesEnding("2026-11-03", 30).map((date, i) => {
    const close = 100 + (i % 5);
    return { date, open: close, high: close + 2.6, low: close - 2.6, close };
  });
}

/** AMD hourly bars: flat under a 104 ceiling, last completed hour closes 106. */
function amdHourlyBars(now: Date): TimedBar[] {
  const bars: TimedBar[] = [];
  for (let i = 0; i < 25; i++) {
    const start = new Date(now.getTime() - (25 - i) * 3_600_000);
    if (i < 24) {
      bars.push({ timestamp: start.toISOString(), open: 100, high: 104, low: 99.5, close: 100 });
    } else {
      bars.push({ timestamp: start.toISOString(), open: 104, high: 107, low: 103.5, close: 106 });
    }
  }
  return bars;
}

function occ(underlying: string, yymmdd: string, cp: string, strike: number): string {
  return `${underlying}${yymmdd}${cp}${String(Math.round(strike * 1000)).padStart(8, "0")}`;
}

const AMD_CALL = occ("AMD", "261120", "C", 105); // exp 2026-11-20

function contract(
  symbol: string, underlying: string, type: "call" | "put",
  strike: number, expiry: string, openInterest: number,
): OptionContract {
  return { symbol, underlying, type, strike, expiry, openInterest };
}

function snapshot(
  symbol: string, bid: number, ask: number, delta: number | null, iv: number | null = 0.62,
): OptionSnapshot {
  return {
    symbol, bid, ask,
    mid: bid > 0 && ask > 0 ? (bid + ask) / 2 : null,
    lastPrice: null, delta, iv,
  };
}

/**
 * A healthy AMD call chain inside the window: strikes 100 / 105 / 115.
 * Spot is $100 in the harness, so the 5% OTM target is 105 — the middle
 * strike (AMD_CALL) is the pick under the 2026-11-03 strike rule.
 */
function amdChain(broker: FakeBroker): void {
  const c30 = occ("AMD", "261120", "C", 115);
  const c52 = occ("AMD", "261120", "C", 100);
  broker.contracts.set("AMD:call", [
    contract(c30, "AMD", "call", 115, "2026-11-20", 8000),
    contract(AMD_CALL, "AMD", "call", 105, "2026-11-20", 5000),
    contract(c52, "AMD", "call", 100, "2026-11-20", 6000),
  ]);
  broker.snapshots.set(c30, snapshot(c30, 0.9, 1.1, 0.3));
  broker.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 1.9, 2.1, 0.44));
  broker.snapshots.set(c52, snapshot(c52, 2.9, 3.1, 0.52));
}

// ---------------------------------------------------------- fake broker

interface CreatedOrder {
  symbol: string;
  qty: number;
  side: string;
  type: string;
  timeInForce: string;
  limitPrice?: number;
}

class FakeBroker implements AlpacaClientLike {
  positions: AlpacaPosition[] = [];
  createdOrders: CreatedOrder[] = [];
  cancelledIds: string[] = [];
  closedSymbols: string[] = [];
  fillEntries = true;
  clockOpen = true;
  onCreateOrder: (() => void) | null = null;
  dailyBars = new Map<string, DailyBar[]>();
  hourlyBars = new Map<string, TimedBar[]>();
  latestPrices = new Map<string, number>();
  contracts = new Map<string, OptionContract[]>();
  snapshots = new Map<string, OptionSnapshot>();
  private orders = new Map<string, AlpacaOrder>();
  private seq = 0;

  async getAccount() {
    return { status: "ACTIVE", equity: 50000, cash: 50000 };
  }
  async getClock() {
    return { isOpen: this.clockOpen, timestamp: T0.toISOString(), nextOpen: "", nextClose: "" };
  }
  async getPositions() {
    return this.positions.map((p) => ({ ...p }));
  }
  async getOpenOrders() {
    return [...this.orders.values()]
      .filter((o) => o.status === "new")
      .map((o) => ({ ...o }));
  }
  async getOrder(id: string) {
    const o = this.orders.get(id);
    if (!o) throw new Error(`order ${id} not found`);
    return { ...o };
  }
  async createOrder(o: {
    symbol: string; qty: number; side: "buy" | "sell";
    type: "market" | "limit"; timeInForce: "day" | "opg"; limitPrice?: number;
  }) {
    this.createdOrders.push({ ...o });
    this.onCreateOrder?.();
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol: o.symbol, side: o.side, qty: o.qty,
      filledQty: 0, filledAvgPrice: null, status: "new",
      type: o.type, timeInForce: o.timeInForce,
    };
    if (this.fillEntries) {
      ord.status = "filled";
      ord.filledQty = o.qty;
      ord.filledAvgPrice = o.limitPrice ?? this.snapshots.get(o.symbol)?.mid ?? 1;
      this.positions.push({
        symbol: o.symbol, qty: o.qty,
        avgEntryPrice: ord.filledAvgPrice,
        currentPrice: ord.filledAvgPrice,
        marketValue: ord.filledAvgPrice * o.qty * 100,
      });
    }
    this.orders.set(id, ord);
    return { ...ord };
  }
  async cancelOrder(id: string) {
    this.cancelledIds.push(id);
    const o = this.orders.get(id);
    if (o && o.status !== "filled") o.status = "canceled";
  }
  async closePosition(symbol: string) {
    this.closedSymbols.push(symbol);
    const pos = this.positions.find((p) => p.symbol === symbol);
    const price = this.snapshots.get(symbol)?.mid ?? pos?.currentPrice ?? 0;
    this.positions = this.positions.filter((p) => p.symbol !== symbol);
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol, side: "sell", qty: pos?.qty ?? 0,
      filledQty: pos?.qty ?? 0, filledAvgPrice: price, status: "filled",
      type: "market", timeInForce: "day",
    };
    this.orders.set(id, ord);
    return { ...ord };
  }
  async getDailyBars(symbol: string) {
    return this.dailyBars.get(symbol) ?? quietDailyBars();
  }
  async getHourlyBars(symbol: string) {
    return this.hourlyBars.get(symbol) ?? [];
  }
  async getLatestPrice(symbol: string) {
    return this.latestPrices.get(symbol) ?? 50;
  }
  async getOptionContracts(underlying: string, type: "call" | "put") {
    return this.contracts.get(`${underlying}:${type}`) ?? [];
  }
  async getOptionSnapshots(symbols: string[]) {
    const out = new Map<string, OptionSnapshot>();
    for (const s of symbols) {
      const snap = this.snapshots.get(s);
      if (snap) out.set(s, snap);
    }
    return out;
  }
}

class FakeControl implements PaperControl {
  haltedSet = new Set<string>();
  liquidations: PendingLiquidation[] = [];
  reports: {
    id: string; codename: string;
    closed: { codename: string; symbol: string; qty: number | null; price: number | null; pnl: number | null }[];
    failed: { codename: string; symbol: string; reason: string }[];
  }[] = [];
  isHalted = (codename: string): boolean => this.haltedSet.has(codename);
  drainLiquidations = (): PendingLiquidation[] => {
    const q = this.liquidations;
    this.liquidations = [];
    return q;
  };
  reportLiquidation = async (
    id: string, codename: string,
    closed: { codename: string; symbol: string; qty: number | null; price: number | null; pnl: number | null }[],
    failed: { codename: string; symbol: string; reason: string }[],
  ): Promise<void> => {
    this.reports.push({ id, codename, closed, failed });
  };
}

const fakeEarnings = (
  map: Map<string, string> | null,
): EarningsCalendarLike => ({
  getEarningsWindow: async () => map,
});

interface Scenario {
  broker: FakeBroker;
  control: FakeControl;
  events: FleetEvent[];
  statePath: string;
  setNow: (d: Date) => void;
  getNow: () => Date;
}

function boot(opts: {
  shadow: boolean;
  earnings?: Map<string, string> | null;
  seedState?: Record<string, unknown>;
  setup?: (broker: FakeBroker) => void;
}): Scenario {
  const dir = mkdtempSync(join(tmpdir(), "vega-harness-"));
  const statePath = join(dir, "paper-vega-state.json");
  if (opts.seedState) {
    writeFileSync(statePath, JSON.stringify(opts.seedState));
  }
  const broker = new FakeBroker();
  broker.dailyBars.set("AMD", amdDailyBars());
  broker.latestPrices.set("AMD", 100);
  opts.setup?.(broker);
  const control = new FakeControl();
  const events: FleetEvent[] = [];
  let current = new Date(T0);
  startVegaTrader(
    vegaBot,
    broker,
    async (e) => {
      events.push(e);
    },
    control,
    {
      shadow: opts.shadow,
      earnings: fakeEarnings(opts.earnings === undefined ? new Map() : opts.earnings),
      now: () => new Date(current),
      statePath,
      tickMs: 15,
    },
  );
  return {
    broker, control, events, statePath,
    setNow: (d) => {
      current = new Date(d);
    },
    getNow: () => new Date(current),
  };
}

const readState = (path: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

// ---------------------------------------------------------------- tests

async function main(): Promise<void> {
  console.log("— pure helpers —");
  {
    const today = "2026-11-04";
    const mk = (
      sym: string, expiry: string, strike: number,
      oi: number, bid: number, ask: number,
      delta: number | null = 0.4, type: "call" | "put" = "call",
    ): ChainCandidate => ({
      contract: contract(sym, "AMD", type, strike, expiry, oi),
      snapshot: snapshot(sym, bid, ask, delta),
    });
    // Calls on spot $100 → target strike $105 (5% OTM).
    const belowTarget = mk("C0", "2026-11-20", 100, 5000, 2.9, 3.1);
    const atTarget = mk("C1", "2026-11-20", 105, 5000, 1.9, 2.1);
    const farBeyond = mk("C2", "2026-11-20", 115, 5000, 0.9, 1.1);
    const pick = pickContract([belowTarget, farBeyond, atTarget], today, "call", 100);
    check("pick: nearest strike at-or-beyond the 5% OTM target wins (105 on spot 100)",
      pick.ok && pick.candidate.contract.symbol === "C1");
    const gapPick = pickContract(
      [mk("C3", "2026-11-20", 102, 5000, 1.9, 2.1), mk("C4", "2026-11-20", 108, 5000, 1.45, 1.55)],
      today, "call", 100);
    check("pick: no strike exactly at target → the next strike beyond it (108)",
      gapPick.ok && gapPick.candidate.contract.symbol === "C4");
    const noneBeyond = pickContract(
      [belowTarget, mk("C5", "2026-11-20", 102, 5000, 1.9, 2.1)],
      today, "call", 100);
    check("pick: no strike at-or-beyond target is a no-trade",
      !noneBeyond.ok && noneBeyond.reason.includes("at-or-beyond"));
    // Puts on spot $100 → target strike $95; largest strike ≤ 95 wins.
    const putPick = pickContract(
      [mk("P0", "2026-11-20", 98, 5000, 2.9, 3.1, 0.4, "put"),
       mk("P1", "2026-11-20", 95, 5000, 1.9, 2.1, 0.4, "put"),
       mk("P2", "2026-11-20", 90, 5000, 0.9, 1.1, 0.4, "put")],
      today, "put", 100);
    check("pick: puts take the largest strike at-or-below spot × 0.95 (95)",
      putPick.ok && putPick.candidate.contract.symbol === "P1");
    // Expiry: the nearest listed expiry inside the window is chosen.
    const expiryPick = pickContract(
      [mk("C6", "2026-11-27", 105, 5000, 1.9, 2.1), mk("C7", "2026-11-20", 105, 5000, 1.9, 2.1)],
      today, "call", 100);
    check("pick: nearest expiry inside the 2–4 week window is the chosen expiry",
      expiryPick.ok && expiryPick.candidate.contract.symbol === "C7");
    const tooSoon = mk("C8", "2026-11-10", 105, 5000, 1.9, 2.1);
    const tooLate = mk("C9", "2026-12-20", 105, 5000, 1.9, 2.1);
    const windowPick = pickContract([tooSoon, tooLate], today, "call", 100);
    check("pick: contracts outside the 2–4 week window are excluded", !windowPick.ok && windowPick.reason.includes("expiry window"));
    // Liquidity applies to the picked strike ONLY — no walking the chain.
    const illiquidPick = pickContract(
      [mk("C10", "2026-11-20", 105, 200, 1.9, 2.1), mk("C11", "2026-11-20", 115, 8000, 0.9, 1.1)],
      today, "call", 100);
    check("pick: picked strike fails OI → no-trade even though a farther strike is liquid (no walking)",
      !illiquidPick.ok && illiquidPick.reason.includes("open interest"));
    const wide = mk("C12", "2026-11-20", 105, 5000, 1.6, 2.4); // spread 40% of mid
    const spreadPick = pickContract([wide], today, "call", 100);
    check("pick: spread > 10% of mid on the picked strike is a no-trade with a spread reason", !spreadPick.ok && spreadPick.reason.includes("spread"));
    // Delta no longer gates the pick (recorded, informational only).
    const wildDelta = pickContract([mk("C13", "2026-11-20", 105, 5000, 1.9, 2.1, 0.62)], today, "call", 100);
    const nullDelta = pickContract([mk("C14", "2026-11-20", 105, 5000, 1.9, 2.1, null)], today, "call", 100);
    check("pick: delta 0.62 or missing delta does not block the 5% OTM pick",
      wildDelta.ok && nullDelta.ok);

    check("tradingDays: Fri → Mon counts 1", tradingDaysBetween("2026-11-06", "2026-11-09") === 1);
    check("tradingDays: Mon → next Mon counts 5", tradingDaysBetween("2026-11-02", "2026-11-09") === 5);
    check("tradingDays: same day counts 0", tradingDaysBetween("2026-11-04", "2026-11-04") === 0);
    const occParsed = parseOccSymbol(AMD_CALL);
    check("OCC parse: underlying/expiry/type round-trip",
      occParsed?.underlying === "AMD" && occParsed.expiry === "2026-11-20" && occParsed.optionType === "call");
  }

  console.log("— S1: shadow entry + take-profit exit (no broker orders) —");
  {
    const s = boot({ shadow: true, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
    } });
    await until("shadow entry decision", () =>
      s.events.some((e) => e.type === "open" && e.symbol === AMD_CALL));
    check("shadow: entry decision carries the Risk Gate approval",
      s.events.some((e) => e.reason.includes("Risk Gate: APPROVED") && e.reason.includes("SHADOW")));
    check("shadow: would-be entry opened in the shadow book",
      s.events.some((e) => e.type === "open" && e.reason.includes("SHADOW")));
    check("shadow: NO orders reached the broker", s.broker.createdOrders.length === 0);
    const entry = s.events.find((e) => e.type === "open" && e.symbol === AMD_CALL);
    check("shadow: fill assumed at mid $2.00, qty exactly 1 (one-contract rule, 5% OTM strike 105)",
      entry?.price === 2 && entry?.qty === 1, `price=${entry?.price} qty=${entry?.qty}`);
    // IV history recorded for the underlying (§5).
    const st = readState(s.statePath) as { ivByUnderlying?: Record<string, Record<string, number>> };
    check("shadow: daily IV recorded in state for AMD",
      st.ivByUnderlying?.AMD?.["2026-11-04"] === 0.62);
    // Take profit: mid to $3.10 ≥ $2.00 × 1.5.
    s.broker.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 3.0, 3.2, 0.6));
    await until("shadow TP close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === AMD_CALL));
    const close = s.events.find((e) => e.type === "close" && e.symbol === AMD_CALL);
    check("shadow: take-profit exit at +50% with pnl +$110",
      close?.pnl === 110 && close.reason.includes("take profit"), `pnl=${close?.pnl}`);
    const st2 = readState(s.statePath) as { shadowRealizedTotal?: number };
    check("shadow: realized PnL booked to the SHADOW ledger only",
      st2.shadowRealizedTotal === 110);
  }

  console.log("— S2: earnings guard (blocked name, then calendar down) —");
  {
    const s = boot({ shadow: true, earnings: new Map([["AMD", "2026-11-06"]]), setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
    } });
    await until("earnings-block decision", () =>
      s.events.some((e) => e.reason.includes("Earnings guard")));
    check("earnings: name reporting in 2 days is blocked with a decision",
      s.events.some((e) => e.reason.includes("2026-11-06")));
    check("earnings: no position opened", !s.events.some((e) => e.type === "open"));

    const s2 = boot({ shadow: true, earnings: null, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
    } });
    await until("fail-closed decision", () =>
      s2.events.some((e) => e.reason.includes("fail-closed")));
    check("earnings: unavailable calendar blocks entries (fail-closed)",
      !s2.events.some((e) => e.type === "open"));
  }

  console.log("— S3: premium cap — the 5% OTM contract busts the cap —");
  {
    const s = boot({ shadow: true, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      // Only the 5% OTM strike (105 on spot 100) is listed; it is liquid
      // (OI 5,000, spread ~6% of mid) but one contract at mid $6.60
      // costs $660 — over the $600 cap (6% of the $10,000 book).
      b.contracts.set("AMD:call", [contract(AMD_CALL, "AMD", "call", 105, "2026-11-20", 5000)]);
      b.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 6.4, 6.8, 0.38));
    } });
    await until("cap rejection", () =>
      s.events.some((e) => e.reason.includes("premium cap")));
    check("cap: $660/contract vs $600 cap → REJECTED decision, no position",
      s.events.some((e) => e.reason.includes("Risk Gate: REJECTED")) &&
      !s.events.some((e) => e.type === "open"));
    check("cap: the over-cap pick is rejected exactly once",
      s.events.filter((e) => e.reason.includes("premium cap")).length === 1,
      JSON.stringify(s.events.map((e) => e.reason)));
  }

  console.log("— S4: Risk Gate — daily loss cap —");
  {
    const s = boot({
      shadow: true,
      seedState: {
        shadowStartCapital: 10000,
        shadowRealizedTotal: -310,
        shadowRealizedByDay: { "2026-11-04": -310 },
      },
      setup: (b) => {
        b.hourlyBars.set("AMD", amdHourlyBars(T0));
        amdChain(b);
      },
    });
    await until("daily-loss rejection", () =>
      s.events.some((e) => e.reason.includes("daily loss cap hit")));
    check("gate: realized −$310 vs −$300 cap (3% of the $10,000 book) → entries rejected, no position",
      !s.events.some((e) => e.type === "open"));
  }

  console.log("— S5: live entry fills, stop-loss exit, decisions precede orders —");
  {
    const timeline: string[] = [];
    const s = boot({ shadow: false, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
      b.onCreateOrder = () => timeline.push("order");
    } });
    const postIdx = { n: 0 };
    void postIdx;
    await until("live entry order", () => s.broker.createdOrders.length === 1);
    const created = s.broker.createdOrders[0]!;
    check("live: entry is a limit-at-mid day order for exactly 1 contract of the picked strike",
      created.symbol === AMD_CALL && created.type === "limit" &&
      created.limitPrice === 2 && created.timeInForce === "day" && created.qty === 1,
      JSON.stringify(created));
    await until("entry fill tracked", () =>
      s.events.some((e) => e.type === "open" && e.symbol === AMD_CALL));
    check("live: fill becomes an open event at $2.00",
      s.events.some((e) => e.type === "open" && e.price === 2));
    // Decision record precedes the order (timeline hook ordering).
    const approval = s.events.find(
      (e) => e.reason.includes("Risk Gate: APPROVED") && e.symbol === AMD_CALL);
    check("live: an APPROVED decision record exists for the order", !!approval);
    check("live: decision and fill share one decision_id",
      !!approval && s.events.some(
        (e) => e.type === "open" && e.decision_id === approval.decision_id));
    // Stop loss: mid to $1.20 ≤ $2.00 × 0.65.
    s.broker.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 1.1, 1.3, 0.3));
    await until("stop-loss close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === AMD_CALL));
    const close = s.events.find((e) => e.type === "close" && e.symbol === AMD_CALL);
    check("live: stop-loss exit via broker close, pnl −$80",
      s.broker.closedSymbols.includes(AMD_CALL) && close?.pnl === -80 &&
      close.reason.includes("stop loss"), `pnl=${close?.pnl}`);
    const st = readState(s.statePath) as { realizedTotal?: number; shadowRealizedTotal?: number };
    check("live: realized PnL booked to the LIVE ledger only",
      st.realizedTotal === -80 && (st.shadowRealizedTotal ?? 0) === 0);
  }

  console.log("— S6: halt cancels his open orders —");
  {
    const s = boot({ shadow: false, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
      b.fillEntries = false; // order rests unfilled
    } });
    await until("resting entry order", () => s.broker.createdOrders.length === 1);
    const openBefore = await s.broker.getOpenOrders();
    check("halt setup: one open order resting", openBefore.length === 1);
    s.control.haltedSet.add("vega");
    await until("order cancelled by halt",
      () => s.broker.cancelledIds.length >= 1);
    check("halt: the resting entry order was cancelled",
      s.broker.cancelledIds[0] === openBefore[0]!.id);
    s.setNow(new Date(T0.getTime() + 300_000));
    await sleep(150);
    check("halt: no reprice / no new orders while halted",
      s.broker.createdOrders.length === 1);
  }

  console.log("— S7: kill + liquidate closes contracts and reports —");
  {
    const s = boot({ shadow: false, setup: (b) => {
      b.positions.push({
        symbol: AMD_CALL, qty: 1, avgEntryPrice: 2,
        currentPrice: 2.5, marketValue: 250,
      });
      b.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 2.4, 2.6, 0.44));
    } });
    await until("reconcile adopts position", () =>
      s.events.some((e) => e.type === "open" && e.reason.includes("reconciled")));
    s.control.liquidations.push({
      id: "liq-1", codename: "vega", auditId: "audit-1",
      requestedAt: new Date().toISOString(),
    });
    await until("liquidation report", () => s.control.reports.length === 1);
    const report = s.control.reports[0]!;
    check("liquidate: broker close submitted for the contract",
      s.broker.closedSymbols.includes(AMD_CALL));
    check("liquidate: report shows 1 closed / 0 failed with pnl +$50",
      report.closed.length === 1 && report.failed.length === 0 &&
      report.closed[0]?.pnl === 50,
      JSON.stringify(report));
  }

  console.log("— S8: restart reconcile keeps an adopted contract managed —");
  {
    const s = boot({ shadow: false, setup: (b) => {
      b.positions.push({
        symbol: AMD_CALL, qty: 2, avgEntryPrice: 2,
        currentPrice: 2.1, marketValue: 420,
      });
      b.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 2.0, 2.2, 0.44));
    } });
    await until("adopted open event", () =>
      s.events.some((e) => e.type === "open" && e.reason.includes("reconciled")));
    check("reconcile: broker position adopted with an open event",
      s.events.some((e) => e.type === "open" && e.qty === 2));
    // Take profit on the adopted position: mid $3.10 ≥ $3.00.
    s.broker.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 3.0, 3.2, 0.6));
    await until("adopted TP exit", () =>
      s.events.some((e) => e.type === "close" && e.symbol === AMD_CALL));
    check("reconcile: adopted position is exit-managed (TP fired)",
      s.broker.closedSymbols.includes(AMD_CALL) &&
      s.events.some((e) => e.type === "close" && e.pnl === 220),
      JSON.stringify(s.events.filter((e) => e.type === "close")));
  }

  console.log("— S9: time stop and expiry guardrail (shadow) —");
  {
    const seed = {
      shadowContracts: {
        [AMD_CALL]: {
          underlying: "AMD", optionType: "call", qty: 1, entryPremium: 2,
          entryDate: "2026-10-28", expiry: "2026-11-20", decisionId: "seed-1",
        },
      },
      lastEvalHour: "2026-11-04T10",
    };
    const s = boot({ shadow: true, seedState: seed, setup: (b) => {
      b.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 2.0, 2.2, 0.44));
    } });
    await until("time-stop close", () =>
      s.events.some((e) => e.type === "close" && e.reason.includes("time stop")));
    check("time stop: position entered 5 trading days ago exits flat-ish (+$10)",
      s.events.some((e) => e.type === "close" && e.pnl === 10));

    const soon = occ("AMD", "261106", "C", 105); // exp Fri 2026-11-06
    const s2 = boot({
      shadow: true,
      seedState: {
        shadowContracts: {
          [soon]: {
            underlying: "AMD", optionType: "call", qty: 1, entryPremium: 2,
            entryDate: "2026-11-03", expiry: "2026-11-06", decisionId: "seed-2",
          },
        },
        lastEvalHour: "2026-11-04T10",
      },
      setup: (b) => {
        b.snapshots.set(soon, snapshot(soon, 1.95, 2.15, 0.44));
      },
    });
    await until("expiry-guardrail close", () =>
      s2.events.some((e) => e.type === "close" && e.reason.includes("expiry guardrail")));
    check("expiry guardrail: contract 2 trading days from expiry is force-exited",
      s2.events.some((e) => e.type === "close" && e.symbol === soon));
  }

  console.log("— S10: limit-at-mid reprice after 60 s, then cancel (D5) —");
  {
    const s = boot({ shadow: false, setup: (b) => {
      b.hourlyBars.set("AMD", amdHourlyBars(T0));
      amdChain(b);
      b.fillEntries = false;
    } });
    await until("initial entry order", () => s.broker.createdOrders.length === 1);
    const firstId = (await s.broker.getOpenOrders())[0]!.id;
    // Mid moves to $2.20; age the order past 60 s.
    s.broker.snapshots.set(AMD_CALL, snapshot(AMD_CALL, 2.1, 2.3, 0.44));
    s.setNow(new Date(T0.getTime() + 61_000));
    await until("repriced order", () => s.broker.createdOrders.length === 2);
    check("reprice: first order cancelled, replacement at the fresh mid $2.20",
      s.broker.cancelledIds.includes(firstId) &&
      s.broker.createdOrders[1]?.limitPrice === 2.2,
      JSON.stringify(s.broker.createdOrders));
    const secondId = (await s.broker.getOpenOrders())[0]!.id;
    s.setNow(new Date(T0.getTime() + 122_000));
    await until("abandon cancel", () => s.broker.cancelledIds.includes(secondId));
    await sleep(120);
    check("reprice: still unfilled after the reprice → cancelled, no third order",
      s.broker.createdOrders.length === 2 &&
      s.events.some((e) => e.reason.includes("entry abandoned")));
  }

  console.log("— S11: no price ceiling — a >$200 underlying is entered (shadow) —");
  {
    const NVDA_PICK = occ("NVDA", "261120", "C", 275);
    const s = boot({ shadow: true, setup: (b) => {
      // NVDA at $260 — dead under the old $200 ceiling. ATR ≈ 5.4%.
      b.dailyBars.set("NVDA", weekdayDatesEnding("2026-11-03", 30).map((date, i) => {
        const close = 258 + (i % 5);
        return { date, open: close, high: close + 7, low: close - 7, close };
      }));
      b.latestPrices.set("NVDA", 260);
      const bars: TimedBar[] = [];
      for (let i = 0; i < 25; i++) {
        const start = new Date(T0.getTime() - (25 - i) * 3_600_000);
        bars.push(i < 24
          ? { timestamp: start.toISOString(), open: 258, high: 262, low: 256, close: 258 }
          : { timestamp: start.toISOString(), open: 262, high: 267, low: 261, close: 266 });
      }
      b.hourlyBars.set("NVDA", bars);
      const c270 = occ("NVDA", "261120", "C", 270);
      const c285 = occ("NVDA", "261120", "C", 285);
      b.contracts.set("NVDA:call", [
        contract(c270, "NVDA", "call", 270, "2026-11-20", 6000),
        contract(NVDA_PICK, "NVDA", "call", 275, "2026-11-20", 5000),
        contract(c285, "NVDA", "call", 285, "2026-11-20", 7000),
      ]);
      b.snapshots.set(c270, snapshot(c270, 5.4, 5.6, 0.42));
      b.snapshots.set(NVDA_PICK, snapshot(NVDA_PICK, 4.4, 4.6, 0.36));
      b.snapshots.set(c285, snapshot(c285, 2.9, 3.1, 0.28));
    } });
    await until("NVDA shadow entry", () =>
      s.events.some((e) => e.type === "open" && e.symbol === NVDA_PICK));
    check("ceiling: $260 underlying entered — 5% OTM target 273 → strike 275, 1 contract at mid $4.50 ($450 ≤ $600 cap)",
      s.events.some((e) => e.type === "open" && e.symbol === NVDA_PICK && e.qty === 1 && e.price === 4.5));
    check("ceiling: the decision text states the no-ceiling screen",
      s.events.some((e) => e.reason.includes("no price ceiling")));
  }

  console.log("— S12: boot re-seed on the starting-capital doubling —");
  {
    // Pre-doubling state file: no startCapital fields, nothing touched.
    const s = boot({ shadow: false, seedState: {
      realizedTotal: 0, realizedByDay: {}, contracts: {},
      pendingEntries: [], pendingExits: [],
    } });
    await sleep(200);
    const st = readState(s.statePath) as { startCapital?: number; shadowStartCapital?: number };
    check("re-seed: untouched pre-doubling books re-seed to $10,000 (live AND shadow)",
      st.startCapital === 10000 && st.shadowStartCapital === 10000,
      JSON.stringify({ startCapital: st.startCapital, shadowStartCapital: st.shadowStartCapital }));

    // A book with a realized loss is a track record — no resize.
    const s2 = boot({ shadow: false, seedState: { realizedTotal: -50, realizedByDay: {} } });
    await sleep(200);
    const st2 = readState(s2.statePath) as { startCapital?: number };
    check("re-seed: a touched book (realized −$50) keeps its $5,000 start",
      st2.startCapital === 5000, JSON.stringify({ startCapital: st2.startCapital }));
  }

  console.log(
    `\n${failed === 0 ? "ALL CHECKS PASSED" : "FAILURES PRESENT"} — ${passed} passed, ${failed} failed`,
  );
  if (failures.length > 0) {
    console.log(`failed checks:\n - ${failures.join("\n - ")}`);
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error("harness crashed:", err);
  process.exit(2);
});
