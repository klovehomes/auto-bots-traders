import type { MarketWeather, WeatherKind } from "./types.js";

/**
 * Market weather (v24) — the pure classification behind the hub dome's
 * particle weather. Deliberately free of I/O so the engine (which owns
 * market data), the web (which scales the particles), and the test
 * harness all run the exact same rule.
 *
 * THE RULE (Keith, 2026-11-11 — "breakout weather or downturn weather
 * for the day", judged on SPY):
 *
 *   dayChangePct = latestPrice vs the prior completed close
 *   breakout  if latestPrice ≥ prior 20-trading-day high
 *             OR dayChangePct ≥ +0.75%
 *   downturn  if dayChangePct ≤ −0.75%
 *             OR latestPrice ≤ prior 20-trading-day low
 *   otherwise the sign decides: ≥ 0 → breakout, < 0 → downturn.
 *
 * Exactly one of the two always displays. (The two rule sets cannot
 * conflict on consistent data: the prior close is itself inside the
 * 20-day window, so trading at/above the window high implies a
 * non-negative day change, and at/below the window low a non-positive
 * one.)
 */

/** Day-move (percent) that alone decides the weather, either way. */
export const WEATHER_DAY_MOVE_PCT = 0.75;

/** Structural slice of a daily bar — the engine's DailyBar satisfies it. */
export interface WeatherBar {
  date: string;
  high: number;
  low: number;
  close: number;
}

export interface WeatherInputs {
  /** SPY's latest price (live trade, today's close, or sim price). */
  latestPrice: number;
  /** The prior completed session's close. */
  priorClose: number;
  /** Highest high of the prior 20 trading days (fewer if that's all
   *  the history there is — the window is "up to 20"). */
  priorHigh20: number;
  /** Lowest low of the prior 20 trading days. */
  priorLow20: number;
}

/** The decided rule itself. Returns the kind + the day change (pct). */
export function classifyWeather(inputs: WeatherInputs): {
  kind: WeatherKind;
  spyChangePct: number;
} {
  const { latestPrice, priorClose, priorHigh20, priorLow20 } = inputs;
  const spyChangePct =
    priorClose > 0 ? ((latestPrice - priorClose) / priorClose) * 100 : 0;
  let kind: WeatherKind;
  if (
    latestPrice >= priorHigh20 ||
    spyChangePct >= WEATHER_DAY_MOVE_PCT
  ) {
    kind = "breakout";
  } else if (
    spyChangePct <= -WEATHER_DAY_MOVE_PCT ||
    latestPrice <= priorLow20
  ) {
    kind = "downturn";
  } else {
    kind = spyChangePct >= 0 ? "breakout" : "downturn";
  }
  return { kind, spyChangePct };
}

/**
 * Particle intensity in [0.15, 1]: a calm day stays sparse and gentle,
 * and activity scales linearly with the day's move up to a ±2.5% day.
 * Monotonic non-decreasing in |spyChangePct| by construction.
 */
export function weatherIntensity(spyChangePct: number): number {
  const scaled = Math.abs(spyChangePct) / 2.5;
  return Math.min(1, Math.max(0.15, scaled));
}

/**
 * Build the weather for "today" from ascending daily bars + the latest
 * price. `todayISO` is the current ET session date (YYYY-MM-DD).
 *
 * Which bar is "the day" being described:
 * - A bar dated today is the in-progress session: the day is the live
 *   price against the completed bars before it.
 * - No bar dated today and the live price differs from the last close
 *   (a new session the bars haven't caught up with): the day is the
 *   live price against all completed bars.
 * - Otherwise (evening after the bars caught up, weekend, holiday):
 *   the day is the last completed bar itself, against the bars before
 *   it — so the dome keeps showing the character of the most recent
 *   session instead of a flat 0.00%.
 *
 * Returns null when there isn't enough history to judge (fewer than
 * two reference bars) — the caller keeps the previous weather / the
 * web falls back to a calm default.
 */
export function weatherFromBars(
  bars: WeatherBar[],
  latestPrice: number | null,
  todayISO: string,
  source: MarketWeather["source"],
  asOf: string,
): MarketWeather | null {
  const asc = [...bars].sort((a, b) => (a.date < b.date ? -1 : 1));
  if (asc.length < 2) return null;
  const last = asc[asc.length - 1]!;

  let dayPrice: number;
  let reference: WeatherBar[];
  if (last.date === todayISO) {
    dayPrice = latestPrice ?? last.close;
    reference = asc.slice(0, -1);
  } else if (
    latestPrice !== null &&
    Math.abs(latestPrice - last.close) > 1e-9
  ) {
    dayPrice = latestPrice;
    reference = asc;
  } else {
    dayPrice = last.close;
    reference = asc.slice(0, -1);
  }
  if (reference.length < 2 || dayPrice <= 0) return null;

  const window = reference.slice(-20);
  const priorClose = reference[reference.length - 1]!.close;
  const priorHigh20 = Math.max(...window.map((b) => b.high));
  const priorLow20 = Math.min(...window.map((b) => b.low));
  const { kind, spyChangePct } = classifyWeather({
    latestPrice: dayPrice,
    priorClose,
    priorHigh20,
    priorLow20,
  });
  return {
    kind,
    spyChangePct: Math.round(spyChangePct * 100) / 100,
    asOf,
    source,
  };
}
