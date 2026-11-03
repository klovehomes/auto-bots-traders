/**
 * Technical indicators for the strategy plugins (Phase 1+).
 *
 * Pure functions over plain number series — no broker, no I/O — so the
 * backtester (Phase 1.5) can run the exact same math as live trading.
 */

export interface DailyBar {
  /** Session date (YYYY-MM-DD, exchange-local). */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Simple moving average of the last `period` values; null when too short. */
export function sma(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) {
    sum += values[i]!;
  }
  return sum / period;
}

/**
 * RSI with Wilder smoothing. Returns null when fewer than period+1 closes.
 * Matches the classic Wilder formulation used by charting packages.
 */
export function rsiWilder(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i]! - closes[i - 1]!;
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i]! - closes[i - 1]!;
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Highest high over the `period` bars BEFORE the last one (breakout level). */
export function priorHigh(bars: DailyBar[], period: number): number | null {
  if (bars.length < period + 1) return null;
  let max = -Infinity;
  for (let i = bars.length - 1 - period; i < bars.length - 1; i++) {
    if (bars[i]!.high > max) max = bars[i]!.high;
  }
  return max;
}

/** An intraday bar (Phase 3: Vega's hourly bars). */
export interface TimedBar {
  /** Bar start, ISO-8601 timestamp. */
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Highest high over the `period` bars BEFORE the last one (hourly breakout level). */
export function priorHighTimed(bars: TimedBar[], period: number): number | null {
  if (bars.length < period + 1) return null;
  let max = -Infinity;
  for (let i = bars.length - 1 - period; i < bars.length - 1; i++) {
    if (bars[i]!.high > max) max = bars[i]!.high;
  }
  return max;
}

/** Lowest low over the `period` bars BEFORE the last one (hourly breakdown level). */
export function priorLowTimed(bars: TimedBar[], period: number): number | null {
  if (bars.length < period + 1) return null;
  let min = Infinity;
  for (let i = bars.length - 1 - period; i < bars.length - 1; i++) {
    if (bars[i]!.low < min) min = bars[i]!.low;
  }
  return min;
}

/**
 * Average true range over the last `period` daily bars (simple mean of
 * true ranges — Vega's volatility screen needs a level, not a signal,
 * so no Wilder smoothing). Null when fewer than period+1 bars exist.
 */
export function atrMean(bars: DailyBar[], period: number): number | null {
  if (bars.length < period + 1 || period <= 0) return null;
  let sum = 0;
  for (let i = bars.length - period; i < bars.length; i++) {
    const bar = bars[i]!;
    const prevClose = bars[i - 1]!.close;
    const tr = Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - prevClose),
      Math.abs(bar.low - prevClose),
    );
    sum += tr;
  }
  return sum / period;
}
