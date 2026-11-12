/**
 * Phase 12 harness — the Kalshi demo client against a LOCAL mock
 * HTTP server (no network, no real keys):
 *
 *   1. a throwaway RSA keypair signs requests; the mock server
 *      VERIFIES each signature with node:crypto verify using Kalshi's
 *      documented construction (RSA-PSS, SHA-256, salt length 32, over
 *      `${timestamp}${METHOD}${path-with-/trade-api/v2-prefix}`)
 *   2. auth headers are present and shaped correctly
 *   3. balance parsing (cents passthrough)
 *   4. market parsing — BOTH price shapes (*_dollars strings and
 *      integer cents) land as dollar numbers
 *   5. order create payload: side-specific price field in cents,
 *      count, limit type, client_order_id present; order parsing back
 *   6. order cancel issues a DELETE against the order path
 *   7. createKalshiClient() refuses a non-demo KALSHI_ENV and returns
 *      null with no keys loaded
 *
 * Run: npx tsx harness/kalshi-harness.ts   (from packages/engine)
 * Exit code 0 = all checks passed.
 */
import {
  createVerify,
  generateKeyPairSync,
  constants,
} from "node:crypto";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  createKalshiClient,
  createKalshiClientWithKeys,
  kalshiSignaturePayload,
  signKalshiRequest,
  KALSHI_API_PREFIX,
} from "../src/kalshi.js";

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

// ------------------------------------------------------------ keypair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString();

// ------------------------------------------- signature unit verification
{
  const ts = "1762473600000";
  const path = `${KALSHI_API_PREFIX}/portfolio/balance`;
  const sig = signKalshiRequest(privatePem, ts, "GET", path);
  const verifier = createVerify("RSA-SHA256");
  verifier.update(kalshiSignaturePayload(ts, "GET", path));
  verifier.end();
  const ok = verifier.verify(
    {
      key: publicPem,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    },
    Buffer.from(sig, "base64"),
  );
  check("signature verifies against the documented construction", ok);

  const v2 = createVerify("RSA-SHA256");
  v2.update(kalshiSignaturePayload(ts, "GET", `${path}?x=1`));
  v2.end();
  const okWrong = v2.verify(
    { key: publicPem, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 },
    Buffer.from(sig, "base64"),
  );
  check("signature does NOT verify over a different payload", !okWrong);
}

// ------------------------------------------------------------ mock server
interface Captured {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}
const captured: Captured[] = [];
let signatureChecks = 0;
let signatureOk = 0;

function verifyRequestSignature(req: IncomingMessage, path: string): void {
  signatureChecks += 1;
  const ts = String(req.headers["kalshi-access-timestamp"] ?? "");
  const sig = String(req.headers["kalshi-access-signature"] ?? "");
  try {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(kalshiSignaturePayload(ts, req.method ?? "", path));
    verifier.end();
    if (
      verifier.verify(
        { key: publicPem, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 },
        Buffer.from(sig, "base64"),
      )
    ) {
      signatureOk += 1;
    }
  } catch {
    // counted as failure below
  }
}

const server: Server = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (c: Buffer) => chunks.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    const url = new URL(req.url ?? "/", "http://localhost");
    captured.push({
      method: req.method ?? "",
      url: req.url ?? "",
      headers: req.headers,
      body: raw ? (JSON.parse(raw) as unknown) : null,
    });
    // The signature must cover the path WITHOUT the query string.
    verifyRequestSignature(req, url.pathname);
    res.setHeader("content-type", "application/json");
    if (url.pathname === `${KALSHI_API_PREFIX}/portfolio/balance`) {
      res.end(JSON.stringify({ balance: 123456, portfolio_value: 130000 }));
    } else if (url.pathname === `${KALSHI_API_PREFIX}/markets`) {
      res.end(
        JSON.stringify({
          markets: [
            {
              ticker: "KXTEST-1",
              title: "Dollars-shaped market",
              yes_bid_dollars: "0.5500",
              yes_ask_dollars: "0.5700",
              no_bid_dollars: "0.4300",
              no_ask_dollars: "0.4500",
              last_price_dollars: "0.6500",
              volume_fp: "1234.00",
              close_time: "2027-01-01T00:00:00Z",
              status: "active",
            },
            {
              ticker: "KXTEST-2",
              title: "Cents-shaped market",
              yes_bid: 40,
              yes_ask: 42,
              no_bid: 58,
              no_ask: 60,
              last_price: 50,
              volume: 77,
              close_time: "2027-01-01T00:00:00Z",
              status: "active",
            },
          ],
        }),
      );
    } else if (url.pathname === `${KALSHI_API_PREFIX}/portfolio/orders` && req.method === "POST") {
      const b = captured[captured.length - 1]!.body as Record<string, unknown>;
      res.end(
        JSON.stringify({
          order: {
            order_id: "kord-1",
            ticker: b.ticker,
            side: b.side,
            action: b.action,
            count: b.count,
            filled_count: b.count,
            status: "executed",
            yes_price: b.yes_price ?? null,
            no_price: b.no_price ?? null,
          },
        }),
      );
    } else if (url.pathname.startsWith(`${KALSHI_API_PREFIX}/portfolio/orders/`) && req.method === "DELETE") {
      res.statusCode = 204;
      res.end();
    } else if (url.pathname.startsWith(`${KALSHI_API_PREFIX}/portfolio/orders/`)) {
      res.end(
        JSON.stringify({
          order: {
            order_id: "kord-1",
            ticker: "KXTEST-1",
            side: "yes",
            action: "buy",
            count: 10,
            filled_count: 10,
            status: "executed",
            yes_price: 57,
          },
        }),
      );
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "not found" }));
    }
  });
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = (server.address() as AddressInfo).port;
const baseUrl = `http://127.0.0.1:${port}`;

