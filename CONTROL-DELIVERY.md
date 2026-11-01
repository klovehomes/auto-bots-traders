# Kill Switch — Delivery Notes

Delivered 2026-11-01. The control layer Keith specified in PLAN.md
("Kill switch and emergency controls"): per-bot and fleet-wide **KILL**,
**KILL + LIQUIDATE**, and **RESUME**, driven by one API-owned Risk Gate
state. Until this build the app was display-only; these are the first
real controls. **MODE=sim is the functional path** — liquidation really
force-closes simulated positions. Paper/connected record the same state
and log it; there is no live order flow to halt yet in those modes.

## Semantics (exactly as built)

- **KILL (per bot):** the bot stops immediately — the engine's activity
  loop skips it entirely (no evaluations, no orders). Open positions
  stay **open and frozen**. The halt is stored state, so it **persists
  across API/engine/container restarts** until deliberately resumed.
- **KILL + LIQUIDATE (per bot):** KILL, plus the engine force-closes
  **all of that bot's tracked open positions** at current prices. Each
  forced close is a normal close event (realized PnL computed the same
  way as any sim close) whose reason is prefixed
  `KILL + LIQUIDATE · forced liquidation at market — …`. A position
  that cannot be closed is **reported in the action result**, never
  silently dropped (in sim every position settles; the `failed` list
  exists for the live engine).
- **Fleet KILL / KILL + LIQUIDATE:** the same, applied to all five
  bots in one action (the liquidation report aggregates per bot).
- **KILL + LIQUIDATE on an already-halted bot is allowed** — it
  liquidates the frozen book. Plain KILL on an already-halted bot (or
  RESUME on an active bot) is a no-op and is **not** written to the
  audit log.
- **RESUME (per bot / fleet):** deliberate re-enable; the bot resumes
  normal activity within ~1 s. Resuming a bot also cancels a pending
  (not yet executed) liquidation for it.
- **Audit:** every effective kill, kill-liquidate, and resume is
  appended to the audit log with timestamp, scope (`bot`/`fleet`),
  target codename, action, source (`web-ui` for dashboard/API calls),
  the bots actually changed, and — for liquidations — the completed
  report. The log is persisted with the state and its tail is served
  by `GET /control`.

## Architecture

One source of truth: the **API owns the Risk Gate control state**
(`packages/api/src/control.ts`, a `ControlStore`). The engine and the
dashboard are both clients of it — the dashboard posts actions and
renders state; the engine enforces state. No bot `.md` files and no
shared-schema changes were needed; the only new shared surface is the
control HTTP/WS payloads, defined locally in each package.

### State + persistence

State file (JSON): per-bot `{ halted, haltedAt, pendingLiquidate }`
plus the audit log (capped at 200 entries stored / 50 served). Path
from env **`CONTROL_STATE_PATH`**; default `./data/control-state.json`
relative to the API package. Writes are atomic (temp file + rename).
If the file is missing or unreadable at boot, the API starts all-active
and logs loudly.

