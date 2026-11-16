/**
 * Alpaca client over plain REST, for hosts that can't (or shouldn't) hold
 * the keys in JavaScript. Every call goes through an `AlpacaTransport`; on
 * a device that transport is the Rust vault, which picks the paper/live
 * host and attaches the API key headers itself.
 *
 * Mirrors the SDK-backed client in engine/src/alpaca.ts call for call
 * (same endpoints, paging and field mapping) so the strategies behave
 * identically on the VM and on a device.
 */
import type {
  AlpacaClientLike,
  AlpacaOrder,
  OptionContract,
  OptionSnapshot,
} from "./broker.js";
import type { DailyBar, TimedBar } from "./indicators.js";

export interface AlpacaRequest {
  /** "trading" = paper-api / api.alpaca.markets (per key); "data" = data.alpaca.markets. */
  api: "trading" | "data";
  method: "GET" | "POST" | "DELETE";
  /** Path starting with /v2/, /v1beta1/ or /v1beta3/. */
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

export type AlpacaTransport = (req: AlpacaRequest) => Promise<{ status: number; text: string }>;

/** Free-tier stock data feed (the SDK's default for paper accounts). */
const STOCK_FEED = "iex";

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
    filledAvgPrice: o.filled_avg_price === null ? null : Number(o.filled_avg_price),
    status: o.status,
    type: o.type,
    timeInForce: o.time_in_force,
  };
}

const byTimestamp = (a: TimedBar, b: TimedBar) =>
  a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;

