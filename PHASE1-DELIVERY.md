# Phase 1 Delivery — Trendia on Alpaca Paper (v10)

Built 2026-11-02. Trendia now trades the real Alpaca **paper** account on
real market data. Everything else about the stack is unchanged.

## What Trendia actually does now (MODE=paper)

- **Data:** real daily bars from Alpaca for her universe (SPY, QQQ, AAPL,
  MSFT, NVDA, AMZN, META, GOOGL, AVGO, COST) plus SPY for the regime check.
- **Rules, exactly as written in `bots/trendia.md`:** trend filter (close
  above the 200DMA, 50DMA above the 200DMA), entry on a 20-day high
  breakout with RSI(14) between 55 and 80, exits on a 7% stop loss, an 8%
  trailing stop, or a close below the 50DMA. If SPY loses its own
  uptrend, new entries stop — cash is a position.
- **Schedule:** she evaluates completed daily bars once a day and entries
  fill at the **next market open** (market-on-open orders), per her file.
  Stops are checked against live prices every 30 seconds while the
  market is open.
- **Risk Gate before every order:** max 20% of her book per position,
  max 5 positions, 1.5% daily loss cap, and the book can't over-commit —
  she trades a virtual **$5,000 book** inside the paper account, sized
  off the book, never the account's $100k.
- **Decision records:** every entry/exit decision lands in the Decisions
  tab with the trigger, the indicator values at signal time, a snapshot
  of the params in force, and the Risk Gate verdict. Gate rejections are
  logged as decisions with no trade. Routine no-signal symbols are
  counted in the engine log only.
- **Kill switch covers her real order flow:** KILL cancels her open
  orders and stops all trading (positions stay open); KILL + LIQUIDATE
  closes her positions at market and reports what closed and what
  couldn't. The arm toggle works exactly as before.
- **Restarts are safe:** her tracked positions, price peaks, pending
  orders and realized PnL persist on the data volume
  (`/data/paper-trendia-state.json`); on boot she reconciles against the
  broker's actual positions before doing anything.
- The other four bots still run the simulator (their reasons say
  `SIM ·`) until their strategy plugins land in Phase 3. Trendia's
  reasons say `PAPER ·`.

## Keith's steps to run it

Your `.env` (in the `app` folder) already has the keys. Two things left:

1. **Get the v10 code** — either unzip `trading-bots-local-v10.zip` and
   copy your `.env` into the new `app` folder, or (cleaner, keeps your
   `.env` in place) update your clone from the bundle:
   `git fetch ~/Downloads/traderbots-dev-v10.bundle dev:dev` then
   `git checkout dev` — then `git push origin dev` when you're ready to
   back it up to GitHub.
2. **Flip the mode:** in `app/.env`, change `MODE=sim` to `MODE=paper`.
3. **Rebuild:** from the `app` folder, `docker compose up --build -d`.

## What you'll see

- The page badge turns blue: **PAPER TRADING**.
- Engine log: `Trendia: Phase 1 live-paper runner started`, then a daily
  evaluation line (entries submitted / gate rejections / no-signal
  count). The first evaluation runs on the most recent completed
  session's bars; any entries fill at the next market open.
- In the Alpaca paper dashboard you'll see the same orders and positions
  — that's the cross-check that it's real.
- Note the paper account shows ~$100k; Trendia only ever commits her
  $5,000 book. Don't trade that paper account by hand — she reconciles
  against it and will adopt positions in her universe as hers.

## Verified before delivery

Typecheck + full build pass. An 11-check harness ran the real runner
against a fake broker: reconcile/adopt, approved entry with full
decision record, market-on-open order, no-signal discipline, fill →
open event, trailing-stop exit with PnL, halt cancels open orders,
kill+liquidate closes and reports, and the SPY-regime gate rejecting
with zero orders. Native runs confirmed the no-key fallback (loud
warning + simulator, never a fake connection) and that a bad-key/network
failure retries without taking the rest of the team down. First
live-paper session happens on your account — the dev VM can't reach
Alpaca from here.
