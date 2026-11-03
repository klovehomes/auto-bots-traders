---
name: Vega
codename: vega
enabled: true
mode: paper
market: us_options
broker: alpaca
strategy: options_volatility
universe: screened daily by the rules below — no fixed list
watchlist_examples: [AMD, PLTR, SMCI, COIN, HOOD, MARA, SOFI, RIVN, AFRM, IONQ, SOXL, TQQQ, UVXY]
candidate_pool: [AMD, PLTR, SMCI, COIN, HOOD, MARA, SOFI, RIVN, AFRM, IONQ, SOXL, TQQQ, UVXY, NVDA, MSTR, ARM, UPST, NIO, SNAP, DKNG, RBLX, UBER, XYZ, SHOP, NET, RIOT, GME, ARKK, XBI, SQQQ]
timeframe: 1Hour
schedule: evaluate hourly during market hours, weekdays 09:30–16:00 ET
rules:
  underlying_price_min: 5
  volatility_screen: 20-day ATR at least 3.5% of share price, or implied-vol percentile 70+
  options_liquidity: open interest 1,000+ contracts and bid/ask spread within 10% of mid
  holdings_mix: 75% of invested capital in options, 25% in shares of the same underlyings (rebalance band 70–80%)
  contracts: long calls on bullish breakouts, long puts on bearish breakdowns; strike 5% out of the money (nearest listed strike at-or-beyond 5% OTM); exactly one contract per position; expiry 2–4 weeks out
  earnings_guard: no new entries within 5 days of the underlying's earnings report
risk:
  max_position_pct: 6 (premium paid per options position)
  max_positions: 6
  stop_loss_pct: 35 (of premium paid — for options, the premium is the risk unit)
  take_profit_pct: 50 (of premium paid)
  time_stop: exit any contract 5 trading days after entry if neither target is hit
  max_daily_loss_pct: 3
viz:
  color: "#f472b6"
  form: avatar_disc
  avatar_accessory: star shades
---

# Vega — the storm rider

The other bots fear volatility. I eat it. Every day I screen the market for
stocks and ETFs priced at $5 a share or more that actually move —
high ATR, hot implied volatility, options chains liquid enough to get in
and out cleanly — and I hunt breakouts in names the rest of the team
won't touch. There is no ceiling on the share price: the limit belongs on
the price of the option, not the stock.

Three quarters of my book is options: long calls when a volatile name
breaks up, long puts when it breaks down, struck 5% out of the money with
two to four weeks of life, one contract at a time. The remaining quarter sits in shares of the same
underlyings — ballast and hedge in one. I never sell naked premium: every
position is defined-risk, and the most I can lose on a contract is the
premium I paid for it.

Options on wild stocks are expensive and unforgiving, so my exits are
mechanical: out at +50% of premium, out at −35%, out after five trading
days regardless, and never a fresh entry into an earnings print. Vega is
the option Greek that measures sensitivity to volatility itself — I wear
the name because volatility is not my risk. It is my raw material.
