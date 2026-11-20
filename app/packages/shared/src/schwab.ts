import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { expandHome, loadPaperKeys } from "./keys.js";
import type { PaperKeys } from "./keys.js";

/**
 * Schwab Trader API core (fleet v37) — shared by the API (OAuth /
 * verify / test endpoints) and the engine (execution adapter).
 *
 * Schwab is the LIVE-money venue: bots assigned to Schwab trade real
 * funds in a real brokerage account, unlike the Alpaca paper and
 * Kalshi demo venues. Every surface in this module is written with
 * that in mind.
 *
 * SECURITY INVARIANTS (do not weaken):
 * - OAuth tokens live ONLY in the token file (see
 *   `resolveSchwabTokenFilePath`, default `~/traderbot-schwab-tokens.json`,
 *   written atomically with 0600 permissions, best effort) and in
 *   memory inside a `SchwabClient`. They are never logged, never
 *   returned by any status surface, and never embedded in an error
 *   message (`SchwabError` messages carry only an HTTP status plus a
 *   bounded, whitespace-collapsed excerpt of Schwab's error body).
 * - The app secret likewise never leaves the keys loader / this
 *   client except as the Basic-auth credential on the token endpoint.
 * - The public status surface (`schwabPublicStatus`) exposes only:
 *   whether the app credentials are configured, the last 4 characters
 *   of the APP KEY (never of the app secret or any token), the OAuth
 *   auth state, and whole days left in the refresh window.
 *
 * REFRESH-ANCHOR SEMANTICS (Schwab-specific, important):
 * - The refresh token lives for 7 days from the ORIGINAL
 *   authorization (`SCHWAB_REFRESH_TTL_MS`, anchored at
 *   `refreshIssuedAt`). Refreshing the access token does NOT extend
 *   that window: when a refresh response carries a new refresh_token
 *   it is stored, but the original `refreshIssuedAt` is kept. When
 *   the 7 days pass the state becomes "expired" and the user must run
 *   the OAuth login again (the setup wizard's re-login step).
 * - Access tokens are short-lived; `accessToken()` transparently
 *   refreshes first when the stored access token is expired or
 *   within `SCHWAB_ACCESS_SKEW_MS` of expiry.
 *
 * SINGLE-ACCOUNT ASSUMPTION:
 * - `accountHash()` — and therefore the wizard verify step and the
 *   engine adapter — uses the FIRST account returned by
 *   GET /trader/v1/accounts/accountNumbers. Multi-account selection
 *   is out of scope for v37.
 *
 * All HTTP goes through an injectable fetch (`fetchImpl`, defaulting
 * to the global fetch); nothing in this module hard-requires the
 * network — the pure helpers (token store, state math, auth-code /
 * auth-URL handling, order-body building) work fully offline.
 */

export const SCHWAB_API_BASE = "https://api.schwabapi.com";
export const SCHWAB_CALLBACK_URL = "https://127.0.0.1:8182";
export const SCHWAB_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SCHWAB_ACCESS_SKEW_MS = 60_000;

export type SchwabAuthState =
  | "no-key"
  | "not-authorized"
  | "authorized"
  | "expired";

export interface SchwabPublicStatus {
  configured: boolean;
  last4: string | null;
  state: SchwabAuthState;
  refreshDaysLeft: number | null;
  live: true;
}

export interface SchwabVerifiedInfo {
  at: string;
  accountMasked: string;
  equity: number | null;
  cash: number | null;
  positionCount: number;
}

export interface SchwabTokenRecord {
  accessToken: string;
  refreshToken: string;
  accessIssuedAt: number;
  accessExpiresInSec: number;
  refreshIssuedAt: number;
  lastVerified: SchwabVerifiedInfo | null;
}

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

/**
 * The Schwab token-file path in force: `TRADERBOT_SCHWAB_TOKEN_FILE`
 * env (with `~` expansion), else `~/traderbot-schwab-tokens.json`.
 */
