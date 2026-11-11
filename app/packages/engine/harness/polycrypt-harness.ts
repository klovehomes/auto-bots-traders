/**
 * Phase 12 harness — PolyCrypt9000's paper runner with a mocked
 * Alpaca client (crypto sleeve) and a fake Kalshi client (prediction
 * sleeve):
 *
 *   1. crypto: Donchian breakout + volume + ATR confirmation places a
 *      market buy (gtc) sized at 15% of the book; the 2× ATR trailing
 *      stop exits it; fills/pnl book to the crypto sub-ledger
 *   2. kalshi: an 10pt edge vs the last-traded anchor is sized by
 *      quarter-Kelly halved (252 contracts on a $5,000 sleeve at
 *      55¢ — the arithmetic is asserted), enters, and exits when the
 *      bid returns to within 1pt of the anchor; <24h-to-close and
 *      low-volume markets are skipped even with bigger edges
 *   3. the Polymarket SHADOW bookkeeping note is emitted and — by
 *      construction — no Polymarket order exists anywhere in the run
 *   4. gate veto: combined realized losses past the 2.5% cap reject
 *      BOTH sleeves (one cap, two sleeves) with no orders placed
 *   5. missing Kalshi keys: a sleeve-level NO-TRADE decision lands
 *      while the crypto sleeve trades on unaffected
 *   6. reconcile: an untracked broker crypto position is foreign —
 *      never adopted, never sold
 *   7. scanKalshiEdges / kalshiOrderSize pure-rule checks
 *
 * Run: npx tsx harness/polycrypt-harness.ts   (from packages/engine)
 * Exit code 0 = all checks passed.
 */
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from "node:fs";
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
import type { KalshiClientLike, KalshiMarket, KalshiOrder } from "../src/kalshi.js";
import type { PaperControl } from "../src/paper.js";
import type { PendingLiquidation } from "../src/control.js";
import type { DailyBar, TimedBar } from "../src/indicators.js";
import {
  kalshiOrderSize,
  scanKalshiEdges,
  startPolyCryptTrader,
} from "../src/polycrypt.js";

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

const polyBot: BotConfig = {
  name: "PolyCrypt9000",
  codename: "polycrypt9000",
  enabled: true,
  mode: "paper + shadow",
  market: "polymarket + crypto",
  broker: "polymarket (shadow first) + alpaca (crypto paper)",
  strategy: "prediction_mispricing + crypto_breakout",
  viz: { color: "#fbbf24", form: "avatar_disc", avatar_accessory: "robot antenna" },
  rules: {},
  risk: { max_daily_loss_pct: "2.5 (the whole bot — both sleeves combined under one Risk Gate cap)" },
  philosophy: "",
  sourcePath: "bots/polycrypt9000.md",
  raw: {},
};

const NOW = new Date("2026-11-06T12:00:00Z");

/** Hourly bars ending one hour before NOW; optional breakout final bar. */
function bars(now: Date, breakout: boolean, base = 100): TimedBar[] {
  const out: TimedBar[] = [];
  const n = 80;
  for (let i = 0; i < n; i++) {
    const start = new Date(now.getTime() - (n - i) * 3_600_000);
    const isLast = i === n - 1;
    if (isLast && breakout) {
      out.push({ timestamp: start.toISOString(), open: base, high: base + 7, low: base + 2, close: base + 5, volume: 250 });
    } else {
      out.push({ timestamp: start.toISOString(), open: base, high: base + 0.3, low: base - 0.3, close: base, volume: 100 });
    }
  }
  return out;
}

interface CreatedOrder {
  symbol: string;
  qty: number;
  side: string;
  type: string;
  timeInForce: string;
  limitPrice?: number;
}

class FakeAlpaca implements AlpacaClientLike {
  positions: AlpacaPosition[] = [];
  createdOrders: CreatedOrder[] = [];
  latestPrices = new Map<string, number>();
  cryptoBars = new Map<string, TimedBar[]>();
  private orders = new Map<string, AlpacaOrder>();
  private seq = 0;

