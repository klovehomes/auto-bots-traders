#!/usr/bin/env node
/**
 * make-sample-snapshot.mjs — generates the SAMPLE snapshot.json that
 * ships in packages/web/public/ so a showcase build serves plausible
 * data before Keith's publisher has ever run.
 *
 * POLYMARKET-ONLY VARIANT (Phase PM2): the sample contains exactly ONE
 * bot — PolyCrypt9000 — matching this branch's single-bot app.
 *
 * THIS IS SAMPLE DATA, hand-shaped to mirror the bot's design — it is
 * not a live publisher output:
 *  - PolyCrypt9000 runs on the simulator in this build (its Polymarket
 *    shadow runner and Alpaca crypto sleeve are future phases), so
 *    every sample event is SIM-shaped and labelled "SIM ·" in the
 *    reason text.
 *  - The bot starts at $10,000 of sim equity; the balance the
 *    publisher math derives is $10,000 + realized PnL of the sample
 *    closes (+$41.20 prediction-market convergence, −$23.75 BTC
 *    breakout stop) = $10,017.45, with one SOL breakout position
 *    still open.
 *
 * Timestamps are generated relative to run time so the sample always
 * looks current. Re-run any time:
 *   node tools/make-sample-snapshot.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSnapshot, scanForLeaks, validateSnapshot } from "./publish-snapshot.mjs";

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(APP_DIR, "packages", "web", "public", "snapshot.json");

const now = Date.now();
const iso = (msAgo) => new Date(now - msAgo).toISOString();
const H = 3_600_000;
const D = 24 * H;

const bot = (name, codename, color, mode) => ({
  name,
  codename,
  mode,
  viz: { color },
});

const bots = [
  bot("PolyCrypt9000", "polycrypt9000", "#fbbf24", "paper + shadow"),
];

const ev = (over) => ({
  bot: "PolyCrypt9000",
  type: "signal",
  decision_id: null,
  symbol: null,
  side: null,
  qty: null,
  price: null,
  pnl: null,
  reason: "",
  ts: iso(0),
  ...over,
});

// Newest first — the same order GET /events/history returns.
const events = [
  ev({ type: "signal", decision_id: "poly-sim-90", symbol: null, reason: "SIM · Polymarket scan: 214 liquid markets priced — best model-vs-market gap 5.2pts, below the 8pt entry rule. No trade.", ts: iso(0.3 * H) }),
  ev({ type: "open", decision_id: "poly-sim-89", symbol: "SOL/USD", side: "buy", qty: 12.5, price: 208.4, reason: "SIM · Donchian 20 breakout, ATR expanding; hourly — crypto sleeve entry.", ts: iso(0.8 * H) }),
  ev({ type: "close", decision_id: "poly-sim-88", symbol: "YES — BTC above $100k by Dec 31", side: "sell", qty: 320, price: 0.61, pnl: 41.2, reason: "SIM · exit: market converged to model — edge captured.", ts: iso(1.6 * H) }),
  ev({ type: "signal", decision_id: "poly-sim-86", symbol: "ETH/USD", reason: "SIM · ETH/USD +1.8% over 4h — below the Donchian breakout trigger. No trade.", ts: iso(3 * H) }),
  ev({ type: "open", decision_id: "poly-sim-87", symbol: "YES — BTC above $100k by Dec 31", side: "buy", qty: 320, price: 0.482, reason: "SIM · market 48% vs model 61% — 13pt edge; quarter-Kelly — Polymarket sleeve entry (shadow).", ts: iso(6 * H) }),
  ev({ type: "close", decision_id: "poly-sim-85", symbol: "BTC/USD", side: "sell", qty: 0.05, price: 102450, pnl: -23.75, reason: "SIM · exit: 2x ATR trailing stop.", ts: iso(1 * D + 2 * H) }),
  ev({ type: "open", decision_id: "poly-sim-84", symbol: "BTC/USD", side: "buy", qty: 0.05, price: 103120, reason: "SIM · Donchian 20 breakout, ATR expanding; hourly — crypto sleeve entry.", ts: iso(1 * D + 6 * H) }),
];

const snapshot = buildSnapshot({
  bots,
  history: { latestSeq: events.length, events },
  fleetMode: "sim",
  now: new Date(now),
});

const problems = validateSnapshot(snapshot);
if (problems.length > 0) {
  console.error(`sample snapshot invalid: ${problems.join("; ")}`);
  process.exit(1);
}
const text = `${JSON.stringify(snapshot, null, 2)}\n`;
const leaks = scanForLeaks(text);
if (leaks.length > 0) {
  console.error(`sample snapshot tripped the denylist: ${leaks.join(" · ")}`);
  process.exit(1);
}
writeFileSync(OUT, text, "utf8");
console.log(`wrote ${OUT}`);
console.log(
  `bots: ${snapshot.bots.map((b) => `${b.codename} $${b.balance.toFixed(2)}`).join(" · ")}`,
);
console.log(`totals: equity $${snapshot.totals.equity.toFixed(2)} · day PnL $${snapshot.totals.dayPnL.toFixed(2)}`);