export function resolveSchwabTokenFilePath(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw = (env.TRADERBOT_SCHWAB_TOKEN_FILE ?? "").trim();
  return expandHome(raw !== "" ? raw : "~/traderbot-schwab-tokens.json");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asVerifiedInfo(value: unknown): SchwabVerifiedInfo | null {
  if (!isRecord(value)) return null;
  if (typeof value.at !== "string") return null;
  if (typeof value.accountMasked !== "string") return null;
  if (typeof value.positionCount !== "number") return null;
  return {
    at: value.at,
    accountMasked: value.accountMasked,
    equity: typeof value.equity === "number" ? value.equity : null,
    cash: typeof value.cash === "number" ? value.cash : null,
    positionCount: value.positionCount,
  };
}

/**
 * Read and loosely validate the token record at `path`. Never throws:
 * a missing, unreadable, or malformed file simply reads as "no
 * record" (the not-authorized / re-login path).
 */
export function readSchwabTokens(path: string): SchwabTokenRecord | null {
  try {
    if (!existsSync(path)) return null;
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (!isRecord(parsed)) return null;
    if (
      typeof parsed.accessToken !== "string" ||
      parsed.accessToken === "" ||
      typeof parsed.refreshToken !== "string" ||
      parsed.refreshToken === "" ||
      typeof parsed.accessIssuedAt !== "number" ||
      !Number.isFinite(parsed.accessIssuedAt) ||
      typeof parsed.accessExpiresInSec !== "number" ||
      !Number.isFinite(parsed.accessExpiresInSec) ||
      typeof parsed.refreshIssuedAt !== "number" ||
      !Number.isFinite(parsed.refreshIssuedAt)
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accessIssuedAt: parsed.accessIssuedAt,
      accessExpiresInSec: parsed.accessExpiresInSec,
      refreshIssuedAt: parsed.refreshIssuedAt,
      lastVerified: asVerifiedInfo(parsed.lastVerified),
    };
  } catch {
    return null;
  }
}

/**
 * Persist the token record atomically: mkdir -p the dirname, write a
 * temp file in the same directory, rename over the target, then chmod
 * 0600 (best effort — some filesystems refuse, and that must not lose
 * the tokens).
 */
export function writeSchwabTokens(path: string, rec: SchwabTokenRecord): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(rec, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
  try {
    chmodSync(path, 0o600);
  } catch {
    // Best effort only.
  }
}

/** Remove the token file at `path` (a missing file is not an error). */
export function clearSchwabTokens(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // Already gone (or unremovable) — clearing is idempotent.
  }
}

// ---------------------------------------------------------------------------
// State math
// ---------------------------------------------------------------------------

/** Epoch ms at which the record's 7-day refresh window closes. */
export function schwabRefreshExpiresAt(rec: SchwabTokenRecord): number {
  return rec.refreshIssuedAt + SCHWAB_REFRESH_TTL_MS;
}

/**
 * Whole days left in the refresh window: 0 when expired, otherwise
 * the ceiling of the remaining time in days (so any partial final day
 * still counts as 1).
 */
export function schwabRefreshDaysLeft(
  rec: SchwabTokenRecord,
  nowMs: number,
): number {
  const remaining = schwabRefreshExpiresAt(rec) - nowMs;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / 86_400_000);
}

/** Derive the OAuth auth state from configuration + stored tokens. */
export function schwabAuthState(
  configured: boolean,
  rec: SchwabTokenRecord | null,
  nowMs: number,
): SchwabAuthState {
  if (!configured) return "no-key";
  if (rec === null) return "not-authorized";
  if (nowMs >= schwabRefreshExpiresAt(rec)) return "expired";
  return "authorized";
}

function tail4(value: string | null): string | null {
  if (!value || value.length <= 4) return null;
  return value.slice(-4);
}

/**
 * The presence-only public status for the dashboard chip / keys
 * endpoint. Defaults: keys from `loadPaperKeys()`, the token path
 * from `resolveSchwabTokenFilePath`, and `Date.now()`.
 */