  async getAccount() { return { status: "ACTIVE", equity: 50000, cash: 50000 }; }
  async getClock() { return { isOpen: true, timestamp: NOW.toISOString(), nextOpen: "", nextClose: "" }; }
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
    const fillPrice = o.limitPrice ?? this.latestPrices.get(o.symbol) ?? 0;
    const ord: AlpacaOrder = {
      id, symbol: o.symbol, side: o.side, qty: o.qty,
      filledQty: o.qty, filledAvgPrice: fillPrice, status: "filled",
      type: o.type, timeInForce: o.timeInForce,
    };
    this.orders.set(id, ord);
    return { ...ord };
  }
  async cancelOrder(id: string) {
    const o = this.orders.get(id);
    if (o && o.status !== "filled") o.status = "canceled";
  }
  async closePosition(symbol: string) { throw new Error(`closePosition(${symbol}) must never be used by polycrypt`); }
  async getDailyBars(): Promise<DailyBar[]> { return []; }
  async getHourlyBars(): Promise<TimedBar[]> { return []; }
  async getLatestPrice(symbol: string) { return this.latestPrices.get(symbol) ?? 0; }
  async getOptionContracts(): Promise<OptionContract[]> { return []; }
  async getOptionSnapshots(): Promise<Map<string, OptionSnapshot>> { return new Map(); }
  async getCryptoBars(symbol: string) { return this.cryptoBars.get(symbol) ?? []; }
  async getCryptoLatestPrice(symbol: string) { return this.latestPrices.get(symbol) ?? 0; }
}

class FakeKalshi implements KalshiClientLike {
  markets: KalshiMarket[] = [];
  createdOrders: { ticker: string; side: string; action: string; count: number; price: number }[] = [];
  private orders = new Map<string, KalshiOrder>();
  private seq = 0;

  async getBalance() { return { balanceCents: 500000, portfolioValueCents: 500000 }; }
  async getMarkets() { return this.markets.map((m) => ({ ...m })); }
  async getMarket(ticker: string) {
    const m = this.markets.find((x) => x.ticker === ticker);
    return m ? { ...m } : null;
  }
  async createOrder(o: { ticker: string; side: "yes" | "no"; action: "buy" | "sell"; count: number; price: number }) {
    this.createdOrders.push({ ...o });
    const ord: KalshiOrder = {
      id: `kord-${++this.seq}`, ticker: o.ticker, side: o.side, action: o.action,
      count: o.count, filledCount: o.count, status: "executed", price: o.price,
    };
    this.orders.set(ord.id, ord);
    return { ...ord };
  }
  async getOrder(id: string) {
    const o = this.orders.get(id);
    if (!o) throw new Error(`kalshi order ${id} not found`);
    return { ...o };
  }
  async cancelOrder(id: string) {
    const o = this.orders.get(id);
    if (o) o.status = "canceled";
  }
}

class FakeControl implements PaperControl {
  haltedSet = new Set<string>();
  liquidations: PendingLiquidation[] = [];
  isHalted = (codename: string): boolean => this.haltedSet.has(codename);
  drainLiquidations = (): PendingLiquidation[] => {
    const q = this.liquidations;
    this.liquidations = [];
    return q;
  };
  reportLiquidation = async (): Promise<void> => undefined;
}

function edgeMarket(overrides: Partial<KalshiMarket> = {}): KalshiMarket {
  return {
    ticker: "KXEDGE",
    title: "Edge market",
    yesBid: 0.53, yesAsk: 0.55, noBid: 0.45, noAsk: 0.47,
    lastPrice: 0.65, volume: 5000,
    closeTime: new Date(NOW.getTime() + 72 * 3_600_000).toISOString(),
    status: "active", result: null,
    ...overrides,
  };
}

const dir = mkdtempSync(join(tmpdir(), "polycrypt-harness-"));
function readState(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, any>;
}

// ------------------------------------------------------------ 7: pure rules
{
  const markets = [
    edgeMarket(),
    edgeMarket({ ticker: "KXSOON", lastPrice: 0.9, yesAsk: 0.7, yesBid: 0.68, closeTime: new Date(NOW.getTime() + 12 * 3_600_000).toISOString() }),
    edgeMarket({ ticker: "KXTHIN", volume: 50 }),
    edgeMarket({ ticker: "KXWIDE", yesBid: 0.3, yesAsk: 0.55 }),
    edgeMarket({ ticker: "KXNOEDGE", lastPrice: 0.56 }),
  ];
  const found = scanKalshiEdges(markets, NOW);
  check("scan: only the clean edge survives", found.length === 1 && found[0]!.market.ticker === "KXEDGE", `got ${found.map((f) => f.market.ticker).join(",")}`);
  check("scan: edge arithmetic", found[0]!.edge === 0.65 - 0.55 && found[0]!.side === "yes");
  check(
    "sizing: quarter-Kelly halved = 252 contracts",
    kalshiOrderSize(0.1, 0.55, 5000, 10000) === 252,
    `got ${kalshiOrderSize(0.1, 0.55, 5000, 10000)}`,
  );
  check("sizing: 3%-of-book cap binds on a huge edge", kalshiOrderSize(0.5, 0.5, 5000, 10000) === 600);
  check("sizing: zero/negative edge → 0", kalshiOrderSize(0, 0.5, 5000, 10000) === 0);
}

