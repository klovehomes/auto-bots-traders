# Phase v22 — Reset All Data in the armed kill-switch bar

Keith's direction (2026-11-10): *"Add another option that appears
when the kill switch is enabled that allows a user to reset the
trade history back to blank and the dollar amount back to the
initial amount. It's like a reset all data function. For the next
version. And push."*

`BUILD_VERSION` default bumped `v21.1` → `v22` (the version line
under "Trader Bot Landscape" from v20; the `BUILD_VERSION` env
override still wins).

Local commit on `dev`, on top of v21.1 (`ad44a65`). Push to dev was
pre-approved by Keith in the request itself.

---

## Keith's 20-second user guide

1. Flip the **arm switch** in the kill-switch bar (same switch that
   arms Kill / Kill + Liquidate).
2. Click **🧹 Reset all data** (amber button, right of "Kill +
   liquidate all").
3. In the modal, **type `RESET`** — the confirm button stays
   disabled until you do — then click **Yes — reset all data**.
4. The team halts and the wipe runs (the kill bar shows "DATA RESET
   IN PROGRESS"; it takes a few seconds in Simulator mode, up to a
   tick — ~30 s — in Paper mode). The arm switch locks again, as
   with any kill action.
5. Optional: flip the run mode (Simulator / Paper) if you want the
   fresh books in a different mode.
6. Click **▶ Resume all** when you're ready to trade again.
   **Nothing trades until you do.**

---

## What it does

A new fleet action, `reset`, that travels the **existing** Risk Gate
control channel — no parallel mechanism was invented:

- **API (`ControlStore`)** — `applyFleetReset()` halts every bot
  (exactly the fleet-kill state), drops any not-yet-executed
  liquidation requests (the wipe supersedes them), and records one
  durable `PendingReset { id, auditId, requestedAt }` in the same
  version-1 control-state file (pre-v22 files load fine — the field
  is optional). A second reset request while one is pending is a
  no-op (returns null, not audit-logged twice).
- **API event history** — the moment a reset is accepted,
  `EventHistoryStore.reset()` clears all three retention classes and
  restarts the sequence at 1, flushed immediately. The wipe cannot
  resurrect.
- **Engine (coordinator)** — `startResetCoordinator()` in
  `engine/src/index.ts` watches the 1 s control poll. On a new
  pending id it deletes the five paper state files from disk and
  records ownership in a durable progress marker
  (`RESET_PROGRESS_PATH`, `/data/reset-progress.json` in Docker).
- **Each book owner applies the wipe itself**, at the top of its
  next tick, before liquidations or polls, so nothing from the old
  book can act or report into the fresh history:
  - the five paper runners cancel their **own** open orders (their
    existing kill-switch cancel paths), swap in their boot-fresh
    state (`freshState()` — $10,000 start, zero realized P&L, no
    entries, decision counter 0), persist it, and note application;
  - the simulator zeroes every sim book's equity to $10,000, erases
    positions, and restarts its decision counter.
  Application is **idempotent per reset id** (each runner remembers
  the last id it applied), so a re-offer changes nothing.
- **Completion** — when every active bot has noted application, the
  coordinator posts ONE audit event (`type: "data_reset"`,
  `bot: "system"`, `decision_id: null`) — which becomes **seq 1, the
  sole first entry of the fresh history** — and reports completion
  (`POST /internal/control/reset-report`, same internal-token trust
  as the liquidation report). The marker records "event emitted"
  *before* the report attempt, so a crash between the two can never
  double-emit; the report retries until accepted, and the API's
  pending flag persists until it lands, so a reset requested while
  the engine is down still executes on engine boot.
- **The web dashboard** — the reset button is gated by the arm
  toggle exactly like Kill / Kill + Liquidate (disabled while
  disarmed; the handler refuses too; firing consumes the arm). The
  confirm modal requires typing `RESET`. On any reset broadcast,
  open dashboards drop their local stream (the sequence restarted)
  and reseed from the fresh history. The kill bar shows "🧹 DATA
  RESET IN PROGRESS" while it runs; the trade stream carries the
  🧹 system row, which flips to "…books back to $10,000, team
  halted" when the completion report lands.

## The wipe / keep list

**Wiped:**
- API event history (all of it — trades, decisions, summaries) and
  the history sequence counter (restarts at 1).
- Every bot's book, sim and paper: balance back to its **$10,000
  initial allocation**, positions in the app's books gone, realized
  P&L counters zeroed, decision counters restarted.
- All per-bot state files (`paper-*-state.json` × 5): deleted by the
  coordinator at reset start; in paper mode each runner rewrites its
  own file fresh when it applies the reset.

**Kept (untouched):**
- Fleet MODE (the Simulator / Paper switch choice stays as set).
- The keys file and environment (Alpaca / Kalshi credentials).
- Bot config files (`bots/*.md`) and every bot parameter.
- The kill-switch machinery itself: prior audit entries, halt
  semantics, arm-toggle behavior. (Landing halted *is* the kill
  state doing its normal job.)
- Exactly one record of the wipe itself: the `DATA_RESET` audit
  event (sole entry of the fresh trade history) plus the reset
  entry in the control audit log.

## Posture after a reset: HALTED

The reset leaves the whole team **halted**, exactly as if you had
pressed Kill all. Nothing evaluates, orders, or trades — in any
mode — until you deliberately press **Resume**. This is deliberate:
a blank book that immediately starts trading on stale assumptions
would defeat the point of a clean reset.

## ⚠️ Broker caveat (also stated in the confirm modal)

**Reset is app data only. It does NOT close positions at Alpaca or
Kalshi.** Pending *orders* are cancelled (same as a kill), but any
paper **positions** open at the broker stay open there. From the
app's point of view they become untracked ("foreign"), and the
app's state-only reconcile ignores them — they will never be
adopted, managed, or closed by the bots. If you want a broker-side
clean slate too, close those positions in the Alpaca/Kalshi paper
accounts themselves. (In Simulator mode there is no broker and this
does not apply.)

## Guardrails held

- **Fleet-only**: `POST /control/bots/:codename/reset` 404s like any
  unknown action; `applyBotAction`/`applyFleetAction` refuse the
  `reset` action defensively — the only path is `applyFleetReset`.
- **Showcase**: reset (like all control code) lives only in the web
  app's `App.tsx`; the readonly/showcase entry tree
  (`showcase-main.tsx` → `showcase.tsx`) never imports it —
  verified by grep over the readonly line (0 control/reset hits
  outside App.tsx). The showcase remains incapable of triggering a
  reset — or any control action.
- **Mode ceiling / live refusal**: untouched. A reset in
  "connected" mode finalizes immediately (no books exist to wipe;
  state-file deletion still applies) and places no orders, as
  always.
- **Secrets**: no keys material is read, moved, or logged by any
  reset path; gitignore rules unchanged.
- One small statistics fix rides along (`fleetState.ts`):
  `computeStats` no longer invents a stats row for event names
  outside the bot config — needed so the `bot: "system"` DATA_RESET
  record doesn't render as a phantom sixth "bot" on the Leaderboard.
- One durability tweak rides along (`history.ts`): the DATA_RESET
  record flushes to disk immediately on ingest (like decision
  records) instead of waiting for the 2 s batch flusher — the record
  of the wipe should be as durable as the wipe itself.

## Verification (all run 2026-11-10, this build)

New harness `app/tools/test-reset-v22.ts` — **21/21 checks passed**:

- *Leg 1 (SIM, real API + engine processes)*: seeded live trading
  (30 events: 17 opens, 13 closes, positions open, non-zero PnL) →
  fleet kill → drain → **two resets fired concurrently: exactly one
  took effect, the other returned a no-op** → history (API and
  on-disk file) holds **only** the DATA_RESET event at seq 1;
  control state shows the team halted with no pending reset; the
  coordinator deleted a pre-planted stale paper state file; the
  progress marker exists; the bot-scoped reset route 404s → Resume →
  trading restarts, and the **first post-reset close shows sim
  equity exactly $10,000 + that close's PnL** (books provably back
  at the initial allocation); DATA_RESET precedes all later events.
