// Portable core (no Node APIs). Request signing is injected: the VM engine
// signs with node:crypto (engine/src/kalshi.ts); a device signs inside its
// Rust vault, so the private key never enters JavaScript.

/**
 * PHASE 12 (v21) — Kalshi DEMO client, PolyCrypt9000's paper venue for
 * prediction markets. Polymarket has no paper/testnet mode, so her
 * prediction sleeve practices here: same mispricing discipline, real
 * demo order flow against https://demo-api.kalshi.co/trade-api/v2.
 *
 * Auth (Kalshi's documented scheme): every request carries
 *   KALSHI-ACCESS-KEY:       the API key id
 *   KALSHI-ACCESS-TIMESTAMP: current time in milliseconds
 *   KALSHI-ACCESS-SIGNATURE: RSA-PSS (SHA-256, salt length = digest
 *     length) signature, base64, over the string
 *     `${timestamp}${METHOD}${path}` where path is the full path
 *     including the /trade-api/v2 prefix and EXCLUDING the query string.
 * Signing is delegated to a KalshiSigner (see createKalshiClientWithSigner).
 *
 * Production Kalshi is unreachable from this build: the factory only
 * ever points at the demo host, and the loader refuses any
 * KALSHI_ENV other than "demo" in this phase.
 */

export const KALSHI_DEMO_BASE_URL = "https://demo-api.kalshi.co";
export const KALSHI_API_PREFIX = "/trade-api/v2";

export interface KalshiMarket {
  ticker: string;
  title: string;
  /** Best YES bid/ask in dollars (0–1); 0 when no quote. */
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  /** Last traded YES price in dollars; null when never traded. */
  lastPrice: number | null;
  /** Contracts traded (lifetime volume as reported by the venue). */
  volume: number;
  /** ISO timestamp the market closes. */
  closeTime: string;
  status: string;
  /** Settlement result once finalized: "yes" | "no" | null. */
  result: string | null;
}

export interface KalshiOrder {
  id: string;
  ticker: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  count: number;
  filledCount: number;
  status: string;
  /** Limit price in dollars for the traded side. */
  price: number | null;
}

export interface KalshiClientLike {
  /** Demo account balance, in cents (Kalshi reports cents). */
  getBalance(): Promise<{ balanceCents: number; portfolioValueCents: number }>;
  /** Open markets, most-traded first as returned, capped at `limit`. */
  getMarkets(limit: number): Promise<KalshiMarket[]>;
  getMarket(ticker: string): Promise<KalshiMarket | null>;
  createOrder(order: {
    ticker: string;
    side: "yes" | "no";
    action: "buy" | "sell";
    count: number;
    /** Limit price in dollars (0.01–0.99) for the traded side. */
    price: number;
  }): Promise<KalshiOrder>;
  getOrder(id: string): Promise<KalshiOrder>;
  cancelOrder(id: string): Promise<void>;
}

export interface KalshiClientOptions {
  baseUrl?: string;
  now?: () => Date;
  fetchFn?: typeof fetch;
}

/**
 * Produces the base64 RSA-PSS signature over kalshiSignaturePayload(...).
 * Async so a device can call into its keystore.
 */
export type KalshiSigner = (
  timestampMs: string,
  method: string,
  path: string,
) => string | Promise<string>;

/** The exact string Kalshi expects to be signed. Exported for the harness. */
export function kalshiSignaturePayload(
  timestampMs: string,
  method: string,
  path: string,
): string {
  return `${timestampMs}${method.toUpperCase()}${path}`;
}

/** Parse a price field that may arrive as *_dollars ("0.5600") or as integer cents. */
function priceFrom(raw: Record<string, unknown>, field: string): number {
  const dollars = raw[`${field}_dollars`];
  if (typeof dollars === "string" && dollars.trim() !== "") {
    const n = Number(dollars);
    if (Number.isFinite(n)) return n;
  }
  if (typeof dollars === "number" && Number.isFinite(dollars)) return dollars;
  const cents = raw[field];
  if (typeof cents === "number" && Number.isFinite(cents)) return cents / 100;
  return 0;
}

function toMarket(raw: Record<string, unknown>): KalshiMarket {
  const last = priceFrom(raw, "last_price");
  return {
    ticker: String(raw.ticker ?? ""),
    title: String(raw.title ?? raw.ticker ?? ""),
    yesBid: priceFrom(raw, "yes_bid"),
    yesAsk: priceFrom(raw, "yes_ask"),
    noBid: priceFrom(raw, "no_bid"),
    noAsk: priceFrom(raw, "no_ask"),
    lastPrice: last > 0 ? last : null,
    volume: Number(raw.volume ?? raw.volume_fp ?? 0) || 0,
    closeTime: String(raw.close_time ?? raw.expiration_time ?? ""),
    status: String(raw.status ?? ""),
    result:
      typeof raw.result === "string" && raw.result !== "" ? raw.result : null,
  };
}

