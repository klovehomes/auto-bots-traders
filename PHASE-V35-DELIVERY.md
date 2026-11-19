# Phase v35 — Exit-rule updates for four bots (Keith, 2026-11-19)

Built from the verified v34 tree (`fleet-v34-reports`) into
`fleet-v35-exits`. Build version bumped to **v35**
(`app/packages/web/src/version.ts`, same mechanism as v34).
Local commit only — **not pushed**; the parent agent pushes after review.

Keith's theme for this phase: hold winners longer. Four bots' exit
rules changed; entries, sizing, and Risk Gate behavior are untouched
everywhere.

---

## 1) Snapback — take profit +4% → +7%

- `bots/snapback.md`: exit prose now "+7%".
- `app/packages/engine/src/snapback.ts`: `TAKE_PROFIT_PCT` 4 → 7
  (the params snapshot already interpolated the constant, so every
  decision record now reads +7%); header comments updated.
- Unchanged: mean-reversion exit (still gated on entry-below-mean),
  −5% stop, 5-trading-day max hold, exit precedence
  (stop → max hold → take profit → reversion).
- Simulator: sim.ts Snapback flavor text never carried the +4%
  number for the TP leg; the win string now also names the +7%
  target. No numeric sim change (the sim does not implement exits
  numerically — see the sim note below).

## 2) Trendia — exit overhaul: ONE close-based exit

Removed both intraday price exits from `app/packages/engine/src/paper.ts`:

- **8% trailing stop: deleted** — the whole intraday `checkStops()`
  pass, the `TRAILING_STOP_PCT` constant, and the per-entry `peak`
  high-water tracking are gone.
- **7% hard stop loss: deleted as an exit trigger** — the runner no
  longer reads `stop_loss_pct` for Trendia at all.

New sole strategy exit, evaluated in the existing daily evaluation
on completed daily closes (same cadence/order pattern as the old
50DMA exit — the exit order is submitted from the evaluation pass):

- **Sell when the daily close falls more than 4% below the 50DMA**
  (`close < 50DMA × 0.96`), read from the new risk field
  `exit_below_50dma_pct` (default 4). The decision record logs the
  close, the 50DMA, the computed exit line, and the % below
  (e.g. "AAPL closed @ $95.00, 4.9% below its 50DMA $99.90 (exit
  line $95.90 = 50DMA × 0.96)").
- The params snapshot now reads `exit_rule: sell only on a daily
  close more than 4% below the 50DMA (close < 50DMA × 0.96)` — no
  stop_loss / trailing_stop text remains.

`bots/trendia.md`: exit prose rewritten to the single rule; the
risk block **drops `stop_loss_pct: 7`** and gains
`exit_below_50dma_pct: 4`; her philosophy prose no longer describes
a trailing stop.

**Loader / Risk Gate investigation (as briefed):** `stop_loss_pct`
was consumed only by the individual runners (paper.ts for Trendia,
snapback.ts, vega.ts for their own stops) — the shared loader
passes `risk` through opaquely, the API Risk Gate / control layer
never reads it, and the v34 reports generator does not reference
it. Removing the field from trendia.md is therefore safe; the
loader parses the updated file cleanly (verified directly, all
five bots). Snapback's and Vega's own `stop_loss_pct` fields are
untouched.

**State migration:** pre-v35 state entries carry a `peak` field.
The runner's state load is a spread-merge over the persisted JSON,
so legacy files load without crashing; `peak` is ignored and is
dropped the next time an entry is written. The new Trendia harness
seeds exactly this legacy shape and proves it.

Unchanged: entries (20-day breakout + RSI 55–80, SPY regime gate,
trend filter), 20% sizing / $95 min notional, max 5 positions,
1.5% daily loss cap (entry-side gate only, as before).

## 3) Vega — time stop is now expiry-based

- `app/packages/engine/src/vega.ts`:
  - The 5-trading-day time stop (`daysHeld >= timeStopDays`) is
    **removed**.
  - The old hard force-exit 2 trading days before expiry is also
    **removed — subsumed**: the new rule fires at or before it in
    every calendar configuration, so keeping it would be dead code.
  - New time stop, checked in the same position as before
    (TP → stop → time): **exit when calendar days-to-expiry ≤ 4**
    (`calendarDaysBetween(today, expiry) <= exitBeforeExpiryDays`),
    via a new exported `calendarDaysBetween` helper. The trigger
    text is `time stop (4 calendar days to expiry)` and the reason
    logs expiry date, days left, mid, and gain vs entry premium.
  - Param plumbing renamed cleanly: `VegaParams.timeStopDays` →
    `exitBeforeExpiryDays`, read from the new risk field
    `exit_before_expiry_days` (leading-number parse, default 4);
    the params snapshot now reads `time_stop: exit at 4 calendar
    days to expiry`.
  - Adopted-position reconcile: entry date is still recorded as the
    adoption date, but the comment/reason no longer claim the time
    stop counts from it — exits now run off the contract's expiry,
    which reconcile takes from the OCC symbol.
