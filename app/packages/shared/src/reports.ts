/**
 * Per-bot performance reports (v34).
 *
 * Pure module — no Node imports — so the API, the CLI, a test harness,
 * and (later) the web dashboard all share ONE implementation of the
 * math. The JSON report object is the canonical AI input: it is
 * self-describing (bot, timeframe, generator version, caveats) so an
 * AI handed the file cold can analyze a bot's performance over the
 * timeframe without any other context. The Markdown rendering is the
 * human-readable twin of the same object.
 *
 * Data model: FleetEvent stream (see shared/types.ts). Close events
 * carry realized `pnl`; open events carry entry price/qty. Opens are
 * FIFO-matched to closes per symbol inside the window; a close with
 * no open inside the window still counts its PnL (its position was
 * opened before the window) but is flagged entryKnown: false.
 *
 * Percentages that need an equity base (net PnL %, drawdown %) are
 * null unless the caller supplies startingEquityUsd — a report must
 * never invent an equity base.
 */
import type { FleetEvent } from "./types.js";

export type { FleetEvent } from "./types.js";

export const REPORT_GENERATOR_VERSION = "v34";

export interface ReportOptions {
  bot: string;
  /** ISO-8601 lower bound (inclusive); null = unbounded. */
  from: string | null;
  /** ISO-8601 upper bound (inclusive); null = unbounded. */
  to: string | null;
  /** Equity at the start of the window, when known. */
  startingEquityUsd?: number | null;
}

export interface ReportTrade {
  symbol: string | null;
  entryTs: string | null;
  exitTs: string;
  entryPrice: number | null;
  exitPrice: number | null;
  qty: number | null;
  pnl: number;
  /** Hours between entry and exit; null when the entry is unknown. */
  holdHours: number | null;
  exitReason: string;
  decisionId: string | null;
  entryKnown: boolean;
}

export interface ReportOpenPosition {
  symbol: string | null;
  entryTs: string;
  entryPrice: number | null;
  qty: number | null;
}

export interface ReportMetrics {
  totalGains: number;
  totalLosses: number;
  netGain: number;
  /** gains / (gains + |losses|) * 100, 2dp. Null when there are no closes. */
  gainLossRatioPct: number | null;
  /** gains / |losses|. Null when there are no losses. */
  profitFactor: number | null;
  wins: number;
  losses: number;
  breakevens: number;
  winRatePct: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  largestWin: number | null;
  largestLoss: number | null;
  expectancyPerTrade: number | null;
  opens: number;
  closes: number;
  maxDrawdownUsd: number;
  /** Only when startingEquityUsd was provided. */
  maxDrawdownPct: number | null;
  /** Only when startingEquityUsd was provided. */
  netPnlPct: number | null;
  startingEquityUsd: number | null;
}

export interface ReportPerSymbol {
  symbol: string;
  trades: number;
  wins: number;
  netPnl: number;
  winRatePct: number | null;
}

export interface ReportPerDay {
  /** UTC date (YYYY-MM-DD) of the close. */
  date: string;
  closes: number;
  pnl: number;
}

export interface ReportReasonCount {
  reason: string;
  count: number;
}

export interface ReportDecisions {
  signals: number;
  approved: number;
  rejected: number;
  topRejectionReasons: ReportReasonCount[];
}

export interface BotReport {
  bot: string;
  botLabel: string;
  generatedAt: string;
  timeframe: { from: string | null; to: string | null };
  generatorVersion: string;
  metrics: ReportMetrics;
  trades: ReportTrade[];
  openPositions: ReportOpenPosition[];
  perSymbol: ReportPerSymbol[];
  /** Per-day realized PnL, keyed by UTC date. */
  perDay: ReportPerDay[];
  decisions: ReportDecisions;
  exitReasons: ReportReasonCount[];
  paramsSnapshotFirst: string | null;
  paramsSnapshotLast: string | null;
  dataClasses: { protected: number; sim: number };
  equityCurve: { ts: string; cumulativePnl: number }[];
  caveats: string[];
}

