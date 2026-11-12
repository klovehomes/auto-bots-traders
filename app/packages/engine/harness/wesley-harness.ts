/**
 * Phase 12 harness — Wesley's wheel runner against an in-memory fake
 * broker (the vega-harness pattern: the REAL runner, only the broker
 * client, clock and state path substituted):
 *
 *   A. CSP entry: monthly cycle beats weekly on premium %, sizing in
 *      100-share blocks, premium lands in the cash ledger, the strike
 *      cash is reserved; early exit at 50% of premium banks the rent
 *   B. defense: a short at 2× premium is bought back at MARKET
 *   C. assignment: an expired ITM put with shares at the broker turns
 *      into a share block at the strike, and the next evaluation sells
 *      a covered call against it; foreign positions are ignored
 *   D. Risk Gate veto: a book already past the 6% daily loss cap gets
 *      a REJECTED decision and NO order reaches the broker
 *   E. pickWheelContract pure-rule checks (band, delta, OI, spread,
 *      premium floor, cycle choice)
 *
 * Run: npx tsx harness/wesley-harness.ts   (from packages/engine)
 * Exit code 0 = all checks passed.
 */
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
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
import type { DailyBar, TimedBar } from "../src/indicators.js";
import { pickWheelContract, startWesleyTrader } from "../src/wesley.js";

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
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function until(what: string, cond: () => boolean, timeoutMs = 6000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for: ${what}`);
    await sleep(20);
  }
}

const wesleyBot: BotConfig = {
  name: "Wesley",
  codename: "wesley",
  enabled: true,
  mode: "paper",
  market: "us_options",
  broker: "alpaca",
  strategy: "options_income_wheel",
  viz: { color: "#4ade80", form: "avatar_disc", avatar_accessory: "bow tie" },
  watchlist_examples: ["F", "INTC", "BAC", "PFE", "T", "VZ", "SOFI", "RIVN", "NU", "WBD", "DRAM", "CAVA", "CART"],
  rules: { underlying_price_min: 5, underlying_price_max: 55 },
  risk: {
    max_position_pct: "100 (one position may use the whole account)",
    max_positions: 4,
    max_daily_loss_pct: 6,
  },
  philosophy: "",
  sourcePath: "bots/wesley.md",
  raw: {},
};

function occ(underlying: string, yymmdd: string, cp: string, strike: number): string {
  return `${underlying}${yymmdd}${cp}${String(Math.round(strike * 1000)).padStart(8, "0")}`;
}
function contract(symbol: string, underlying: string, type: "call" | "put", strike: number, expiry: string, oi: number): OptionContract {
  return { symbol, underlying, type, strike, expiry, openInterest: oi };
}
function snapshot(symbol: string, bid: number, ask: number, delta: number | null): OptionSnapshot {
  return { symbol, bid, ask, mid: bid > 0 && ask > 0 ? (bid + ask) / 2 : null, lastPrice: null, delta, iv: null };
}

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
  clockOpen = true;
  latestPrices = new Map<string, number>();
  contracts = new Map<string, OptionContract[]>();
  snapshots = new Map<string, OptionSnapshot>();
  private orders = new Map<string, AlpacaOrder>();
  private seq = 0;

  async getAccount() { return { status: "ACTIVE", equity: 50000, cash: 50000 }; }
  async getClock() { return { isOpen: this.clockOpen, timestamp: new Date().toISOString(), nextOpen: "", nextClose: "" }; }
  async getPositions() { return this.positions.map((p) => ({ ...p })); }
  async getOpenOrders() { return [...this.orders.values()].filter((o) => o.status === "new").map((o) => ({ ...o })); }
  async getOrder(id: string) {
    const o = this.orders.get(id);
    if (!o) throw new Error(`order ${id} not found`);
    return { ...o };
  }
  async createOrder(o: { symbol: string; qty: number; side: "buy" | "sell"; type: "market" | "limit"; timeInForce: "day" | "opg" | "gtc" | "ioc"; limitPrice?: number }) {
    this.createdOrders.push({ ...o });
    const id = `ord-${++this.seq}`;
    const fillPrice = o.limitPrice ?? this.snapshots.get(o.symbol)?.mid ?? this.latestPrices.get(o.symbol) ?? 1;
    const ord: AlpacaOrder = {
      id, symbol: o.symbol, side: o.side, qty: o.qty,
      filledQty: o.qty, filledAvgPrice: fillPrice, status: "filled",
      type: o.type, timeInForce: o.timeInForce,
    };
    this.orders.set(id, ord);
    // Reflect option fills in positions (short = negative qty).
    if (o.symbol.length > 6 && /[CP]\d{8}$/.test(o.symbol)) {
      const signed = o.side === "sell" ? -o.qty : o.qty;
      const existing = this.positions.find((p) => p.symbol === o.symbol);
      if (existing) {
        existing.qty += signed;
        if (existing.qty === 0) this.positions = this.positions.filter((p) => p.symbol !== o.symbol);
      } else if (signed !== 0) {
        this.positions.push({ symbol: o.symbol, qty: signed, avgEntryPrice: fillPrice, currentPrice: fillPrice, marketValue: fillPrice * signed * 100 });
      }
    }
    return { ...ord };
  }
  async cancelOrder(id: string) {
    this.cancelledIds.push(id);
    const o = this.orders.get(id);
    if (o && o.status !== "filled") o.status = "canceled";
  }
  async closePosition(symbol: string) {
    const pos = this.positions.find((p) => p.symbol === symbol);
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol, side: "sell", qty: pos?.qty ?? 0, filledQty: pos?.qty ?? 0,
      filledAvgPrice: pos?.currentPrice ?? 0, status: "filled", type: "market", timeInForce: "day",
    };
    this.orders.set(id, ord);
    this.positions = this.positions.filter((p) => p.symbol !== symbol);
    return { ...ord };
  }
  async getDailyBars(_symbol: string): Promise<DailyBar[]> { return []; }
  async getHourlyBars(_symbol: string): Promise<TimedBar[]> { return []; }
  async getLatestPrice(symbol: string) { return this.latestPrices.get(symbol) ?? 999; }
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
  async getCryptoBars() { return []; }
  async getCryptoLatestPrice() { return 0; }
}

class FakeControl implements PaperControl {
  haltedSet = new Set<string>();
  liquidations: PendingLiquidation[] = [];
  reports: { id: string; codename: string; closed: unknown[]; failed: unknown[] }[] = [];
  isHalted = (codename: string): boolean => this.haltedSet.has(codename);
  drainLiquidations = (): PendingLiquidation[] => {
    const q = this.liquidations;
    this.liquidations = [];
    return q;
  };
  reportLiquidation = async (id: string, codename: string, closed: never[], failed: never[]): Promise<void> => {
    this.reports.push({ id, codename, closed, failed });
  };
}

/** F @ $12: weekly put mid 0.15 (1.36%), monthly put mid 0.29 (2.64%) — monthly wins. */
const F_PUT_WEEKLY = occ("F", "261111", "P", 11);
const F_PUT_MONTHLY = occ("F", "261211", "P", 11);
function fChain(broker: FakeBroker): void {
  broker.contracts.set("F:put", [
    contract(F_PUT_WEEKLY, "F", "put", 11, "2026-11-11", 800),
    contract(F_PUT_MONTHLY, "F", "put", 11, "2026-12-11", 900),
  ]);
  broker.snapshots.set(F_PUT_WEEKLY, snapshot(F_PUT_WEEKLY, 0.145, 0.155, -0.25));
  broker.snapshots.set(F_PUT_MONTHLY, snapshot(F_PUT_MONTHLY, 0.285, 0.295, -0.27));
}

const T0 = new Date("2026-11-04T15:00:00Z"); // Wed 10:00 ET
const dir = mkdtempSync(join(tmpdir(), "wesley-harness-"));

function scenario(broker: FakeBroker, statePath: string, now: Date) {
  const events: FleetEvent[] = [];
  const control = new FakeControl();
  startWesleyTrader(wesleyBot, broker, async (e) => { events.push(e); }, control, {
    now: () => now,
    statePath,
    tickMs: 15,
  });
  return { events, control };
}

function readState(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, any>;
}

// ------------------------------------------------------------- E: pure pick
{
  const spot = 12;
  const today = "2026-11-04";
  const good = [
    { contract: contract(F_PUT_WEEKLY, "F", "put", 11, "2026-11-11", 800), snapshot: snapshot(F_PUT_WEEKLY, 0.145, 0.155, -0.25) },
    { contract: contract(F_PUT_MONTHLY, "F", "put", 11, "2026-12-11", 900), snapshot: snapshot(F_PUT_MONTHLY, 0.285, 0.295, -0.27) },
  ];
  const pick = pickWheelContract(good, today, "put", spot);
  check("pick: monthly wins on premium %", pick.ok && pick.candidate.cycle === "monthly" && pick.candidate.contract.symbol === F_PUT_MONTHLY);

  const badDelta = [
    { contract: contract(F_PUT_WEEKLY, "F", "put", 11, "2026-11-11", 800), snapshot: snapshot(F_PUT_WEEKLY, 0.145, 0.155, -0.45) },
  ];
  check("pick: delta outside 0.20–0.30 rejected", !pickWheelContract(badDelta, today, "put", spot).ok);

  const thinPremium = [
    { contract: contract(F_PUT_WEEKLY, "F", "put", 11, "2026-11-11", 800), snapshot: snapshot(F_PUT_WEEKLY, 0.045, 0.055, -0.25) },
  ];
  check("pick: premium below 1% floor rejected", !pickWheelContract(thinPremium, today, "put", spot).ok);

  const lowOi = [
    { contract: contract(F_PUT_WEEKLY, "F", "put", 11, "2026-11-11", 100), snapshot: snapshot(F_PUT_WEEKLY, 0.145, 0.155, -0.25) },
  ];
  check("pick: OI below 500 rejected", !pickWheelContract(lowOi, today, "put", spot).ok);

  const outOfBand = [
    { contract: contract(occ("F", "261111", "P", 10), "F", "put", 10, "2026-11-11", 800), snapshot: snapshot(occ("F", "261111", "P", 10), 0.145, 0.155, -0.25) },
  ];
  check("pick: strike beyond 10% OTM rejected", !pickWheelContract(outOfBand, today, "put", spot).ok);
}

// ------------------------------------------------- A: entry + early exit
{
  const broker = new FakeBroker();
  broker.latestPrices.set("F", 12);
  fChain(broker);
  const statePath = join(dir, "a.json");
  const { events } = scenario(broker, statePath, T0);

  await until("CSP sell order", () => broker.createdOrders.some((o) => o.side === "sell" && o.symbol === F_PUT_MONTHLY));
  const entry = broker.createdOrders.find((o) => o.symbol === F_PUT_MONTHLY)!;
  check("A: monthly CSP chosen", entry.type === "limit" && entry.limitPrice === 0.29);
  check("A: sized in 100-share blocks (9 contracts on $10k vs $1,100/block)", entry.qty === 9, `qty=${entry.qty}`);

  await until("short tracked in state", () => existsSync(statePath) && readState(statePath).shorts?.[F_PUT_MONTHLY] !== undefined);
  const st = readState(statePath);
  check("A: premium landed in cash ledger", st.cash === 10261, `cash=${st.cash}`);
  check("A: decision record approved through the gate", events.some((e) => e.reason.includes("Risk Gate: APPROVED") && e.reason.includes("CSP")));

  // Early exit: mid falls to ≤50% of the 0.29 collected.
  broker.snapshots.set(F_PUT_MONTHLY, snapshot(F_PUT_MONTHLY, 0.135, 0.145, -0.12));
  await until("early-exit buy order", () => broker.createdOrders.some((o) => o.side === "buy" && o.symbol === F_PUT_MONTHLY));
  await until("close event booked", () => events.some((e) => e.type === "close" && e.symbol === F_PUT_MONTHLY));
  const close = events.find((e) => e.type === "close" && e.symbol === F_PUT_MONTHLY)!;
  check("A: early exit realizes half the premium", close.pnl === 135, `pnl=${close.pnl}`);
  const st2 = readState(statePath);
  check("A: short removed + cash settled", st2.shorts[F_PUT_MONTHLY] === undefined && st2.cash === 10135, `cash=${st2.cash}`);
}

// ------------------------------------------------------------- B: defense
{
  const broker = new FakeBroker();
  broker.latestPrices.set("F", 12);
  fChain(broker);
  const statePath = join(dir, "b.json");
  const { events } = scenario(broker, statePath, T0);
  await until("B entry fill tracked", () => existsSync(statePath) && readState(statePath).shorts?.[F_PUT_MONTHLY] !== undefined);
  broker.snapshots.set(F_PUT_MONTHLY, snapshot(F_PUT_MONTHLY, 0.59, 0.61, -0.6));
  await until("defense buy order", () => broker.createdOrders.some((o) => o.side === "buy" && o.symbol === F_PUT_MONTHLY && o.type === "market"));
  await until("B close booked", () => events.some((e) => e.type === "close" && e.symbol === F_PUT_MONTHLY));
  const close = events.find((e) => e.type === "close" && e.symbol === F_PUT_MONTHLY)!;
  check("B: defense exits at market", broker.createdOrders.some((o) => o.side === "buy" && o.type === "market"));
  check("B: defense loss booked honestly", close.pnl === -279, `pnl=${close.pnl}`);
  check("B: decision names the defense", events.some((e) => e.reason.includes("defense") && e.reason.includes("2×")));
}

// --------------------------------------- C: assignment + covered call + foreign
{
  const broker = new FakeBroker();
  broker.latestPrices.set("F", 10.5);
  const F_CALL = occ("F", "261116", "C", 11.5);
  broker.contracts.set("F:call", [contract(F_CALL, "F", "call", 11.5, "2026-11-16", 900)]);
  broker.snapshots.set(F_CALL, snapshot(F_CALL, 0.116, 0.124, 0.24));
  // Shares posted at the broker (assignment); plus foreign positions.
  broker.positions.push({ symbol: "F", qty: 100, avgEntryPrice: 11, currentPrice: 10.5, marketValue: 1050 });
  broker.positions.push({ symbol: "INTC", qty: 25, avgEntryPrice: 40, currentPrice: 40, marketValue: 1000 });
  broker.positions.push({ symbol: occ("F", "261120", "C", 15), qty: 2, avgEntryPrice: 1, currentPrice: 1, marketValue: 200 });

  const statePath = join(dir, "c.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(statePath, JSON.stringify({
    startCapital: 10000,
    cash: 10015,
    realizedTotal: 0,
    realizedByDay: {},
    shorts: {
      [occ("F", "261106", "P", 11)]: {
        kind: "put", underlying: "F", strike: 11, expiry: "2026-11-06",
        qty: 1, entryPremium: 0.15, entryDate: "2026-10-30", decisionId: "wesley-1",
      },
    },
    shares: {},
    pending: [],
    lastEvalDate: null,
    decisionCounter: 1,
  }));

  const monday = new Date("2026-11-09T15:00:00Z"); // Mon 10:00 ET, after the Friday expiry
  const { events } = scenario(broker, statePath, monday);
  await until("share block booked", () => readState(statePath).shares?.F !== undefined);
  const st = readState(statePath);
  check("C: assigned 100 shares at the strike", st.shares.F.qty === 100 && st.shares.F.costBasis === 11);
  // Cash = 10015 seed − 1100 assignment conversion + 12 covered-call
  // premium (the call fills in the same tick sequence, before this read).
  check("C: secured cash converted (10015 − 1100 + 12 call premium)", st.cash === 8927, `cash=${st.cash}`);
  check("C: assignment decision on the record", events.some((e) => e.reason.includes("ASSIGNED")));

  await until("covered call sold", () => broker.createdOrders.some((o) => o.side === "sell" && o.symbol === F_CALL));
  check("C: covered call sold against the shares", broker.createdOrders.some((o) => o.symbol === F_CALL && o.qty === 1));
  check("C: foreign INTC shares never touched", !broker.createdOrders.some((o) => o.symbol === "INTC"));
  check("C: foreign option never touched", !broker.createdOrders.some((o) => o.symbol === occ("F", "261120", "C", 15)));
}

// ---------------------------------------------------------- D: gate veto
{
  const broker = new FakeBroker();
  broker.latestPrices.set("F", 12);
  fChain(broker);
  const statePath = join(dir, "d.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(statePath, JSON.stringify({
    startCapital: 10000,
    cash: 9300,
    realizedTotal: -700,
    realizedByDay: { "2026-11-04": -700 },
    shorts: {},
    shares: {},
    pending: [],
    lastEvalDate: null,
    decisionCounter: 0,
  }));
  const { events } = scenario(broker, statePath, T0);
  await until("gate rejection decision", () => events.some((e) => e.reason.includes("Risk Gate: REJECTED")));
  check("D: daily loss cap named in the verdict", events.some((e) => e.reason.includes("daily loss cap")));
  check("D: no order reached the broker", broker.createdOrders.length === 0);
}

await sleep(50);
console.log(`\n${passed}/${passed + failed} checks passed`);
if (failures.length) console.log(`failures: ${failures.join("; ")}`);
process.exit(failed === 0 ? 0 : 1);