- `bots/vega.md`: `time_stop:` risk line replaced with
  `exit_before_expiry_days: 4 (calendar days — …)`; prose updated
  ("out when a contract reaches 4 days from expiration").
- Unchanged: +50% TP / −35% stop on premium (mid-based), check
  order, entries, $95-min / 6%-cap sizing.
- **Covered call/put exception:** Keith's wording excepted covered
  calls/puts from this time stop. Vega holds only long calls/puts
  and never writes covered positions (those are Wesley's), so the
  exception is structurally moot for Vega — no covered-position
  logic was built, per the brief.

## 4) Wesley — two-tier early exit by position age

- `app/packages/engine/src/wesley.ts`:
  - `EARLY_EXIT_FRACTION` (0.5) is now the **young tier** only.
    New constants: `EARLY_EXIT_FRACTION_AGED = 0.2` and
    `EARLY_EXIT_AGE_DAYS = 5`.
  - In `managePositions`, each short's age is computed in
    **calendar days** since its tracked `entryDate`:
    - entered **< 5 days ago**: buy back at mid ≤ **50%** of
      premium collected (previous behavior);
    - entered **≥ 5 days ago**: buy back **only** at mid ≤ **20%**
      of premium collected — i.e. only when he is up at least 80%
      on the trade (Keith's corrected direction, 2026-11-19).
  - The buy-back decision record states the tier, the position's
    age, and (aged tier) the 80%-capture requirement. The params
    snapshot and the boot log line state both tiers.
- **Entry-date availability:** `ShortOption.entryDate` was already
  recorded on every open and persisted in state, so no state
  migration is needed. Defensive coding per the brief: a legacy
  short whose `entryDate` is missing/empty at runtime is treated
  as **entered today** (young tier) instead of crashing.
- `bots/wesley.md`: `early_exit` rewritten as the two-tier rule;
  prose updated to match.
- Unchanged: 2× defense buy-back (fires at any age — harness-proven),
  expiry settlement (worthless / assignment / called away), entries,
  premium floor.

## Simulator (sim.ts) parity

The simulator does not implement any bot's exits numerically — its
closes are narrative, with per-bot flavor strings. The strings that
contradicted the new rules were updated so SIM never displays a
dead rule:

- Trendia: both win/lose strings now name the sole exit
  ("close >4% below 50DMA — trend broken…"); the "8% trailing stop
  hit" string is gone.
- Vega: lose string now "−35% premium stop / expiry time stop
  (DTE ≤ 4)".
- Wesley: win string now "bought back early at the age-tiered
  target".
- Snapback: win string now also names the +7% target; her lose
  string ("5% stop hit / 5-day time stop") is still accurate —
  her 5-trading-day max hold did not change.

## PM app parity — deliberate non-port

The Prediction Markets Assistant app contains only PolyCrypt9000.
None of these four bots or rules exist there, so — exactly as v34
recorded for the reports generator — there is nothing to port.
PolyCrypt9000's own exits (2× ATR trailing stop etc.) are unchanged
in both apps.

---

## Verification (all run in this tree, 2026-11-19)

- **Typecheck:** `npm run typecheck` — PASS, all four workspaces
  (shared, engine, api, web).
- **Production build:** `npm run build` — PASS, all workspaces;
  web bundle emitted with `BUILD_VERSION` "v35" present.
- **Harnesses** (`app/packages/engine/harness/`, run with tsx):
  - `snapback-harness.ts` — **56/56**. Extended: at +5% the position
    now HOLDS (no close, no sell order); at +7% the TP fires
    (pnl +$140.80 on the fixture); the post-restart and above-mean
    TP cases were re-based to +7% ($96.40 / $98.10).
  - `trendia-harness.ts` — **8/8, NEW** (no Trendia harness existed
    before v35). Cases: legacy state with a `peak` field loads and
    stays tracked; close at 0.9706×50DMA while 8.1% below peak →
    NO exit; close −10.0% from entry but above 0.96×50DMA → NO
    exit; close at 0.9510×50DMA → EXIT with close/50DMA/%-below in
    the record and the new params snapshot (pnl −$50.00 booked).
    Its bot config deliberately carries no `stop_loss_pct`.
  - `vega-harness.ts` — **59/59**. S9 rewritten: held 6 trading
    days with DTE 10 → NO exit, contract still in the shadow book;
    DTE 4 → time-stop exit; DTE 3 → time-stop exit. TP (S1/S8) and
    stop-loss (S5) cases pass unchanged.
  - `wesley-harness.ts` — **27/27**. New scenario F: 3-day-old
    position exits at mid = 50% of premium; 6-day-old position
    does NOT exit at 50% or at 30%, DOES exit at 20% (reason names
    the 80% capture); 6-day-old position still defends at 2×.
  - Regression: `polycrypt-harness.ts` **24/24**,
    `kalshi-harness.ts` **20/20**, `mode-harness.ts` **47/47**.
- **App tools tests** (`app/tools/`):
  - `test-reports-v34.ts` **38/38** · `test-reset-v22.ts` **21/21**
    · `test-smoke-v21.ts` **11/11** (native boot smoke: API + engine
    in SIM and PAPER with fake keys — engine boots and ticks with
    the new runners) · `test-history-v19.ts` **25/25** ·
    `test-keys-v21.ts` **32/32** · `test-keys-v21-1.ts` **34/34** ·
    `test-landscape-v18.ts` **15/15** · `test-weather-v24.ts`
    **32/32** · `test-option-contracts-v23.ts` **21/21**.
- **Bot-file load check:** the shared loader parses all five
  updated `bots/*.md` files; Trendia loads with no `stop_loss_pct`,
  Vega's `exit_before_expiry_days` parses to 4, Snapback's exit
  prose reads +7%.
- **Stale-text grep:** sources and the built web bundle grepped for
  "+4%", "8% trailing", "5-day time stop", Trendia stop_loss /
  trailing_stop — no user-visible stale rule text remains. The
  only matches are (a) historical notes in comments ("was +4%
  before v35"), (b) this phase's own harness doc comments
  describing what was removed, and (c) Snapback's sim lose string
  "5-day time stop", which is still correct — her max hold did
  not change. The web bundle contains "v35" and zero stale strings.

### One real bug found and fixed during verification

The first reset-test run failed at "API boots": my initial
trendia.md exit prose contained `(Keith, 2026-11-19: hold
positions longer)` — a colon+space inside a YAML plain scalar,
which gray-matter/js-yaml rejects, so the loader threw and the API
could not boot. Fixed by rewording to an em dash. The loader check
above and the full reset test (21/21) pass with the fix. Worth
remembering for future .md prose edits: no ": " inside frontmatter
values.

## Decisions made along the way

- **Vega's old 2-trading-day expiry guardrail was removed**, not
  kept alongside the new rule: DTE ≤ 4 calendar days fires at or
  before DTE ≤ 2 trading days in every case, so the guardrail was
  unreachable dead code. Flagging it here in case Keith wants it
  back as a separate belt-and-braces check.
- **Wesley position age is calendar days** since entry (Keith's
  wording was "entered less than 5 days ago"); Snapback's and
  Vega's pre-existing day-count conventions were not touched.
- **Trendia's exit stays in the daily evaluation** (the same pass
  and order pattern as the old 50DMA exit) rather than becoming an
  intraday check — the rule is defined on the daily close, and the
  brief asked for consistency with her existing cadence.
- `app_bkup/` and `traderbots-dashboard-static-v14/` in the tree
  are pre-v35 archival snapshots and were deliberately not updated.

## Files changed

- `bots/snapback.md`, `bots/trendia.md`, `bots/vega.md`,
  `bots/wesley.md`
- `app/packages/engine/src/snapback.ts` (TP constant + comments)
- `app/packages/engine/src/paper.ts` (Trendia overhaul)
- `app/packages/engine/src/vega.ts` (expiry time stop)
- `app/packages/engine/src/wesley.ts` (two-tier early exit)
- `app/packages/engine/src/sim.ts` (flavor strings)
- `app/packages/engine/harness/snapback-harness.ts` (re-based +
  new TP cases)
- `app/packages/engine/harness/vega-harness.ts` (S9 rewritten)
- `app/packages/engine/harness/wesley-harness.ts` (new scenario F)
- `app/packages/engine/harness/trendia-harness.ts` (NEW)
- `app/packages/web/src/version.ts` (v34 → v35)
- `PHASE-V35-DELIVERY.md` (this file)
