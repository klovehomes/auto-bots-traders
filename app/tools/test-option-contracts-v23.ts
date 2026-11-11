/**
 * v23 verification — the REAL Alpaca client's getOptionContracts.
 *
 *     node_modules/.bin/tsx tools/test-option-contracts-v23.ts   (from app/)
 *
 * Root cause under test: contract discovery was pointed at the Market
 * Data API (https://data.alpaca.markets/v1beta1/options/contracts), a
 * path that does not exist — every Vega contract pick (and Wesley
 * chain scan) died with HTTP 404. Discovery lives on the Trading API:
 * GET /v2/options/contracts on paper-api.alpaca.markets (paper) or
 * api.alpaca.markets (live).
 *
 * Exercises createAlpacaClient() from packages/engine/src/alpaca.ts
 * with `fetch` mocked and DUMMY paper keys supplied through a scratch
 * keys file (the v21 loader pattern — never real keys):
 *   1. request goes to the paper Trading API host + /v2 path
 *   2. query carries underlying / type / expiry window / status=active
 *   3. auth headers are the dummy keys
 *   4. pagination follows next_page_token (and stops when it ends)
 *   5. contracts parse: symbol / underlying / type / strike / expiry / OI
 *      (a missing open_interest parses as 0)
 *   6. ALPACA_PAPER=false selects the live Trading host
 *   7. a non-OK response still throws the Phase 6 error shape —
 *      context + HTTP status + body excerpt — so Vega's NO TRADE
 *      decision visibility is unchanged
 *
 * Scratch lives under ~/workspace/trading-bots/scratch-v23/ (never
 * /tmp — it is wiped on runtime restart), mirroring the earlier tools.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v23");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const FAKE_ALPACA_ID = "PKV23DUMMYKEYID0000WXYZ";
const FAKE_ALPACA_SECRET = "v23-dummy-secret-not-a-real-key-0123456789";
const keysPath = join(SCRATCH, "traderbot-keys.txt");
writeFileSync(
  keysPath,
  [
    `ALPACA_API_KEY_ID=${FAKE_ALPACA_ID}`,
    `ALPACA_API_SECRET_KEY=${FAKE_ALPACA_SECRET}`,
  ].join("\n"),
);
// Env must be in place before the first keys load (loader caches).
process.env.KEYS_FILE = keysPath;
delete process.env.ALPACA_PAPER;

const { createAlpacaClient } = await import(
  "../packages/engine/src/alpaca.ts"
);

// ------------------------------------------------------------ fetch mock
interface RecordedCall {
  url: URL;
  headers: Record<string, string>;
}
const calls: RecordedCall[] = [];
let responder: (call: number) => Response = () => {
  throw new Error("responder not set");
};
const realFetch = globalThis.fetch;
globalThis.fetch = (async (
  input: string | URL | Request,
  init?: RequestInit,
) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const headers: Record<string, string> = {};
  const h = new Headers(init?.headers);
  h.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  calls.push({ url, headers });
  return responder(calls.length);
}) as typeof fetch;

const jsonPage = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const PAGE_1 = {
  option_contracts: [
    {
      symbol: "NET261204C00160000",
      underlying_symbol: "NET",
      type: "call",
      strike_price: "160.000",
      expiration_date: "2026-12-04",
      open_interest: "1234",
    },
    {
      symbol: "NET261204C00165000",
      underlying_symbol: "NET",
      type: "call",
      strike_price: "165.000",
      expiration_date: "2026-12-04",
      open_interest: "87",
    },
  ],
  next_page_token: "PAGE2TOKEN",
};
const PAGE_2 = {
  option_contracts: [
    {
      symbol: "NET261211C00170000",
      underlying_symbol: "NET",
      type: "call",
      strike_price: "170.000",
      expiration_date: "2026-12-11",
      // open_interest deliberately absent — must parse as 0
    },
  ],
  next_page_token: null,
};

// ------------------------------------------------------------- paper host
const client = createAlpacaClient();
check("client built from dummy keys file", client !== null);
if (client) {
  responder = (n) => jsonPage(n === 1 ? PAGE_1 : PAGE_2);
  const contracts = await client.getOptionContracts(
    "NET",
    "call",
    "2026-11-25",
    "2026-12-09",
  );

  check("exactly 2 requests (pagination stopped)", calls.length === 2);
  const first = calls[0];
  check(
    "host is paper Trading API",
    first !== undefined &&
      `${first.url.protocol}//${first.url.host}` ===
        "https://paper-api.alpaca.markets",
    first?.url.host,
  );
  check(
    "path is /v2/options/contracts",
    first?.url.pathname === "/v2/options/contracts",
    first?.url.pathname,
  );
  const q = first?.url.searchParams;
  check("query: underlying_symbols", q?.get("underlying_symbols") === "NET");
  check("query: type", q?.get("type") === "call");
  check(
    "query: expiration_date_gte",
    q?.get("expiration_date_gte") === "2026-11-25",
  );
  check(
    "query: expiration_date_lte",
    q?.get("expiration_date_lte") === "2026-12-09",
  );
  check("query: status=active", q?.get("status") === "active");
  check(
    "auth headers carry the dummy keys",
    first?.headers["apca-api-key-id"] === FAKE_ALPACA_ID &&
      first?.headers["apca-api-secret-key"] === FAKE_ALPACA_SECRET,
  );
  check(
    "second request follows next_page_token",
    calls[1]?.url.searchParams.get("page_token") === "PAGE2TOKEN",
  );

  check("3 contracts across both pages", contracts.length === 3);
  const c0 = contracts[0];
  check(
    "contract parses (symbol/underlying/type)",
    c0?.symbol === "NET261204C00160000" &&
      c0?.underlying === "NET" &&
      c0?.type === "call",
  );
  check("contract parses strike", c0?.strike === 160, String(c0?.strike));
  check("contract parses expiry", c0?.expiry === "2026-12-04");
  check(
    "contract parses open interest",
    c0?.openInterest === 1234,
    String(c0?.openInterest),
  );
  check(
    "missing open_interest parses as 0",
    contracts[2]?.openInterest === 0,
  );
}

// -------------------------------------------------------------- live host
{
  process.env.ALPACA_PAPER = "false";
  const liveClient = createAlpacaClient();
  check("non-paper client built", liveClient !== null);
  if (liveClient) {
    calls.length = 0;
    responder = () => jsonPage({ option_contracts: [], next_page_token: null });
    await liveClient.getOptionContracts("NET", "put", "2026-11-25", "2026-12-09");
    const url = calls[0]?.url;
    check(
      "host is live Trading API when ALPACA_PAPER=false",
      url !== undefined &&
        `${url.protocol}//${url.host}` === "https://api.alpaca.markets" &&
        url.pathname === "/v2/options/contracts",
      url?.host,
    );
  }
  delete process.env.ALPACA_PAPER;
}

// ------------------------------------------------------------ error shape
if (client) {
  calls.length = 0;
  responder = () =>
    new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  let thrown: Error | null = null;
  try {
    await client.getOptionContracts("NET", "call", "2026-11-25", "2026-12-09");
  } catch (e) {
    thrown = e as Error;
  }
  check("non-OK response throws", thrown !== null);
  check(
    "error keeps Phase 6 shape (context + status + body excerpt)",
    thrown !== null &&
      thrown.message.includes("option contracts for NET") &&
      thrown.message.includes("HTTP 500") &&
      thrown.message.includes("Internal Server Error"),
    thrown?.message,
  );
}

globalThis.fetch = realFetch;
console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
