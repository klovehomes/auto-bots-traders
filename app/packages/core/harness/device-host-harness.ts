/**
 * Device-host harness: the pieces a device uses to run @fleet/core bots
 * without Node or an API server, exercised against in-memory fakes.
 *
 *   1. createAlpacaRestClient: request shapes (host, method, path, query,
 *      body) and response mapping; paging; error text = status + excerpt
 *   2. createKalshiClientWithTransport: paths carry the /trade-api/v2
 *      prefix, order body, error path
 *   3. createLocalControl: halts persist across instances via the store;
 *      liquidations reach only the named bot; resume clears its queue
 *   4. a REAL runner (Trendia) started through the REST client + memory
 *      store: it ticks, saves state through the store, and its stop
 *      handle actually stops it
 *
 * Run: npx tsx harness/device-host-harness.ts   (from packages/core)
 */
import type { BotConfig } from "@fleet/shared/types";
import {
  createAlpacaRestClient,
  createKalshiClientWithTransport,
  createLocalControl,
  createMemoryStateStore,
  startPaperTrader,
  type AlpacaRequest,
  type KalshiRequest,
} from "../src/index.js";

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ok = (body: unknown) => ({ status: 200, text: JSON.stringify(body) });

// ── 1. Alpaca REST client ────────────────────────────────────────────────
console.log("1. Alpaca REST client");
{
  const seen: AlpacaRequest[] = [];
  const alpaca = createAlpacaRestClient(async (req) => {
    seen.push(req);
    if (req.path === "/v2/account") return ok({ status: "ACTIVE", equity: "100000.5", cash: "2500" });
    if (req.path === "/v2/orders" && req.method === "POST")
      return ok({
        id: "o1", symbol: "AAPL", side: "buy", qty: "3", filled_qty: "0",
        filled_avg_price: null, status: "new", type: "limit", time_in_force: "day",
      });
    if (req.path === "/v2/stocks/AAPL/bars") {
      return req.query?.page_token
        ? ok({ bars: [{ t: "2026-11-10T05:00:00Z", o: 1, h: 2, l: 0.5, c: 1.5 }], next_page_token: null })
        : ok({ bars: [{ t: "2026-11-11T05:00:00Z", o: 2, h: 3, l: 1, c: 2.5 }], next_page_token: "p2" });
    }
    if (req.path === "/v1beta3/crypto/us/latest/trades") return ok({ trades: { "BTC/USD": { p: 91000 } } });
    if (req.path === "/v2/clock") return { status: 403, text: '{"message":  "forbidden\n key"}' };
    return { status: 404, text: "" };
  });

  const acct = await alpaca.getAccount();
  check("account maps strings to numbers", acct.equity === 100000.5 && acct.cash === 2500 && acct.status === "ACTIVE");
  check("account uses trading host", seen[0]?.api === "trading" && seen[0]?.method === "GET");

  const order = await alpaca.createOrder({ symbol: "AAPL", qty: 3, side: "buy", type: "limit", timeInForce: "day", limitPrice: 187.25 });
  const post = seen.find((r) => r.method === "POST");
  const body = post?.body as Record<string, string> | undefined;
  check(
    "order body matches Alpaca's REST shape",
    body?.qty === "3" && body?.time_in_force === "day" && body?.limit_price === "187.25" && body?.type === "limit",
    JSON.stringify(body),
  );
  check("order response mapped", order.id === "o1" && order.qty === 3 && order.filledAvgPrice === null);

  const bars = await alpaca.getDailyBars("AAPL", "2026-01-01");
  const barReqs = seen.filter((r) => r.path === "/v2/stocks/AAPL/bars");
  check("daily bars follow next_page_token", barReqs.length === 2 && barReqs[1]?.query?.page_token === "p2");
  check("daily bars sorted ascending by date", bars.map((b) => b.date).join() === "2026-11-10,2026-11-11");
  check("bars use data host, iex feed, adjustment=all", barReqs.every((r) => r.api === "data" && r.query?.feed === "iex" && r.query?.adjustment === "all"));

  check("crypto latest price", (await alpaca.getCryptoLatestPrice("BTC/USD")) === 91000);

  let message = "";
  try {
    await alpaca.getClock();
  } catch (e) {
    message = e instanceof Error ? e.message : String(e);
  }
  check("HTTP errors carry status + collapsed body excerpt", message === 'clock: HTTP 403 — {"message": "forbidden key"}', message);
}

