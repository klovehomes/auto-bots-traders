import Alpaca from "@alpacahq/alpaca-trade-api";
import { getPaperKeys } from "@fleet/shared";
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

/**
 * Build an error for a non-OK data-API response that carries the
 * HTTP status AND a bounded excerpt of the response body (Phase 6).
 * A bare "HTTP 404" explains nothing — on 2026-11-04 Vega's SMCI and
 * RBLX signals died on exactly that, invisibly. The body excerpt
 * (whitespace-collapsed, capped) is what Alpaca actually said, and it
 * lands in Vega's NO TRADE decision record via the thrown error.
 */
async function httpError(context: string, res: Response): Promise<Error> {
  let excerpt = "";
  try {
    excerpt = (await res.text()).replace(/\s+/g, " ").trim().slice(0, 300);
  } catch {
    // Body unreadable — the status alone will have to do.
  }
  return new Error(
    `${context}: HTTP ${res.status}${excerpt ? ` — ${excerpt}` : ""}`,
  );
}

function keysConfigured(): { keyId: string; secretKey: string } | null {
  // Phase 12 (v21): keys resolve through the shared key-file loader —
  // ~/traderbot-keys.txt (or KEYS_FILE) wins, environment is fallback.
  const keys = getPaperKeys();
  if (!keys.alpacaKeyId || !keys.alpacaSecretKey) return null;
  return { keyId: keys.alpacaKeyId, secretKey: keys.alpacaSecretKey };
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
          throw await httpError(`option contracts for ${underlying}`, res);
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
          throw await httpError("option snapshots", res);
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

    async getCryptoBars(symbol: string, startISO: string) {
      const bars: TimedBar[] = [];
      let pageToken: string | null = null;
      // ~45 days of hourly bars ≈ 1,100 rows; the endpoint pages at
      // 10,000, so this loop is a safety net, not the common path.
      for (let page = 0; page < 5; page++) {
        const url = new URL("https://data.alpaca.markets/v1beta3/crypto/us/bars");
        url.searchParams.set("symbols", symbol);
        url.searchParams.set("timeframe", "1Hour");
        url.searchParams.set("start", startISO);
        url.searchParams.set("limit", "10000");
        url.searchParams.set("sort", "asc");
        if (pageToken) url.searchParams.set("page_token", pageToken);
        const res = await fetch(url, {
          headers: {
            "APCA-API-KEY-ID": keys.keyId,
            "APCA-API-SECRET-KEY": keys.secretKey,
          },
        });
        if (!res.ok) {
          throw await httpError(`crypto bars for ${symbol}`, res);
        }
        const body = (await res.json()) as {
          bars?: Record<
            string,
            { t: string; o: number; h: number; l: number; c: number; v: number }[]
          >;
          next_page_token?: string | null;
        };
        for (const b of body.bars?.[symbol] ?? []) {
          bars.push({
            timestamp: b.t,
            open: Number(b.o),
            high: Number(b.h),
            low: Number(b.l),
            close: Number(b.c),
            volume: Number(b.v),
          });
        }
        pageToken = body.next_page_token ?? null;
        if (!pageToken) break;
      }
      bars.sort((a, b) =>
        a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
      );
      return bars;
    },

    async getCryptoLatestPrice(symbol: string) {
      const url = new URL(
        "https://data.alpaca.markets/v1beta3/crypto/us/latest/trades",
      );
      url.searchParams.set("symbols", symbol);
      const res = await fetch(url, {
        headers: {
          "APCA-API-KEY-ID": keys.keyId,
          "APCA-API-SECRET-KEY": keys.secretKey,
        },
      });
      if (!res.ok) {
        throw await httpError(`crypto latest trade for ${symbol}`, res);
      }
      const body = (await res.json()) as {
        trades?: Record<string, { p: number }>;
      };
      const price = Number(body.trades?.[symbol]?.p ?? NaN);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`crypto latest trade for ${symbol}: no price in response`);
      }
      return price;
    },
  };
}

export async function checkAlpacaPaperConnection(): Promise<void> {
  const keys = keysConfigured();
  if (!keys) {
    console.log(
      "[alpaca] stub mode: Alpaca paper keys not loaded " +
        "(no ALPACA_API_KEY_ID/ALPACA_API_SECRET_KEY in the keys file or environment) " +
        "— skipping broker connection check.",
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
