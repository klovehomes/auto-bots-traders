/**
 * Broker surface the strategies trade against. Implemented by the Alpaca
 * SDK client on the VM (engine/src/alpaca.ts) and by a key-less client on
 * devices whose requests are signed inside the Rust vault.
 */
import type { DailyBar, TimedBar } from "./indicators.js";

export interface AlpacaPosition {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
}

export interface AlpacaOrder {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  filledQty: number;
  filledAvgPrice: number | null;
  status: string;
  type: string;
  timeInForce: string;
}

export interface AlpacaClock {
  isOpen: boolean;
  timestamp: string;
  nextOpen: string;
  nextClose: string;
}

/** One listed option contract (Phase 3: Vega's chain surface). */
export interface OptionContract {
  /** OCC symbol, e.g. AMD261120C00150000. */
  symbol: string;
  underlying: string;
  type: "call" | "put";
  strike: number;
  /** Expiration date (YYYY-MM-DD). */
  expiry: string;
  openInterest: number;
}

/** Latest quote + Greeks for one option contract (indicative feed). */
export interface OptionSnapshot {
  symbol: string;
  bid: number;
  ask: number;
  /** (bid + ask) / 2 when a two-sided quote exists, else null. */
  mid: number | null;
  lastPrice: number | null;
  /** Signed delta (negative for puts); null when the feed omits Greeks. */
  delta: number | null;
  iv: number | null;
}

export interface AlpacaClientLike {
  getAccount(): Promise<{ status: string; equity: number; cash: number }>;
  getClock(): Promise<AlpacaClock>;
  getPositions(): Promise<AlpacaPosition[]>;
  getOpenOrders(): Promise<AlpacaOrder[]>;
  getOrder(id: string): Promise<AlpacaOrder>;
  createOrder(order: {
    symbol: string;
    qty: number;
    side: "buy" | "sell";
    type: "market" | "limit";
    /** "gtc" is required for crypto orders (Phase 12: PolyCrypt9000). */
    timeInForce: "day" | "opg" | "gtc" | "ioc";
    /** Required when type is "limit" (per-share for equities, per-contract for options). */
    limitPrice?: number;
  }): Promise<AlpacaOrder>;
  cancelOrder(id: string): Promise<void>;
  /** Liquidate the entire position in `symbol` at market. */
  closePosition(symbol: string): Promise<AlpacaOrder>;
  /** Daily bars from `startISO`, ascending by session date. */
  getDailyBars(symbol: string, startISO: string): Promise<DailyBar[]>;
  getLatestPrice(symbol: string): Promise<number>;
  /** Hourly bars from `startISO`, ascending by bar start (Phase 3). */
  getHourlyBars(symbol: string, startISO: string): Promise<TimedBar[]>;
  /**
   * Listed option contracts for one underlying + type inside an expiry
   * window (Phase 3). Served by the Trading API's
   * GET /v2/options/contracts (v23 fix — contract discovery has never
   * lived on the Market Data API; the old v1beta1 data-host path 404'd
   * every pick). The JS SDK has no contracts surface, so this uses raw
   * REST with the same keys, on the paper or live Trading host per the
   * client's paper flag.
   */
  getOptionContracts(
    underlying: string,
    type: "call" | "put",
    expiryGte: string,
    expiryLte: string,
  ): Promise<OptionContract[]>;
  /**
   * Snapshots (latest quote + Greeks + IV) for option contract symbols,
   * on the free indicative feed (Phase 3).
   */
  getOptionSnapshots(symbols: string[]): Promise<Map<string, OptionSnapshot>>;
  /**
   * Hourly crypto bars (Phase 12: PolyCrypt9000's breakout sleeve) from
   * the Market Data API's crypto endpoint — the JS SDK's stock bars do
   * not serve crypto pairs. Bars carry volume (the breakout rule
   * confirms on it). Symbol form: "BTC/USD".
   */
  getCryptoBars(symbol: string, startISO: string): Promise<TimedBar[]>;
  /** Latest crypto trade price for a pair like "BTC/USD" (Phase 12). */
  getCryptoLatestPrice(symbol: string): Promise<number>;
}
