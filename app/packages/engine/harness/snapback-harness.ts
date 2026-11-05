/**
 * Phase 4 harness — Snapback's mean-reversion runner against an
 * in-memory fake broker, in the Phase 1/3 style: the REAL runner
 * (src/snapback.ts) with only the broker client, the clock and the
 * state path substituted. Covers:
 *
 *   1. z-score trigger entry (live stretch vs the last 20 completed
 *      closes, population SD), sized at 20% of the book
 *   2. RSI(2) trigger entry (z-score NOT stretched — the OR leg alone)
 *   3. trend-filter block (price below the 200DMA with z < −2)
 *   4. no-signal evaluation (nothing fires, no orders, no events)
 *   5. Risk Gate rejections: position cap (one share > 20% of book),
 *      max positions (6/6), daily loss cap (1.5% of book)
 *   6. exits: reversion to the 20-day mean, +4% take profit, −5%
 *      stop loss, 5-trading-day max hold
 *   7. halt cancels HER open orders
 *   8. kill + liquidate closes ONLY her tracked positions (a foreign
 *      position on the shared account is untouched; exits are
 *      quantity-sized sells, never closePosition)
 *   9. foreign broker position ignored at boot + refused at entry
 *  10. state persistence + boot reconcile of her own position across
 *      a restart (the reconciled position stays exit-managed)
 *  11. partial fill tracked at the broker-reported quantity
 *  12. boot re-seed: untouched $5,000 book → $10,000; touched stays
 *  13. Phase 6: the mean-reversion exit applies only to positions
 *      entered BELOW the mean (an RSI(2) entry above the mean holds
 *      and exits on +4% instead — the 2026-11-04 TSLA churn shape);
 *      same-day re-entry cooldown after an exit (next day allowed);
 *      legacy positions without the entry-side fields derive them
 *      at boot and behave accordingly
 *
 * Run: npx tsx harness/snapback-harness.ts   (from packages/engine)
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
} from "../src/alpaca.js";
import type { PaperControl } from "../src/paper.js";
import type { PendingLiquidation } from "../src/control.js";
import type { DailyBar } from "../src/indicators.js";
import { startSnapbackTrader } from "../src/snapback.js";

// ---------------------------------------------------------------- setup

const UNIVERSE = ["SPY", "QQQ", "IWM", "AAPL", "MSFT", "AMD", "NFLX", "TSLA"];

const snapbackBot: BotConfig = {
  name: "Snapback",
  codename: "snapback",
  enabled: true,
  mode: "paper",
  market: "us_stocks",
  broker: "alpaca",
  strategy: "mean_reversion",
  viz: { color: "#38bdf8", form: "avatar_disc", avatar_accessory: "cap" },
  universe: UNIVERSE,
  rules: {},
  risk: {
    // Exactly as gray-matter reads bots/snapback.md.
    max_position_pct: 20,
    max_positions: 6,
    stop_loss_pct: 5,
    max_daily_loss_pct: 1.5,
  },
  philosophy: "",
  sourcePath: "bots/snapback.md",
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

/** 240 daily bars ending Tue 2026-11-03 from an explicit closes list. */
function barsFromCloses(closes: number[]): DailyBar[] {
  const dates = weekdayDatesEnding("2026-11-03", closes.length);
  return closes.map((close, i) => ({
    date: dates[i]!, open: close, high: close, low: close, close,
  }));
}

const flat = (value: number, n: number): number[] =>
  Array.from({ length: n }, () => value);

/**
 * Z-trigger name: long base at $80 (200DMA ≈ $81.93), the last 20
 * closes are 19 × $100 + one $85 (mean $99.25, pop SD ≈ $3.27). A
 * live price of $90 gives z ≈ −2.83 with the price above the 200DMA.
 */
const zCloses = [...flat(80, 220), ...flat(100, 19), 85];
/**
 * RSI-trigger name: base at $79 (200DMA ≈ $80.15), the last 20 closes
 * step down $100 → $81 (mean $90.50, SD ≈ $5.77). Live $81: z ≈ −1.65
 * (no z fire) but the closing staircase drives RSI(2) to 0.
 */