export function schwabPublicStatus(opts?: {
  keys?: PaperKeys;
  env?: NodeJS.ProcessEnv;
  tokenFilePath?: string;
  nowMs?: number;
}): SchwabPublicStatus {
  const env = opts?.env ?? process.env;
  const keys = opts?.keys ?? loadPaperKeys({ env });
  const nowMs = opts?.nowMs ?? Date.now();
  const tokenFilePath = opts?.tokenFilePath ?? resolveSchwabTokenFilePath(env);
  const configured = keys.schwabAppKey !== null && keys.schwabAppSecret !== null;
  const rec = readSchwabTokens(tokenFilePath);
  return {
    configured,
    last4: tail4(keys.schwabAppKey),
    state: schwabAuthState(configured, rec, nowMs),
    refreshDaysLeft: rec === null ? null : schwabRefreshDaysLeft(rec, nowMs),
    live: true,
  };
}

/**
 * The setup-wizard step to land on for a given Schwab state:
 * app credentials missing → step 4 (enter credentials); configured
 * but not authorized (or the refresh window expired) → step 5 (OAuth
 * connect / re-login); authorized but not yet verified → step 6
 * (read-only verify); authorized and verified → step 7 (test order).
 */
export function deriveSchwabWizardStep(input: {
  configured: boolean;
  state: SchwabAuthState;
  verified: boolean;
}): number {
  if (!input.configured) return 4;
  if (input.state === "not-authorized" || input.state === "expired") return 5;
  if (input.state === "authorized" && !input.verified) return 6;
  if (input.state === "authorized" && input.verified) return 7;
  // Configured with a "no-key" state should not happen; the safest
  // landing is the credentials step.
  return 4;
}

// ---------------------------------------------------------------------------
// OAuth helpers
// ---------------------------------------------------------------------------

/**
 * Pull the authorization code out of whatever the user pasted: either
 * a bare code (no whitespace, no "://", no "=") or the full callback
 * URL Schwab redirected to, in which case the `code` query parameter
 * is returned URL-decoded. Returns null on garbage, a missing code,
 * or when an `error` parameter is present (a denied/failed login).
 */
export function extractSchwabAuthCode(input: string): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;

  if (trimmed.includes("://")) {
    try {
      const url = new URL(trimmed);
      if (url.searchParams.has("error")) return null;
      const code = url.searchParams.get("code");
      return code !== null && code !== "" ? code : null;
    } catch {
      return null;
    }
  }

  if (trimmed.includes("=")) {
    // A pasted query string ("code=…&…" or "?code=…") rather than a
    // bare code — parse it as parameters instead of guessing.
    const query = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
    try {
      const params = new URLSearchParams(query);
      if (params.has("error")) return null;
      const code = params.get("code");
      return code !== null && code !== "" ? code : null;
    } catch {
      return null;
    }
  }

  if (/\s/.test(trimmed)) return null;
  return trimmed;
}

/** The Schwab OAuth authorize URL for the wizard's connect step. */
export function buildSchwabAuthUrl(
  appKey: string,
  baseUrl: string = SCHWAB_API_BASE,
): string {
  const base = baseUrl.replace(/\/+$/, "");
  return (
    `${base}/v1/oauth/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(appKey)}` +
    `&redirect_uri=${encodeURIComponent(SCHWAB_CALLBACK_URL)}`
  );
}

// ---------------------------------------------------------------------------
// Order payloads
// ---------------------------------------------------------------------------

export interface SchwabOrderBody {
  orderType: "MARKET" | "LIMIT";
  session: "NORMAL";
  duration: "DAY";
  orderStrategyType: "SINGLE";
  price?: string;
  orderLegCollection: {
    instruction: "BUY" | "SELL";
    quantity: number;
    instrument: { symbol: string; assetType: "EQUITY" };
  }[];
}

/**
 * Build Schwab's documented equity order body. LIMIT orders require
 * `limitPrice` and carry it as a 2-decimal string; MARKET orders omit
 * `price` entirely. The symbol is uppercased.
 */