// -------------------------------------------- 1+2+3: both sleeves trade
{
  const alpaca = new FakeAlpaca();
  alpaca.cryptoBars.set("BTC/USD", bars(NOW, true));
  alpaca.cryptoBars.set("ETH/USD", bars(NOW, false, 50));
  alpaca.cryptoBars.set("SOL/USD", bars(NOW, false, 20));
  alpaca.latestPrices.set("BTC/USD", 105);
  alpaca.latestPrices.set("ETH/USD", 50);
  alpaca.latestPrices.set("SOL/USD", 20);
  const kalshi = new FakeKalshi();
  kalshi.markets = [edgeMarket()];
  const events: FleetEvent[] = [];
  const statePath = join(dir, "main.json");
  startPolyCryptTrader(polyBot, { alpaca, kalshi }, async (e) => { events.push(e); }, new FakeControl(), {
    now: () => NOW, statePath, tickMs: 15,
  });

  await until("crypto buy order", () => alpaca.createdOrders.some((o) => o.symbol === "BTC/USD" && o.side === "buy"));
  const buy = alpaca.createdOrders.find((o) => o.symbol === "BTC/USD")!;
  check("crypto: market buy, gtc (crypto TIF)", buy.type === "market" && buy.timeInForce === "gtc");
  check("crypto: sized at 15% of the $10k book", Math.abs(buy.qty - 1500 / 105) < 0.01, `qty=${buy.qty}`);
  await until("crypto position tracked", () => existsSync(statePath) && readState(statePath).crypto?.["BTC/USD"] !== undefined);
  check("crypto: no ETH/SOL orders (no breakout)", !alpaca.createdOrders.some((o) => o.symbol !== "BTC/USD"));

  await until("kalshi entry order", () => kalshi.createdOrders.some((o) => o.ticker === "KXEDGE" && o.action === "buy"));
  const kBuy = kalshi.createdOrders.find((o) => o.ticker === "KXEDGE")!;
  check("kalshi: 252 contracts at the 55¢ offer", kBuy.count === 252 && kBuy.price === 0.55 && kBuy.side === "yes", `count=${kBuy.count}`);
  await until("kalshi position tracked", () => readState(statePath).kalshi?.KXEDGE !== undefined);
  check("shadow: Polymarket bookkeeping note emitted", events.some((e) => e.reason.includes("SHADOW") && e.reason.includes("Polymarket")));
  check("shadow: zero Polymarket orders exist in the run", !alpaca.createdOrders.some((o) => o.symbol.includes("PM")) && kalshi.createdOrders.every((o) => o.ticker === "KXEDGE"));

  // Crypto trailing stop: peak 105, ATR entry ≈ 1.34 → stop ≈ 102.3.
  alpaca.latestPrices.set("BTC/USD", 101);
  await until("crypto exit order", () => alpaca.createdOrders.some((o) => o.symbol === "BTC/USD" && o.side === "sell"));
  await until("crypto close booked", () => events.some((e) => e.type === "close" && e.symbol === "BTC/USD"));
  const cClose = events.find((e) => e.type === "close" && e.symbol === "BTC/USD")!;
  check("crypto: trailing-stop loss booked to the sleeve", cClose.pnl !== null && cClose.pnl < -50 && cClose.pnl > -60, `pnl=${cClose.pnl}`);

  // Kalshi exit: bid returns to within 1pt of the 0.65 anchor.
  kalshi.markets[0]!.yesBid = 0.645;
  await until("kalshi exit order", () => kalshi.createdOrders.some((o) => o.ticker === "KXEDGE" && o.action === "sell"));
  await until("kalshi close booked", () => events.some((e) => e.type === "close" && e.symbol === "KXEDGE"));
  const kClose = events.find((e) => e.type === "close" && e.symbol === "KXEDGE")!;
  check("kalshi: edge-closed exit books the capture", kClose.pnl === 23.94, `pnl=${kClose.pnl}`);
  const st = readState(statePath);
  check("ledgers: sleeves kept separate", st.cryptoRealized < 0 && st.kalshiRealized === 23.94, `crypto=${st.cryptoRealized} kalshi=${st.kalshiRealized}`);
}

