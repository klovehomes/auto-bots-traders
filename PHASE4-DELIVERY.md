# Phase 4 — Snapback's real paper-trading runner

Delivered 2026-11-04 on branch `dev`, on top of `498ef84`. Status:
**built, typechecked, harness-verified, NOT yet deployed** — the Mac
restart (pull + `docker compose up -d --build`) is what puts her
live, same routine as Phases 1 and 3.

Snapback now trades the shared Alpaca **paper** account for real,
under the fleet `MODE=paper` ceiling, on her own virtual **$10,000**
book — the third and final equity/options runner of the current
fleet (Trendia Phase 1, Vega Phase 3). In `MODE=sim` she stays on
the simulator; in paper mode without Alpaca keys the engine degrades
to the full simulator with the same loud warning as the other
runners, now naming all three.

## What was built

- **`app/packages/engine/src/snapback.ts`** (new) — her runner,
  mirroring the Trendia/Vega patterns: durable JSON state with
  `startCapital` and the same boot re-seed rule, decision records on
  the event stream (trigger, indicator values, params snapshot, Risk
  Gate verdict), the shared control/kill-switch router, and a 30 s
  tick with Vega's no-overlap guard.
- **Registration** in `engine/src/index.ts`: Snapback joins the
  paper-runner registry; the simulator no longer simulates her when
  her real runner is active (the same displacement Trendia/Vega
  use); the paper-mode boot line and the no-keys fallback message
  name her.
- **`engine/src/indicators.ts`**: added `stdDev` (see conventions
  below). Nothing else in the file changed.
- **Harness** `app/packages/engine/harness/snapback-harness.ts`
  (new): the real runner against an in-memory fake broker.
- **Copy/config parity**: the web decision-detail hint now reads
  "Phases 1 + 3 + 4: Trendia's, Vega's and Snapback's decisions…";
  `docker-compose.yml` sets `SNAPBACK_STATE_PATH:
  /data/paper-snapback-state.json`; `.env.example` documents it.
- **`bots/snapback.md` unchanged** — the loader already exposes every
  field the runner needs.

## Her rules, as implemented (from bots/snapback.md)

- **Universe (8):** SPY, QQQ, IWM, AAPL, MSFT, AMD, NFLX, TSLA.
- **Cadence:** entry evaluation **hourly during market hours** (the
  .md schedule), keyed and persisted exactly like Vega's hourly
  machinery; exits watched on the fast 30 s tick.
- **Entries — the stretch, measured LIVE:** at each hourly
  evaluation, for each name she doesn't already hold:
  - z-score = (latest price − mean of the last 20 **completed**
    daily closes) / (SD of those closes); fires below **−2.0**.
  - **OR** RSI(2) < **10** (see conventions below).
  - **Trend filter:** the latest price must be above the **200DMA**
    of completed daily closes. A signal that fails the filter is a
    logged decision ("Trend filter: BLOCKED"), not a silent skip.
  - One open position per underlying; no pyramiding.
  - Quantity = `floor(20% of book equity / latest price)`; zero
    shares is a logged gate rejection, never a fractional order.
  - Entry orders are **market, time-in-force `day`** — her signal is
    intraday (hourly), so unlike Trendia's next-open entries the
    order goes in when the stretch is measured.
- **Risk Gate before every entry** (her .md numbers): 20% max
  position, max 6 positions, 1.5% daily loss cap on her book, plus
  the fleet book-commitment check. Every verdict — approve or
  reject — is a decision record; each evaluation ends with a summary
  log line (entries / gate rejections / trend blocks / no-signal).
- **Exits** (every tick in market hours, first match wins, in this
  order): stop loss at entry × 0.95; **5-trading-day max hold**
  (Mon–Fri days strictly after the entry date — Vega's time-stop
  convention); +4% at entry × 1.04; reversion complete when the
  latest price reaches the current 20-day mean of completed closes.
  Partial fills are managed at the broker-reported quantity and
  labelled as partial in the stream.
- **Kill switch:** a halt cancels **her** open orders (tracked order
  IDs only); kill + liquidate closes **only her tracked positions**
  and reports closed/failed honestly through the control router.

## Live-stretch measurement choices (the documented conventions)

- **Standard deviation: population SD (÷N).** The codebase had no
  SD function; the new `stdDev` helper in `indicators.ts` uses the
  population convention because Snapback's z-score is a
  Bollinger-style stretch measure and Bollinger Bands are defined
  with population SD. Documented in the helper's doc comment.
- **RSI(2):** the codebase's Wilder RSI at period 2 over the
  completed daily closes, with the **latest trade price appended as
  today's in-progress close**. Both entry legs are therefore live
  intraday measures against completed-bar statistics — the same
  convention Vega uses when he screens the live price against
  completed-bar ATR. The z-score and RSI(2) are recomputed from the
  live price on every call; only the bar-derived parts (20-day mean,
  SD, 200DMA, closes) are cached per ET date.
- **200DMA:** simple mean of the last 200 completed daily closes;
  names with fewer than 200 completed closes are treated as
  no-signal (never traded on partial history).

## The shared-account overlap rule — and the paper.ts safety fix

