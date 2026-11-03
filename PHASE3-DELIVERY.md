# Phase 3 (Vega) — Delivery: Vega's options pipeline on Alpaca paper

Delivered 2026-11-03 as **v11** (dev branch). Scope:
`PHASE3-VEGA-SCOPE.md` in ~/workspace/trading-bots (all six §6 decisions
made by Keith 2026-11-03). This build is Milestones 1 + 2 — data
plumbing and full paper-order capability — delivered in **SHADOW
mode**. Milestone 3 (shares ballast / 75-25 mix) is NOT in this build
(decision D3).

## What shipped

- **Runner registry** (`engine/src/index.ts`): paper mode now routes
  Trendia (Phase 1 daily runner, untouched) AND Vega (new hourly
  options runner) to the real paper account. The simulator runs only
  Snapback, Wesley and PolyCrypt9000. The control router
  (`paper.ts`) was generalized to a three-way liquidation split.
- **Vega runner** (`engine/src/vega.ts`, new): hourly screen of the
  30-symbol `candidate_pool` (added to `bots/vega.md`: his original 13
  + NVDA, MSTR, ARM, UPST, NIO, SNAP, DKNG, RBLX, UBER, XYZ, SHOP, NET,
  RIOT, GME, ARKK, XBI, SQQQ) — price $5–$200, ATR(20) ≥ 3.5% of price;
  20-hour breakout/breakdown signals (D2); contract pick at expiry
  2–4 weeks, |delta| closest to 0.45 in his 0.35–0.55 band, OI ≥ 1,000,
  spread ≤ 10% of mid (failed picks are logged no-trade decisions);
  Risk Gate at his .md numbers (premium ≤ 6% of his $5,000 virtual
  book = $300/position, max 6 positions, 3% daily loss cap; sizing =
  floor(cap ÷ ask×100), one contract over the cap is a rejection);
  exits on the 30 s tick off live mids (+50% TP, −35% stop, 5-trading-
  day time stop, force-exit 2 trading days before expiry); full
  decision records (contract, strike, expiry, delta, IV, premium, gate
  verdict, params snapshot); kill switch via the existing control
  router (halt cancels his open orders; kill+liquidate closes his
  contracts and reports); state at `/data/paper-vega-state.json` with
  boot reconcile of broker contract positions; daily IV recorded per
  underlying in state for the future IV-percentile screen leg.
- **Earnings guard** (`engine/src/earnings.ts`, new): Nasdaq public
  earnings calendar, refreshed once per ET date (hourly retry after a
  failure). Entries within 5 days of earnings are blocked with a
  decision; when the calendar cannot be read, entries pause entirely
  — fail-closed, logged, never a silent pass.
- **Alpaca options surface** (`engine/src/alpaca.ts`): option contract
  lookup and snapshots (quote + Greeks + IV) via the Market Data API
  on the free **indicative** feed (the JS SDK has no contracts
  surface; raw REST with the same keys), hourly underlying bars, and
  limit orders (`limit_price` now forwarded by `createOrder`).
- **Orders (D5)**: entries are limit-at-mid, day TIF; unfilled after
  60 s → cancelled and repriced once at the fresh mid; still unfilled
  after another 60 s → cancelled and logged as abandoned. Exits use
  close-at-market, same as Trendia (stops must fill).
- **Shadow/live separation**: shadow positions and shadow realized
  PnL live in their own state fields; the live book never inherits
  shadow results. Shadow liquidation settles the shadow book at
  current mids and reports through the same control channel.

## Shadow mode — how it flips

`VEGA_SHADOW` env flag, default **true** (set in
`app/docker-compose.yml` as `${VEGA_SHADOW:-true}` and in
`app/.env.example`). In shadow, Vega runs the full pipeline and emits
decision / order-intent events labelled `SHADOW ·`, tracking a shadow
book so exits are simulated against live mids — but places **no**
broker orders. To flip him to live paper orders after the soak:

1. In the app folder's `.env`, set `VEGA_SHADOW=false`.
2. `docker compose up -d` (not `restart` — env changes need recreate).
3. Confirm in the engine log: `Phase 3 live-paper runner started` and
   the MODE=paper banner line saying "live paper orders".

## Verification (all run 2026-11-03 on this tree)

- **Typecheck**: `npm run typecheck` — pass (all four workspaces).
- **Production build**: `npm run build` — pass (incl. web vite build).
- **Fake-broker harness** (`app/packages/engine/harness/vega-harness.ts`,
  run with `npx tsx harness/vega-harness.ts`): **42/42 checks pass.**
  Covers the scope §8 list: delta-band + expiry-window picks, OI and
  spread rejects (incl. fall-through to the next liquid contract),
  sizing math incl. the 1-contract-too-expensive gate reject, shadow
  entry with zero broker orders, TP/stop exits at the right mids in
  both modes, time stop, expiry guardrail, earnings block (2 days out)
  and calendar-down fail-closed, daily-loss-cap rejection, halt
  cancelling a resting order (and no reprice while halted),
  kill+liquidate closing a contract with an honest report
  (1 closed / 0 failed / +$50), restart reconcile adopting and then
  exit-managing a live contract, the D5 reprice-then-cancel sequence,
  decision-record-before-order with a shared decision_id, IV history
  recording, and shadow/live PnL ledger separation.
  Two real bugs were found and fixed by the harness during the build:
  an exactly-10% spread failed on floating-point dust (now inclusive
  with an epsilon), and one harness-side race (asserted a close event
  before the poll tick emitted it).
- **Native smoke runs** (engine only, API down, 12–25 s each):
  - `MODE=sim` — unchanged: banner, all five bots on the simulator,
    zero runner starts.
  - `MODE=paper`, no keys — loud fallback ("Trendia and Vega CANNOT
    trade paper… simulator for every bot"), stub-mode connection note.
  - `MODE=paper`, dummy keys, Alpaca unreachable from this VM —
    connection-check failure logged (VM egress proxy), BOTH runners
    started (Trendia on Keith's 24-name universe; Vega SHADOW on the
    30-name pool), simulator running exactly 3 bots, tick failures
    logged as will-retry, no crash. Note: Vega's first tick spends
    time in the morning earnings refresh (8 sequential Nasdaq dates,
    10 s timeout each); through this VM's proxy that outlasted the
    25 s window — harmless (entries stay fail-closed until it lands)
    and a couple of seconds on a direct connection.
- **Not verifiable from this VM**: live Alpaca options endpoints
  (contracts/snapshots) — the VM cannot reach Alpaca at all; the
  options surface is verified against the fake broker and the
  published API shapes, and the shadow soak on Keith's Mac is the
  real-data proof. `docker compose config` could not be run (no
  Docker on this VM); the compose change copies the existing env
  pattern exactly.

## Interpretations worth knowing (scope was silent; choices logged)

- One open options position per underlying at a time (his file caps
  total positions, not per-name stacks) — a second signal on a held
  name is a gate rejection with that reason.
- Adopted (reconciled) positions count the time stop from the
  adoption date — the true entry date is unknowable after state loss;
  the reconcile event says so.
- Trading-day counting ignores exchange holidays (weekdays only).
- The exactly-10% spread boundary is inclusive ("within 10% of mid").
- Vega's tick never overlaps itself (an `evaluating` guard Trendia
  doesn't need): his hourly screen is heavier than one 30 s tick in
  the worst case, and overlapping evaluations could double-submit.

## Mac steps (Keith)

Same flow as v10: fetch the v11 bundle (or pull `dev`), keep your
existing app-folder `.env` (keys + MODE=paper already in place),
`docker compose up --build -d` from the app folder. Vega comes up in
SHADOW mode by default — watch his `SHADOW ·` decisions in the stream
for 2–3 trading days, then flip `VEGA_SHADOW=false` + `docker compose
up -d` when you're satisfied with his picks.