const rsiCloses = [
  ...flat(79, 220),
  ...Array.from({ length: 20 }, (_, i) => 100 - i),
];
/**
 * Trend-block name: flat at $100 with the last close $97 (mean20
 * $99.85, SD ≈ $0.65, 200DMA ≈ $99.99). Live $97.50: z ≈ −3.59 fires,
 * but the price sits below the 200DMA — a warning, not an invitation.
 */
const trendBlockCloses = [...flat(100, 239), 97];
/**
 * Shallow-dip name for the mean-reversion exit: base at $80, last 20
 * closes 19 × $100 + $99 (mean $99.95, SD ≈ $0.22). Live $98 gives a
 * deep z with the 200DMA ≈ $82 — entry at $98, and a return to
 * $100.50 completes the reversion while staying under entry × 1.04.
 */
const shallowCloses = [...flat(80, 220), ...flat(100, 19), 99];
/**
 * Expensive name for the position-cap gate: base $2,000, last 20
 * closes 19 × $2,500 + $2,125 (mean $2,481.25, SD ≈ $81.73, 200DMA
 * ≈ $2,048.13). Live $2,250: z ≈ −2.83 fires above the trend line,
 * but one share ($2,250) exceeds 20% of the $10,000 book ($2,000).
 */
const priceyCloses = [...flat(2000, 220), ...flat(2500, 19), 2125];
/**
 * Above-mean RSI name (Phase 6 — the 2026-11-04 TSLA shape): the
 * last 20 closes are 10 × $60, 6 × $100, then 99/97/94/92 stepping
 * down (mean $79.10, SD ≈ $19.20, 200DMA ≈ $57.41). A live price of
 * $91.50 sits ABOVE the 20-day mean (z ≈ +0.65 — no z fire) but the
 * closing staircase drives RSI(2) to ≈ 1.5, so the RSI leg alone
 * enters, above the mean. +4% target: $95.16.
 */
const aboveMeanRsiCloses = [
  ...flat(55, 220),
  ...flat(60, 10),
  ...flat(100, 6),
  99, 97, 94, 92,
];

