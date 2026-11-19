> **SYNTHETIC SAMPLE DATA — generated from the v34 test harness fixtures. Not real trading history.**

# Snapback performance report

Timeframe: 2026-11-01T00:00:00Z → 2026-11-30T23:59:59Z (per-day PnL by UTC date) · Generated 2026-11-19T09:03:19.991Z · Generator v34

The JSON form of this report is the canonical AI input; this Markdown is the human-readable twin of the same numbers.

## Totals

- Total Gains: +$150.00
- Total Losses: -$50.00
- Net Gain: +$100.00
- Gain/Loss Ratio: 75.00%

## Metrics

| Metric | Value |
|---|---|
| Closed trades | 4 |
| Opens | 4 |
| Wins / Losses / Breakevens | 3 / 1 / 0 |
| Win rate | 75.00% |
| Profit factor | 3 |
| Average win | $50.00 |
| Average loss | -$50.00 |
| Largest win | $100.00 |
| Largest loss | -$50.00 |
| Expectancy per trade | +$25.00 |
| Max drawdown | $50.00 |
| Net PnL % | — |
| Starting equity | — |

## Per-symbol

| Symbol | Trades | Wins | Win rate | Net PnL |
|---|---|---|---|---|
| AAPL | 1 | 1 | 100.00% | +$100.00 |
| MSFT | 1 | 0 | 0.00% | -$50.00 |
| TSLA | 1 | 1 | 100.00% | +$25.00 |
| XYZ | 1 | 1 | 100.00% | +$25.00 |

## Per-day realized PnL (UTC)

| Date (UTC) | Closes | PnL |
|---|---|---|
| 2026-11-03 | 1 | +$100.00 |
| 2026-11-06 | 1 | +$25.00 |
| 2026-11-07 | 1 | +$25.00 |
| 2026-11-09 | 1 | -$50.00 |

## Decisions

Signals: 3 · Approved: 2 · Rejected: 1 · Decision data classes: 10 protected / 1 sim

Top Risk Gate rejection reasons:

- daily loss cap reached — 1

Exit reasons:

- mean reversion target — 1
- stop loss — 1
- take profit — 1
- time exit — 1

Params snapshot (first in window): z_entry=-2.0, rsi2_entry=10, max_position_pct=20
Params snapshot (last in window): z_entry=-2.2, rsi2_entry=8, max_position_pct=20

## Trades

| Symbol | Entry | Exit | Entry px | Exit px | Qty | PnL | Hold (h) | Exit reason |
|---|---|---|---|---|---|---|---|---|
| AAPL | 2026-11-02T14:01:00Z | 2026-11-03T14:01:00Z | 100 | 110 | 10 | +$100.00 | 24 | mean reversion target |
| XYZ | 2026-11-04T14:00:00Z | 2026-11-06T14:00:00Z | 10 | 15 | 5 | +$25.00 | 48 | take profit |
| TSLA | unknown | 2026-11-07T14:00:00Z | — | 250 | 3 | +$25.00 | — | time exit |
| MSFT | 2026-11-08T14:00:00Z | 2026-11-09T14:00:00Z | 200 | 195 | 10 | -$50.00 | 24 | stop loss |

## Open positions (unmatched opens)

| Symbol | Entry | Entry px | Qty |
|---|---|---|---|
| XYZ | 2026-11-05T14:00:00Z | 20 | 5 |

## Caveats

- Realized PnL only: metrics are computed from close events in the window. Open positions are listed at entry and are NOT marked to market.
- Per-day PnL is keyed by UTC date.
- 1 close(s) had no matching open inside the window (position opened earlier) — entry price and hold time are unknown for those trades.
- Window includes sim-class decision data (bare numeric decision ids) — simulator output, not real-runner performance. Check dataClasses before quoting these numbers.
- No starting equity provided — net PnL % and drawdown % are null rather than computed against an invented base.
