/**
 * Fleet v37 verification harness — the Schwab integration.
 *
 *     node_modules/.bin/tsx tools/test-schwab-v37.ts        (from app/)
 *
 * Exercises the REAL v37 code with NO real network — every Schwab
 * HTTP call goes through an injected fake `fetchImpl` that plays a
 * fake Schwab server and records every request:
 *   packages/shared/src/keys.ts    (Schwab parts of the keys loader)
 *   packages/shared/src/schwab.ts  (token store, OAuth, client,
 *                                   order bodies, status surface)
 *   packages/engine/src/venue.ts   (per-bot venue gating)
 *   packages/engine/src/schwab.ts  (engine execution adapter)
 *
 * Coverage:
 *   1. keys loader: SCHWAB_APP_KEY/SECRET load, file-beats-env,
 *      env fallback, both-present rule, status redaction
 *   2. token exchange + on-disk storage (0600, authorized, 7 days)
 *   3. auth-code extraction (bare / callback URL / encoded / error)
 *   4. refresh flow: rotated tokens, refresh anchor preserved
 *   5. expiry / days-left math + all four public chip states
 *   6. account-hash lookup caching (one network call)
 *   7. order payload shapes + place / preview / cancel via client
 *   8. shared account / orders mapping (weighted avg fill price)
 *   9. engine adapter mapping (positions, orders, order placement,
 *      option / GTC refusals, missing data client, closePosition)
 *  10. redaction across every API-shaped payload
 *  11. venue gating (modes, ceiling, exclusions, unknown broker)
 *  12. wizard step derivation
 *
 * Scratch lives under ~/workspace/fleet-v37-schwab/scratch-v37/
 * (never /tmp — it is wiped on runtime restart) and is removed in a
 * finally at the end. All credentials below are fake strings minted
 * for this test.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadPaperKeys } from "../packages/shared/src/keys.ts";
import {
  buildEquityOrderBody,
  deriveSchwabWizardStep,
  extractSchwabAuthCode,
  readSchwabTokens,
  SchwabClient,
  schwabAuthState,
  schwabPublicStatus,
  schwabRefreshDaysLeft,
  writeSchwabTokens,
  type SchwabTokenRecord,
} from "../packages/shared/src/schwab.ts";
import type { BotConfig } from "../packages/shared/src/types.ts";
import {
  createSchwabExecutionClient,
} from "../packages/engine/src/schwab.ts";
import {
  effectiveMode,
  resolveBotVenue,
} from "../packages/engine/src/venue.ts";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}
async function expectThrow(
  name: string,
  fn: () => unknown | Promise<unknown>,
  msgPart?: string,
): Promise<void> {
  let thrown: Error | null = null;
  try {
    await fn();
  } catch (e) {
    thrown = e as Error;
  }
  check(
    name,
    thrown !== null &&
      (msgPart === undefined ||
        thrown.message.toLowerCase().includes(msgPart.toLowerCase())),
    thrown ? thrown.message : "nothing was thrown",
  );
}

const SCRATCH = join(homedir(), "workspace/fleet-v37-schwab/scratch-v37");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

// ------------------------------------------------------------- fixtures
const FAKE_APP_KEY = "FAKEAPPKEY12345678";
const FAKE_APP_SECRET = "FAKEAPPSECRET87654321";
const EXPECTED_BASIC = `Basic ${Buffer.from(
  `${FAKE_APP_KEY}:${FAKE_APP_SECRET}`,
  "utf8",
).toString("base64")}`;
const FAKE_CODE = "FAKEAUTHCODE123";
const KNOWN_CODES = new Set([FAKE_CODE, "XYZ", "AB+CD="]);
const NOW = Date.now();
const DAY_MS = 86_400_000;

// ------------------------------------------------------- fake Schwab API
interface RecordedRequest {
  method: string;
  url: string;
  pathname: string;
  headers: Record<string, string>;
  body: string;
}
const recorded: RecordedRequest[] = [];
let accountNumbersCalls = 0;
let lastPlacedBody: Record<string, unknown> | null = null;

const ACCOUNT_PAYLOAD = {
  securitiesAccount: {
    accountNumber: "12345678",
    currentBalances: {
      equity: 25000.5,
      cashBalance: 4000.25,
      liquidationValue: 25000.5,
    },
    positions: [
      {
        instrument: { symbol: "AAPL", assetType: "EQUITY" },
        longQuantity: 10,
        shortQuantity: 0,
        averagePrice: 150,
        marketValue: 1800,
        currentDayProfitLoss: 25.5,
      },
      {
        instrument: { symbol: "MSFT", assetType: "EQUITY" },
        longQuantity: 5,
        shortQuantity: 5,
        averagePrice: 300,
        marketValue: 0,
        currentDayProfitLoss: 0,
      },
    ],
  },
};

const WORKING_ORDER = {
  orderId: 111,
  status: "WORKING",
  orderType: "LIMIT",
  price: 150.25,
  enteredTime: "2026-11-20T14:30:00.000Z",
  filledQuantity: 0,
  orderLegCollection: [
    {
      instruction: "BUY",
      quantity: 5,
      instrument: { symbol: "AAPL", assetType: "EQUITY" },
    },
  ],
  orderActivityCollection: [],
};

const FILLED_ORDER = {
  orderId: 222,
  status: "FILLED",
  orderType: "MARKET",
  enteredTime: "2026-11-20T14:31:00.000Z",
  filledQuantity: 5,
  orderLegCollection: [
    {
      instruction: "SELL",
      quantity: 5,
      instrument: { symbol: "MSFT", assetType: "EQUITY" },
    },
  ],
  orderActivityCollection: [
    {
      executionLegs: [
        { price: 100, quantity: 2 },
        { price: 102, quantity: 3 },
      ],
    },
  ],
};

function placedOrderPayload(): Record<string, unknown> {
  const legs = Array.isArray(lastPlacedBody?.orderLegCollection)
    ? (lastPlacedBody.orderLegCollection as unknown[])
    : [
        {
          instruction: "BUY",
          quantity: 1,
          instrument: { symbol: "AAPL", assetType: "EQUITY" },
        },
      ];
  return {
    orderId: 987654,
    status: "WORKING",
    orderType:
      typeof lastPlacedBody?.orderType === "string"
        ? lastPlacedBody.orderType
        : "MARKET",
    price:
      typeof lastPlacedBody?.price === "string"
        ? Number(lastPlacedBody.price)
        : null,
    enteredTime: "2026-11-20T14:32:00.000Z",
    filledQuantity: 0,
    orderLegCollection: legs,
    orderActivityCollection: [],
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeHeaders(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw instanceof Headers) {
    raw.forEach((v, k) => {
      out[k.toLowerCase()] = v;
    });
  } else if (raw !== null && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "string") out[k.toLowerCase()] = v;
    }
  }
  return out;
}

const fakeFetch = (async (
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  const url = new URL(urlStr);
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = normalizeHeaders(init?.headers);
  const body = typeof init?.body === "string" ? init.body : "";
  recorded.push({ method, url: urlStr, pathname: url.pathname, headers, body });
  const path = url.pathname;

  // --- OAuth token endpoint
  if (method === "POST" && path === "/v1/oauth/token") {
    const params = new URLSearchParams(body);
    const grant = params.get("grant_type");
    if (grant === "authorization_code") {
      const code = params.get("code");
      if (code === null || !KNOWN_CODES.has(code)) {
        return jsonResponse({ error: "invalid_grant" }, 400);
      }
      return jsonResponse({
        access_token: "FAKE-ACCESS-1",
        refresh_token: "FAKE-REFRESH-1",
        expires_in: 1800,
        token_type: "Bearer",
      });
    }
    if (grant === "refresh_token") {
      return jsonResponse({
        access_token: "FAKE-ACCESS-2",
        refresh_token: "FAKE-REFRESH-2",
        expires_in: 1800,
        token_type: "Bearer",
      });
    }
    return jsonResponse({ error: "unsupported_grant_type" }, 400);
  }

  // --- Account numbers
  if (method === "GET" && path === "/trader/v1/accounts/accountNumbers") {
    accountNumbersCalls += 1;
    return jsonResponse([{ accountNumber: "12345678", hashValue: "HASHABC" }]);
  }

  // --- Preview order (before the generic orders POST)
  if (method === "POST" && path === "/trader/v1/accounts/HASHABC/previewOrder") {
    return jsonResponse({ orderId: 555, orderValidationResult: "VALID" });
  }

  // --- Place order
  if (method === "POST" && path === "/trader/v1/accounts/HASHABC/orders") {
    try {
      lastPlacedBody = JSON.parse(body) as Record<string, unknown>;
    } catch {
      lastPlacedBody = null;
    }
    return new Response(null, {
      status: 201,
      headers: {
        Location:
          "https://api.schwabapi.com/trader/v1/accounts/HASHABC/orders/987654",
      },
    });
  }

  // --- Orders list
  if (method === "GET" && path === "/trader/v1/accounts/HASHABC/orders") {
    return jsonResponse([WORKING_ORDER, FILLED_ORDER]);
  }

  // --- Single order GET / DELETE
  const single = /^\/trader\/v1\/accounts\/HASHABC\/orders\/(\d+)$/.exec(path);
  if (single && method === "GET") {
    if (single[1] === "111") return jsonResponse(WORKING_ORDER);
    if (single[1] === "222") return jsonResponse(FILLED_ORDER);
    if (single[1] === "987654") return jsonResponse(placedOrderPayload());
    return jsonResponse({ error: "not found" }, 404);
  }
  if (single && method === "DELETE") {
    return new Response(null, { status: 200 });
  }

  // --- Account with positions
  if (method === "GET" && path === "/trader/v1/accounts/HASHABC") {
    return jsonResponse(ACCOUNT_PAYLOAD);
  }

  return jsonResponse({ error: `fake server: no route for ${method} ${path}` }, 404);
}) as unknown as typeof fetch;

function tokenRequests(grantType: string): RecordedRequest[] {
  return recorded.filter(
    (r) =>
      r.method === "POST" &&
      r.pathname === "/v1/oauth/token" &&
      new URLSearchParams(r.body).get("grant_type") === grantType,
  );
}

function makeClient(tokenFilePath: string): SchwabClient {
  return new SchwabClient({
    appKey: FAKE_APP_KEY,
    appSecret: FAKE_APP_SECRET,
    tokenFilePath,
    fetchImpl: fakeFetch,
    now: () => NOW,
  });
}

function tokenRecord(overrides: Partial<SchwabTokenRecord>): SchwabTokenRecord {
  return {
    accessToken: "SOME-ACCESS",
    refreshToken: "SOME-REFRESH",
    accessIssuedAt: NOW,
    accessExpiresInSec: 1800,
    refreshIssuedAt: NOW,
    lastVerified: null,
    ...overrides,
  };
}

async function main(): Promise<void> {
  try {
    // ============================================ 1. Keys loader
    const keysPath = join(SCRATCH, "traderbot-keys.txt");
    writeFileSync(
      keysPath,
      [
        "# v37 test keys",
        `SCHWAB_APP_KEY=${FAKE_APP_KEY}`,
        `SCHWAB_APP_SECRET=${FAKE_APP_SECRET}`,
      ].join("\n"),
    );
    const configuredKeys = loadPaperKeys({
      keysFilePath: keysPath,
      env: {} as NodeJS.ProcessEnv,
    });
    check("keys: schwab app key loaded", configuredKeys.schwabAppKey === FAKE_APP_KEY);
    check("keys: schwab app secret loaded", configuredKeys.schwabAppSecret === FAKE_APP_SECRET);
    check("keys: status.schwab.loaded true", configuredKeys.status.schwab.loaded === true);
    check(
      "keys: status.schwab.source is file",
      configuredKeys.status.schwab.source === "file",
      configuredKeys.status.schwab.source,
    );
    check(
      "keys: keyIdTail is last 4 of app key",
      configuredKeys.status.schwab.keyIdTail === FAKE_APP_KEY.slice(-4),
      String(configuredKeys.status.schwab.keyIdTail),
    );
    {
      const keys = loadPaperKeys({
        keysFilePath: keysPath,
        env: {
          SCHWAB_APP_KEY: "ENVAPPKEY99999999",
          SCHWAB_APP_SECRET: "env-secret-should-lose",
        } as NodeJS.ProcessEnv,
      });
      check("keys: file beats env (key)", keys.schwabAppKey === FAKE_APP_KEY);
      check("keys: file beats env (secret)", keys.schwabAppSecret === FAKE_APP_SECRET);
    }
    {
      const keys = loadPaperKeys({
        keysFilePath: join(SCRATCH, "absent.txt"),
        env: {
          SCHWAB_APP_KEY: FAKE_APP_KEY,
          SCHWAB_APP_SECRET: FAKE_APP_SECRET,
        } as NodeJS.ProcessEnv,
      });
      check("keys: env-only fallback loads", keys.schwabAppKey === FAKE_APP_KEY && keys.schwabAppSecret === FAKE_APP_SECRET);
      check(
        "keys: env-only source is env",
        keys.status.schwab.loaded && keys.status.schwab.source === "env",
        keys.status.schwab.source,
      );
    }
    {
      const onlyKeyPath = join(SCRATCH, "keys-only-key.txt");
      writeFileSync(onlyKeyPath, `SCHWAB_APP_KEY=${FAKE_APP_KEY}\n`);
      const keys = loadPaperKeys({
        keysFilePath: onlyKeyPath,
        env: {} as NodeJS.ProcessEnv,
      });
      check("keys: only-key-no-secret not loaded", keys.status.schwab.loaded === false);
      check(
        "keys: only-key exposes neither value",
        keys.schwabAppKey === null && keys.schwabAppSecret === null,
      );
      check(
        "keys: only-key detail says both must be present",
        (keys.status.schwab.detail ?? "").includes("both be present"),
        keys.status.schwab.detail ?? "",
      );
    }
    {
      const statusJson = JSON.stringify(configuredKeys.status);
      check("keys: status JSON has no app secret", !statusJson.includes(FAKE_APP_SECRET));
      check("keys: status JSON has no full app key", !statusJson.includes(FAKE_APP_KEY));
    }

    // ============================================ 2. Token exchange + storage
    const tokenPath = join(SCRATCH, "schwab-tokens.json");
    const client = makeClient(tokenPath);
    const exchanged = await client.exchangeCode(FAKE_CODE);
    check("exchange: returns FAKE-ACCESS-1", exchanged.accessToken === "FAKE-ACCESS-1");
    check("exchange: returns FAKE-REFRESH-1", exchanged.refreshToken === "FAKE-REFRESH-1");
    check("exchange: token file persisted", existsSync(tokenPath));
    {
      const onDisk = readSchwabTokens(tokenPath);
      check("exchange: record readable from disk", onDisk !== null);
      check(
        "exchange: disk record carries both tokens",
        onDisk?.accessToken === "FAKE-ACCESS-1" && onDisk?.refreshToken === "FAKE-REFRESH-1",
      );
      check(
        "exchange: refresh anchored at now",
        onDisk?.refreshIssuedAt === NOW && onDisk?.accessIssuedAt === NOW,
      );
      let modeBits = -1;
      try {
        modeBits = statSync(tokenPath).mode & 0o777;
      } catch {
        modeBits = -1;
      }
      check(
        "exchange: token file mode is 0600",
        modeBits === 0o600,
        modeBits >= 0 ? `0o${modeBits.toString(8)}` : "stat failed",
      );
    }
    {
      const status = schwabPublicStatus({
        keys: configuredKeys,
        tokenFilePath: tokenPath,
        nowMs: NOW,
      });
      check("exchange: public state authorized", status.state === "authorized", status.state);
      check("exchange: refreshDaysLeft is 7", status.refreshDaysLeft === 7, String(status.refreshDaysLeft));
      check("exchange: public status live true", status.live === true);
    }
    {
      const posts = tokenRequests("authorization_code");
      check("exchange: exactly one authorization_code POST so far", posts.length === 1, String(posts.length));
      const post = posts[0];
      check(
        "exchange: Basic auth header matches app key/secret",
        post?.headers["authorization"] === EXPECTED_BASIC,
        post?.headers["authorization"] ?? "",
      );
      const params = new URLSearchParams(post?.body ?? "");
      check("exchange: grant_type is authorization_code", params.get("grant_type") === "authorization_code");
      check("exchange: code param is the fake code", params.get("code") === FAKE_CODE);
      check(
        "exchange: redirect_uri is the loopback callback",
        params.get("redirect_uri") === "https://127.0.0.1:8182",
        params.get("redirect_uri") ?? "",
      );
    }

    // ============================================ 3. Code extraction
    check("extract: bare code", extractSchwabAuthCode(FAKE_CODE) === FAKE_CODE);
    check(
      "extract: full callback URL",
      extractSchwabAuthCode("https://127.0.0.1:8182/?code=XYZ&state=abc") === "XYZ",
    );
    check(
      "extract: URL-encoded code is decoded",
      extractSchwabAuthCode("https://127.0.0.1:8182/?code=AB%2BCD%3D&state=x") === "AB+CD=",
    );
    check(
      "extract: error param yields null",
      extractSchwabAuthCode("https://127.0.0.1:8182/?error=access_denied&state=abc") === null,
    );
    check("extract: garbage yields null", extractSchwabAuthCode("hello world not a code") === null);
    check("extract: empty yields null", extractSchwabAuthCode("") === null);
    {
      const urlClient = makeClient(join(SCRATCH, "tokens-from-url.json"));
      const rec = await urlClient.exchangeCode(
        "https://127.0.0.1:8182/?code=XYZ&state=abc",
      );
      check("extract: exchangeCode(full pasted URL) succeeds", rec.accessToken === "FAKE-ACCESS-1");
    }

    // ============================================ 4. Refresh flow + anchor semantics
    const refreshPath = join(SCRATCH, "tokens-refresh.json");
    const craftedRefreshIssuedAt = NOW - 3 * DAY_MS;
    writeSchwabTokens(
      refreshPath,
      tokenRecord({
        accessToken: "OLD-ACCESS",
        refreshToken: "OLD-REFRESH",
        accessIssuedAt: NOW - 3 * 3_600_000,
        accessExpiresInSec: 1800,
        refreshIssuedAt: craftedRefreshIssuedAt,
      }),
    );
    {
      const refreshClient = makeClient(refreshPath);
      const refreshBefore = tokenRequests("refresh_token").length;
      const tok = await refreshClient.accessToken();
      check("refresh: accessToken returns rotated access token", tok === "FAKE-ACCESS-2", tok);
      check(
        "refresh: exactly one refresh grant fired",
        tokenRequests("refresh_token").length - refreshBefore === 1,
      );
      const refreshPost = tokenRequests("refresh_token").at(-1);
      check(
        "refresh: grant carried the stored refresh token",
        new URLSearchParams(refreshPost?.body ?? "").get("refresh_token") === "OLD-REFRESH",
      );
      const stored = readSchwabTokens(refreshPath);
      check(
        "refresh: stored record has new access token",
        stored?.accessToken === "FAKE-ACCESS-2",
      );
      check(
        "refresh: stored record has new refresh token",
        stored?.refreshToken === "FAKE-REFRESH-2",
      );
      check(
        "refresh: refreshIssuedAt anchor UNCHANGED",
        stored?.refreshIssuedAt === craftedRefreshIssuedAt,
        String(stored?.refreshIssuedAt),
      );
      check(
        "refresh: schwabRefreshDaysLeft is 4 after 3 days",
        stored !== null && schwabRefreshDaysLeft(stored, NOW) === 4,
        stored ? String(schwabRefreshDaysLeft(stored, NOW)) : "no record",
      );
    }

    // ============================================ 5. Expiry math + four chip states
    const noKeys = loadPaperKeys({
      keysFilePath: join(SCRATCH, "absent.txt"),
      env: {} as NodeJS.ProcessEnv,
    });
    {
      const s = schwabPublicStatus({
        keys: noKeys,
        tokenFilePath: join(SCRATCH, "no-tokens.json"),
        nowMs: NOW,
      });
      check("chip: no credentials → no-key", s.state === "no-key" && s.configured === false, s.state);
      check("chip: no-key refreshDaysLeft null", s.refreshDaysLeft === null);
      check("chip: no-key live true", s.live === true);
    }
    {
      const s = schwabPublicStatus({
        keys: configuredKeys,
        tokenFilePath: join(SCRATCH, "no-tokens.json"),
        nowMs: NOW,
      });
      check(
        "chip: credentials, no token file → not-authorized",
        s.state === "not-authorized" && s.configured === true,
        s.state,
      );
      check("chip: not-authorized refreshDaysLeft null", s.refreshDaysLeft === null);
      check("chip: not-authorized live true", s.live === true);
    }
    {
      const p = join(SCRATCH, "tokens-fresh.json");
      writeSchwabTokens(p, tokenRecord({ refreshIssuedAt: NOW }));
      const s = schwabPublicStatus({ keys: configuredKeys, tokenFilePath: p, nowMs: NOW });
      check("chip: fresh record → authorized", s.state === "authorized", s.state);
      check("chip: fresh record daysLeft 7", s.refreshDaysLeft === 7, String(s.refreshDaysLeft));
      check("chip: authorized live true", s.live === true);
    }
    {
      const p = join(SCRATCH, "tokens-6half.json");
      writeSchwabTokens(p, tokenRecord({ refreshIssuedAt: NOW - 6.5 * DAY_MS }));
      const s = schwabPublicStatus({ keys: configuredKeys, tokenFilePath: p, nowMs: NOW });
      check("chip: 6.5 days in → still authorized", s.state === "authorized", s.state);
      check("chip: 6.5 days in → daysLeft 1 (ceil)", s.refreshDaysLeft === 1, String(s.refreshDaysLeft));
      check("chip: 6.5-day live true", s.live === true);
    }
    {
      const p = join(SCRATCH, "tokens-exact7.json");
      writeSchwabTokens(p, tokenRecord({ refreshIssuedAt: NOW - 7 * DAY_MS }));
      const s = schwabPublicStatus({ keys: configuredKeys, tokenFilePath: p, nowMs: NOW });
      check("chip: exactly 7 days → expired", s.state === "expired", s.state);
      check("chip: exactly 7 days → daysLeft 0", s.refreshDaysLeft === 0, String(s.refreshDaysLeft));
      check("chip: expired live true", s.live === true);
    }
    {
      const p = join(SCRATCH, "tokens-past7.json");
      writeSchwabTokens(p, tokenRecord({ refreshIssuedAt: NOW - 8 * DAY_MS }));
      const s = schwabPublicStatus({ keys: configuredKeys, tokenFilePath: p, nowMs: NOW });
      check("chip: past 7 days → expired + 0", s.state === "expired" && s.refreshDaysLeft === 0, s.state);
    }
    check(
      "state math: schwabAuthState no-key wins over record",
      schwabAuthState(false, tokenRecord({}), NOW) === "no-key",
    );
    check(
      "state math: schwabAuthState not-authorized on null record",
      schwabAuthState(true, null, NOW) === "not-authorized",
    );

    // ============================================ 6. Account hash caching
    {
      const cacheClient = makeClient(tokenPath);
      const before = accountNumbersCalls;
      const h1 = await cacheClient.accountHash();
      const h2 = await cacheClient.accountHash();
      check("cache: accountHash returns HASHABC", h1 === "HASHABC" && h2 === "HASHABC", h1);
      check(
        "cache: two accountHash calls → one network call",
        accountNumbersCalls - before === 1,
        String(accountNumbersCalls - before),
      );
    }

    // ============================================ 7. Order payload shapes + client order calls
    {
      const mb = buildEquityOrderBody({ symbol: "aapl", side: "buy", qty: 10, type: "market" });
      check("body: market orderType", mb.orderType === "MARKET", mb.orderType);
      check("body: market has NO price field", !("price" in mb));
      check("body: market buy instruction", mb.orderLegCollection[0]?.instruction === "BUY");
      check("body: leg quantity", mb.orderLegCollection[0]?.quantity === 10);
      check(
        "body: symbol uppercased",
        mb.orderLegCollection[0]?.instrument.symbol === "AAPL",
        mb.orderLegCollection[0]?.instrument.symbol,
      );
      check("body: assetType EQUITY", mb.orderLegCollection[0]?.instrument.assetType === "EQUITY");
      check("body: session NORMAL", mb.session === "NORMAL");
      check("body: duration DAY", mb.duration === "DAY");
      check("body: orderStrategyType SINGLE", mb.orderStrategyType === "SINGLE");
      const ms = buildEquityOrderBody({ symbol: "MSFT", side: "sell", qty: 3, type: "market" });
      check("body: market sell instruction", ms.orderLegCollection[0]?.instruction === "SELL");
      const lb = buildEquityOrderBody({
        symbol: "AAPL",
        side: "buy",
        qty: 1,
        type: "limit",
        limitPrice: 1,
      });
      check("body: limit orderType", lb.orderType === "LIMIT", lb.orderType);
      check("body: limit price is \"1.00\" string", lb.price === "1.00", String(lb.price));
      await expectThrow(
        "body: limit without price throws",
        () => buildEquityOrderBody({ symbol: "AAPL", side: "buy", qty: 1, type: "limit" }),
        "limitPrice",
      );
    }
    {
      const body = buildEquityOrderBody({ symbol: "AAPL", side: "buy", qty: 2, type: "market" });
      const placed = await client.placeOrder("HASHABC", body);
      check("client: placeOrder status 201", placed.status === 201, String(placed.status));
      check(
        "client: placeOrder orderId from Location header",
        placed.orderId === "987654",
        String(placed.orderId),
      );
      const preview = (await client.previewOrder("HASHABC", body)) as {
        orderId?: number;
        orderValidationResult?: string;
      };
      check(
        "client: previewOrder returns fake JSON",
        preview.orderId === 555 && preview.orderValidationResult === "VALID",
        JSON.stringify(preview),
      );
      const deletesBefore = recorded.filter((r) => r.method === "DELETE").length;
      await client.cancelOrder("HASHABC", "987654");
      const deletes = recorded.filter((r) => r.method === "DELETE");
      check(
        "client: cancelOrder issues exactly one DELETE",
        deletes.length - deletesBefore === 1,
      );
      check(
        "client: cancelOrder DELETE hits the order URL",
        deletes.at(-1)?.pathname === "/trader/v1/accounts/HASHABC/orders/987654",
        deletes.at(-1)?.pathname,
      );
    }

    // ============================================ 8. Positions + orders mapping (shared)
    {
      const summary = await client.getAccount("HASHABC");
      check("account: equity mapped", summary.equity === 25000.5, String(summary.equity));
      check("account: cash mapped", summary.cash === 4000.25, String(summary.cash));
      check(
        "account: liquidationValue mapped",
        summary.liquidationValue === 25000.5,
        String(summary.liquidationValue),
      );
      check("account: both raw positions present", summary.positions.length === 2, String(summary.positions.length));
      const aapl = summary.positions.find((p) => p.symbol === "AAPL");
      check(
        "account: AAPL quantities mapped",
        aapl?.longQuantity === 10 && aapl?.shortQuantity === 0,
      );
      check("account: AAPL averagePrice mapped", aapl?.averagePrice === 150, String(aapl?.averagePrice));
      check(
        "account: AAPL day PnL mapped",
        aapl?.currentDayProfitLoss === 25.5,
        String(aapl?.currentDayProfitLoss),
      );
      const orders = await client.getOrders("HASHABC");
      check("orders: two orders mapped", orders.length === 2, String(orders.length));
      const filled = orders.find((o) => o.orderId === "222");
      check("orders: FILLED status raw", filled?.status === "FILLED", filled?.status);
      check(
        "orders: filledAvgPrice weighted 101.2",
        filled?.filledAvgPrice !== null &&
          filled?.filledAvgPrice !== undefined &&
          Math.abs(filled.filledAvgPrice - 101.2) < 1e-9,
        String(filled?.filledAvgPrice),
      );
      const single = await client.getOrder("HASHABC", "222");
      check(
        "orders: getOrder FILLED weighted avg 101.2",
        single.filledAvgPrice !== null && Math.abs(single.filledAvgPrice - 101.2) < 1e-9,
        String(single.filledAvgPrice),
      );
      check("orders: getOrder filledQuantity", single.filledQuantity === 5, String(single.filledQuantity));
    }

    // ============================================ 9. Engine adapter mapping
    {
      const exec = createSchwabExecutionClient({ schwab: client, data: null });
      const positions = await exec.getPositions();
      check("engine: exactly one net position", positions.length === 1, String(positions.length));
      const aapl = positions.find((p) => p.symbol === "AAPL");
      check("engine: AAPL present", aapl !== undefined);
      check("engine: AAPL qty 10", aapl?.qty === 10, String(aapl?.qty));
      check("engine: AAPL avgEntryPrice 150", aapl?.avgEntryPrice === 150, String(aapl?.avgEntryPrice));
      check("engine: AAPL marketValue 1800", aapl?.marketValue === 1800, String(aapl?.marketValue));
      check("engine: AAPL currentPrice 180", aapl?.currentPrice === 180, String(aapl?.currentPrice));
      check(
        "engine: net-zero MSFT row absent",
        positions.every((p) => p.symbol !== "MSFT"),
      );
      const open = await exec.getOpenOrders();
      check("engine: open orders exclude FILLED", open.every((o) => o.id !== "222"));
      const working = open.find((o) => o.id === "111");
      check("engine: WORKING order included", working !== undefined);
      check("engine: WORKING status mapped lowercase", working?.status === "working", working?.status);
      check("engine: open order timeInForce day", working?.timeInForce === "day", working?.timeInForce);
      const filledOrder = await exec.getOrder("222");
      check("engine: getOrder FILLED → filled", filledOrder.status === "filled", filledOrder.status);
      check(
        "engine: getOrder FILLED avg price 101.2",
        filledOrder.filledAvgPrice !== null && Math.abs(filledOrder.filledAvgPrice - 101.2) < 1e-9,
        String(filledOrder.filledAvgPrice),
      );

      const postsBefore = recorded.filter(
        (r) => r.method === "POST" && r.pathname === "/trader/v1/accounts/HASHABC/orders",
      ).length;
      const created = await exec.createOrder({
        symbol: "AAPL",
        qty: 3,
        side: "buy",
        type: "market",
        timeInForce: "day",
      });
      check("engine: createOrder returns re-fetched order", created.id === "987654", created.id);
      check(
        "engine: createOrder side/symbol from re-fetch",
        created.side === "buy" && created.symbol === "AAPL",
        `${created.side}/${created.symbol}`,
      );
      const posts = recorded.filter(
        (r) => r.method === "POST" && r.pathname === "/trader/v1/accounts/HASHABC/orders",
      );
      check("engine: createOrder issued one POST", posts.length - postsBefore === 1);
      const postedBody = JSON.parse(posts.at(-1)?.body ?? "{}") as {
        orderType?: string;
        price?: unknown;
        session?: string;
        duration?: string;
        orderStrategyType?: string;
        orderLegCollection?: {
          instruction?: string;
          quantity?: number;
          instrument?: { symbol?: string; assetType?: string };
        }[];
      };
      check("engine: POST body orderType MARKET", postedBody.orderType === "MARKET", postedBody.orderType);
      check("engine: POST body has no price", !("price" in postedBody));
      check(
        "engine: POST body leg matches buildEquityOrderBody shape",
        postedBody.orderLegCollection?.[0]?.instruction === "BUY" &&
          postedBody.orderLegCollection?.[0]?.quantity === 3 &&
          postedBody.orderLegCollection?.[0]?.instrument?.symbol === "AAPL" &&
          postedBody.orderLegCollection?.[0]?.instrument?.assetType === "EQUITY" &&
          postedBody.session === "NORMAL" &&
          postedBody.duration === "DAY" &&
          postedBody.orderStrategyType === "SINGLE",
      );
      await expectThrow(
        "engine: createOrder OCC option symbol throws",
        () =>
          exec.createOrder({
            symbol: "AAPL261120C00150000",
            qty: 1,
            side: "buy",
            type: "market",
            timeInForce: "day",
          }),
        "option",
      );
      await expectThrow(
        "engine: createOrder gtc throws",
        () =>
          exec.createOrder({
            symbol: "AAPL",
            qty: 1,
            side: "buy",
            type: "market",
            timeInForce: "gtc",
          }),
        "DAY only",
      );
      await expectThrow(
        "engine: getDailyBars with data null throws clearly",
        () => exec.getDailyBars("AAPL", "2026-01-01"),
        "market data unavailable",
      );
      const closed = await exec.closePosition("AAPL");
      const closePost = recorded
        .filter(
          (r) => r.method === "POST" && r.pathname === "/trader/v1/accounts/HASHABC/orders",
        )
        .at(-1);
      const closeBody = JSON.parse(closePost?.body ?? "{}") as {
        orderLegCollection?: { instruction?: string; quantity?: number }[];
      };
      check(
        "engine: closePosition places SELL for full qty 10",
        closeBody.orderLegCollection?.[0]?.instruction === "SELL" &&
          closeBody.orderLegCollection?.[0]?.quantity === 10,
        closePost?.body,
      );
      check("engine: closePosition returns an order", closed.id === "987654", closed.id);
    }

    // ============================================ 10. Redaction across API-shaped payloads
    {
      const pub = schwabPublicStatus({
        keys: configuredKeys,
        tokenFilePath: tokenPath,
        nowMs: NOW,
      });
      const pubJson = JSON.stringify(pub);
      const statusJson = JSON.stringify(configuredKeys.status);
      const needles = ["FAKE-ACCESS", "FAKE-REFRESH", FAKE_APP_SECRET, FAKE_APP_KEY];
      for (const needle of needles) {
        check(`redact: public status has no ${needle.slice(0, 12)}…`, !pubJson.includes(needle));
        check(`redact: keys status has no ${needle.slice(0, 12)}…`, !statusJson.includes(needle));
      }
      check(
        "redact: public status has no accessToken key",
        !("accessToken" in pub),
      );
      check(
        "redact: public status has no refreshToken key",
        !("refreshToken" in pub),
      );
      check(
        "redact: public status key set is exactly the public surface",
        JSON.stringify(Object.keys(pub).sort()) ===
          JSON.stringify(["configured", "last4", "live", "refreshDaysLeft", "state"]),
        Object.keys(pub).sort().join(","),
      );
      check(
        "redact: token file itself DOES hold tokens on disk (sanity)",
        (readFileSync(tokenPath, "utf8") ?? "").includes("FAKE-ACCESS-1"),
      );
    }

    // ============================================ 11. Venue gating
    {
      const stub = (
        codename: string,
        broker: string,
        mode: string,
        name = codename,
      ): BotConfig => ({
        name,
        codename,
        enabled: true,
        mode,
        market: "stocks",
        broker,
        strategy: "test",
        viz: { color: "#000000", form: "disc", avatar_accessory: "" },
        rules: {},
        risk: {},
        philosophy: "",
        sourcePath: "",
        raw: {},
      });
      for (const fleet of ["sim", "paper", "connected"] as const) {
        const r = resolveBotVenue(stub("trendia", "alpaca", "sim", "Trendia"), fleet);
        check(`venue: alpaca default ok under fleet ${fleet}`, r.ok === true && r.venue === "alpaca");
      }
      {
        const r = resolveBotVenue(stub("trendia", "", "sim", "Trendia"), "sim");
        check("venue: empty broker defaults to alpaca ok", r.ok === true && r.venue === "alpaca");
      }
      {
        const r = resolveBotVenue(stub("trendia", "schwab", "paper", "Trendia"), "connected");
        check("venue: schwab bot paper under fleet connected refused", r.ok === false && r.venue === "schwab");
      }
      {
        const r = resolveBotVenue(stub("trendia", "schwab", "connected", "Trendia"), "paper");
        check("venue: schwab bot connected under fleet paper refused (ceiling)", r.ok === false);
      }
      {
        const r = resolveBotVenue(stub("trendia", "schwab", "connected", "Trendia"), "connected");
        check("venue: trendia schwab connected/connected ok", r.ok === true && r.venue === "schwab" && r.reason === null);
      }
      {
        const r = resolveBotVenue(stub("snapback", "schwab", "connected", "Snapback"), "connected");
        check("venue: snapback schwab connected/connected ok", r.ok === true && r.venue === "schwab");
      }
      {
        const r = resolveBotVenue(stub("vega", "schwab", "connected", "Vega"), "connected");
        check("venue: vega schwab refused", r.ok === false);
        check(
          "venue: vega reason mentions options",
          (r.reason ?? "").toLowerCase().includes("options"),
          r.reason ?? "",
        );
      }
      {
        const r = resolveBotVenue(stub("wesley", "schwab", "connected", "Wesley"), "connected");
        check("venue: wesley schwab refused", r.ok === false);
        check(
          "venue: wesley reason mentions options",
          (r.reason ?? "").toLowerCase().includes("options"),
          r.reason ?? "",
        );
      }
      {
        const r = resolveBotVenue(
          stub("polycrypt9000", "schwab", "connected", "PolyCrypt9000"),
          "connected",
        );
        check("venue: polycrypt9000 schwab refused", r.ok === false);
        check(
          "venue: polycrypt reason mentions exclusion / no crypto",
          (r.reason ?? "").toLowerCase().includes("excluded") &&
            (r.reason ?? "").toLowerCase().includes("crypto"),
          r.reason ?? "",
        );
      }
      {
        const r = resolveBotVenue(stub("trendia", "ibkr", "connected", "Trendia"), "connected");
        check("venue: unknown broker ibkr refused", r.ok === false);
        check(
          "venue: unknown broker reason names it",
          (r.reason ?? "").includes("ibkr"),
          r.reason ?? "",
        );
      }
      check(
        "venue: effectiveMode bot paper under fleet connected → paper",
        effectiveMode("paper", "connected") === "paper",
      );
      check(
        "venue: effectiveMode bot connected under fleet sim → sim",
        effectiveMode("connected", "sim") === "sim",
      );
      check(
        "venue: effectiveMode garbage bot mode → sim",
        effectiveMode("garbage", "connected") === "sim",
      );
    }

    // ============================================ 12. Wizard step derivation
    check(
      "wizard: not configured → 4",
      deriveSchwabWizardStep({ configured: false, state: "no-key", verified: false }) === 4,
    );
    check(
      "wizard: configured + not-authorized → 5",
      deriveSchwabWizardStep({ configured: true, state: "not-authorized", verified: false }) === 5,
    );
    check(
      "wizard: expired → 5",
      deriveSchwabWizardStep({ configured: true, state: "expired", verified: false }) === 5,
    );
    check(
      "wizard: authorized + unverified → 6",
      deriveSchwabWizardStep({ configured: true, state: "authorized", verified: false }) === 6,
    );
    check(
      "wizard: authorized + verified → 7",
      deriveSchwabWizardStep({ configured: true, state: "authorized", verified: true }) === 7,
    );
  } finally {
    rmSync(SCRATCH, { recursive: true, force: true });
  }
}

main()
  .then(() => {
    console.log(`\n${checks - failures}/${checks} checks passed`);
    console.log(`scratch removed: ${!existsSync(SCRATCH)}`);
    process.exit(failures === 0 ? 0 : 1);
  })
  .catch((err: unknown) => {
    failures += 1;
    console.error("HARNESS ERROR:", err instanceof Error ? (err.stack ?? err.message) : err);
    console.log(`\n${checks - failures}/${checks} checks passed`);
    console.log(`scratch removed: ${!existsSync(SCRATCH)}`);
    process.exit(1);
  });