/** Capture console.log lines (the runners' summaries are console-only). */
function captureLogs(): { lines: string[]; stop: () => void } {
  const lines: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map((a) => String(a)).join(" "));
    orig(...args);
  };
  return {
    lines,
    stop: () => {
      console.log = orig;
    },
  };
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
  /** When set, buy orders fill only this many shares (partial fill). */
  partialFillQty: number | null = null;
  clockOpen = true;
  dailyBars = new Map<string, DailyBar[]>();
  latestPrices = new Map<string, number>();
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
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol: o.symbol, side: o.side, qty: o.qty,
      filledQty: 0, filledAvgPrice: null, status: "new",
      type: o.type, timeInForce: o.timeInForce,
    };
    if (this.fillEntries) {
      const price = this.latestPrices.get(o.symbol) ?? 50;
      const fillQty =
        o.side === "buy" && this.partialFillQty !== null
          ? Math.min(this.partialFillQty, o.qty)
          : o.qty;
      ord.status = "filled";
      ord.filledQty = fillQty;
      ord.filledAvgPrice = price;
      if (o.side === "buy") {
        const existing = this.positions.find((p) => p.symbol === o.symbol);
        if (existing) {
          existing.qty += fillQty;
        } else {
          this.positions.push({
            symbol: o.symbol, qty: fillQty, avgEntryPrice: price,
            currentPrice: price, marketValue: price * fillQty,
          });
        }
      } else {
        const existing = this.positions.find((p) => p.symbol === o.symbol);
        if (existing) {
          existing.qty -= fillQty;
          if (existing.qty <= 0) {
            this.positions = this.positions.filter((p) => p.symbol !== o.symbol);
          }
        }
      }
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
    // Snapback must NEVER call this (it would liquidate the whole
    // shared-account position in the symbol). Recorded so tests can
    // assert it stayed unused.
    this.closedSymbols.push(symbol);
    const pos = this.positions.find((p) => p.symbol === symbol);
    this.positions = this.positions.filter((p) => p.symbol !== symbol);
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol, side: "sell", qty: pos?.qty ?? 0,
      filledQty: pos?.qty ?? 0, filledAvgPrice: pos?.currentPrice ?? 0,
      status: "filled", type: "market", timeInForce: "day",
    };
    this.orders.set(id, ord);
    return { ...ord };
  }
  async getDailyBars(symbol: string) {
    return this.dailyBars.get(symbol) ?? [];
  }
  async getHourlyBars() {
    return [];
  }
  async getLatestPrice(symbol: string) {
    return this.latestPrices.get(symbol) ?? 50;
  }
  async getOptionContracts() {
    return [];
  }
  async getOptionSnapshots() {
    return new Map();
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

interface Scenario {
  broker: FakeBroker;
  control: FakeControl;
  events: FleetEvent[];
  statePath: string;
  setNow: (d: Date) => void;
}

function boot(opts: {
  seedState?: Record<string, unknown>;
  statePath?: string;
  setup?: (broker: FakeBroker, control: FakeControl) => void;
} = {}): Scenario {
  const dir = mkdtempSync(join(tmpdir(), "snapback-harness-"));
  const statePath = opts.statePath ?? join(dir, "paper-snapback-state.json");
  if (opts.seedState) {
    writeFileSync(statePath, JSON.stringify(opts.seedState));
  }
  const broker = new FakeBroker();
  const control = new FakeControl();
  opts.setup?.(broker, control);
  const events: FleetEvent[] = [];
  let current = new Date(T0);
  startSnapbackTrader(
    snapbackBot,
    broker,
    async (e) => {
      events.push(e);
    },
    control,
    { now: () => new Date(current), statePath, tickMs: 15 },
  );
  return {
    broker, control, events, statePath,
    setNow: (d) => {
      current = new Date(d);
    },
  };
}

const readState = (path: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

const entriesOf = (path: string): Record<string, { qty: number; entryPrice: number }> =>
  (readState(path) as { entries: Record<string, { qty: number; entryPrice: number }> }).entries;

/** Boot a scenario whose SPY carries the z-trigger fixture at $90. */
function bootZEntry(extra?: (s: Scenario) => void): Scenario {
  const s = boot({
    setup: (b) => {
      b.dailyBars.set("SPY", barsFromCloses(zCloses));
      b.latestPrices.set("SPY", 90);
    },
  });
  extra?.(s);
  return s;
}

// ---------------------------------------------------------------- tests

async function main(): Promise<void> {
  console.log("— S1: z-score trigger entry —");
  {
    const s = bootZEntry();
    await until("z entry order", () => s.broker.createdOrders.length === 1);
    const order = s.broker.createdOrders[0]!;
    check("z: entry is a market day BUY for SPY",
      order.symbol === "SPY" && order.side === "buy" &&
      order.type === "market" && order.timeInForce === "day",
      JSON.stringify(order));
    check("z: sized at 20% of the $10,000 book → floor($2,000 / $90) = 22 shares",
      order.qty === 22, `qty=${order.qty}`);
    await until("z fill tracked", () =>
      s.events.some((e) => e.type === "open" && e.symbol === "SPY"));
    const open = s.events.find((e) => e.type === "open" && e.symbol === "SPY");
    check("z: fill becomes an open event at $90 × 22",
      open?.price === 90 && open?.qty === 22);
    const approval = s.events.find(
      (e) => e.type === "signal" && e.symbol === "SPY");
    check("z: the decision record names the z-score leg and the Risk Gate approval",
      !!approval && approval.reason.includes("z-score") &&
      approval.reason.includes("Risk Gate: APPROVED") &&
      approval.reason.includes("200DMA"),
      approval?.reason);
    check("z: decision and fill share one decision_id",
      !!approval && open?.decision_id === approval.decision_id);
    check("z: state tracks the position",
      entriesOf(s.statePath).SPY?.qty === 22 &&
      entriesOf(s.statePath).SPY?.entryPrice === 90);
  }

  console.log("— S2: RSI(2) trigger entry (OR leg alone) —");
  {
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("QQQ", barsFromCloses(rsiCloses));
        b.latestPrices.set("QQQ", 81);
      },
    });
    await until("RSI entry order", () => s.broker.createdOrders.length === 1);
    const order = s.broker.createdOrders[0]!;
    check("rsi: entry fires for QQQ, qty floor($2,000 / $81) = 24",
      order.symbol === "QQQ" && order.qty === 24, JSON.stringify(order));
    const approval = s.events.find(
      (e) => e.type === "signal" && e.symbol === "QQQ");
    check("rsi: decision names the RSI(2) leg and NOT a z-score breach",
      !!approval && approval.reason.includes("RSI(2)") &&
      !approval.reason.includes("z-score -"),
      approval?.reason);
  }

  console.log("— S3: trend-filter block —");
  {
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("IWM", barsFromCloses(trendBlockCloses));
        b.latestPrices.set("IWM", 97.5);
      },
    });
    await until("trend-block decision", () =>
      s.events.some((e) => e.reason.includes("Trend filter: BLOCKED")));
    check("trend: z < −2 below the 200DMA → BLOCKED decision, no order",
      s.broker.createdOrders.length === 0 &&
      !s.events.some((e) => e.type === "open"));
  }

  console.log("— S4: no-signal evaluation —");
  {
    const s = boot();
    await sleep(400);
    check("no-signal: no orders and no decision events on a quiet book",
      s.broker.createdOrders.length === 0 && s.events.length === 0,
      `orders=${s.broker.createdOrders.length} events=${s.events.length}`);
    const st = readState(s.statePath) as { lastEvalHour?: string | null };
    check("no-signal: the hourly evaluation ran and persisted its hour key",
      st.lastEvalHour === "2026-11-04T10", `lastEvalHour=${st.lastEvalHour}`);
  }

  console.log("— S5: Risk Gate rejections —");
  {
    // Position cap: one share of the pricey name exceeds 20% of book.
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("NFLX", barsFromCloses(priceyCloses));
        b.latestPrices.set("NFLX", 2250);
      },
    });
    await until("position-cap rejection", () =>
      s.events.some((e) => e.reason.includes("position cap")));
    check("gate: one $2,250 share > $2,000 cap → REJECTED, no order",
      s.events.some((e) => e.reason.includes("Risk Gate: REJECTED")) &&
      s.broker.createdOrders.length === 0);
  }
  {
    // Max positions: six tracked positions already open; TSLA fires.
    const held = ["SPY", "QQQ", "IWM", "AAPL", "MSFT", "AMD"];
    const seedEntries: Record<string, unknown> = {};
    for (const sym of held) {
      seedEntries[sym] = {
        qty: 10, entryPrice: 50, entryDate: "2026-11-04", decisionId: `seed-${sym}`,
      };
    }
    const s = boot({
      seedState: { entries: seedEntries },
      setup: (b) => {
        for (const sym of held) {
          b.positions.push({
            symbol: sym, qty: 10, avgEntryPrice: 50,
            currentPrice: 50, marketValue: 500,
          });
        }
        b.dailyBars.set("TSLA", barsFromCloses(zCloses));
        b.latestPrices.set("TSLA", 90);
      },
    });
    await until("max-positions rejection", () =>
      s.events.some((e) => e.reason.includes("max positions reached")));
    check("gate: 6/6 positions open → TSLA signal REJECTED, no order",
      s.broker.createdOrders.length === 0 &&
      s.events.some((e) => e.symbol === "TSLA" && e.reason.includes("Risk Gate: REJECTED")));
  }
  {
    // Daily loss cap: −$160 realized today vs the −$150 cap (1.5%).
    const s = boot({
      seedState: {
        realizedTotal: -160,
        realizedByDay: { "2026-11-04": -160 },
      },
      setup: (b) => {
        b.dailyBars.set("SPY", barsFromCloses(zCloses));
        b.latestPrices.set("SPY", 90);
      },
    });
    await until("daily-loss rejection", () =>
      s.events.some((e) => e.reason.includes("daily loss cap hit")));
    check("gate: realized −$160 vs −$150 cap → SPY signal REJECTED, no order",
      s.broker.createdOrders.length === 0 &&
      s.events.some((e) => e.reason.includes("Risk Gate: REJECTED")));
  }

  console.log("— S6: exits —");
  {
    // Mean reversion: shallow dip entered at $98; $100.50 ≥ mean20
    // $99.95 but < entry × 1.04 ($101.92) isolates the reversion leg.
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("SPY", barsFromCloses(shallowCloses));
        b.latestPrices.set("SPY", 98);
      },
    });
    await until("shallow entry", () => s.broker.createdOrders.length === 1);
    check("exit setup: shallow-dip entry is 20 shares @ $98",
      s.broker.createdOrders[0]?.qty === 20);
    s.broker.latestPrices.set("SPY", 100.5);
    await until("mean-reversion close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const close = s.events.find((e) => e.type === "close");
    check("exit: reversion to the 20-day mean fires, pnl +$50.00",
      close?.pnl === 50 && close.reason.includes("reversion"),
      `pnl=${close?.pnl} reason=${close?.reason}`);
    check("exit: position removed from state after the fill",
      entriesOf(s.statePath).SPY === undefined);
  }
  {
    // Take profit: z-entry at $90; $93.70 ≥ $93.60 target, below the
    // $99.25 mean — the +4% leg fires.
    const s = bootZEntry();
    await until("z entry", () => s.broker.createdOrders.length === 1);
    s.broker.latestPrices.set("SPY", 93.7);
    await until("take-profit close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const close = s.events.find((e) => e.type === "close");
    check("exit: +4% take profit fires, pnl +$81.40",
      close?.pnl === 81.4 && close.reason.includes("take profit"),
      `pnl=${close?.pnl}`);
  }
  {
    // Stop loss: z-entry at $90; $85.40 ≤ $85.50 stop.
    const s = bootZEntry();
    await until("z entry", () => s.broker.createdOrders.length === 1);
    s.broker.latestPrices.set("SPY", 85.4);
    await until("stop-loss close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const close = s.events.find((e) => e.type === "close");
    check("exit: −5% stop loss fires, pnl −$101.20 booked to the day",
      close?.pnl === -101.2 && close.reason.includes("stop loss"),
      `pnl=${close?.pnl}`);
    const st = readState(s.statePath) as {
      realizedByDay?: Record<string, number>;
    };
    check("exit: the loss lands in realizedByDay for the daily cap",
      st.realizedByDay?.["2026-11-04"] === -101.2);
  }
  {
    // Time stop: entered Wed Nov 4; Wed Nov 11 is 5 trading days on;
    // price unchanged at $90 so no other leg can fire.
    const s = bootZEntry();
    await until("z entry", () => s.broker.createdOrders.length === 1);
    s.setNow(new Date("2026-11-11T15:00:00Z"));
    await until("time-stop close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const close = s.events.find((e) => e.type === "close");
    check("exit: 5-trading-day max hold fires flat (pnl $0)",
      close?.pnl === 0 && close.reason.includes("max hold"),
      `pnl=${close?.pnl} reason=${close?.reason}`);
  }

  console.log("— S7: halt cancels her open orders —");
  {
    const s = boot({
      setup: (b) => {
        b.fillEntries = false; // entry order rests unfilled
        b.dailyBars.set("SPY", barsFromCloses(zCloses));
        b.latestPrices.set("SPY", 90);
      },
    });
    await until("resting entry order", () => s.broker.createdOrders.length === 1);
    const openBefore = await s.broker.getOpenOrders();
    check("halt setup: one entry order resting", openBefore.length === 1);
    s.control.haltedSet.add("snapback");
    await until("order cancelled by halt",
      () => s.broker.cancelledIds.length >= 1);
    check("halt: HER resting entry order was cancelled",
      s.broker.cancelledIds[0] === openBefore[0]!.id);
    await sleep(200);
    check("halt: no new orders while halted",
      s.broker.createdOrders.length === 1);
  }

  console.log("— S8: kill + liquidate closes only her positions —");
  {
    const s = boot({
      seedState: {
        entries: {
          SPY: { qty: 10, entryPrice: 50, entryDate: "2026-11-04", decisionId: "seed-spy" },
        },
      },
      setup: (b, c) => {
        b.positions.push(
          { symbol: "SPY", qty: 10, avgEntryPrice: 50, currentPrice: 55, marketValue: 550 },
          { symbol: "NFLX", qty: 7, avgEntryPrice: 900, currentPrice: 910, marketValue: 6370 },
        );
        b.latestPrices.set("SPY", 55);
        c.liquidations.push({
          id: "liq-1", codename: "snapback", auditId: "audit-1",
          requestedAt: new Date().toISOString(),
        });
      },
    });
    await until("liquidation report", () => s.control.reports.length === 1);
    const report = s.control.reports[0]!;
    check("liquidate: report shows her SPY closed (qty 10 @ $55, pnl +$50), 0 failed",
      report.closed.length === 1 && report.failed.length === 0 &&
      report.closed[0]?.symbol === "SPY" && report.closed[0]?.pnl === 50,
      JSON.stringify(report));
    check("liquidate: the foreign NFLX position is untouched at the broker",
      s.broker.positions.some((p) => p.symbol === "NFLX" && p.qty === 7));
    check("liquidate: exit was a quantity-sized sell — closePosition never called",
      s.broker.closedSymbols.length === 0 &&
      s.broker.createdOrders.some(
        (o) => o.symbol === "SPY" && o.side === "sell" && o.qty === 10));
    await until("liquidation fill booked", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    check("liquidate: the fill books realized +$50 under her entry decision",
      s.events.some((e) => e.type === "close" && e.pnl === 50));
  }

  console.log("— S9: foreign position ignored at boot and refused at entry —");
  {
    const s = boot({
      setup: (b) => {
        // Trendia's TSLA shares sit on the shared account; Snapback's
        // own state is empty. TSLA also carries a live z-trigger.
        b.positions.push({
          symbol: "TSLA", qty: 5, avgEntryPrice: 200,
          currentPrice: 90, marketValue: 450,
        });
        b.dailyBars.set("TSLA", barsFromCloses(zCloses));
        b.latestPrices.set("TSLA", 90);
      },
    });
    await until("foreign-guard decision", () =>
      s.events.some((e) => e.reason.includes("another bot's position")));
    check("foreign: boot reconcile did NOT adopt the position (no open event)",
      !s.events.some((e) => e.type === "open"));
    check("foreign: the live signal is REJECTED at the gate — she never trades over it",
      s.broker.createdOrders.length === 0 &&
      s.events.some((e) => e.reason.includes("Risk Gate: REJECTED")));
    check("foreign: state still tracks nothing",
      Object.keys(entriesOf(s.statePath)).length === 0);
  }

  console.log("— S10: persistence + reconcile across a restart —");
  {
    const dir = mkdtempSync(join(tmpdir(), "snapback-harness-"));
    const statePath = join(dir, "paper-snapback-state.json");
    const s1 = boot({
      statePath,
      setup: (b) => {
        b.dailyBars.set("SPY", barsFromCloses(zCloses));
        b.latestPrices.set("SPY", 90);
      },
    });
    await until("first-boot entry fill", () =>
      s1.events.some((e) => e.type === "open" && e.symbol === "SPY"));
    check("persist: state file holds the filled position (22 @ $90)",
      entriesOf(statePath).SPY?.qty === 22 &&
      entriesOf(statePath).SPY?.entryPrice === 90);
    // Restart: a fresh runner on the same state file; the broker
    // still holds her 22 shares.
    const s2 = boot({
      statePath,
      setup: (b) => {
        b.positions.push({
          symbol: "SPY", qty: 22, avgEntryPrice: 90,
          currentPrice: 90, marketValue: 1980,
        });
        b.dailyBars.set("SPY", barsFromCloses(zCloses));
        b.latestPrices.set("SPY", 90);
      },
    });
    await sleep(300);
    check("reconcile: her own position survives the restart in state",
      entriesOf(statePath).SPY?.qty === 22);
    s2.broker.latestPrices.set("SPY", 93.7);
    await until("post-restart take-profit exit", () =>
      s2.broker.createdOrders.some((o) => o.side === "sell"));
    check("reconcile: the reconciled position stays exit-managed (+4% sell submitted)",
      s2.broker.createdOrders.some(
        (o) => o.symbol === "SPY" && o.side === "sell" && o.qty === 22));
  }

  console.log("— S11: partial fill tracked at the reported quantity —");
  {
    const s = boot({
      setup: (b) => {
        b.partialFillQty = 10; // only 10 of the 22 shares fill
        b.dailyBars.set("SPY", barsFromCloses(zCloses));
        b.latestPrices.set("SPY", 90);
      },
    });
    await until("partial-fill open event", () =>
      s.events.some((e) => e.type === "open" && e.symbol === "SPY"));
    const open = s.events.find((e) => e.type === "open");
    check("partial: state and stream track 10 shares, labelled a partial fill",
      open?.qty === 10 && open.reason.includes("partial fill") &&
      entriesOf(s.statePath).SPY?.qty === 10,
      `qty=${open?.qty}`);
  }

  console.log("— S12: boot re-seed on the starting-capital doubling —");
  {
    const s = boot({ seedState: {
      startCapital: 5000, realizedTotal: 0, realizedByDay: {},
      entries: {}, pendingEntries: [], pendingExits: [],
    } });
    await sleep(250);
    const st = readState(s.statePath) as { startCapital?: number };
    check("re-seed: untouched $5,000 book re-seeds to $10,000",
      st.startCapital === 10000, `startCapital=${st.startCapital}`);

    const s2 = boot({ seedState: {
      startCapital: 5000, realizedTotal: -50, realizedByDay: {},
      entries: {}, pendingEntries: [], pendingExits: [],
    } });
    await sleep(250);
    const st2 = readState(s2.statePath) as { startCapital?: number };
    check("re-seed: a touched book (realized −$50) keeps its $5,000 start",
      st2.startCapital === 5000, `startCapital=${st2.startCapital}`);

    const s3 = boot({ seedState: {
      realizedTotal: 0, realizedByDay: {},
      entries: {}, pendingEntries: [], pendingExits: [],
    } });
    await sleep(250);
    const st3 = readState(s3.statePath) as { startCapital?: number };
    check("re-seed: a legacy file with no startCapital reads as $5,000 and re-seeds untouched",
      st3.startCapital === 10000, `startCapital=${st3.startCapital}`);
  }

  console.log("— S13: Phase 6 — entry-side exit gating, re-entry cooldown, legacy state —");
  {
    // RSI(2) entry ABOVE the mean: the position must HOLD through
    // ticks at/above the mean and exit on +4% — under the old rule
    // the first tick at/above the mean closed it (the TSLA churn).
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("SPY", barsFromCloses(aboveMeanRsiCloses));
        b.latestPrices.set("SPY", 91.5);
      },
    });
    await until("above-mean RSI entry order", () => s.broker.createdOrders.length === 1);
    const order = s.broker.createdOrders[0]!;
    check("above-mean: RSI(2)-leg entry fires above the 20-day mean, 21 shares",
      order.symbol === "SPY" && order.side === "buy" && order.qty === 21,
      JSON.stringify(order));
    await until("above-mean fill tracked", () =>
      s.events.some((e) => e.type === "open" && e.symbol === "SPY"));
    const st = readState(s.statePath) as {
      entries: Record<string, { entryMean?: number; entryBelowMean?: boolean }>;
    };
    check("above-mean: state records the entry mean ($79.10) and entryBelowMean=false",
      Math.abs((st.entries.SPY?.entryMean ?? 0) - 79.1) < 0.01 &&
      st.entries.SPY?.entryBelowMean === false,
      JSON.stringify(st.entries.SPY));
    // $95.00 ≥ mean ($79.10) but < the +4% target ($95.16): hold.
    s.broker.latestPrices.set("SPY", 95);
    await sleep(450);
    check("above-mean: NO mean-reversion exit while price rides above the entry mean",
      !s.events.some((e) => e.type === "close") &&
      !s.broker.createdOrders.some((o) => o.side === "sell") &&
      entriesOf(s.statePath).SPY?.qty === 21);
    s.broker.latestPrices.set("SPY", 95.3);
    await until("above-mean take-profit close", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const close = s.events.find((e) => e.type === "close");
    check("above-mean: the position exits on the +4% take profit instead, pnl +$79.80",
      close?.pnl === 79.8 && close.reason.includes("take profit"),
      `pnl=${close?.pnl} reason=${close?.reason}`);
  }
  {
    // Cooldown: shallow-dip entry exits at the mean; the same symbol
    // re-signals an hour later the same day → skipped (and counted);
    // the next trading day she may re-enter.
    const cap = captureLogs();
    const s = boot({
      setup: (b) => {
        b.dailyBars.set("SPY", barsFromCloses(shallowCloses));
        b.latestPrices.set("SPY", 98);
      },
    });
    await until("cooldown entry", () => s.broker.createdOrders.length === 1);
    s.broker.latestPrices.set("SPY", 100.5);
    await until("cooldown mean exit", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    const stAfterExit = readState(s.statePath) as {
      lastExitBySymbol?: Record<string, string>;
    };
    check("cooldown: the exit records SPY's last-exit date (2026-11-04) in state",
      stAfterExit.lastExitBySymbol?.SPY === "2026-11-04",
      JSON.stringify(stAfterExit.lastExitBySymbol));
    s.broker.latestPrices.set("SPY", 98);
    s.setNow(new Date("2026-11-04T16:00:00Z")); // 11:00 ET, same day
    await until("cooldown evaluation summary", () =>
      cap.lines.some(
        (l) => l.includes("hourly evaluation complete") && l.includes("1 cooldown-skips"),
      ));
    check("cooldown: same-day re-signal is skipped — no second buy, no second open",
      s.broker.createdOrders.filter((o) => o.side === "buy").length === 1 &&
      s.events.filter((e) => e.type === "open").length === 1);
    check("cooldown: the skip is surfaced in the hourly summary as a cooldown-skip",
      cap.lines.some((l) => l.includes("1 cooldown-skips")));
    s.setNow(new Date("2026-11-05T15:00:00Z")); // Thu 10:00 ET
    await until("next-day re-entry", () =>
      s.broker.createdOrders.filter((o) => o.side === "buy").length === 2);
    check("cooldown: next trading day she may re-enter the same symbol",
      s.broker.createdOrders.filter((o) => o.side === "buy").length === 2);
    cap.stop();
  }
  {
    // Legacy (a): a pre-Phase-6 position entered BELOW the mean
    // derives entryBelowMean=true at boot; the mean exit protects it.
    const s = boot({
      seedState: {
        entries: {
          SPY: { qty: 10, entryPrice: 98, entryDate: "2026-11-04", decisionId: "legacy-spy" },
        },
      },
      setup: (b) => {
        b.positions.push({
          symbol: "SPY", qty: 10, avgEntryPrice: 98,
          currentPrice: 98, marketValue: 980,
        });
        b.dailyBars.set("SPY", barsFromCloses(shallowCloses));
        b.latestPrices.set("SPY", 98);
      },
    });
    await until("legacy below-mean derivation persisted", () => {
      const st = readState(s.statePath) as {
        entries: Record<string, { entryBelowMean?: boolean }>;
      };
      return st.entries.SPY?.entryBelowMean === true;
    });
    const stA = readState(s.statePath) as {
      entries: Record<string, { entryMean?: number; entryBelowMean?: boolean }>;
    };
    check("legacy: a pre-Phase-6 position below the mean derives entryBelowMean=true (mean $99.95) at boot",
      stA.entries.SPY?.entryBelowMean === true &&
      Math.abs((stA.entries.SPY?.entryMean ?? 0) - 99.95) < 0.01,
      JSON.stringify(stA.entries.SPY));
    s.broker.latestPrices.set("SPY", 100.5);
    await until("legacy mean exit", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "SPY"));
    check("legacy: the derived position still exits at the mean, pnl +$25.00",
      s.events.some(
        (e) => e.type === "close" && e.pnl === 25 && e.reason.includes("reversion"),
      ));
  }
  {
    // Legacy (b): a pre-Phase-6 position entered ABOVE the mean
    // derives entryBelowMean=false; price ≥ mean all day must NOT
    // churn it out (stop $95.57 / target $104.62 stay untouched).
    const s = boot({
      seedState: {
        entries: {
          SPY: { qty: 10, entryPrice: 100.6, entryDate: "2026-11-04", decisionId: "legacy-spy-hi" },
        },
      },
      setup: (b) => {
        b.positions.push({
          symbol: "SPY", qty: 10, avgEntryPrice: 100.6,
          currentPrice: 100.6, marketValue: 1006,
        });
        b.dailyBars.set("SPY", barsFromCloses(shallowCloses));
        b.latestPrices.set("SPY", 100.6);
      },
    });
    await until("legacy above-mean derivation persisted", () => {
      const st = readState(s.statePath) as {
        entries: Record<string, { entryBelowMean?: boolean }>;
      };
      return st.entries.SPY?.entryBelowMean === false;
    });
    await sleep(450);
    check("legacy: a pre-Phase-6 position above the mean derives entryBelowMean=false and is NOT churned out at the mean",
      !s.events.some((e) => e.type === "close") &&
      !s.broker.createdOrders.some((o) => o.side === "sell") &&
      entriesOf(s.statePath).SPY?.qty === 10);
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