- *Leg 2 (PAPER runners in-process)*: Trendia + Snapback with
  pre-dirtied state files (realized −$250.25 / +$123.45, open
  entries) → reset via the PaperControl seam → both state files
  fresh ($10,000 start, 0 realized, no entries, counter 0), each
  runner noted application **exactly once**; re-offering the same
  id changed nothing (file bytes identical, no new notes); a second
  reset with a new id applied again.

Regressions — all green: typecheck (4 packages) + full build;
history v19 **25/25**; keys v21 **32/32**; keys v21.1 **34/34**;
v21 boot smoke **11/11** (API keys/status, sim streaming, paper
boot); mode harness **36/36**; snapback **49/49**;
vega **55/55**; wesley **22/22**; polycrypt **21/21**; kalshi
**20/20**. Web bundle grep confirms "Reset all data", the amber
`reset-all` class, "DATA RESET IN PROGRESS", and default version
`"v22"` all ship in the built output.

"Reset while mode=PAPER behaves identically for local state" is
covered by construction + Leg 2: the reset path is mode-independent
(the coordinator and the PaperControl seam are shared; the runners
are the paper book owners), and the coordinator runs in every mode.
A live paper-mode end-to-end (real Alpaca paper account) remains
Keith-side verification on the Mac, as with v21 — this sandbox
cannot reach Alpaca.

## Files changed

API: `packages/api/src/control.ts` (reset action, PendingReset,
applyFleetReset/completeReset/waitForReset),
`packages/api/src/history.ts` (store reset + immediate DATA_RESET
flush), `packages/api/src/index.ts` (fleet reset route, runReset,
reset-report route, RESET_WAIT_MS).
Engine: `packages/engine/src/control.ts` (pendingReset peek,
application notes, reportReset), `packages/engine/src/index.ts`
(coordinator, progress marker, state-file deletion),
`packages/engine/src/paper.ts` (PaperControl seam + router +
Trendia tick), `snapback.ts` / `vega.ts` / `wesley.ts` /
`polycrypt.ts` (tick-top reset application),
`packages/engine/src/sim.ts` (sim book wipe).
Shared: `packages/shared/src/types.ts` + `schema.ts` (`data_reset`
event type).
Web: `packages/web/src/App.tsx` (button, typed-RESET modal, reseed,
status line, system row), `fleetState.ts` (stats guard),
`styles.css` (amber `.btn.reset-all`, `.reset-type-input`),
`version.ts` (`v22`).
Ops/tests: `app/docker-compose.yml` (RESET_PROGRESS_PATH),
`app/tools/test-reset-v22.ts` (new harness), this doc.