const BOT_LABELS: Record<string, string> = {
  trendia: "Trendia",
  snapback: "Snapback",
  vega: "Vega",
  wesley: "Wesley",
  polycrypt9000: "PolyCrypt9000",
};

export function botLabel(bot: string): string {
  return BOT_LABELS[bot] ?? (bot.charAt(0).toUpperCase() + bot.slice(1));
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const round4 = (n: number): number => Math.round(n * 10000) / 10000;

/** Decision class rule, mirrored from api/history.ts: a codename-prefixed
 *  decision id (`<codename>-<counter>`) marks a real-data runner
 *  (protected); a bare numeric id — or anything unrecognized — is sim. */
export function classifyDecisionId(decisionId: string | null): "protected" | "sim" {
  if (decisionId === null) return "sim";
  const match = /^(.+)-(\d+)$/.exec(decisionId);
  if (match && !/^\d+$/.test(match[1]!)) return "protected";
  return "sim";
}

/** Extract a ` · `-separated segment that starts with `marker`, trimmed
 *  of an optional trailing stop character set. Null when absent. */
function segmentAfter(reason: string, marker: string, stopAt: string[]): string | null {
  const idx = reason.indexOf(marker);
  if (idx < 0) return null;
  let rest = reason.slice(idx + marker.length);
  const segEnd = rest.indexOf(" · ");
  if (segEnd >= 0) rest = rest.slice(0, segEnd);
  let cut = rest.length;
  for (const s of stopAt) {
    const i = rest.indexOf(s);
    if (i >= 0 && i < cut) cut = i;
  }
  const out = rest.slice(0, cut).trim();
  return out === "" ? null : out;
}

function paramsSnapshotOf(reason: string): string | null {
  return segmentAfter(reason, "params snapshot:", []);
}

interface OpenLot {
  symbol: string | null;
  ts: string;
  price: number | null;
  qty: number;
  decisionId: string | null;
}

export function generateBotReport(
  events: FleetEvent[],
  opts: ReportOptions,
): BotReport {
  const fromMs = opts.from ? Date.parse(opts.from) : null;
  const toMs = opts.to ? Date.parse(opts.to) : null;
  const startingEquity =
    typeof opts.startingEquityUsd === "number" && opts.startingEquityUsd > 0
      ? opts.startingEquityUsd
      : null;

  const filtered = events
    .filter((e) => e.bot === opts.bot)
    .filter((e) => e.type !== "data_reset")
    .filter((e) => {
      const ms = Date.parse(e.ts);
      if (fromMs !== null && ms < fromMs) return false;
      if (toMs !== null && ms > toMs) return false;
      return true;
    })
    .sort((a, b) => {
      const d = Date.parse(a.ts) - Date.parse(b.ts);
      if (d !== 0) return d;
      return (a.seq ?? 0) - (b.seq ?? 0);
    });

  // --- FIFO matching + realized-PnL metrics -------------------------------
  const lotsBySymbol = new Map<string, OpenLot[]>();
  const trades: ReportTrade[] = [];
  const equityCurve: { ts: string; cumulativePnl: number }[] = [];
  const exitReasonCounts = new Map<string, number>();
  let opens = 0;
  let closes = 0;
  let cumulativePnl = 0;

  for (const e of filtered) {
    if (e.type === "open") {
      opens += 1;
      const key = e.symbol ?? "";
      const queue = lotsBySymbol.get(key) ?? [];
      queue.push({
        symbol: e.symbol,
        ts: e.ts,
        price: e.price,
        qty: e.qty ?? 0,
        decisionId: e.decision_id,
      });
      lotsBySymbol.set(key, queue);
    } else if (e.type === "close") {
      closes += 1;
      const pnl = e.pnl ?? 0;
      cumulativePnl += pnl;
      equityCurve.push({ ts: e.ts, cumulativePnl: round2(cumulativePnl) });

      const exitReason =
        segmentAfter(e.reason ?? "", "EXIT —", [":"]) ?? "close (no EXIT marker)";
      exitReasonCounts.set(exitReason, (exitReasonCounts.get(exitReason) ?? 0) + 1);

      // FIFO-consume open lots for this symbol.
      const key = e.symbol ?? "";
      const queue = lotsBySymbol.get(key) ?? [];
      let remaining = e.qty ?? Number.POSITIVE_INFINITY;
      let consumedQty = 0;
      let weightedEntry = 0;
      let entryTs: string | null = null;
      let entryDecision: string | null = null;
      while (queue.length > 0 && remaining > 0) {
        const lot = queue[0]!;
        const take = Math.min(lot.qty, remaining);
        if (take <= 0 && lot.qty > 0) break;
        if (entryTs === null) {
          entryTs = lot.ts;
          entryDecision = lot.decisionId;
        }
        if (lot.price !== null) weightedEntry += lot.price * take;
        consumedQty += take;
        remaining -= take;
        lot.qty -= take;
        if (lot.qty <= 0) queue.shift();
      }
      lotsBySymbol.set(key, queue);

      const entryKnown = consumedQty > 0 && entryTs !== null;
      trades.push({
        symbol: e.symbol,
        entryTs: entryKnown ? entryTs : null,
        exitTs: e.ts,
        entryPrice: entryKnown && consumedQty > 0 ? round4(weightedEntry / consumedQty) : null,
        exitPrice: e.price,
        qty: e.qty ?? (consumedQty > 0 ? consumedQty : null),
        pnl: round2(pnl),
        holdHours:
          entryKnown && entryTs
            ? round2((Date.parse(e.ts) - Date.parse(entryTs)) / 3_600_000)
            : null,
        exitReason,
        decisionId: e.decision_id ?? entryDecision,
        entryKnown,
      });
    }
  }

  const openPositions: ReportOpenPosition[] = [];
  for (const queue of lotsBySymbol.values()) {
    for (const lot of queue) {
      if (lot.qty > 0) {
        openPositions.push({
          symbol: lot.symbol,
          entryTs: lot.ts,
          entryPrice: lot.price,
          qty: lot.qty,
        });
      }
    }
  }
  openPositions.sort((a, b) => Date.parse(a.entryTs) - Date.parse(b.entryTs));

  // --- Headline metrics -----------------------------------------------------
  const pnls = trades.map((t) => t.pnl);
  const gainList = pnls.filter((p) => p > 0);
  const lossList = pnls.filter((p) => p < 0);
  const totalGains = round2(gainList.reduce((s, p) => s + p, 0));
  const totalLosses = round2(lossList.reduce((s, p) => s + p, 0));
  const netGain = round2(totalGains + totalLosses);
  const closedCount = trades.length;

  // Max drawdown on the equity curve (starting equity, or 0 base).
  const base = startingEquity ?? 0;
  let peak = base;
  let maxDd = 0;
  let maxDdPct: number | null = null;
  for (const point of equityCurve) {
    const value = base + point.cumulativePnl;
    if (value > peak) peak = value;
    const dd = peak - value;
    if (dd > maxDd) {
      maxDd = dd;
      if (startingEquity !== null && peak > 0) maxDdPct = round2((dd / peak) * 100);
    }
  }

  const metrics: ReportMetrics = {
    totalGains,
    totalLosses,
    netGain,
    gainLossRatioPct:
      closedCount > 0 && totalGains + Math.abs(totalLosses) > 0
        ? round2((totalGains / (totalGains + Math.abs(totalLosses))) * 100)
        : null,
    profitFactor:
      lossList.length > 0 ? round4(totalGains / Math.abs(totalLosses)) : null,
    wins: gainList.length,
    losses: lossList.length,
    breakevens: pnls.filter((p) => p === 0).length,
    winRatePct:
      closedCount > 0 ? round2((gainList.length / closedCount) * 100) : null,
    avgWin: gainList.length > 0 ? round2(totalGains / gainList.length) : null,
    avgLoss:
      lossList.length > 0 ? round2(totalLosses / lossList.length) : null,
    largestWin: gainList.length > 0 ? Math.max(...gainList) : null,
    largestLoss: lossList.length > 0 ? Math.min(...lossList) : null,
    expectancyPerTrade: closedCount > 0 ? round2(netGain / closedCount) : null,
    opens,
    closes,
    maxDrawdownUsd: round2(maxDd),
    maxDrawdownPct: startingEquity !== null ? (maxDdPct ?? 0) : null,
    netPnlPct: startingEquity !== null ? round2((netGain / startingEquity) * 100) : null,
    startingEquityUsd: startingEquity,
  };

  // --- Per-symbol + per-day -------------------------------------------------
  const perSymbolMap = new Map<string, ReportPerSymbol>();
  for (const t of trades) {
    const key = t.symbol ?? "(unknown)";
    const row = perSymbolMap.get(key) ?? {
      symbol: key,
      trades: 0,
      wins: 0,
      netPnl: 0,
      winRatePct: null,
    };
    row.trades += 1;
    if (t.pnl > 0) row.wins += 1;
    row.netPnl = round2(row.netPnl + t.pnl);
    perSymbolMap.set(key, row);
  }
  const perSymbol = [...perSymbolMap.values()]
    .map((r) => ({
      ...r,
      winRatePct: r.trades > 0 ? round2((r.wins / r.trades) * 100) : null,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  const perDayMap = new Map<string, ReportPerDay>();
  for (const t of trades) {
    const date = t.exitTs.slice(0, 10); // UTC date from the ISO timestamp
    const row = perDayMap.get(date) ?? { date, closes: 0, pnl: 0 };
    row.closes += 1;
    row.pnl = round2(row.pnl + t.pnl);
    perDayMap.set(date, row);
  }
  const perDay = [...perDayMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // --- Decisions ------------------------------------------------------------
  let signals = 0;
  let approved = 0;
  let rejected = 0;
  const rejectionCounts = new Map<string, number>();
  let paramsSnapshotFirst: string | null = null;
  let paramsSnapshotLast: string | null = null;
  const dataClasses = { protected: 0, sim: 0 };

  for (const e of filtered) {
    if (e.decision_id !== null && e.decision_id !== undefined) {
      dataClasses[classifyDecisionId(e.decision_id)] += 1;
    }
    const snap = paramsSnapshotOf(e.reason ?? "");
    if (snap !== null) {
      if (paramsSnapshotFirst === null) paramsSnapshotFirst = snap;
      paramsSnapshotLast = snap;
    }
    if (e.type !== "signal") continue;
    signals += 1;
    const reason = e.reason ?? "";
    if (reason.includes("Risk Gate: APPROVED")) {
      approved += 1;
    } else if (reason.includes("Risk Gate: REJECTED")) {
      rejected += 1;
      const why =
        segmentAfter(reason, "Risk Gate: REJECTED —", []) ?? "unspecified";
      rejectionCounts.set(why, (rejectionCounts.get(why) ?? 0) + 1);
    }
  }

  const sortReasons = (m: Map<string, number>): ReportReasonCount[] =>
    [...m.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));

  // --- Caveats ---------------------------------------------------------------
  const caveats: string[] = [
    "Realized PnL only: metrics are computed from close events in the window. Open positions are listed at entry and are NOT marked to market.",
    "Per-day PnL is keyed by UTC date.",
  ];
  const unmatched = trades.filter((t) => !t.entryKnown).length;
  if (unmatched > 0) {
    caveats.push(
      `${unmatched} close(s) had no matching open inside the window (position opened earlier) — entry price and hold time are unknown for those trades.`,
    );
  }
  if (dataClasses.sim > 0) {
    caveats.push(
      "Window includes sim-class decision data (bare numeric decision ids) — simulator output, not real-runner performance. Check dataClasses before quoting these numbers.",
    );
  }
  if (closedCount === 0) {
    caveats.push(
      "No closed trades in this window — performance metrics are empty, not zero-performance.",
    );
  }
  if (startingEquity === null) {
    caveats.push(
      "No starting equity provided — net PnL % and drawdown % are null rather than computed against an invented base.",
    );
  }

  return {
    bot: opts.bot,
    botLabel: botLabel(opts.bot),
    generatedAt: new Date().toISOString(),
    timeframe: { from: opts.from, to: opts.to },
    generatorVersion: REPORT_GENERATOR_VERSION,
    metrics,
    trades,
    openPositions,
    perSymbol,
    perDay,
    decisions: {
      signals,
      approved,
      rejected,
      topRejectionReasons: sortReasons(rejectionCounts),
    },
    exitReasons: sortReasons(exitReasonCounts),
    paramsSnapshotFirst,
    paramsSnapshotLast,
    dataClasses,
    equityCurve,
    caveats,
  };
}

export function generateFleetReports(
  events: FleetEvent[],
  opts: Omit<ReportOptions, "bot">,
  botList: string[],
): BotReport[] {
  return botList.map((bot) => generateBotReport(events, { ...opts, bot }));
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function fmtUsd(n: number | null, signed = false): string {
  if (n === null) return "—";
  const sign = n > 0 && signed ? "+" : n < 0 ? "-" : "";
  const body = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}$${body}`;
}

function fmtPct(n: number | null): string {
  return n === null ? "—" : `${n.toFixed(2)}%`;
}

function fmtNum(n: number | null): string {
  return n === null ? "—" : String(n);
}

export function renderBotReportMarkdown(report: BotReport): string {
  const m = report.metrics;
  const tf = report.timeframe;
  const lines: string[] = [];
  lines.push(`# ${report.botLabel} performance report`);
  lines.push("");
  lines.push(
    `Timeframe: ${tf.from ?? "beginning"} → ${tf.to ?? "now"} (per-day PnL by UTC date) · Generated ${report.generatedAt} · Generator ${report.generatorVersion}`,
  );
  lines.push("");
  lines.push(
    "The JSON form of this report is the canonical AI input; this Markdown is the human-readable twin of the same numbers.",
  );
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Total Gains: ${fmtUsd(m.totalGains, true)}`);
  lines.push(`- Total Losses: ${fmtUsd(m.totalLosses, true)}`);
  lines.push(`- Net Gain: ${fmtUsd(m.netGain, true)}`);
  lines.push(`- Gain/Loss Ratio: ${fmtPct(m.gainLossRatioPct)}`);
  lines.push("");
  lines.push("## Metrics");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---|");
  lines.push(`| Closed trades | ${m.closes} |`);
  lines.push(`| Opens | ${m.opens} |`);
  lines.push(`| Wins / Losses / Breakevens | ${m.wins} / ${m.losses} / ${m.breakevens} |`);
  lines.push(`| Win rate | ${fmtPct(m.winRatePct)} |`);
  lines.push(`| Profit factor | ${m.profitFactor === null ? "—" : m.profitFactor} |`);
  lines.push(`| Average win | ${fmtUsd(m.avgWin)} |`);
  lines.push(`| Average loss | ${fmtUsd(m.avgLoss)} |`);
  lines.push(`| Largest win | ${fmtUsd(m.largestWin)} |`);
  lines.push(`| Largest loss | ${fmtUsd(m.largestLoss)} |`);
  lines.push(`| Expectancy per trade | ${fmtUsd(m.expectancyPerTrade, true)} |`);
  lines.push(`| Max drawdown | ${fmtUsd(m.maxDrawdownUsd)}${m.maxDrawdownPct !== null ? ` (${fmtPct(m.maxDrawdownPct)})` : ""} |`);
  lines.push(`| Net PnL % | ${fmtPct(m.netPnlPct)} |`);
  lines.push(`| Starting equity | ${fmtUsd(m.startingEquityUsd)} |`);
  lines.push("");
  lines.push("## Per-symbol");
  lines.push("");
  if (report.perSymbol.length === 0) {
    lines.push("No closed trades in window.");
  } else {
    lines.push("| Symbol | Trades | Wins | Win rate | Net PnL |");
    lines.push("|---|---|---|---|---|");
    for (const s of report.perSymbol) {
      lines.push(
        `| ${s.symbol} | ${s.trades} | ${s.wins} | ${fmtPct(s.winRatePct)} | ${fmtUsd(s.netPnl, true)} |`,
      );
    }
  }
  lines.push("");
  lines.push("## Per-day realized PnL (UTC)");
  lines.push("");
  if (report.perDay.length === 0) {
    lines.push("No closed trades in window.");
  } else {
    lines.push("| Date (UTC) | Closes | PnL |");
    lines.push("|---|---|---|");
    for (const d of report.perDay) {
      lines.push(`| ${d.date} | ${d.closes} | ${fmtUsd(d.pnl, true)} |`);
    }
  }
  lines.push("");
  lines.push("## Decisions");
  lines.push("");
  lines.push(
    `Signals: ${report.decisions.signals} · Approved: ${report.decisions.approved} · Rejected: ${report.decisions.rejected} · Decision data classes: ${report.dataClasses.protected} protected / ${report.dataClasses.sim} sim`,
  );
  lines.push("");
  if (report.decisions.topRejectionReasons.length > 0) {
    lines.push("Top Risk Gate rejection reasons:");
    lines.push("");
    for (const r of report.decisions.topRejectionReasons) {
      lines.push(`- ${r.reason} — ${r.count}`);
    }
    lines.push("");
  }
  if (report.exitReasons.length > 0) {
    lines.push("Exit reasons:");
    lines.push("");
    for (const r of report.exitReasons) {
      lines.push(`- ${r.reason} — ${r.count}`);
    }
    lines.push("");
  }
  lines.push(`Params snapshot (first in window): ${report.paramsSnapshotFirst ?? "—"}`);
  lines.push(`Params snapshot (last in window): ${report.paramsSnapshotLast ?? "—"}`);
  lines.push("");
  lines.push("## Trades");
  lines.push("");
  if (report.trades.length === 0) {
    lines.push("No closed trades in window.");
  } else {
    lines.push("| Symbol | Entry | Exit | Entry px | Exit px | Qty | PnL | Hold (h) | Exit reason |");
    lines.push("|---|---|---|---|---|---|---|---|---|");
    for (const t of report.trades) {
      lines.push(
        `| ${t.symbol ?? "—"} | ${t.entryTs ?? "unknown"} | ${t.exitTs} | ${fmtNum(t.entryPrice)} | ${fmtNum(t.exitPrice)} | ${fmtNum(t.qty)} | ${fmtUsd(t.pnl, true)} | ${t.holdHours === null ? "—" : t.holdHours} | ${t.exitReason} |`,
      );
    }
  }
  lines.push("");
  lines.push("## Open positions (unmatched opens)");
  lines.push("");
  if (report.openPositions.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| Symbol | Entry | Entry px | Qty |");
    lines.push("|---|---|---|---|");
    for (const p of report.openPositions) {
      lines.push(
        `| ${p.symbol ?? "—"} | ${p.entryTs} | ${fmtNum(p.entryPrice)} | ${fmtNum(p.qty)} |`,
      );
    }
  }
  lines.push("");
  lines.push("## Caveats");
  lines.push("");
  for (const c of report.caveats) lines.push(`- ${c}`);
  lines.push("");
  return lines.join("\n");
}

export function renderFleetReportMarkdown(reports: BotReport[]): string {
  const first = reports[0];
  const lines: string[] = [];
  lines.push("# Fleet performance report");
  lines.push("");
  lines.push(
    `Timeframe: ${first?.timeframe.from ?? "beginning"} → ${first?.timeframe.to ?? "now"} · Generated ${first?.generatedAt ?? new Date().toISOString()} · Generator ${REPORT_GENERATOR_VERSION}`,
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Bot | Net Gain | Gain/Loss Ratio | Win rate | Closes |");
  lines.push("|---|---|---|---|---|");
  for (const r of reports) {
    lines.push(
      `| ${r.botLabel} | ${fmtUsd(r.metrics.netGain, true)} | ${fmtPct(r.metrics.gainLossRatioPct)} | ${fmtPct(r.metrics.winRatePct)} | ${r.metrics.closes} |`,
    );
  }
  lines.push("");
  for (const r of reports) {
    lines.push(renderBotReportMarkdown(r));
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
}