export function createAlpacaRestClient(transport: AlpacaTransport): AlpacaClientLike {
  async function call<T>(context: string, req: AlpacaRequest): Promise<T> {
    const res = await transport(req);
    if (res.status < 200 || res.status >= 300) {
      // Same shape as engine/src/alpaca.ts httpError: status + bounded body excerpt.
      const excerpt = res.text.replace(/\s+/g, " ").trim().slice(0, 300);
      throw new Error(`${context}: HTTP ${res.status}${excerpt ? ` — ${excerpt}` : ""}`);
    }
    return (res.text.trim() === "" ? undefined : JSON.parse(res.text)) as T;
  }

  /** Stock bars (daily or hourly), following next_page_token like the SDK generator. */
  async function stockBars(symbol: string, startISO: string, timeframe: "1Day" | "1Hour") {
    const out: { t: string; o: number; h: number; l: number; c: number }[] = [];
    let pageToken: string | null = null;
    for (let page = 0; page < 20; page++) {
      const query: Record<string, string> = {
        start: startISO,
        timeframe,
        limit: "1000",
        adjustment: "all",
        feed: STOCK_FEED,
      };
      if (pageToken) query.page_token = pageToken;
      const body = await call<{
        bars?: { t: string; o: number; h: number; l: number; c: number }[] | null;
        next_page_token?: string | null;
      }>(`${timeframe} bars for ${symbol}`, {
        api: "data",
        method: "GET",
        path: `/v2/stocks/${encodeURIComponent(symbol)}/bars`,
        query,
      });
      out.push(...(body.bars ?? []));
      pageToken = body.next_page_token ?? null;
      if (!pageToken) break;
    }
    return out;
  }

  return {
    async getAccount() {
      const a = await call<{ status: string; equity: string; cash: string }>("account", {
        api: "trading",
        method: "GET",
        path: "/v2/account",
      });
      return { status: a.status, equity: Number(a.equity), cash: Number(a.cash) };
    },

    async getClock() {
      const c = await call<{ is_open: boolean; timestamp: string; next_open: string; next_close: string }>(
        "clock",
        { api: "trading", method: "GET", path: "/v2/clock" },
      );
      return { isOpen: c.is_open, timestamp: c.timestamp, nextOpen: c.next_open, nextClose: c.next_close };
    },

    async getPositions() {
      const raw = await call<
        { symbol: string; qty: string; avg_entry_price: string; current_price: string; market_value: string }[]
      >("positions", { api: "trading", method: "GET", path: "/v2/positions" });
      return raw.map((p) => ({
        symbol: p.symbol,
        qty: Number(p.qty),
        avgEntryPrice: Number(p.avg_entry_price),
        currentPrice: Number(p.current_price),
        marketValue: Number(p.market_value),
      }));
    },

    async getOpenOrders() {
      const raw = await call<RawOrder[]>("open orders", {
        api: "trading",
        method: "GET",
        path: "/v2/orders",
        query: { status: "open", limit: "500" },
      });
      return raw.map(toOrder);
    },

    async getOrder(id) {
      return toOrder(
        await call<RawOrder>(`order ${id}`, {
          api: "trading",
          method: "GET",
          path: `/v2/orders/${encodeURIComponent(id)}`,
        }),
      );
    },

    async createOrder(order) {
      return toOrder(
        await call<RawOrder>(`create order ${order.symbol}`, {
          api: "trading",
          method: "POST",
          path: "/v2/orders",
          body: {
            symbol: order.symbol,
            qty: String(order.qty),
            side: order.side,
            type: order.type,
            time_in_force: order.timeInForce,
            ...(order.limitPrice !== undefined ? { limit_price: String(order.limitPrice) } : {}),
          },
        }),
      );
    },

    async cancelOrder(id) {
      await call<void>(`cancel order ${id}`, {
        api: "trading",
        method: "DELETE",
        path: `/v2/orders/${encodeURIComponent(id)}`,
      });
    },

    async closePosition(symbol) {
      return toOrder(
        await call<RawOrder>(`close position ${symbol}`, {
          api: "trading",
          method: "DELETE",
          path: `/v2/positions/${encodeURIComponent(symbol)}`,
        }),
      );
    },

    async getDailyBars(symbol, startISO) {
      const bars: DailyBar[] = (await stockBars(symbol, startISO, "1Day")).map((b) => ({
        date: String(b.t).slice(0, 10),
        open: b.o,
        high: b.h,
        low: b.l,
        close: b.c,
      }));
      bars.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      return bars;
    },

    async getLatestPrice(symbol) {
      const body = await call<{ trade?: { p: number } }>(`latest trade for ${symbol}`, {
        api: "data",
        method: "GET",
        path: `/v2/stocks/${encodeURIComponent(symbol)}/trades/latest`,
        query: { feed: STOCK_FEED },
      });
      return Number(body.trade?.p);
    },

    async getHourlyBars(symbol, startISO) {
      const bars: TimedBar[] = (await stockBars(symbol, startISO, "1Hour")).map((b) => ({
        timestamp: String(b.t),
        open: b.o,
        high: b.h,
        low: b.l,
        close: b.c,
      }));
      return bars.sort(byTimestamp);
    },

    async getOptionContracts(underlying, type, expiryGte, expiryLte) {
      const contracts: OptionContract[] = [];
      let pageToken: string | null = null;
      for (let page = 0; page < 10; page++) {
        const query: Record<string, string> = {
          underlying_symbols: underlying,
          type,
          expiration_date_gte: expiryGte,
          expiration_date_lte: expiryLte,
          status: "active",
          limit: "1000",
        };
        if (pageToken) query.page_token = pageToken;
        const body = await call<{
          option_contracts?: {
            symbol: string;
            underlying_symbol: string;
            type: string;
            strike_price: string;
            expiration_date: string;
            open_interest?: string;
          }[];
          next_page_token?: string | null;
        }>(`option contracts for ${underlying}`, {
          api: "trading",
          method: "GET",
          path: "/v2/options/contracts",
          query,
        });
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

    async getOptionSnapshots(symbols) {
      const out = new Map<string, OptionSnapshot>();
      for (let i = 0; i < symbols.length; i += 100) {
        const chunk = symbols.slice(i, i + 100);
        if (chunk.length === 0) continue;
        const body = await call<{
          snapshots?: Record<
            string,
            {
              latestQuote?: { bp?: number; ap?: number };
              latestTrade?: { p?: number };
              greeks?: { delta?: number };
              impliedVolatility?: number;
            }
          >;
        }>("option snapshots", {
          api: "data",
          method: "GET",
          path: "/v1beta1/options/snapshots",
          query: { symbols: chunk.join(","), feed: "indicative" },
        });
        for (const [symbol, s] of Object.entries(body.snapshots ?? {})) {
          const bid = Number(s.latestQuote?.bp ?? 0);
          const ask = Number(s.latestQuote?.ap ?? 0);
          out.set(symbol, {
            symbol,
            bid,
            ask,
            mid: ask > 0 && bid > 0 ? (bid + ask) / 2 : null,
            lastPrice: s.latestTrade?.p !== undefined ? Number(s.latestTrade.p) : null,
            delta: s.greeks?.delta !== undefined ? Number(s.greeks.delta) : null,
            iv: s.impliedVolatility !== undefined ? Number(s.impliedVolatility) : null,
          });
        }
      }
      return out;
    },

    async getCryptoBars(symbol, startISO) {
      const bars: TimedBar[] = [];
      let pageToken: string | null = null;
      for (let page = 0; page < 5; page++) {
        const query: Record<string, string> = {
          symbols: symbol,
          timeframe: "1Hour",
          start: startISO,
          limit: "10000",
          sort: "asc",
        };
        if (pageToken) query.page_token = pageToken;
        const body = await call<{
          bars?: Record<string, { t: string; o: number; h: number; l: number; c: number; v: number }[]>;
          next_page_token?: string | null;
        }>(`crypto bars for ${symbol}`, {
          api: "data",
          method: "GET",
          path: "/v1beta3/crypto/us/bars",
          query,
        });
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
      return bars.sort(byTimestamp);
    },

    async getCryptoLatestPrice(symbol) {
      const body = await call<{ trades?: Record<string, { p: number }> }>(
        `crypto latest trade for ${symbol}`,
        { api: "data", method: "GET", path: "/v1beta3/crypto/us/latest/trades", query: { symbols: symbol } },
      );
      const price = Number(body.trades?.[symbol]?.p ?? NaN);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`crypto latest trade for ${symbol}: no price in response`);
      }
      return price;
    },
  };
}