`docker-compose.yml`: the api service gets
`CONTROL_STATE_PATH=/data/control-state.json` and a named volume
**`fleet-data:/data`**, so halts survive `docker compose down/up` and
image rebuilds (use `down -v` only if you *want* to wipe state).

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/control` | Full public state: fleet mode, per-bot halted flags, `anyHalted`/`allHalted`, recent audit entries |
| POST | `/control/bots/:codename/kill` | Halt one bot |
| POST | `/control/bots/:codename/kill-liquidate` | Halt + liquidate one bot |
| POST | `/control/bots/:codename/resume` | Resume one bot |
| POST | `/control/fleet/kill` | Halt all bots |
| POST | `/control/fleet/kill-liquidate` | Halt + liquidate all bots |
| POST | `/control/fleet/resume` | Resume all bots |
| GET | `/internal/control` | Engine view (internal token): bot halts + pending liquidations |
| POST | `/internal/control/liquidation-report` | Engine reports liquidation results (internal token) |

Action responses: `{ ok, changed, entry, liquidation?, liquidationNote?, state }`.
For liquidations the API **waits up to 10 s** for the engine's report
so the HTTP response normally carries the finished report
(`liquidation: { status: "complete", closed: [{bot, symbol, qty, pnl}],
failed: [{bot, symbol, reason}] }`); if the engine hasn't confirmed
in time, the response carries the pending report and the completed one
arrives over the WebSocket (see handshake). Unknown codenames/actions
return 404.

Every state change is also broadcast on the existing `/events`
WebSocket as `{ kind: "control", ts, state, entry }`, so every open
dashboard updates instantly; the dashboard additionally does one
`GET /control` on page load.

### Engine handshake (liquidation)

1. A kill-liquidate action sets `pendingLiquidate: { id, auditId,
   requestedAt }` on each affected bot in the API state and creates
   the audit entry in `pending` status.
2. The engine polls `GET /internal/control` **every 1 s** (same
   `API_BASE_URL` + `INTERNAL_EVENT_TOKEN` plumbing it already used
   for posting events). It keeps the last-known halt set in memory and
   enforces it in the simulator's activity loop: a halted bot is
   skipped entirely — no evaluations, no orders — while prices keep
   stepping (so a later liquidation prices at current market).
   **Fail-safe: if the API is unreachable, the engine keeps enforcing
   the last-known state and logs it (throttled); before the first
   successful poll it defaults to all-active.**
3. On consuming a pending liquidation, the sim engine force-closes
   that bot's whole book (same close/PnL math as a normal close,
   liquidation-prefixed reason) and POSTs the result to
   `/internal/control/liquidation-report` (3 retries; a total delivery
   failure re-arms the pending so a later poll re-executes and reports
   the — by then empty — book honestly).
4. The API folds the report into the audit entry (fleet entries
   aggregate each bot's report and complete when the last bot
   reports), clears `pendingLiquidate`, and wakes the waiting POST so
   its response carries the final report; the completed entry is
   broadcast over the WebSocket.

In `paper`/`connected` modes the control client runs identically —
halts are recorded and logged when they flip ("recorded; no live
order flow in this build/mode") — there is simply no order flow to
stop yet.

## Web UI

- **Fleet controls:** a Kill-switch bar directly under the totals bar
  — state readout ("all bots active" / "N of 5 bots halted" / "FLEET
  HALTED"), **⛔ Kill all**, **⛔ Kill + liquidate all**, and
  **▶ Resume all** whenever anything is halted. A red **halt banner**
  appears above it while any halt is in force.
- **Per-bot controls:** inside the building inspect dialog (deliberate
  clicks — hover only opens the dialog, it never triggers an action):
  **⛔ Kill** / **⛔ Kill + liquidate** when active; **▶ Resume** /
  **⛔ Kill + liquidate** plus a "not trading" note when halted.
- **HALTED badges:** in the inspect dialog header and on leaderboard
  rows for halted bots.
- **Confirmation modal** for every liquidate (per-bot and fleet):
  names the scope and the number of open positions that will be
  closed (from client-side session state), warns that closes are
  final and the halt persists, and requires an explicit
  "Yes — kill + liquidate" click. Plain KILL needs no confirmation.
- **Landscape:** a halted bot's building goes dark — facade dims, the
  name plate's third line becomes "⛔ HALTED — trading stopped" in
  red, the avatar screen dims under a red **HALTED** band, the plinth
  ring holds steady red, the ground pool turns dim red, and the dish
  stays inert (no beams). Live via the WS control event + the initial
  `GET /control`.
- **Trade stream:** control actions render as distinct system rows
  interleaved with trades (e.g. "⛔ Snapback KILLED — trading halted",
  "▶ Snapback resumed", "⛔⛔ FLEET KILL + LIQUIDATE — 7 positions
  closed"; unclosable positions show a red count). They are kept out
  of all PnL math — they never enter the trade-event list the stats
  aggregate.

## Deployment note — keep control endpoints private

The control POST endpoints are **unauthenticated in this local build**,
consistent with the rest of the local app (only `/internal/*` uses the
shared token). That is safe only under the standing deployment rule:
**the dashboard and API are reachable over Tailscale only — never
expose them publicly.** A kill switch anyone on the internet can press
is worse than none. When the app leaves the tailnet, control endpoints
need real auth before anything else ships.

## Not in this build

- **MCP control tools** (`kill_bot`, `kill_all_bots`,
  `kill_and_liquidate_bot`, `kill_all_and_liquidate`) — a later
  surface on this same API state, per the plan.
- Automatic daily-loss breaker trips write the same state through the
  same store when Phase 5 lands; the audit `source` field already
  distinguishes them from `web-ui`.
- Live/paper order cancellation: plain KILL is specified to cancel
  pending broker orders; there are no broker orders in any mode yet,
  so today a halt simply prevents new activity (and, in sim, freezes
  the book). The state and audit already carry the semantics.

## Limitations

- Dashboard aggregates (open-position counts in the confirmation
  modal, "today's trades") remain **session-scoped** — they accumulate
  from page load, as with the rest of the UI. The API/engine state is
  the durable truth; a fresh page load re-reads halts from
  `GET /control` but position counts rebuild from the live stream.
- The liquidation report's `closed` PnL is the sim's realized PnL at
  force-close time; prices are the seeded random walk, not market data.
- Engine enforcement granularity is its 1 s control poll: a kill lands
  within ~1 s of the API recording it (plus the dashboard's own click).
- If the engine is down when a liquidation is requested, the audit
  entry stays `pending` and the POST returns after 10 s with a note;
  the liquidation executes when the engine next polls. The halt itself
  is effective immediately regardless.
- Audit log is capped (200 stored / 50 served) — plenty for manual
  control actions; the daily-loss breakers will want a real table when
  they land.

## Verification (2026-11-01, native stack, MODE=sim)

All tests actually run against the native stack (API + engine + web
preview) with a scratch `CONTROL_STATE_PATH`; browser checks in
fresh-profile headless Chrome. **Zero console errors** on desktop and
mobile. Typecheck passes for all four packages; `vite build` passes.

1. **Kill Snapback (API):** after `POST /control/bots/snapback/kill`,
   **0 Snapback trade events in 20 s** while the other four bots
   produced 11 events; `GET /control` showed `snapback.halted: true`.
2. **Persistence:** the API was SIGKILLed and restarted against the
   same state file — the halt was still in force, Snapback stayed
   silent while the API was down (engine fail-safe = last-known
   state), and after `POST …/resume` Snapback produced 3 events in
   16 s.
3. **Kill + liquidate Vega:** Vega held 5 open positions; the POST
   response carried the completed liquidation report — **5 closed,
   0 failed** — and all 5 forced closes appeared on the stream with
   the `KILL + LIQUIDATE · ` reason prefix. Vega's book was empty,
   `pendingLiquidate` cleared, and the audit log contained the
   Snapback kill, Snapback resume, and Vega kill-liquidate entries.
4. **Fleet kill / resume:** `POST /control/fleet/kill` halted the
   remaining 4 bots (Vega already halted — no-op for her, correctly
   not double-logged); **0 trade events fleet-wide in 15 s**; fleet
   resume changed all 5 and activity returned (15 events in 16 s).
5. **Screenshots** (`ui-preview/`): `kill-controls-desktop.png`
   (fleet controls, halt banner, Snapback's building dark with HALTED
   plate + red screen band), `kill-dialog.png` (inspect dialog with
   HALTED badge, frozen $5,000.00 equity while the fleet traded on,
   Resume / Kill + liquidate buttons), `kill-confirm.png`
   (liquidation confirmation modal), `kill-mobile.png` (390×844 —
   stacked fleet controls + halt banner).
