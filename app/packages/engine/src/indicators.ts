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
 * Standard deviation of the given values — POPULATION convention
 * (divide by N, not N−1). This is the finance-standard choice: it is
 * what Bollinger Bands use, and Snapback's z-score is a Bollinger-style
 * stretch measure, so the band math must match. Null on an empty series.
 */
export function stdDev(values: number[]): number | null {
  if (values.length === 0) return null;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) /
    values.length;
  return Math.sqrt(variance);
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

/**
 * A confirmed homing pigeon, as detected by detectHomingPigeon: the
 * two pattern candles plus the confirmation candle that closed above
 * the second candle's close.
 */
export interface HomingPigeon {
  /** Date of pattern candle 1 (long black body). */
  firstDate: string;
  /** Date of pattern candle 2 (small black body inside candle 1). */
  secondDate: string;
  /** Date of the confirmation candle (the most recent completed bar). */
  confirmDate: string;
  /** Close of candle 2 — the level the confirmation had to beat. */
  secondClose: number;
  /** Close of the confirmation candle. */
  confirmClose: number;
  /** 10-day SMA of closes ending at candle 2 (the downtrend test). */
  sma10AtSecond: number;
}

/**
 * Detect a CONFIRMED homing pigeon ending on the most recent
 * completed daily bar (Keith, 2026-11-14 — Snapback's second
 * buy trigger, alongside z-score / RSI(2)).
 *
 * The pattern (Steve Nison; TA-Lib CDLHOMINGPIGEON): in a downtrend,
 * a long black candle followed by a smaller black candle whose real
 * body sits entirely inside the first candle's body — a same-colour
 * harami, signalling fading selling pressure.
 *
 * Exact rules, all on completed daily bars (the caller passes only
 * completed bars, so a half-formed intraday candle can never be
 * candle 2 or the confirmation):
 * - bars[n-3] (candle 1) and bars[n-2] (candle 2) are both black
 *   (close < open);
 * - candle 2's body is inside candle 1's body: open2 <= open1 and
 *   close2 >= close1, and the first body is at least twice the
 *   second (body1 >= 2 * body2) — the deterministic "long first,
 *   small second" requirement (no TA-Lib body averages);
 * - downtrend context (TA-Lib does NOT verify this, so we do):
 *   candle 2's close sits below the 10-day SMA of closes ending
 *   at candle 2;
 * - confirmation (required — Bulkowski's testing found the
 *   unconfirmed pattern acts as a bearish continuation 56% of the
 *   time): the next completed candle, bars[n-1], closes ABOVE
 *   candle 2's close.
 *
 * The detection is anchored to the latest bar: it only returns a
 * hit while the confirmation candle IS the most recent completed
 * bar, so the signal is live for the trading day after the
 * confirmation closes and then expires — it never re-fires on the
 * same pattern. Returns null when fewer than 12 bars are supplied
 * (10 for the SMA + pattern + confirmation) or any rule fails.
 */
export function detectHomingPigeon(bars: DailyBar[]): HomingPigeon | null {
  const n = bars.length;
  if (n < 12) return null;
  const first = bars[n - 3]!;
  const second = bars[n - 2]!;
  const confirm = bars[n - 1]!;
  // Both pattern candles black (close < open).
  if (!(first.close < first.open) || !(second.close < second.open)) {
    return null;
  }
  const body1 = first.open - first.close;
  const body2 = second.open - second.close;
  // Second body inside the first, and the first at least twice the second.
  if (
    !(second.open <= first.open) ||
    !(second.close >= first.close) ||
    !(body1 >= 2 * body2)
  ) {
    return null;
  }
  // Downtrend context: candle 2's close below the 10-day SMA of
  // closes ending at candle 2.
  const sma10 = sma(
    bars.slice(n - 11, n - 1).map((b) => b.close),
    10,
  );
  if (sma10 === null || !(second.close < sma10)) return null;
  // Confirmation: the next completed candle closes above candle 2.
  if (!(confirm.close > second.close)) return null;
  return {
    firstDate: first.date,
    secondDate: second.date,
    confirmDate: confirm.date,
    secondClose: second.close,
    confirmClose: confirm.close,
    sma10AtSecond: sma10,
  };
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
  /** Traded volume in the bar, when the feed provides it (Phase 12: crypto bars do; equity bars may omit it). */
  volume?: number;
}

/**
 * Average true range over the last `period` timed bars (simple mean,
 * same convention as atrMean). Null when fewer than period+1 bars.
 */
export function atrTimed(bars: TimedBar[], period: number): number | null {
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
