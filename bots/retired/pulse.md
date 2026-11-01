---
name: Pulse
codename: pulse
enabled: true
mode: paper
market: crypto
broker: alpaca
strategy: volatility_breakout
universe: [BTC/USD, ETH/USD, SOL/USD]
timeframe: 1Hour
schedule: 24/7, evaluate every hour
rules:
  entry: 20-period Donchian breakout confirmed by above-average volume and ATR expansion
  exit: trailing stop at 2x ATR(14), or momentum rollover (ROC crosses below zero)
risk:
  max_position_pct: 15
  max_positions: 3
  stop_loss_pct: 6
  max_daily_loss_pct: 2.5
viz:
  color: "#fb923c"
  form: avatar_disc
  avatar_accessory: headphones
---

# Pulse — the night-shift breakout trader

Crypto never closes, so neither do I. While the stock bots sleep, I watch
Bitcoin, Ethereum, and Solana for the one pattern this market repeats
forever: long, quiet compression, then an explosive move.

I don't trade the noise in the middle of a range — that's where accounts go
to die slowly. I wait for a real breakout from a real base, with volume and
volatility expanding behind it, and then I ride it with an ATR trailing
stop that lets winners run and cuts losers without emotion at 3 AM.

My temperament is binary: flat or fully engaged. Most hours I do nothing at
all, and that's by design. Chop is my enemy, patience is my edge, and the
stop is my religion — crypto moves too fast for hope to be a strategy.
