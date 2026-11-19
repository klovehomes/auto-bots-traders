/**
 * v34 verification — per-bot performance reports generator.
 *
 *     node_modules/.bin/tsx tools/test-reports-v34.ts   (from app/)
 *
 * Exercises the REAL shipped code (packages/shared/src/reports.ts):
 *   1. The screenshot formula: gains 47467.14 / losses −38806.71 →
 *      Gain/Loss Ratio 55.02%, Net Gain 8660.43.
 *   2. FIFO matching of opens to closes per symbol (two opens of one
 *      symbol, first lot consumed first, second lot still open).
 *   3. A matched win (hold hours, exit reason), a matched loss, and
 *      an unmatched close (entry opened before the window).
 *   4. Decision counts: approved vs rejected signals, top Risk Gate
 *      veto reason extraction.
 *   5. Params snapshot first/last extraction.
 *   6. Decision data classes: protected (codename-prefixed id) vs
 *      sim (bare numeric id).
 *   7. Window filtering (out-of-window events excluded), per-symbol
 *      and per-day (UTC) breakdowns, drawdown, and the equity-base
 *      rule (% metrics null without a starting equity).
 *   8. Markdown rendering carries the screenshot's Totals terms.
 *
 * Side effect: writes the synthetic history to
 * /tmp/v34-synthetic-history.json (v2 persisted shape) so the report
 * CLI can be run against the exact harness data for the samples.
 */
import { writeFileSync } from "node:fs";
import {
  generateBotReport,
  generateFleetReports,
  renderBotReportMarkdown,
  type FleetEvent,
} from "../packages/shared/src/reports.ts";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}
const near = (a: number | null, b: number, eps = 1e-9): boolean =>
  a !== null && Math.abs(a - b) <= eps;

// ---------------------------------------------------------------------------
// Synthetic events
// ---------------------------------------------------------------------------
const ev = (partial: Partial<FleetEvent> & { bot: string; type: FleetEvent["type"]; ts: string }): FleetEvent => ({
  decision_id: null,
  symbol: null,
  side: null,
  qty: null,
  price: null,
  pnl: null,
  reason: "",
  ...partial,
});

const SNAP1_PARAMS = "z_entry=-2.0, rsi2_entry=10, max_position_pct=20";
const SNAP_LAST_PARAMS = "z_entry=-2.2, rsi2_entry=8, max_position_pct=20";

const events: FleetEvent[] = [
  // --- snapback: matched win (AAPL) ---
  ev({ bot: "snapback", type: "signal", ts: "2026-11-02T14:00:00Z", decision_id: "snapback-1", symbol: "AAPL",
    reason: `Signal z=-2.3 · Risk Gate: APPROVED · params snapshot: ${SNAP1_PARAMS}` }),
  ev({ bot: "snapback", type: "open", ts: "2026-11-02T14:01:00Z", decision_id: "snapback-1", symbol: "AAPL", side: "buy", qty: 10, price: 100, reason: "open" }),
  ev({ bot: "snapback", type: "close", ts: "2026-11-03T14:01:00Z", decision_id: "snapback-1", symbol: "AAPL", side: "sell", qty: 10, price: 110, pnl: 100,
    reason: "EXIT — mean reversion target: price returned to 20-day mean" }),
  // --- snapback: rejected signal with a veto reason ---
  ev({ bot: "snapback", type: "signal", ts: "2026-11-03T15:00:00Z", decision_id: "snapback-2", symbol: "MSFT",
    reason: `Signal z=-2.1 · Risk Gate: REJECTED — daily loss cap reached · params snapshot: ${SNAP1_PARAMS}` }),
  // --- snapback: FIFO across two opens of XYZ ---
  ev({ bot: "snapback", type: "open", ts: "2026-11-04T14:00:00Z", decision_id: "snapback-3", symbol: "XYZ", side: "buy", qty: 5, price: 10, reason: "open" }),
  ev({ bot: "snapback", type: "open", ts: "2026-11-05T14:00:00Z", decision_id: "snapback-3", symbol: "XYZ", side: "buy", qty: 5, price: 20, reason: "open" }),
  ev({ bot: "snapback", type: "close", ts: "2026-11-06T14:00:00Z", decision_id: "snapback-3", symbol: "XYZ", side: "sell", qty: 5, price: 15, pnl: 25,
    reason: "EXIT — take profit: target hit" }),
  // --- snapback: unmatched close (entry before the window) ---
  ev({ bot: "snapback", type: "close", ts: "2026-11-07T14:00:00Z", decision_id: "snapback-4", symbol: "TSLA", side: "sell", qty: 3, price: 250, pnl: 25,
    reason: "EXIT — time exit: 5 days elapsed" }),
  // --- snapback: matched loss (MSFT) ---
  ev({ bot: "snapback", type: "open", ts: "2026-11-08T14:00:00Z", decision_id: "snapback-5", symbol: "MSFT", side: "buy", qty: 10, price: 200, reason: "open" }),
  ev({ bot: "snapback", type: "close", ts: "2026-11-09T14:00:00Z", decision_id: "snapback-5", symbol: "MSFT", side: "sell", qty: 10, price: 195, pnl: -50,
    reason: "EXIT — stop loss: -5% hit" }),
  // --- snapback: sim-class decision (bare numeric id), latest params snapshot ---
  ev({ bot: "snapback", type: "signal", ts: "2026-11-10T14:00:00Z", decision_id: "4815", symbol: "AAPL",
    reason: `Simulator signal · Risk Gate: APPROVED · params snapshot: ${SNAP_LAST_PARAMS}` }),
  // --- snapback: out-of-window events (must be excluded) ---
  ev({ bot: "snapback", type: "close", ts: "2026-10-20T14:00:00Z", decision_id: "snapback-0", symbol: "AAPL", side: "sell", qty: 1, price: 90, pnl: 999, reason: "EXIT — old: pre-window" }),
  // --- trendia: one clean win, must not leak into snapback's report ---
  ev({ bot: "trendia", type: "signal", ts: "2026-11-02T15:00:00Z", decision_id: "trendia-1", symbol: "NVDA",
    reason: "Breakout 20-day high · Risk Gate: APPROVED · params snapshot: breakout=20d, rsi_min=55" }),
  ev({ bot: "trendia", type: "open", ts: "2026-11-02T15:01:00Z", decision_id: "trendia-1", symbol: "NVDA", side: "buy", qty: 5, price: 150, reason: "open" }),
  ev({ bot: "trendia", type: "close", ts: "2026-11-05T15:01:00Z", decision_id: "trendia-1", symbol: "NVDA", side: "sell", qty: 5, price: 165, pnl: 75,
    reason: "EXIT — trailing stop: hit" }),
  // --- vega: the screenshot numbers, as two unmatched closes ---
  ev({ bot: "vega", type: "close", ts: "2026-11-04T16:00:00Z", decision_id: "vega-1", symbol: "SPY", side: "sell", qty: 1, price: 10, pnl: 47467.14, reason: "EXIT — target: hit" }),
  ev({ bot: "vega", type: "close", ts: "2026-11-05T16:00:00Z", decision_id: "vega-2", symbol: "QQQ", side: "sell", qty: 1, price: 10, pnl: -38806.71, reason: "EXIT — stop: hit" }),
];

