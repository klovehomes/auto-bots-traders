import {
  buildEquityOrderBody,
  getPaperKeys,
  SchwabClient,
  type SchwabOrderBody,
  type SchwabOrderRaw,
} from "@fleet/shared";
import type {
  AlpacaClientLike,
  AlpacaOrder,
  AlpacaPosition,
} from "./alpaca.js";

/**
 * Engine-side Schwab adapter (v37).
 *
 * Schwab is LIVE money. This adapter is only constructed after
 * `resolveBotVenue` (venue.ts) approves the bot — CONNECTED bot,
 * CONNECTED fleet, equity bots only (Trendia/Snapback in v37) —
 * and the Risk Gate still sits in front of the runners that use it.
 *
 * The adapter implements the narrow `AlpacaClientLike` surface the
 * runners already speak, split in two:
 * - EXECUTION (account, positions, orders) goes to Schwab.
 * - MARKET DATA stays on Alpaca in v37 and delegates to the Alpaca
 *   data client passed in `deps.data`; with no data client the data
 *   methods throw a clear "market data unavailable" error rather
 *   than fabricating prices.
 *
 * Credentials come from the shared keys loader (`getPaperKeys`);
 * OAuth tokens come from the shared token store (the SchwabClient's
 * token file). Neither is ever logged here.
 */

/** Build a SchwabClient from the keys file, or null when unconfigured. */
export function createSchwabClientFromKeys(): SchwabClient | null {
  const keys = getPaperKeys();
  if (!keys.schwabAppKey || !keys.schwabAppSecret) return null;
  const tokenFilePath = process.env.TRADERBOT_SCHWAB_TOKEN_FILE?.trim();
  return new SchwabClient({
    appKey: keys.schwabAppKey,
    appSecret: keys.schwabAppSecret,
    ...(tokenFilePath ? { tokenFilePath } : {}),
  });
}

const TERMINAL_SCHWAB_STATUSES: ReadonlySet<string> = new Set([
  "FILLED",
  "CANCELED",
  "EXPIRED",
  "REJECTED",
]);

function mapSchwabStatus(status: string): string {
  switch (status.trim().toUpperCase()) {
    case "FILLED":
      return "filled";
    case "CANCELED":
      return "canceled";
    case "EXPIRED":
      return "expired";
    case "REJECTED":
      return "rejected";
    default:
      return status.trim().toLowerCase();
  }
}

/** SchwabOrderRaw → the AlpacaOrder shape the runners track. */
function toOrder(raw: SchwabOrderRaw): AlpacaOrder {
  const leg = raw.legs?.[0];
  const instruction = (leg?.instruction ?? "").trim();
  const upper = instruction.toUpperCase();
  return {
    id: raw.orderId,
    symbol: leg?.symbol ?? "",
    side: upper.startsWith("BUY")
      ? "buy"
      : upper.startsWith("SELL")
        ? "sell"
        : instruction.toLowerCase(),
    qty: leg?.quantity ?? 0,
    filledQty: raw.filledQuantity,
    filledAvgPrice: raw.filledAvgPrice,
    status: mapSchwabStatus(raw.status),
    type: raw.orderType.trim().toLowerCase(),
    timeInForce: "day",
  };
}

/**
 * OCC option symbols (e.g. AMD261120C00150000) — the spaced form is
 * caught by the caller's space check; this catches the compact form.
 */
const OCC_SYMBOL_PATTERN = /^[A-Za-z.]{1,6}\d{6}[CP]\d{8}$/;
const OCC_SUFFIX_PATTERN = /\d{6}[CP]\d{8}$/;

function isOptionContractSymbol(symbol: string): boolean {
  return OCC_SYMBOL_PATTERN.test(symbol) || OCC_SUFFIX_PATTERN.test(symbol);
}

