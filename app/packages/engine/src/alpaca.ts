import Alpaca from "@alpacahq/alpaca-trade-api";
import type { DailyBar, TimedBar } from "./indicators.js";

/**
 * Alpaca broker access.
 *
 * `checkAlpacaPaperConnection` (Phase 0) verifies the paper connection at
 * boot when keys are configured; with no keys it logs a clear stub-mode
 * message — it never fabricates a connection result.
 *
 * `createAlpacaClient` (Phase 1) returns the narrow typed surface the
 * paper-trading runner uses, or null when keys are not configured. The
 * runner is written against `AlpacaClientLike`, so tests can substitute
 * an in-memory fake without touching strategy or Risk Gate code.
 */

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
    timeInForce: "day" | "opg";
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
   * window (Phase 3). Served from the Market Data API — the JS SDK has
   * no contracts surface, so this uses raw REST with the same keys.
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
}

interface RawPosition {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
}

interface RawOrder {
  id: string;
  symbol: string;
  side: string;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  status: string;
  type: string;
  time_in_force: string;
}

function toOrder(o: RawOrder): AlpacaOrder {
  return {
    id: o.id,
    symbol: o.symbol,
    side: o.side,
    qty: Number(o.qty),
    filledQty: Number(o.filled_qty),
    filledAvgPrice:
      o.filled_avg_price === null ? null : Number(o.filled_avg_price),
    status: o.status,
    type: o.type,
    timeInForce: o.time_in_force,
  };
}

function keysConfigured(): { keyId: string; secretKey: string } | null {
  const keyId = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_API_SECRET;
  if (!keyId || !secretKey) return null;
  return { keyId, secretKey };
}