const FROM = "2026-11-01T00:00:00Z";
const TO = "2026-11-30T23:59:59Z";

// ---------------------------------------------------------------------------
// 1. Screenshot formula
// ---------------------------------------------------------------------------
const vega = generateBotReport(events, { bot: "vega", from: FROM, to: TO });
check("screenshot: totalGains", near(vega.metrics.totalGains, 47467.14), `=${vega.metrics.totalGains}`);
check("screenshot: totalLosses", near(vega.metrics.totalLosses, -38806.71), `=${vega.metrics.totalLosses}`);
check("screenshot: netGain", near(vega.metrics.netGain, 8660.43), `=${vega.metrics.netGain}`);
check("screenshot: gainLossRatioPct is 55.02", near(vega.metrics.gainLossRatioPct, 55.02), `=${vega.metrics.gainLossRatioPct}`);
check("screenshot: profitFactor", near(vega.metrics.profitFactor, 1.2232, 1e-3), `=${vega.metrics.profitFactor}`);

// ---------------------------------------------------------------------------
// 2–7. Snapback report
// ---------------------------------------------------------------------------
const snap = generateBotReport(events, { bot: "snapback", from: FROM, to: TO });
check("snapback: closes in window", snap.metrics.closes === 4, `=${snap.metrics.closes}`);
check("snapback: opens in window", snap.metrics.opens === 4, `=${snap.metrics.opens}`);
check("snapback: totals", near(snap.metrics.totalGains, 150) && near(snap.metrics.totalLosses, -50) && near(snap.metrics.netGain, 100),
  `gains=${snap.metrics.totalGains} losses=${snap.metrics.totalLosses} net=${snap.metrics.netGain}`);
check("snapback: gainLossRatioPct 75", near(snap.metrics.gainLossRatioPct, 75), `=${snap.metrics.gainLossRatioPct}`);
check("snapback: wins/losses", snap.metrics.wins === 3 && snap.metrics.losses === 1, `=${snap.metrics.wins}/${snap.metrics.losses}`);
check("snapback: winRatePct 75", near(snap.metrics.winRatePct, 75));
check("snapback: expectancy", near(snap.metrics.expectancyPerTrade, 25), `=${snap.metrics.expectancyPerTrade}`);
check("snapback: out-of-window close excluded (no 999 PnL)", !snap.trades.some((t) => t.pnl === 999));

const aapl = snap.trades.find((t) => t.symbol === "AAPL")!;
check("FIFO/win: AAPL entry matched", aapl.entryKnown && near(aapl.entryPrice, 100), `entry=${aapl.entryPrice}`);
check("FIFO/win: AAPL hold hours 24", near(aapl.holdHours, 24), `=${aapl.holdHours}`);
check("FIFO/win: AAPL exit reason extracted", aapl.exitReason === "mean reversion target", `=${aapl.exitReason}`);

