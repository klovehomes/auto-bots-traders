import type { BotConfig, FleetEvent } from "@fleet/shared/types";

/**
 * Client-side aggregation over the event stream.
 *
 * Since Phase 6 the App seeds from the API's persisted event history
 * (GET /events/history) and merges the live stream by sequence
 * number, so every aggregate on this page (equity, win rate,
 * drawdown, YTD totals) is computed over the API's retained history
 * plus this session's live events — reloading the page no longer
 * resets them; the retention caps (5,000 decision records, 1,000
 * other events) bound how far back they reach.
 */

/**
 * Equal starting allocation: $5,000/bot paper as decided 2026-10-30,
 * doubled to $10,000/bot by Keith on 2026-11-03 (sim matches).
 */
export const START_EQUITY = 10000;

export interface OpenPosition {
  key: string;
  symbol: string;
  side: string | null;
  qty: number | null;
  price: number | null;
  ts: string;
}

export interface BotStats {
  name: string;
  /** Current equity: START_EQUITY + cumulative realized PnL from closes. */
  equity: number;
  /** Cumulative realized PnL from close events. */
  realized: number;
  wins: number;
  losses: number;
  closes: number;
  opens: number;
  /** Trade events seen (opens + closes). */
  trades: number;
  /** Equity after each close, oldest → newest, starting at START_EQUITY. */
  curve: number[];
  /** Worst peak-to-trough equity drop, in dollars (positive number). */
  maxDrawdown: number;
  /** Open positions keyed by bot+symbol+decision. */
  openPositions: OpenPosition[];
  /** Recent closes for the landscape ring's PnL-momentum tint. */
  recentCloses: { ts: number; pnl: number }[];
}

function emptyStats(name: string): BotStats {
  return {
    name,
    equity: START_EQUITY,
    realized: 0,
    wins: 0,
    losses: 0,
    closes: 0,
    opens: 0,
    trades: 0,
    curve: [START_EQUITY],
    maxDrawdown: 0,
    openPositions: [],
    recentCloses: [],
  };
}

/**
 * Build per-bot stats from the event list. `events` is newest-first (as kept
 * by the App); processing runs oldest → newest so equity accumulates in
 * chronological order.
 */
export function computeStats(
  bots: BotConfig[],
  events: FleetEvent[],
): Map<string, BotStats> {
  const map = new Map<string, BotStats>();
  for (const bot of bots) map.set(bot.name, emptyStats(bot.name));

  const chronological = [...events].reverse();
  for (const event of chronological) {
    const stats = map.get(event.bot);
    // Events from names outside the current bot config are ignored.
    // Most importantly, the engine's DATA_RESET audit record (bot
    // "system", v22) must never become a phantom leaderboard row with
    // a fake $10,000 book; genuine bot events always match a config
    // name, because the runners emit bot.name from the same files.
    if (!stats) continue;
    if (event.type === "open") {
      stats.opens += 1;
      stats.trades += 1;
      stats.openPositions.push({
        key: `${event.bot}|${event.symbol ?? "?"}|${event.decision_id ?? event.ts}`,
        symbol: event.symbol ?? "?",
        side: event.side,
        qty: event.qty,
        price: event.price,
        ts: event.ts,
      });
    } else if (event.type === "close") {
      stats.closes += 1;
      stats.trades += 1;
      const pnl = event.pnl ?? 0;
      stats.realized += pnl;
      stats.equity = START_EQUITY + stats.realized;
      if (pnl > 0) stats.wins += 1;
      else if (pnl < 0) stats.losses += 1;
      stats.curve.push(stats.equity);
      stats.recentCloses.push({ ts: Date.parse(event.ts), pnl });
      if (stats.recentCloses.length > 24) stats.recentCloses.shift();
      // A close retires the oldest matching open for that symbol (if the
      // page saw it — closes for positions opened before page load are
      // simply unmatched and still count toward PnL).
      const idx = stats.openPositions.findIndex(
        (p) => p.symbol === event.symbol,
      );
      if (idx >= 0) stats.openPositions.splice(idx, 1);
    }
  }

  for (const stats of map.values()) {
    let peak = -Infinity;
    let maxDd = 0;
    for (const point of stats.curve) {
      if (point > peak) peak = point;
      const dd = peak - point;
      if (dd > maxDd) maxDd = dd;
    }
    stats.maxDrawdown = maxDd;
    stats.realized = Math.round(stats.realized * 100) / 100;
    stats.equity = Math.round(stats.equity * 100) / 100;
  }
  return map;
}

export interface FleetTotals {
  /** Sum of positive realized PnL across all bots (green number). */
  profits: number;
  /** Sum of realized losses as a positive magnitude (shown red). */
  losses: number;
  net: number;
  closes: number;
}

export function computeTotals(events: FleetEvent[]): FleetTotals {
  let profits = 0;
  let losses = 0;
  let closes = 0;
  for (const event of events) {
    if (event.type !== "close" || event.pnl === null) continue;
    closes += 1;
    if (event.pnl > 0) profits += event.pnl;
    else if (event.pnl < 0) losses += -event.pnl;
  }
  profits = Math.round(profits * 100) / 100;
  losses = Math.round(losses * 100) / 100;
  return { profits, losses, net: Math.round((profits - losses) * 100) / 100, closes };
}

/**
 * PnL momentum for the landscape glow ring: recent closes weighted by an
 * exponential decay (~45 s half-life-ish), squashed to [-1, 1].
 * Positive → ring leans green, negative → red. This stands in for
 * unrealized-PnL tinting until the engine streams position marks.
 */
export function momentumAt(stats: BotStats, now: number): number {
  let sum = 0;
  for (const close of stats.recentCloses) {
    const ageSec = Math.max(0, (now - close.ts) / 1000);
    sum += close.pnl * Math.exp(-ageSec / 45);
  }
  return Math.tanh(sum / 120);
}

/** "$1,234.56" / "-$42.17" formatting used across the page. */
export function fmtMoney(value: number, signed = false): string {
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "Nov 1, 12:03 AM" style timestamp for feed rows. */
export function fmtTime(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtTimeFull(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}