/** Build the SDK-backed client, or null when no keys are configured. */
export function createAlpacaClient(): AlpacaClientLike | null {
  const keys = keysConfigured();
  if (!keys) return null;
  const paper = (process.env.ALPACA_PAPER ?? "true") !== "false";
  // The SDK's typings are loose (any-heavy); treat the instance as a
  // record of async functions and map the raw REST shapes ourselves.
  const client = new Alpaca({
    keyId: keys.keyId,
    secretKey: keys.secretKey,
    paper,
  }) as unknown as Record<string, (...args: never[]) => unknown>;

  return {
    async getAccount() {
      const a = (await client.getAccount()) as {
        status: string;
        equity: string;
        cash: string;
      };
      return {
        status: a.status,
        equity: Number(a.equity),
        cash: Number(a.cash),
      };
    },

    async getClock() {
      const c = (await client.getClock()) as {
        is_open: boolean;
        timestamp: string;
        next_open: string;
        next_close: string;
      };
      return {
        isOpen: c.is_open,
        timestamp: c.timestamp,
        nextOpen: c.next_open,
        nextClose: c.next_close,
      };
    },

    async getPositions() {
      const raw = (await client.getPositions()) as RawPosition[];
      return raw.map((p) => ({
        symbol: p.symbol,
        qty: Number(p.qty),
        avgEntryPrice: Number(p.avg_entry_price),
        currentPrice: Number(p.current_price),
        marketValue: Number(p.market_value),
      }));
    },

    async getOpenOrders() {
      const raw = (await client.getOrders({
        status: "open",
        limit: 500,
      } as never)) as RawOrder[];
      return raw.map(toOrder);
    },

    async getOrder(id: string) {
      const raw = (await client.getOrder(id as never)) as RawOrder;
      return toOrder(raw);
    },

    async createOrder(order) {
      const raw = (await client.createOrder({
        symbol: order.symbol,
        qty: order.qty,
        side: order.side,
        type: order.type,
        time_in_force: order.timeInForce,
        ...(order.limitPrice !== undefined
          ? { limit_price: order.limitPrice }
          : {}),
      } as never)) as RawOrder;
      return toOrder(raw);
    },

    async cancelOrder(id: string) {
      await client.cancelOrder(id as never);
    },

    async closePosition(symbol: string) {
      const raw = (await client.closePosition(symbol as never)) as RawOrder;
      return toOrder(raw);
    },

    async getDailyBars(symbol: string, startISO: string) {
      const gen = client.getBarsV2(symbol as never, {
        start: startISO,
        timeframe: "1Day",
        limit: 1000,
        adjustment: "all",
      } as never) as AsyncGenerator<{
        Timestamp: string;
        OpenPrice: number;
        HighPrice: number;
        LowPrice: number;
        ClosePrice: number;
      }>;
      const bars: DailyBar[] = [];
      for await (const b of gen) {
        bars.push({
          date: String(b.Timestamp).slice(0, 10),
          open: b.OpenPrice,
          high: b.HighPrice,
          low: b.LowPrice,
          close: b.ClosePrice,
        });
      }
      bars.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      return bars;
    },

    async getLatestPrice(symbol: string) {
      const t = (await client.getLatestTrade(symbol as never)) as {
        Price: number;
      };
      return Number(t.Price);
    },

    async getHourlyBars(symbol: string, startISO: string) {
      const gen = client.getBarsV2(symbol as never, {
        start: startISO,
        timeframe: "1Hour",
        limit: 1000,
        adjustment: "all",
      } as never) as AsyncGenerator<{
        Timestamp: string;
        OpenPrice: number;
        HighPrice: number;
        LowPrice: number;
        ClosePrice: number;
      }>;
      const bars: TimedBar[] = [];
      for await (const b of gen) {
        bars.push({
          timestamp: String(b.Timestamp),
          open: b.OpenPrice,
          high: b.HighPrice,
          low: b.LowPrice,
          close: b.ClosePrice,
        });
      }
      bars.sort((a, b) =>
        a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
      );
      return bars;
    },

    async getOptionContracts(underlying, type, expiryGte, expiryLte) {
      const contracts: OptionContract[] = [];
      let pageToken: string | null = null;
      // The chain inside a 2–4 week window can exceed one page for the
      // most liquid names; follow next_page_token (bounded for safety).
      for (let page = 0; page < 10; page++) {
        const url = new URL(
          "https://data.alpaca.markets/v1beta1/options/contracts",
        );
        url.searchParams.set("underlying_symbols", underlying);
        url.searchParams.set("type", type);
        url.searchParams.set("expiration_date_gte", expiryGte);
        url.searchParams.set("expiration_date_lte", expiryLte);
        url.searchParams.set("limit", "1000");
        if (pageToken) url.searchParams.set("page_token", pageToken);
        const res = await fetch(url, {
          headers: {
            "APCA-API-KEY-ID": keys.keyId,
            "APCA-API-SECRET-KEY": keys.secretKey,
          },
        });
        if (!res.ok) {
          throw new Error(
            `option contracts for ${underlying}: HTTP ${res.status}`,
          );
        }
        const body = (await res.json()) as {
          option_contracts?: {
            symbol: string;
            underlying_symbol: string;
            type: string;
            strike_price: string;
            expiration_date: string;
            open_interest?: string;
          }[];
          next_page_token?: string | null;
        };
        for (const c of body.option_contracts ?? []) {
          contracts.push({
            symbol: c.symbol,
            underlying: c.underlying_symbol,
            type: c.type === "put" ? "put" : "call",
            strike: Number(c.strike_price),
            expiry: c.expiration_date,
            openInterest: Number(c.open_interest ?? 0),
          });
        }
        pageToken = body.next_page_token ?? null;
        if (!pageToken) break;
      }
      return contracts;
    },

    async getOptionSnapshots(symbols: string[]) {
      const out = new Map<string, OptionSnapshot>();
      // The snapshots endpoint accepts a bounded symbol list per call.
      for (let i = 0; i < symbols.length; i += 100) {
        const chunk = symbols.slice(i, i + 100);
        if (chunk.length === 0) continue;
        const url = new URL(
          "https://data.alpaca.markets/v1beta1/options/snapshots",
        );
        url.searchParams.set("symbols", chunk.join(","));
        // Free tier: the indicative feed. Real-time OPRA needs Alpaca's
        // paid tier (Phase 3 scope §5 — the shadow soak measures lag).
        url.searchParams.set("feed", "indicative");
        const res = await fetch(url, {
          headers: {
            "APCA-API-KEY-ID": keys.keyId,
            "APCA-API-SECRET-KEY": keys.secretKey,
          },
        });
        if (!res.ok) {
          throw new Error(`option snapshots: HTTP ${res.status}`);
        }
        const body = (await res.json()) as {
          snapshots?: Record<
            string,
            {
              latestQuote?: { bp?: number; ap?: number };
              latestTrade?: { p?: number };
              greeks?: { delta?: number };
              impliedVolatility?: number;
            }
          >;
        };
        for (const [symbol, s] of Object.entries(body.snapshots ?? {})) {
          const bid = Number(s.latestQuote?.bp ?? 0);
          const ask = Number(s.latestQuote?.ap ?? 0);
          out.set(symbol, {
            symbol,
            bid,
            ask,
            mid: ask > 0 && bid > 0 ? (bid + ask) / 2 : null,
            lastPrice:
              s.latestTrade?.p !== undefined ? Number(s.latestTrade.p) : null,
            delta:
              s.greeks?.delta !== undefined ? Number(s.greeks.delta) : null,
            iv:
              s.impliedVolatility !== undefined
                ? Number(s.impliedVolatility)
                : null,
          });
        }
      }
      return out;
    },
  };
}

export async function checkAlpacaPaperConnection(): Promise<void> {
  const keys = keysConfigured();
  if (!keys) {
    console.log(
      "[alpaca] stub mode: Alpaca keys not configured " +
        "(ALPACA_API_KEY / ALPACA_API_SECRET unset) — skipping broker connection check.",
    );
    return;
  }

  const paper = (process.env.ALPACA_PAPER ?? "true") !== "false";
  const client = new Alpaca({
    keyId: keys.keyId,
    secretKey: keys.secretKey,
    paper,
  });

  try {
    const account = (await client.getAccount()) as unknown as Record<
      string,
      unknown
    >;
    console.log(
      `[alpaca] ${paper ? "paper" : "LIVE"} connection OK — ` +
        `account status=${String(account.status)} equity=${String(account.equity)}`,
    );
  } catch (err) {
    console.error(
      "[alpaca] connection check failed:",
      err instanceof Error ? err.message : err,
    );
  }
}