export function buildEquityOrderBody(input: {
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: "market" | "limit";
  limitPrice?: number;
}): SchwabOrderBody {
  const isLimit = input.type === "limit";
  if (isLimit && (input.limitPrice === undefined || !Number.isFinite(input.limitPrice))) {
    throw new SchwabError(0, "buildEquityOrderBody: limitPrice is required for LIMIT orders");
  }
  return {
    orderType: isLimit ? "LIMIT" : "MARKET",
    session: "NORMAL",
    duration: "DAY",
    orderStrategyType: "SINGLE",
    ...(isLimit ? { price: (input.limitPrice as number).toFixed(2) } : {}),
    orderLegCollection: [
      {
        instruction: input.side === "buy" ? "BUY" : "SELL",
        quantity: input.qty,
        instrument: {
          symbol: input.symbol.trim().toUpperCase(),
          assetType: "EQUITY",
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Raw response shapes (mapped from Schwab JSON)
// ---------------------------------------------------------------------------

export interface SchwabAccountNumber {
  accountNumber: string;
  hashValue: string;
}

export interface SchwabPositionRaw {
  symbol: string;
  assetType: string;
  longQuantity: number;
  shortQuantity: number;
  averagePrice: number;
  marketValue: number;
  currentDayProfitLoss: number;
}

export interface SchwabAccountSummary {
  accountNumber: string;
  equity: number;
  cash: number;
  liquidationValue: number;
  positions: SchwabPositionRaw[];
}

export interface SchwabOrderRaw {
  orderId: string;
  status: string;
  orderType: string;
  price: number | null;
  enteredTime: string | null;
  legs: { symbol: string; instruction: string; quantity: number }[];
  filledQuantity: number;
  filledAvgPrice: number | null;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * A Schwab failure. `status` is the HTTP status, or 0 for local
 * errors (no tokens, unparseable auth code, …). Messages never
 * contain token or secret values.
 */
export class SchwabError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SchwabError";
    this.status = status;
  }
}

/** Bounded, whitespace-collapsed excerpt of an error body (≤200 chars). */
function excerptOf(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 200);
}

function httpError(context: string, status: number, text: string): SchwabError {
  const excerpt = excerptOf(text);
  return new SchwabError(
    status,
    `${context}: HTTP ${status}${excerpt ? ` — ${excerpt}` : ""}`,
  );
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export interface SchwabClientOptions {
  appKey: string;
  appSecret: string;
  tokenFilePath?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

interface RawResponse {
  status: number;
  headers: Headers;
  json: unknown;
  text: string;
}

async function readResponse(res: Response): Promise<{ text: string; json: unknown }> {
  const anyRes = res as unknown as {
    text?: () => Promise<string>;
    json?: () => Promise<unknown>;
  };
  if (typeof anyRes.text === "function") {
    const text = await anyRes.text();
    let json: unknown = null;
    if (text !== "") {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    return { text, json };
  }
  if (typeof anyRes.json === "function") {
    const json = await anyRes.json();
    return { text: json === null || json === undefined ? "" : JSON.stringify(json), json };
  }
  return { text: "", json: null };
}

function headerValue(headers: Headers, name: string): string | null {
  const anyHeaders = headers as unknown as {
    get?: (n: string) => string | null;
    [key: string]: unknown;
  };
  if (typeof anyHeaders.get === "function") {
    const value = anyHeaders.get(name);
    if (value !== null && value !== undefined) return value;
  }
  if (isRecord(anyHeaders)) {
    for (const [key, value] of Object.entries(anyHeaders)) {
      if (key.toLowerCase() === name.toLowerCase() && typeof value === "string") {
        return value;
      }
    }
  }
  return null;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapAccountSummary(raw: unknown): SchwabAccountSummary {
  const root = isRecord(raw) ? raw : {};
  const account = isRecord(root.securitiesAccount) ? root.securitiesAccount : root;
  const balances = isRecord(account.currentBalances) ? account.currentBalances : {};
  const rawPositions = Array.isArray(account.positions) ? account.positions : [];
  const positions: SchwabPositionRaw[] = rawPositions.map((entry) => {
    const pos = isRecord(entry) ? entry : {};
    const instrument = isRecord(pos.instrument) ? pos.instrument : {};
    return {
      symbol: typeof instrument.symbol === "string" ? instrument.symbol : "",
      assetType: typeof instrument.assetType === "string" ? instrument.assetType : "",
      longQuantity: toFiniteNumber(pos.longQuantity),
      shortQuantity: toFiniteNumber(pos.shortQuantity),
      averagePrice: toFiniteNumber(pos.averagePrice),
      marketValue: toFiniteNumber(pos.marketValue),
      currentDayProfitLoss: toFiniteNumber(pos.currentDayProfitLoss),
    };
  });
  return {
    accountNumber:
      account.accountNumber === undefined || account.accountNumber === null
        ? ""
        : String(account.accountNumber),
    equity: toFiniteNumber(balances.equity),
    cash: toFiniteNumber(balances.cashBalance ?? balances.cash),
    liquidationValue: toFiniteNumber(balances.liquidationValue),
    positions,
  };
}

function mapOrder(raw: unknown): SchwabOrderRaw {
  const order = isRecord(raw) ? raw : {};
  const rawLegs = Array.isArray(order.orderLegCollection)
    ? order.orderLegCollection
    : [];
  const legs: SchwabOrderRaw["legs"] = rawLegs.map((entry) => {
    const leg = isRecord(entry) ? entry : {};
    const instrument = isRecord(leg.instrument) ? leg.instrument : {};
    return {
      symbol: typeof instrument.symbol === "string" ? instrument.symbol : "",
      instruction: typeof leg.instruction === "string" ? leg.instruction : "",
      quantity: toFiniteNumber(leg.quantity),
    };
  });

  // Weighted average fill price across every execution leg, when the
  // order carries activity detail; otherwise null.
  let filledAvgPrice: number | null = null;
  const activities = Array.isArray(order.orderActivityCollection)
    ? order.orderActivityCollection
    : [];
  let priceQtySum = 0;
  let qtySum = 0;
  for (const entry of activities) {
    const activity = isRecord(entry) ? entry : {};
    const execLegs = Array.isArray(activity.executionLegs)
      ? activity.executionLegs
      : [];
    for (const legEntry of execLegs) {
      const leg = isRecord(legEntry) ? legEntry : {};
      const price = toFiniteNumber(leg.price, NaN);
      const qty = toFiniteNumber(leg.quantity);
      if (Number.isFinite(price) && qty > 0) {
        priceQtySum += price * qty;
        qtySum += qty;
      }
    }
  }
  if (qtySum > 0) filledAvgPrice = priceQtySum / qtySum;

  return {
    orderId:
      order.orderId === undefined || order.orderId === null
        ? ""
        : String(order.orderId),
    status: typeof order.status === "string" ? order.status : "",
    orderType: typeof order.orderType === "string" ? order.orderType : "",
    price:
      order.price === undefined || order.price === null
        ? null
        : Number.isFinite(Number(order.price))
          ? Number(order.price)
          : null,
    enteredTime: typeof order.enteredTime === "string" ? order.enteredTime : null,
    legs,
    filledQuantity: toFiniteNumber(order.filledQuantity),
    filledAvgPrice,
  };
}

/** Schwab's order-time format: `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` (UTC ISO). */
function formatSchwabTime(ms: number): string {
  return new Date(ms).toISOString();
}

export class SchwabClient {
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly tokenFilePath: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly nowFn: () => number;
  private accountNumbersCache: SchwabAccountNumber[] | null = null;

  constructor(options: SchwabClientOptions) {
    this.appKey = options.appKey;
    this.appSecret = options.appSecret;
    this.tokenFilePath = options.tokenFilePath ?? resolveSchwabTokenFilePath();
    this.baseUrl = (options.baseUrl ?? SCHWAB_API_BASE).replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.nowFn = options.now ?? Date.now;
  }

  buildAuthUrl(): string {
    return buildSchwabAuthUrl(this.appKey, this.baseUrl);
  }

  private basicAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.appKey}:${this.appSecret}`, "utf8").toString("base64")}`;
  }

  /** POST the token endpoint with a form body; throws SchwabError on non-2xx. */
  private async tokenRequest(
    form: URLSearchParams,
    context: string,
  ): Promise<Record<string, unknown>> {
    const res = await this.fetchImpl(`${this.baseUrl}/v1/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const { text, json } = await readResponse(res);
    const status = res.status ?? 0;
    if (status < 200 || status >= 300) throw httpError(context, status, text);
    if (!isRecord(json)) {
      throw new SchwabError(status, `${context}: response was not a JSON object`);
    }
    return json;
  }

  private recordFromTokenResponse(
    json: Record<string, unknown>,
    accessIssuedAt: number,
    refreshIssuedAt: number,
    lastVerified: SchwabVerifiedInfo | null,
    context: string,
  ): SchwabTokenRecord {
    const accessToken = json.access_token;
    const refreshToken = json.refresh_token;
    if (
      typeof accessToken !== "string" ||
      accessToken === "" ||
      typeof refreshToken !== "string" ||
      refreshToken === ""
    ) {
      throw new SchwabError(0, `${context}: token response missing access_token or refresh_token`);
    }
    return {
      accessToken,
      refreshToken,
      accessIssuedAt,
      accessExpiresInSec: toFiniteNumber(json.expires_in, 1800),
      refreshIssuedAt,
      lastVerified,
    };
  }

  /**
   * Exchange an authorization code (or the full pasted callback URL)
   * for tokens. A fresh authorization resets `lastVerified` to null
   * and anchors a new 7-day refresh window at now.
   */
  async exchangeCode(codeOrUrl: string): Promise<SchwabTokenRecord> {
    const code = extractSchwabAuthCode(codeOrUrl);
    if (code === null) {
      throw new SchwabError(
        0,
        "exchangeCode: could not extract an authorization code from the provided input",
      );
    }
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SCHWAB_CALLBACK_URL,
    });
    const json = await this.tokenRequest(form, "Schwab token exchange");
    const nowMs = this.nowFn();
    const rec = this.recordFromTokenResponse(
      json,
      nowMs,
      nowMs,
      null,
      "Schwab token exchange",
    );
    writeSchwabTokens(this.tokenFilePath, rec);
    return rec;
  }

  /**
   * Refresh the access token with the stored refresh token. The
   * 7-day refresh window stays anchored at the ORIGINAL
   * authorization: a new refresh_token in the response is stored,
   * but `refreshIssuedAt` is kept. `lastVerified` is preserved.
   */
  async refresh(): Promise<SchwabTokenRecord> {
    const existing = readSchwabTokens(this.tokenFilePath);
    if (existing === null) {
      throw new SchwabError(0, "refresh: no Schwab tokens stored — authorization required");
    }
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: existing.refreshToken,
    });
    const json = await this.tokenRequest(form, "Schwab token refresh");
    // Schwab may omit refresh_token on refresh (the old one stays
    // valid); fall back to the stored token in that case.
    const merged: Record<string, unknown> =
      typeof json.refresh_token === "string" && json.refresh_token !== ""
        ? json
        : { ...json, refresh_token: existing.refreshToken };
    const rec = this.recordFromTokenResponse(
      merged,
      this.nowFn(),
      existing.refreshIssuedAt,
      existing.lastVerified,
      "Schwab token refresh",
    );
    writeSchwabTokens(this.tokenFilePath, rec);
    return rec;
  }

  /**
   * A currently-valid access token, refreshing first when the stored
   * token is expired or within SCHWAB_ACCESS_SKEW_MS of expiry.
   */
  async accessToken(): Promise<string> {
    const rec = readSchwabTokens(this.tokenFilePath);
    if (rec === null) {
      throw new SchwabError(0, "accessToken: no Schwab tokens stored — authorization required");
    }
    const expiresAt = rec.accessIssuedAt + rec.accessExpiresInSec * 1000;
    if (this.nowFn() >= expiresAt - SCHWAB_ACCESS_SKEW_MS) {
      const refreshed = await this.refresh();
      return refreshed.accessToken;
    }
    return rec.accessToken;
  }

  /**
   * Raw authenticated request: Bearer auth via `accessToken()`, JSON
   * body when provided. Returns status/headers/parsed JSON without
   * throwing on non-2xx, so callers that need headers (placeOrder's
   * Location) can handle the response themselves.
   */
  private async rawRequest(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<RawResponse> {
    const token = await this.accessToken();
    const hasBody = init?.body !== undefined;
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      ...(hasBody ? { body: JSON.stringify(init.body) } : {}),
    });
    const { text, json } = await readResponse(res);
    return {
      status: res.status ?? 0,
      headers: res.headers,
      json,
      text,
    };
  }

  /** Authenticated JSON request; throws SchwabError on non-2xx. */
  async request<T>(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<T> {
    const raw = await this.rawRequest(path, init);
    if (raw.status < 200 || raw.status >= 300) {
      throw httpError(`Schwab request ${init?.method ?? "GET"} ${path}`, raw.status, raw.text);
    }
    return raw.json as T;
  }

  /** Account numbers + hashes; the result is cached on the instance. */
  async getAccountNumbers(): Promise<SchwabAccountNumber[]> {
    if (this.accountNumbersCache !== null) return this.accountNumbersCache;
    const raw = await this.request<unknown>("/trader/v1/accounts/accountNumbers");
    const list = Array.isArray(raw) ? raw : [];
    const mapped: SchwabAccountNumber[] = list.map((entry) => {
      const item = isRecord(entry) ? entry : {};
      return {
        accountNumber:
          item.accountNumber === undefined || item.accountNumber === null
            ? ""
            : String(item.accountNumber),
        hashValue:
          item.hashValue === undefined || item.hashValue === null
            ? ""
            : String(item.hashValue),
      };
    });
    this.accountNumbersCache = mapped;
    return mapped;
  }

  /** The first account's hash (single-account assumption, see header). */
  async accountHash(): Promise<string> {
    const accounts = await this.getAccountNumbers();
    const first = accounts[0];
    if (!first || first.hashValue === "") {
      throw new SchwabError(0, "accountHash: no Schwab accounts returned");
    }
    return first.hashValue;
  }

  async getAccount(hashValue: string): Promise<SchwabAccountSummary> {
    const raw = await this.request<unknown>(
      `/trader/v1/accounts/${encodeURIComponent(hashValue)}?fields=positions`,
    );
    return mapAccountSummary(raw);
  }

  async getOrders(hashValue: string): Promise<SchwabOrderRaw[]> {
    const nowMs = this.nowFn();
    const params = new URLSearchParams({
      fromEnteredTime: formatSchwabTime(nowMs - 60 * 24 * 60 * 60 * 1000),
      toEnteredTime: formatSchwabTime(nowMs),
    });
    const raw = await this.request<unknown>(
      `/trader/v1/accounts/${encodeURIComponent(hashValue)}/orders?${params.toString()}`,
    );
    const list = Array.isArray(raw) ? raw : [];
    return list.map(mapOrder);
  }

  async getOrder(hashValue: string, orderId: string): Promise<SchwabOrderRaw> {
    const raw = await this.request<unknown>(
      `/trader/v1/accounts/${encodeURIComponent(hashValue)}/orders/${encodeURIComponent(orderId)}`,
    );
    return mapOrder(raw);
  }

  /**
   * Place an order. Schwab answers 201 with an empty body and the
   * order id in the `Location` header — parse its trailing segment
   * (null when the header is absent).
   */
  async placeOrder(
    hashValue: string,
    body: SchwabOrderBody,
  ): Promise<{ orderId: string | null; status: number }> {
    const path = `/trader/v1/accounts/${encodeURIComponent(hashValue)}/orders`;
    const raw = await this.rawRequest(path, { method: "POST", body });
    if (raw.status < 200 || raw.status >= 300) {
      throw httpError(`Schwab place order POST ${path}`, raw.status, raw.text);
    }
    const location = headerValue(raw.headers, "Location");
    let orderId: string | null = null;
    if (location !== null && location.trim() !== "") {
      const segments = location.split("/").filter((s) => s !== "");
      orderId = segments.length > 0 ? (segments[segments.length - 1] ?? null) : null;
    }
    return { orderId, status: raw.status };
  }

  /** Preview an order; Schwab's parsed response is returned as-is. */
  async previewOrder(hashValue: string, body: SchwabOrderBody): Promise<unknown> {
    return this.request<unknown>(
      `/trader/v1/accounts/${encodeURIComponent(hashValue)}/previewOrder`,
      { method: "POST", body },
    );
  }

  async cancelOrder(hashValue: string, orderId: string): Promise<void> {
    const path =
      `/trader/v1/accounts/${encodeURIComponent(hashValue)}/orders/` +
      `${encodeURIComponent(orderId)}`;
    const raw = await this.rawRequest(path, { method: "DELETE" });
    if (raw.status < 200 || raw.status >= 300) {
      throw httpError(`Schwab cancel order DELETE ${path}`, raw.status, raw.text);
    }
  }
}