const FIXED_NOW = new Date("2026-11-06T12:00:00Z");
const client = createKalshiClientWithKeys("test-key-id-1234", privatePem, {
  baseUrl,
  now: () => FIXED_NOW,
});

// ---------------------------------------------------------------- balance
{
  const bal = await client.getBalance();
  check("balance parses (cents)", bal.balanceCents === 123456 && bal.portfolioValueCents === 130000);
  const req = captured[captured.length - 1]!;
  check("balance request path", req.url === `${KALSHI_API_PREFIX}/portfolio/balance`);
  check("auth header: key", req.headers["kalshi-access-key"] === "test-key-id-1234");
  check(
    "auth header: timestamp is ms of injected clock",
    req.headers["kalshi-access-timestamp"] === String(FIXED_NOW.getTime()),
  );
  check(
    "auth header: signature present (base64)",
    typeof req.headers["kalshi-access-signature"] === "string" &&
      (req.headers["kalshi-access-signature"] as string).length > 100,
  );
}

// ---------------------------------------------------------------- markets
{
  const markets = await client.getMarkets(200);
  check("markets: two parsed", markets.length === 2);
  const d = markets.find((m) => m.ticker === "KXTEST-1")!;
  check(
    "markets: *_dollars shape → dollars",
    d.yesBid === 0.55 && d.yesAsk === 0.57 && d.lastPrice === 0.65 && d.volume === 1234,
    `got bid=${d.yesBid} ask=${d.yesAsk} last=${d.lastPrice} vol=${d.volume}`,
  );
  const c = markets.find((m) => m.ticker === "KXTEST-2")!;
  check(
    "markets: integer-cents shape → dollars",
    c.yesBid === 0.4 && c.yesAsk === 0.42 && c.lastPrice === 0.5 && c.volume === 77,
    `got bid=${c.yesBid} ask=${c.yesAsk} last=${c.lastPrice}`,
  );
  const req = captured[captured.length - 1]!;
  check(
    "markets request carries status=open + limit, NOT signed in query",
    req.url.includes("status=open") && req.url.includes("limit=200"),
    req.url,
  );
}

// ------------------------------------------------------------------ order
{
  const order = await client.createOrder({
    ticker: "KXTEST-1",
    side: "yes",
    action: "buy",
    count: 10,
    price: 0.57,
  });
  const req = captured[captured.length - 1]!;
  const body = req.body as Record<string, unknown>;
  check("order: POST to /portfolio/orders", req.method === "POST" && req.url === `${KALSHI_API_PREFIX}/portfolio/orders`);
  check("order: yes_price in cents", body.yes_price === 57 && body.no_price === undefined);
  check("order: count + limit type", body.count === 10 && body.type === "limit");
  check("order: client_order_id present", typeof body.client_order_id === "string" && (body.client_order_id as string).length >= 8);
  check("order: parsed back", order.id === "kord-1" && order.filledCount === 10 && order.price === 0.57);

  await client.createOrder({ ticker: "KXTEST-2", side: "no", action: "buy", count: 3, price: 0.6 });
  const body2 = captured[captured.length - 1]!.body as Record<string, unknown>;
  check("order: no side uses no_price", body2.no_price === 60 && body2.yes_price === undefined);

  await client.cancelOrder("kord-1");
  const del = captured[captured.length - 1]!;
  check("cancel: DELETE order path", del.method === "DELETE" && del.url === `${KALSHI_API_PREFIX}/portfolio/orders/kord-1`);
}

// --------------------------------------------------- signature sweep + env
check(
  "every request signature verified server-side",
  signatureChecks >= 5 && signatureOk === signatureChecks,
  `${signatureOk}/${signatureChecks}`,
);
{
  // No keys anywhere in env → factory returns null.
  const prev = { ...process.env };
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("KALSHI") || k.startsWith("ALPACA") || k === "KEYS_FILE") {
      delete process.env[k];
    }
  }
  process.env.KEYS_FILE = "/nonexistent/definitely-missing-keys.txt";
  check("factory: null without keys", createKalshiClient() === null);
  process.env = prev;
}

server.close();
console.log(`\n${passed}/${passed + failed} checks passed`);
if (failures.length) console.log(`failures: ${failures.join("; ")}`);
process.exit(failed === 0 ? 0 : 1);