const xyz = snap.trades.find((t) => t.symbol === "XYZ")!;
check("FIFO: XYZ close consumed the FIRST lot (entry 10)", near(xyz.entryPrice, 10), `entry=${xyz.entryPrice}`);
const xyzOpen = snap.openPositions.find((p) => p.symbol === "XYZ");
check("FIFO: XYZ second lot still open (5 @ 20)", !!xyzOpen && near(xyzOpen.qty, 5) && near(xyzOpen.entryPrice, 20),
  xyzOpen ? `qty=${xyzOpen.qty} @ ${xyzOpen.entryPrice}` : "missing");

const tsla = snap.trades.find((t) => t.symbol === "TSLA")!;
check("unmatched close: TSLA entryKnown false", tsla.entryKnown === false && tsla.entryTs === null && tsla.holdHours === null);
check("unmatched close: caveat present", snap.caveats.some((c) => c.includes("no matching open")));

check("decisions: signals/approved/rejected", snap.decisions.signals === 3 && snap.decisions.approved === 2 && snap.decisions.rejected === 1,
  `=${snap.decisions.signals}/${snap.decisions.approved}/${snap.decisions.rejected}`);
check("decisions: top veto reason", snap.decisions.topRejectionReasons[0]?.reason === "daily loss cap reached",
  `=${snap.decisions.topRejectionReasons[0]?.reason}`);
check("exit reasons: stop loss counted", snap.exitReasons.some((r) => r.reason === "stop loss" && r.count === 1));

check("params snapshot first", snap.paramsSnapshotFirst === SNAP1_PARAMS, `=${snap.paramsSnapshotFirst}`);
check("params snapshot last", snap.paramsSnapshotLast === SNAP_LAST_PARAMS, `=${snap.paramsSnapshotLast}`);

check("data classes: sim counted", snap.dataClasses.sim === 1, `sim=${snap.dataClasses.sim}`);
check("data classes: protected counted", snap.dataClasses.protected >= 5, `protected=${snap.dataClasses.protected}`);
check("sim caveat present", snap.caveats.some((c) => c.includes("sim-class")));

const aaplSym = snap.perSymbol.find((s) => s.symbol === "AAPL")!;
check("per-symbol: AAPL", aaplSym.trades === 1 && near(aaplSym.netPnl, 100));
const day3 = snap.perDay.find((d) => d.date === "2026-11-03")!;
check("per-day (UTC): 2026-11-03 PnL 100", !!day3 && near(day3.pnl, 100));

check("equity curve: one point per close", snap.equityCurve.length === 4, `=${snap.equityCurve.length}`);
check("drawdown without equity base: USD only", near(snap.metrics.maxDrawdownUsd, 50) && snap.metrics.maxDrawdownPct === null && snap.metrics.netPnlPct === null,
  `dd=${snap.metrics.maxDrawdownUsd}`);

const snapEq = generateBotReport(events, { bot: "snapback", from: FROM, to: TO, startingEquityUsd: 10000 });
check("with equity: netPnlPct 1.00", near(snapEq.metrics.netPnlPct, 1), `=${snapEq.metrics.netPnlPct}`);
check("with equity: maxDrawdownPct set", snapEq.metrics.maxDrawdownPct !== null && near(snapEq.metrics.maxDrawdownPct, 0.49, 0.01),
  `=${snapEq.metrics.maxDrawdownPct}`);

// ---------------------------------------------------------------------------
// Bot isolation + fleet generation + markdown
// ---------------------------------------------------------------------------
const trendia = generateBotReport(events, { bot: "trendia", from: FROM, to: TO });
check("isolation: trendia closes=1 net=75", trendia.metrics.closes === 1 && near(trendia.metrics.netGain, 75));

const fleet = generateFleetReports(events, { from: FROM, to: TO }, ["trendia", "snapback", "vega", "wesley", "polycrypt9000"]);
check("fleet: 5 reports, wesley empty-window caveat", fleet.length === 5 &&
  fleet.find((r) => r.bot === "wesley")!.caveats.some((c) => c.includes("No closed trades")));
check("report is self-describing", snap.generatorVersion === "v34" && snap.bot === "snapback" && snap.timeframe.from === FROM);

const md = renderBotReportMarkdown(snap);
check("markdown: title + Totals terms",
  md.includes("# Snapback performance report") && md.includes("Total Gains:") && md.includes("Total Losses:") &&
  md.includes("Net Gain:") && md.includes("Gain/Loss Ratio: 75.00%"));

// Persist the synthetic history (v2 shape) for CLI sample runs. Events
// carry API-stamped seq numbers, exactly as a real persisted history
// file does (the API's EventHistoryStore drops seq-less records).
writeFileSync(
  "/tmp/v34-synthetic-history.json",
  JSON.stringify(
    {
      version: 2,
      nextSeq: events.length + 1,
      protected: events.map((e, i) => ({ ...e, seq: i + 1 })),
      sim: [],
      recent: [],
    },
    null,
    2,
  ),
);

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exit(1);