// ------------------------------------------------------- 4: gate veto, both
{
  const alpaca = new FakeAlpaca();
  alpaca.cryptoBars.set("BTC/USD", bars(NOW, true));
  alpaca.latestPrices.set("BTC/USD", 105);
  const kalshi = new FakeKalshi();
  kalshi.markets = [edgeMarket()];
  const events: FleetEvent[] = [];
  const statePath = join(dir, "veto.json");
  writeFileSync(statePath, JSON.stringify({
    startCapital: 10000, cryptoRealized: -300, kalshiRealized: 0,
    realizedByDay: { "2026-11-06": -300 },
    crypto: {}, kalshi: {}, pendingCrypto: [], pendingKalshi: [],
    lastCryptoHour: null, lastKalshiScanKey: null, shadowNoteDate: null,
    kalshiMissingNoted: false, decisionCounter: 0,
  }));
  startPolyCryptTrader(polyBot, { alpaca, kalshi }, async (e) => { events.push(e); }, new FakeControl(), {
    now: () => NOW, statePath, tickMs: 15,
  });
  await until("both sleeves rejected", () =>
    events.filter((e) => e.reason.includes("Risk Gate: REJECTED")).length >= 2);
  check("veto: combined cap named for crypto", events.some((e) => e.symbol === "BTC/USD" && e.reason.includes("combined daily loss cap")));
  check("veto: combined cap named for kalshi", events.some((e) => e.symbol === "KXEDGE" && e.reason.includes("combined daily loss cap")));
  check("veto: zero orders on either venue", alpaca.createdOrders.length === 0 && kalshi.createdOrders.length === 0);
}

// ------------------------------------------- 5: kalshi keys missing, crypto ok
{
  const alpaca = new FakeAlpaca();
  alpaca.cryptoBars.set("BTC/USD", bars(NOW, true));
  alpaca.latestPrices.set("BTC/USD", 105);
  const events: FleetEvent[] = [];
  startPolyCryptTrader(polyBot, { alpaca, kalshi: null }, async (e) => { events.push(e); }, new FakeControl(), {
    now: () => NOW, statePath: join(dir, "nokey.json"), tickMs: 15,
  });
  await until("kalshi NO-TRADE decision", () => events.some((e) => e.reason.includes("Kalshi demo keys not loaded")));
  check("missing keys: NO-TRADE is explicit", events.some((e) => e.reason.includes("NO TRADE") && e.reason.includes("Kalshi")));
  await until("crypto still trades", () => alpaca.createdOrders.some((o) => o.symbol === "BTC/USD"));
  check("missing keys: crypto sleeve unaffected", alpaca.createdOrders.length >= 1);
}

// ------------------------------------------------------------- 6: foreign
{
  const alpaca = new FakeAlpaca();
  alpaca.positions.push({ symbol: "SOLUSD", qty: 3, avgEntryPrice: 20, currentPrice: 20, marketValue: 60 });
  alpaca.cryptoBars.set("BTC/USD", bars(NOW, false));
  alpaca.cryptoBars.set("ETH/USD", bars(NOW, false, 50));
  alpaca.cryptoBars.set("SOL/USD", bars(NOW, false, 20));
  alpaca.latestPrices.set("SOL/USD", 20);
  const statePath = join(dir, "foreign.json");
  startPolyCryptTrader(polyBot, { alpaca, kalshi: new FakeKalshi() }, async () => undefined, new FakeControl(), {
    now: () => NOW, statePath, tickMs: 15,
  });
  await sleep(300);
  check("foreign: untracked SOLUSD never adopted", readState(statePath).crypto?.["SOL/USD"] === undefined);
  check("foreign: no orders placed against it", alpaca.createdOrders.length === 0);
}

await sleep(50);
console.log(`\n${passed}/${passed + failed} checks passed`);
if (failures.length) console.log(`failures: ${failures.join("; ")}`);
process.exit(failed === 0 ? 0 : 1);
