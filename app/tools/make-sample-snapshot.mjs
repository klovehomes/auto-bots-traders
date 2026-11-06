#!/usr/bin/env node
/**
 * make-sample-snapshot.mjs — generates the SAMPLE snapshot.json that
 * ships in packages/web/public/ so a showcase build serves plausible
 * data before Keith's publisher has ever run.
 *
 * THIS IS SAMPLE DATA, hand-shaped to mirror the fleet's known state
 * on 2026-11-05 — it is not a live publisher output:
 *  - Trendia, Vega: paper books untouched at $10,000 (no closes yet —
 *    Trendia's daily screen found no qualifying breakout; Vega's
 *    signals produced NO TRADE decisions).
 *  - Snapback: $9,997.08 — her real first day (2026-11-04): two TSLA
 *    round trips, −$1.12 and −$1.80, the churn the v14 patch fixed.
 *  - Wesley, PolyCrypt9000: still simulator bots — their sample
 *    trades are SIM-shaped and labelled "SIM ·" in the reason text.
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
  bot("Trendia", "trendia", "#22d3ee", "paper"),
  bot("Snapback", "snapback", "#a78bfa", "paper"),
  bot("Vega", "vega", "#f472b6", "paper"),
  bot("Wesley", "wesley", "#4ade80", "paper"),
  bot("PolyCrypt9000", "polycrypt9000", "#fbbf24", "paper + shadow"),
];

const ev = (over) => ({
  bot: "Trendia",
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
  // Today — the two simulator bots doing their regular chatter/trades.
  ev({ bot: "Wesley", type: "close", decision_id: "wes-sim-104", symbol: "F", side: "buy", qty: 100, price: 11.86, pnl: 86.0, reason: "SIM · Cash-secured put on F expired worthless — premium kept, wheel cycle complete.", ts: iso(0.4 * H) }),
  ev({ bot: "PolyCrypt9000", type: "signal", decision_id: "poly-sim-88", symbol: "ETH/USD", reason: "SIM · ETH/USD +1.8% over 4h — below the 3% breakout trigger. No trade.", ts: iso(0.7 * H) }),
  ev({ bot: "Wesley", type: "open", decision_id: "wes-sim-103", symbol: "SOFI", side: "sell", qty: 100, price: 16.2, reason: "SIM · Sold a cash-secured put on SOFI (weekly cycle) inside the $5–$55 income band.", ts: iso(1.2 * H) }),
  ev({ bot: "PolyCrypt9000", type: "close", decision_id: "poly-sim-87", symbol: "BTC/USD", side: "sell", qty: 0.05, price: 102450, pnl: -23.75, reason: "SIM · BTC/USD breakout faded back through the entry — breakout rule exits at the stop.", ts: iso(2.1 * H) }),
  ev({ bot: "PolyCrypt9000", type: "open", decision_id: "poly-sim-86", symbol: "BTC/USD", side: "buy", qty: 0.05, price: 103120, reason: "SIM · BTC/USD cleared the 24h range high on rising volume — breakout entry.", ts: iso(5.5 * H) }),
  ev({ bot: "Wesley", type: "open", decision_id: "wes-sim-102", symbol: "F", side: "sell", qty: 100, price: 12.72, reason: "SIM · Sold a cash-secured put on F — 100-share wheel block, premium collected up front.", ts: iso(1 * D + 2 * H) }),
  // Yesterday (2026-11-04) — Snapback's real first paper trades.
  ev({ bot: "Snapback", type: "close", decision_id: "snap-20261104-2c", symbol: "TSLA", side: "sell", qty: 5, price: 388.18, pnl: -1.8, reason: "Exit at the 20-day mean ($382.84 band reached intraday) — position closed per the mean-reversion exit rule.", ts: iso(1 * D + 5.2 * H) }),
  ev({ bot: "Snapback", type: "open", decision_id: "snap-20261104-2o", symbol: "TSLA", side: "buy", qty: 5, price: 388.54, reason: "Mean-reversion stretch: RSI(2) 9.6 < 10 with TSLA above its 20-day mean ($382.84); 200DMA trend filter passed.", ts: iso(1 * D + 5.4 * H) }),
  ev({ bot: "Snapback", type: "close", decision_id: "snap-20261104-1c", symbol: "TSLA", side: "sell", qty: 5, price: 388.81, pnl: -1.12, reason: "Exit at the 20-day mean ($382.84 band reached intraday) — position closed per the mean-reversion exit rule.", ts: iso(1 * D + 6.1 * H) }),
  ev({ bot: "Snapback", type: "open", decision_id: "snap-20261104-1o", symbol: "TSLA", side: "buy", qty: 5, price: 389.03, reason: "Mean-reversion stretch: RSI(2) 10.0 at the < 10 trigger band with TSLA above its 20-day mean ($382.84); 200DMA trend filter passed.", ts: iso(1 * D + 6.3 * H) }),
  // Paper screens that produced decisions but no trades.
  ev({ bot: "Vega", type: "signal", decision_id: "vega-20261104-7", symbol: "SMCI", reason: "NO TRADE · Options chain fetch failed for SMCI (broker returned 404) — signal recorded, no contract picked. Nothing bought.", ts: iso(1 * D + 7 * H) }),
  ev({ bot: "Vega", type: "signal", decision_id: "vega-20261104-5", symbol: "RBLX", reason: "NO TRADE · Options chain fetch failed for RBLX (broker returned 404) — signal recorded, no contract picked. Nothing bought.", ts: iso(1 * D + 8 * H) }),
  ev({ bot: "Trendia", type: "signal", decision_id: "trendia-20261104-eod", symbol: null, reason: "Daily evaluation: 23-name universe screened — no name satisfied breakout + RSI(55–80) + trend + SPY-regime together. No trade.", ts: iso(1 * D + 9 * H) }),
];

const snapshot = buildSnapshot({
  bots,
  history: { latestSeq: events.length, events },
  fleetMode: "paper",
  now: new Date(now),
});

// Sample-only correction: Snapback's two TSLA round trips happened
// YESTERDAY, so her day PnL is 0 today — buildSnapshot's day boundary
// already handles that (the trades are > 24h old relative to `now`
// only if generated after midnight; force the honest sample value).
const snapback = snapshot.bots.find((b) => b.codename === "snapback");
if (snapback) snapback.dayPnL = 0;
snapshot.totals.dayPnL = Math.round(
  snapshot.bots.reduce((s, b) => s + b.dayPnL, 0) * 100,
) / 100;

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
