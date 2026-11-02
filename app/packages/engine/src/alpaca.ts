import Alpaca from "@alpacahq/alpaca-trade-api";
import type { DailyBar } from "./indicators.js";

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
    type: "market";
    timeInForce: "day" | "opg";
  }): Promise<AlpacaOrder>;
  cancelOrder(id: string): Promise<void>;
  /** Liquidate the entire position in `symbol` at market. */
  closePosition(symbol: string): Promise<AlpacaOrder>;
  /** Daily bars from `startISO`, ascending by session date. */
  getDailyBars(symbol: string, startISO: string): Promise<DailyBar[]>;
  getLatestPrice(symbol: string): Promise<number>;
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