export function createSchwabExecutionClient(deps: {
  schwab: SchwabClient;
  data: AlpacaClientLike | null;
}): AlpacaClientLike {
  const { schwab, data } = deps;

  const requireData = (): AlpacaClientLike => {
    if (!data) {
      throw new Error(
        "Schwab venue: market data unavailable — no Alpaca data client " +
          "is configured (market data stays on Alpaca in v37).",
      );
    }
    return data;
  };

  const getPositionsImpl = async (): Promise<AlpacaPosition[]> => {
    const hashValue = await schwab.accountHash();
    const summary = await schwab.getAccount(hashValue);
    const out: AlpacaPosition[] = [];
    for (const p of summary.positions ?? []) {
      const qty = p.longQuantity - p.shortQuantity;
      if (qty === 0) continue;
      out.push({
        symbol: p.symbol,
        qty,
        avgEntryPrice: p.averagePrice,
        currentPrice: qty !== 0 ? p.marketValue / qty : p.averagePrice,
        marketValue: p.marketValue,
      });
    }
    return out;
  };

  /**
   * Place one equity order body at Schwab and resolve it back to the
   * runner's order shape: the broker's own record when Schwab returns
   * an order id, otherwise a synthesized "accepted" order (Schwab
   * accepted the request but gave us nothing to poll yet).
   */
  const submitEquityOrder = async (args: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    type: "market" | "limit";
    limitPrice?: number;
  }): Promise<AlpacaOrder> => {
    const body: SchwabOrderBody = buildEquityOrderBody({
      symbol: args.symbol,
      side: args.side,
      qty: args.qty,
      type: args.type,
      ...(args.limitPrice !== undefined
        ? { limitPrice: args.limitPrice }
        : {}),
    });
    const hashValue = await schwab.accountHash();
    const placed = await schwab.placeOrder(hashValue, body);
    if (placed.orderId) {
      const raw = await schwab.getOrder(hashValue, placed.orderId);
      return toOrder(raw);
    }
    return {
      id: "",
      symbol: args.symbol,
      side: args.side,
      qty: args.qty,
      filledQty: 0,
      filledAvgPrice: null,
      status: "accepted",
      type: args.type,
      timeInForce: "day",
    };
  };

  return {
    async getAccount() {
      const hashValue = await schwab.accountHash();
      const summary = await schwab.getAccount(hashValue);
      return {
        status: "ACTIVE",
        equity: summary.equity ?? 0,
        cash: summary.cash ?? 0,
      };
    },

    async getClock() {
      return requireData().getClock();
    },

    async getPositions() {
      return getPositionsImpl();
    },

    async getOpenOrders() {
      const hashValue = await schwab.accountHash();
      const raw = await schwab.getOrders(hashValue);
      return raw
        .filter(
          (o: SchwabOrderRaw) =>
            !TERMINAL_SCHWAB_STATUSES.has(o.status.trim().toUpperCase()),
        )
        .map(toOrder);
    },

    async getOrder(id: string) {
      const hashValue = await schwab.accountHash();
      const raw = await schwab.getOrder(hashValue, id);
      return toOrder(raw);
    },

    async createOrder(order) {
      const symbol = order.symbol;
      // Equity symbols only on this venue: an option contract (a
      // spaced symbol, or the compact OCC shape) can never be served
      // here — Vega/Wesley are refused upstream in venue.ts, and this
      // is the belt-and-braces check at the order path itself.
      if (symbol.includes(" ") || isOptionContractSymbol(symbol.trim())) {
        throw new Error(
          `Schwab venue: refusing order for "${symbol}" — that is an option ` +
            "contract symbol, and the Schwab venue serves equities only in v37.",
        );
      }
      // Schwab equity orders in v37 are DAY only.
      if (order.timeInForce === "gtc" || order.timeInForce === "ioc") {
        throw new Error(
          `Schwab venue: refusing ${order.timeInForce.toUpperCase()} order for ${symbol} — ` +
            "Schwab equity orders are DAY only in v37.",
        );
      }
      // "opg" is accepted and mapped to a Schwab DAY market order:
      // Trendia submits market-on-open orders after the close, and a
      // Schwab DAY market order placed after hours queues for the
      // next session's open — the same economic fill she gets from
      // Alpaca's opg handling.
      return submitEquityOrder({
        symbol,
        side: order.side,
        qty: order.qty,
        type: order.type,
        ...(order.limitPrice !== undefined
          ? { limitPrice: order.limitPrice }
          : {}),
      });
    },

    async cancelOrder(id: string) {
      const hashValue = await schwab.accountHash();
      await schwab.cancelOrder(hashValue, id);
    },

    async closePosition(symbol: string) {
      const positions = await getPositionsImpl();
      const position = positions.find((p) => p.symbol === symbol);
      if (!position || position.qty === 0) {
        throw new Error(
          `Schwab venue: cannot close ${symbol} — no Schwab position in that symbol.`,
        );
      }
      return submitEquityOrder({
        symbol,
        side: "sell",
        qty: Math.abs(position.qty),
        type: "market",
      });
    },

    async getDailyBars(symbol: string, startISO: string) {
      return requireData().getDailyBars(symbol, startISO);
    },

    async getLatestPrice(symbol: string) {
      return requireData().getLatestPrice(symbol);
    },

    async getHourlyBars(symbol: string, startISO: string) {
      return requireData().getHourlyBars(symbol, startISO);
    },

    async getOptionContracts() {
      throw new Error("Schwab venue does not serve options in v37.");
    },

    async getOptionSnapshots() {
      throw new Error("Schwab venue does not serve options in v37.");
    },

    async getCryptoBars(symbol: string, startISO: string) {
      return requireData().getCryptoBars(symbol, startISO);
    },

    async getCryptoLatestPrice(symbol: string) {
      return requireData().getCryptoLatestPrice(symbol);
    },
  };
}