Snapback is the second live **equity** bot on the one Alpaca paper
account, and her universe overlaps Trendia's (SPY, QQQ, AAPL, MSFT,
AMD). Phase 4 therefore runs on a **state-only** discipline:

- **Snapback's boot reconcile is state-only.** She manages only
  positions recorded in her own state (quantities synced to what the
  broker reports). An untracked broker position is **ignored and
  logged as foreign — never adopted**.
- **She never trades over a foreign position.** If a live signal
  fires on a symbol the account holds but she doesn't track, the
  entry is gate-REJECTED with that reason. The two stock bots can
  therefore never co-hold a symbol.
- **Her exits are quantity-sized market sells for exactly her
  tracked quantity** — never `closePosition(symbol)`, which would
  liquidate the whole account position in that symbol, including
  Trendia's shares.

**Trendia's runner (`paper.ts`) was tightened to the same rule —
this is a required safety fix, not a refactor:**

- Trendia's boot reconcile previously **adopted** any untracked
  in-universe broker position (a Phase 1 safety net for state loss).
  With Snapback live, her next boot would have claimed Snapback's
  SPY/QQQ/AAPL/MSFT/AMD shares as her own. Adoption is removed:
  untracked positions are logged as foreign and ignored. Her
  stale-state drop (tracked symbol no longer at the broker) is
  unchanged.
- The same hazard existed in two adjacent sweeps, tightened in the
  same pass: her kill + liquidate previously closed **every** broker
  position in her universe (now: only her tracked positions,
  reported honestly when a tracked symbol has no broker position),
  and her halt-cancel previously cancelled open orders **by universe
  symbol** (now: only her own tracked order IDs).
- Trendia's exits and evaluation already skipped broker-held symbols
  she doesn't track (Phase 1 behavior) and are unchanged. One
  residual to know about: her kill + liquidate still closes her
  tracked symbols via `closePosition(symbol)` — safe **only
  because** the no-co-hold rule above guarantees a symbol she tracks
  is held by her alone. Vega (options, OCC symbols) is unaffected by
  all of this.

## Verification (all run 2026-11-04)

- `npm run typecheck` — clean across api / engine / shared / web.
- `npm run build` — clean (web build shows only the pre-existing
  chunk-size warning).
- **Snapback harness: 38/38 passed** — z-trigger entry (22 shares =
  floor($2,000/$90)); RSI(2)-only entry; trend-filter block;
  no-signal evaluation; gate rejections (position cap, max
  positions 6/6, daily loss cap −$160 vs −$150); all four exits
  (mean reversion +$50.00, take profit +$81.40, stop loss −$101.20
  booked to the day, 5-day max hold); halt cancels her resting
  order; kill + liquidate closes only her SPY (+$50 reported) with
  the foreign NFLX position untouched and `closePosition` never
  called; foreign position ignored at boot and refused at entry;
  state persistence + reconcile across a restart (reconciled
  position stays exit-managed); partial fill tracked at 10 of 22
  shares; boot re-seed (untouched $5,000 → $10,000, touched stays,
  legacy no-`startCapital` file reads $5,000 and re-seeds).
- **Vega harness: 47/47 passed** — no regression from the
  `paper.ts`/`indicators.ts` changes.
- **Smoke, `MODE=sim`:** all five bots simulated; Snapback emits
  SIM-labelled events (e.g. "SIM · z-score -2.3 vs 20-day mean;
  RSI(2) 7; above 200DMA").
- **Smoke, `MODE=paper` without keys:** the boot line announces all
  three runners, then the loud fallback — "Alpaca keys are not
  configured — Trendia, Vega and Snapback CANNOT trade paper.
  Running the simulator for every bot instead." No fabricated
  connection.

## Boot / verification lines Keith should see (Mac, after restart)

```
[engine] MODE=paper — Trendia trades the Alpaca paper account on real market data; Vega runs his Phase 3 options pipeline (...); Snapback trades real paper entries/exits on her hourly mean-reversion runner; Wesley and PolyCrypt9000 stay on the simulator
[snapback] Snapback: Phase 4 live-paper runner started — universe SPY/QQQ/IWM/AAPL/MSFT/AMD/NFLX/TSLA, book $10,000.00, hourly stretch evaluation in market hours, exits on the fast tick
```

Then, in market hours, once an hour:

```
[snapback] Snapback: hourly evaluation complete — N entries submitted, N gate rejections, N trend-filter blocks, N no-signal; book equity $…
```

Possible one-time lines on the first boot, only if the account holds
positions a bot doesn't track (expected if Trendia holds any of the
five overlap names):

```
[snapback] Snapback: foreign position ignored at boot — … (state-only reconcile; never adopted)
[paper] Trendia: foreign position ignored at boot — … (state-only reconcile; never adopted)
```

Her state file appears at `/data/paper-snapback-state.json` on the
shared volume (host path `data/paper-snapback-state.json` when run
outside Docker). Her decisions — signals, trend blocks, gate
verdicts, fills, exits — show in the dashboard's Decisions/Trade
Stream views with the full record, like Trendia's and Vega's.
