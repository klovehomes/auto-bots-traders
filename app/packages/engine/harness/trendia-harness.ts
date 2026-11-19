/**
 * v35 harness — Trendia's exit overhaul (Keith, 2026-11-19) against
 * an in-memory fake broker: the REAL paper runner (src/paper.ts)
 * with only the broker client, the state path and the tick cadence
 * substituted. (paper.ts has no clock injection — it reads the wall
 * clock; the fixtures use bars ending the day before the run date,
 * which are always "completed", and a null lastEvalDate makes the
 * first tick run the daily evaluation as a catch-up.)
 *
 * The v35 rule: her ONLY strategy exit is a daily close more than
 * 4% below the 50DMA (close < 50DMA × 0.96). The 8% trailing stop
 * and the 7% hard stop are gone. Cases:
 *
 *   1. close at 0.97×50DMA while 8.1% below the position's peak —
 *      NO exit (trailing stop gone). The seeded state carries the
 *      legacy `peak` field: it must load without crashing.
 *   2. close 10.0% below ENTRY but still above 0.96×50DMA —
 *      NO exit (hard stop gone).
 *   3. close at 0.95×50DMA — EXIT fires, with the close, the 50DMA
 *      and the % below in the decision record, and a params
 *      snapshot carrying the new rule (no stop_loss/trailing text).
 *   4. the bot config carries NO stop_loss_pct at all — the runner
 *      must not need it (the field was removed from trendia.md).
 *
 * Run: npx tsx harness/trendia-harness.ts   (from packages/engine)
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

process.env.PAPER_TICK_MS = "20";
const { startPaperTrader } = await import("../src/paper.js");

// ---------------------------------------------------------------- setup

const trendiaBot: BotConfig = {
  name: "Trendia",
  codename: "trendia",
  enabled: true,
  mode: "paper",
  market: "us_stocks",
  broker: "alpaca",
  strategy: "momentum_trend",
  viz: { color: "#22d3ee", form: "avatar_disc", avatar_accessory: "visor" },
  universe: ["AAPL", "SPY"],
  rules: {},
  risk: {
    // Exactly as gray-matter reads the v35 bots/trendia.md — note
    // there is deliberately NO stop_loss_pct anymore.
    max_position_pct: 20,
    min_notional: 95,
    max_positions: 5,
    exit_below_50dma_pct: 4,
    max_daily_loss_pct: 1.5,
  },
  philosophy: "",
  sourcePath: "bots/trendia.md",
  raw: {},
};

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
  timeoutMs = 5000,
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

/**
 * 240 daily bars ending Wed 2026-11-18 (always "completed" relative
 * to any later run date): 239 flat closes at `base`, final close
 * `lastClose`. The 50DMA is then (49×base + lastClose) / 50.
 */
function barsEnding(base: number, lastClose: number): DailyBar[] {
  const closes = [...Array.from({ length: 239 }, () => base), lastClose];
  const dates = weekdayDatesEnding("2026-11-18", closes.length);
  return closes.map((close, i) => ({
    date: dates[i]!, open: close, high: close, low: close, close,
  }));
}

// ---------------------------------------------------------- fake broker

class FakeBroker implements AlpacaClientLike {
  positions: AlpacaPosition[] = [];
  closedSymbols: string[] = [];
  createdOrders: { symbol: string; side: string }[] = [];
  dailyBars = new Map<string, DailyBar[]>();
  private orders = new Map<string, AlpacaOrder>();
  private seq = 0;

  async getAccount() {
    return { status: "ACTIVE", equity: 50000, cash: 50000 };
  }
  async getClock() {
    return { isOpen: true, timestamp: new Date().toISOString(), nextOpen: "", nextClose: "" };
  }
  async getPositions() {
    return this.positions.map((p) => ({ ...p }));
  }
  async getOpenOrders() {
    return [...this.orders.values()].filter((o) => o.status === "new").map((o) => ({ ...o }));
  }
  async getOrder(id: string) {
    const o = this.orders.get(id);
    if (!o) throw new Error(`order ${id} not found`);
    return { ...o };
  }
  async createOrder(o: { symbol: string; qty: number; side: "buy" | "sell"; type: "market" | "limit"; timeInForce: "day" | "opg"; limitPrice?: number }) {
    this.createdOrders.push({ symbol: o.symbol, side: o.side });
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol: o.symbol, side: o.side, qty: o.qty,
      filledQty: o.qty, filledAvgPrice: 100, status: "filled",
      type: o.type, timeInForce: o.timeInForce,
    };
    this.orders.set(id, ord);
    return { ...ord };
  }
  async cancelOrder() {}
  async closePosition(symbol: string) {
    this.closedSymbols.push(symbol);
    const pos = this.positions.find((p) => p.symbol === symbol);
    const id = `ord-${++this.seq}`;
    const ord: AlpacaOrder = {
      id, symbol, side: "sell", qty: pos?.qty ?? 0,
      filledQty: pos?.qty ?? 0, filledAvgPrice: pos?.currentPrice ?? 0,
      status: "filled", type: "market", timeInForce: "day",
    };
    this.orders.set(id, ord);
    this.positions = this.positions.filter((p) => p.symbol !== symbol);
    return { ...ord };
  }
  async getDailyBars(symbol: string) {
    return this.dailyBars.get(symbol) ?? [];
  }
  async getHourlyBars() {
    return [];
  }
  async getLatestPrice() {
    return 100;
  }
  async getOptionContracts() {
    return [];
  }
  async getOptionSnapshots() {
    return new Map();
  }
}