function toOrder(raw: Record<string, unknown>): KalshiOrder {
  const side = raw.side === "no" ? "no" : "yes";
  const priceCents =
    side === "yes" ? Number(raw.yes_price ?? NaN) : Number(raw.no_price ?? NaN);
  return {
    id: String(raw.order_id ?? raw.id ?? ""),
    ticker: String(raw.ticker ?? ""),
    side,
    action: raw.action === "sell" ? "sell" : "buy",
    count: Number(raw.count ?? 0) || 0,
    filledCount: Number(raw.filled_count ?? raw.fill_count ?? 0) || 0,
    status: String(raw.status ?? ""),
    price: Number.isFinite(priceCents) ? priceCents / 100 : null,
  };
}

/**
 * Build a Kalshi client for one API key id. `signer` produces the request
 * signature, so this module never sees the private key.
 */
export function createKalshiClientWithSigner(
  keyId: string,
  signer: KalshiSigner,
  options: KalshiClientOptions = {},
): KalshiClientLike {
  const baseUrl = (options.baseUrl ?? KALSHI_DEMO_BASE_URL).replace(/\/+$/, "");
  const now = options.now ?? (() => new Date());
  const fetchFn = options.fetchFn ?? fetch;

  async function request<T>(
    method: string,
    pathSuffix: string,
    query?: Record<string, string>,
    body?: unknown,
  ): Promise<T> {
    const path = `${KALSHI_API_PREFIX}${pathSuffix}`;
    const url = new URL(`${baseUrl}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    }
    const timestampMs = String(now().getTime());
    const signature = await signer(timestampMs, method, path);
    const res = await fetchFn(url, {
      method,
      headers: {
        "KALSHI-ACCESS-KEY": keyId,
        "KALSHI-ACCESS-TIMESTAMP": timestampMs,
        "KALSHI-ACCESS-SIGNATURE": signature,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      let excerpt = "";
      try {
        excerpt = (await res.text()).replace(/\s+/g, " ").trim().slice(0, 300);
      } catch {
        // status alone will have to do
      }
      throw new Error(
        `kalshi ${method} ${path}: HTTP ${res.status}${excerpt ? ` — ${excerpt}` : ""}`,
      );
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return {
    async getBalance() {
      const body = await request<{ balance?: number; portfolio_value?: number }>(
        "GET",
        "/portfolio/balance",
      );
      return {
        balanceCents: Number(body.balance ?? 0),
        portfolioValueCents: Number(body.portfolio_value ?? 0),
      };
    },

    async getMarkets(limit: number) {
      const body = await request<{ markets?: Record<string, unknown>[] }>(
        "GET",
        "/markets",
        { status: "open", limit: String(Math.max(1, Math.min(1000, limit))) },
      );
      return (body.markets ?? []).map(toMarket);
    },

    async getMarket(ticker: string) {
      try {
        const body = await request<{ market?: Record<string, unknown> }>(
          "GET",
          `/markets/${encodeURIComponent(ticker)}`,
        );
        return body.market ? toMarket(body.market) : null;
      } catch {
        return null;
      }
    },

    async createOrder(order) {
      const priceCents = Math.round(order.price * 100);
      const body = await request<{ order?: Record<string, unknown> }>(
        "POST",
        "/portfolio/orders",
        undefined,
        {
          ticker: order.ticker,
          client_order_id: globalThis.crypto.randomUUID(),
          side: order.side,
          action: order.action,
          count: order.count,
          type: "limit",
          ...(order.side === "yes"
            ? { yes_price: priceCents }
            : { no_price: priceCents }),
        },
      );
      if (!body.order) throw new Error("kalshi create order: no order in response");
      return toOrder(body.order);
    },

    async getOrder(id: string) {
      const body = await request<{ order?: Record<string, unknown> }>(
        "GET",
        `/portfolio/orders/${encodeURIComponent(id)}`,
      );
      if (!body.order) throw new Error(`kalshi order ${id}: not found`);
      return toOrder(body.order);
    },

    async cancelOrder(id: string) {
      await request("DELETE", `/portfolio/orders/${encodeURIComponent(id)}`);
    },
  };
}