// ── 2. Kalshi over a transport ───────────────────────────────────────────
console.log("2. Kalshi transport client");
{
  const seen: KalshiRequest[] = [];
  const kalshi = createKalshiClientWithTransport(async (req) => {
    seen.push(req);
    if (req.path === "/trade-api/v2/portfolio/balance") return ok({ balance: 12345, portfolio_value: 200 });
    if (req.path === "/trade-api/v2/portfolio/orders" && req.method === "POST")
      return ok({ order: { order_id: "k1", ticker: "T", side: "yes", action: "buy", count: 2, yes_price: 41, status: "resting" } });
    if (req.method === "DELETE") return { status: 204, text: "" };
    return { status: 500, text: "boom" };
  });
  const bal = await kalshi.getBalance();
  check("balance via transport", bal.balanceCents === 12345 && bal.portfolioValueCents === 200);
  const o = await kalshi.createOrder({ ticker: "T", side: "yes", action: "buy", count: 2, price: 0.41 });
  const body = seen.find((r) => r.method === "POST")?.body as Record<string, unknown> | undefined;
  check("order body: cents price + client_order_id", body?.yes_price === 41 && typeof body?.client_order_id === "string");
  check("order mapped", o.id === "k1" && o.price === 0.41);
  await kalshi.cancelOrder("k1");
  check("204 cancel accepted", seen.at(-1)?.path === "/trade-api/v2/portfolio/orders/k1");
  let message = "";
  try {
    await kalshi.getOrder("zzz");
  } catch (e) {
    message = e instanceof Error ? e.message : String(e);
  }
  check("error names method, full path, status", message === "kalshi GET /trade-api/v2/portfolio/orders/zzz: HTTP 500 — boom", message);
}

// ── 3. Local control ─────────────────────────────────────────────────────
console.log("3. Local control (device kill switch)");
{
  const store = createMemoryStateStore();
  const c1 = createLocalControl(store);
  c1.halt("vega");
  const c2 = createLocalControl(store);
  check("halt persists across app restarts (via store)", c2.isHalted("vega") && !c2.isHalted("trendia"));

  c2.haltAndLiquidate("snapback");
  check("liquidate also halts", c2.isHalted("snapback"));
  check("other bots don't see the liquidation", c2.forBot("trendia").drainLiquidations().length === 0);
  const mine = c2.forBot("snapback").drainLiquidations();
  check("named bot drains it once", mine.length === 1 && c2.forBot("snapback").drainLiquidations().length === 0);

  c2.haltAndLiquidate("wesley");
  c2.resume("wesley");
  check("resume clears a not-yet-run liquidation", c2.forBot("wesley").drainLiquidations().length === 0 && !c2.isHalted("wesley"));

  let reported = "";
  c2.onReport((r) => (reported = `${r.codename}:${r.closed.length}/${r.failed.length}`));
  await c2.forBot("snapback").reportLiquidation("x", "snapback", [], [{ codename: "snapback", symbol: "AMD", reason: "no quote" }]);
  check("liquidation results reported, failures included", reported === "snapback:0/1", reported);
}

// ── 4. Real runner through device wiring, and its stop handle ────────────
console.log("4. Trendia runner on device wiring");
{
  let calls = 0;
  const alpaca = createAlpacaRestClient(async (req) => {
    calls++;
    switch (req.path) {
      case "/v2/account":
        return ok({ status: "ACTIVE", equity: "100000", cash: "100000" });
      case "/v2/clock":
        return ok({ is_open: false, timestamp: new Date().toISOString(), next_open: "", next_close: "" });
      case "/v2/positions":
      case "/v2/orders":
        return ok([]);
      default:
        return ok({ bars: [], next_page_token: null });
    }
  });
  const writes: string[] = [];
  const store = createMemoryStateStore({}, { onWrite: (k) => writes.push(k) });
  const control = createLocalControl(store);
  const bot: BotConfig = {
    name: "Trendia", codename: "trendia", enabled: true, mode: "paper", market: "us_stocks",
    broker: "alpaca", strategy: "momentum_trend",
    viz: { color: "#22d3ee", form: "avatar_disc", avatar_accessory: "x" } as BotConfig["viz"],
    universe: ["SPY"], rules: {}, risk: {}, philosophy: "", sourcePath: "bots/trendia.md", raw: {},
  };
  const origLog = console.log;
  console.log = () => undefined; // runner chatter
  const stop = startPaperTrader(bot, alpaca, async () => undefined, control.forBot("trendia"), {
    store,
    statePath: "data/paper-trendia-state.json",
    tickMs: 25,
  });
  await sleep(250);
  console.log = origLog;
  const before = calls;
  check("runner ticks against the REST client", before > 3, `calls=${before}`);
  check("runner saves through the StateStore", writes.includes("data/paper-trendia-state.json"), writes.join());
  check("saved state is valid JSON", (() => {
    try {
      return typeof JSON.parse(store.read("data/paper-trendia-state.json") ?? "") === "object";
    } catch {
      return false;
    }
  })());
  stop();
  await sleep(60); // let any in-flight tick finish
  const settled = calls;
  await sleep(200);
  check("stop handle stops the runner", calls === settled, `${settled} → ${calls}`);
}

console.log("");
if (failures.length) {
  console.log(`${failures.length} FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`${passed}/${passed} checks passed`);
