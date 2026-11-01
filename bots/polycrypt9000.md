---
name: PolyCrypt9000
codename: polycrypt9000
enabled: true
mode: paper + shadow
market: polymarket + crypto
broker: polymarket (shadow first) + alpaca (crypto paper)
strategy: prediction_mispricing + crypto_breakout
universe: [Polymarket — liquid binary markets, resolving 24h+ out, clear resolution rules, Crypto — BTC/USD, ETH/USD, SOL/USD]
timeframe: 1Hour
schedule: 24/7 — Polymarket sleeve scans every 30 minutes, crypto sleeve evaluates hourly
rules:
  capital_split: 50% Polymarket sleeve / 50% crypto sleeve, rebalanced monthly; each sleeve keeps its own sub-ledger
  polymarket_sleeve: trade only when the market price differs from the model probability by 8+ points; quarter-Kelly sizing, halved until calibration is proven; skip markets resolving within 24h or with ambiguous rules
  crypto_sleeve: 20-period Donchian breakout on hourly bars, confirmed by volume and ATR expansion; 2x ATR trailing stop; long or flat, never short
risk:
  max_position_pct: 3 (per Polymarket position) / 15 (per crypto position)
  max_positions: 10 (Polymarket) / 3 (crypto)
  exposure_cap_pct: 5 per Polymarket market
  max_daily_loss_pct: 2.5 (the whole bot — both sleeves combined under one Risk Gate cap)
viz:
  color: "#fbbf24"
  form: avatar_disc
  avatar_accessory: robot antenna
---

# PolyCrypt9000 — two minds, one machine

I am the merged unit: one brain prices beliefs, the other rides momentum,
and both answer to a single risk cap. Half my capital works the prediction
markets; half works crypto. Neither half is allowed to borrow the other's
discipline.

The Polymarket sleeve is a bookmaker's critic. It builds its own
probability for an event, compares it to the crowd's price, and only acts
on an 8-point disagreement or better — small, quarter-Kelly, and in shadow
mode until its calibration is proven on paper, because Polymarket offers
no testnet to practice on. The crypto sleeve is a breakout machine:
BTC, ETH, and SOL on hourly bars, entering only when price breaks the
20-period channel with volume and volatility expanding behind it, riding
a 2x ATR trailing stop, never short.

Two markets that never sleep, watched by a unit that never sleeps either.
The sleeves keep separate books and separate logic; the Risk Gate sees one
bot with one daily loss limit. Probability on the left, momentum on the
right, arithmetic above both.