class FakeControl implements PaperControl {
  isHalted = (): boolean => false;
  drainLiquidations = (): PendingLiquidation[] => [];
  reportLiquidation = async (): Promise<void> => {};
}

interface Scenario {
  broker: FakeBroker;
  events: FleetEvent[];
  statePath: string;
}

function boot(opts: {
  entryPrice: number;
  peak: number;
  lastClose: number;
}): Scenario {
  const dir = mkdtempSync(join(tmpdir(), "trendia-harness-"));
  const statePath = join(dir, "paper-trendia-state.json");
  // Legacy (pre-v35) state shape: the entry carries a `peak` field.
  writeFileSync(statePath, JSON.stringify({
    startCapital: 10000,
    realizedTotal: 0,
    realizedByDay: {},
    entries: {
      AAPL: {
        qty: 10, entryPrice: opts.entryPrice, peak: opts.peak,
        decisionId: "seed-aapl",
      },
    },
    pendingEntries: [],
    pendingExits: [],
    lastEvalDate: null,
    decisionCounter: 1,
  }));
  const broker = new FakeBroker();
  broker.positions.push({
    symbol: "AAPL", qty: 10, avgEntryPrice: opts.entryPrice,
    currentPrice: opts.lastClose, marketValue: opts.lastClose * 10,
  });
  broker.dailyBars.set("AAPL", barsEnding(100, opts.lastClose));
  broker.dailyBars.set("SPY", barsEnding(100, 100));
  const events: FleetEvent[] = [];
  process.env.PAPER_STATE_PATH = statePath;
  startPaperTrader(trendiaBot, broker, async (e) => {
    events.push(e);
  }, new FakeControl());
  return { broker, events, statePath };
}

const entriesOf = (path: string): Record<string, unknown> =>
  (JSON.parse(readFileSync(path, "utf8")) as { entries: Record<string, unknown> }).entries;

// ---------------------------------------------------------------- tests

async function main(): Promise<void> {
  console.log("— T1: down 8.1% from peak, close at 0.97×50DMA → NO exit —");
  {
    // 50DMA = (49×100 + 97)/50 = 99.94; exit line = 95.94.
    // Close 97 = 0.9706×50DMA and 8.1% below the seeded peak 105.6 —
    // the removed trailing stop would have sold; v35 must hold.
    const s = boot({ entryPrice: 100, peak: 105.6, lastClose: 97 });
    await sleep(900);
    check("legacy state with a `peak` field loads and the position stays tracked",
      entriesOf(s.statePath).AAPL !== undefined);
    check("no exit order and no close event (trailing stop is gone)",
      s.broker.closedSymbols.length === 0 &&
      !s.events.some((e) => e.type === "close"),
      `closed=${JSON.stringify(s.broker.closedSymbols)} events=${s.events.length}`);
  }

  console.log("— T2: down 10.0% from entry, close above 0.96×50DMA → NO exit —");
  {
    // 50DMA = (49×100 + 97.2)/50 = 99.944; exit line = 95.95.
    // Close 97.2 is exactly −10.0% vs the $108 entry — the removed
    // 7% hard stop would have sold; v35 must hold.
    const s = boot({ entryPrice: 108, peak: 108, lastClose: 97.2 });
    await sleep(900);
    check("no exit order and no close event (hard stop is gone)",
      s.broker.closedSymbols.length === 0 &&
      !s.events.some((e) => e.type === "close") &&
      entriesOf(s.statePath).AAPL !== undefined,
      `closed=${JSON.stringify(s.broker.closedSymbols)}`);
  }

  console.log("— T3: close at 0.95×50DMA → EXIT —");
  {
    // 50DMA = (49×100 + 95)/50 = 99.90; exit line = 95.90.
    // Close 95 = 0.9510×50DMA — more than 4% below → sell.
    const s = boot({ entryPrice: 100, peak: 100, lastClose: 95 });
    await until("exit close booked", () =>
      s.events.some((e) => e.type === "close" && e.symbol === "AAPL"));
    const close = s.events.find((e) => e.type === "close")!;
    check("exit fired via closePosition for AAPL",
      s.broker.closedSymbols.includes("AAPL"));
    check("close books pnl −$50.00 (10 × ($95 − $100))",
      close.pnl === -50, `pnl=${close.pnl}`);
    const signal = s.events.find(
      (e) => e.type === "signal" && e.reason.includes("EXIT"));
    check("decision record names the close ($95.00), the 50DMA ($99.90) and the % below (4.9%)",
      !!signal && signal.reason.includes("$95.00") &&
      signal.reason.includes("50DMA $99.90") &&
      signal.reason.includes("4.9% below"),
      signal?.reason);
    check("params snapshot carries the new rule and NO stop_loss / trailing_stop text",
      !!signal && signal.reason.includes("exit_rule") &&
      signal.reason.includes("more than 4% below the 50DMA") &&
      !signal.reason.includes("stop_loss") &&
      !signal.reason.includes("trailing_stop"),
      signal?.reason);
    check("position removed from state after the fill",
      entriesOf(s.statePath).AAPL === undefined);
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
