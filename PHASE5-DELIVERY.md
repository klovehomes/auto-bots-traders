# Phase 5 — Dashboard mode switch (delivery)

Keith's request (2026-11-04): *"Up in the upper right hand corner under
the status indicator, I would like to be able to restart the whole
system in simulator mode, or paper trading mode or live cash account
mode, with a drop down control."*

Delivered: a **Fleet mode** dropdown in the dashboard header, upper
right, directly under the WebSocket status / mode badge row, with
three entries — **Simulator**, **Paper trading**, and **Live cash
account — not enabled yet** (locked, see below). Choosing Simulator or
Paper trading and confirming switches the whole fleet and restarts the
engine into the new mode, end to end, with no `.env` edits and no
manual container commands.

## The mechanism, end to end

The switch rides the control plumbing the kill switch already built:
the **API owns durable state on the shared `fleet-data` volume**, and
the **engine learns control state by polling `GET /internal/control`
every second**. Phase 5 adds a second API-owned store beside the Risk
Gate's:

1. **Stored desired mode** — `api/src/mode.ts` (`ModeStore`) persists
   `{version, mode, updatedAt, updatedBy}` to `MODE_STATE_PATH`
   (`/data/mode-state.json` in Docker, on the same `fleet-data`
   volume as the control state), with the control store's discipline:
   atomic tmp-file + rename writes, and a corrupt file is ignored
   with a loud error — never a crash, never a wedged boot.
2. **Dashboard → API** — `POST /mode {mode}` validates and records
   the choice (validation lives in `ModeStore.requestMode`, see
   below), then broadcasts `{kind: "mode", state}` over the existing
   WebSocket so every open dashboard updates live. `GET /mode` serves
   the public state: `{desired, desiredSource, running, switching,
   switchable}`.
3. **API → engine (running)** — the existing internal control poll
   payload gains one field, `desiredMode`. No new channel, no file
   watching.
4. **Engine switch** — `engine/src/mode.ts` (`createModeSupervisor`)
   compares each polled `desiredMode` with the mode the process
   booted into. On a difference it, exactly once: logs the switch,
   posts **one switch event** to the stream (bot `Engine`, type
   `signal`, reason `MODE SWITCH · fleet mode <from> → <to>
   (dashboard switch) — engine restarting into <to>`, visible in the
   Decisions tab), then **exits with code 0**. Docker's existing
   `restart: unless-stopped` on the engine service relaunches it.
   (No compose change was needed for the restart itself — the policy
   was already there; compose only gained the `MODE_STATE_PATH` env
   on both services.)
5. **Engine boot** — boot resolution (`resolveBootMode`) reads the
   stored mode file first: **stored dashboard choice → `MODE` env →
   `sim`**. The env is now only the initial default when nothing is
   stored. Invalid/corrupt stored content falls back to the env
   resolution with a loud `⚠` warning; pre-Phase-5 env semantics are
   preserved exactly (unrecognized env → `sim` + warning).
6. **Running-mode report** — so the dashboard can tell "restarting…"
   from "running", the engine reports the mode it booted into via
   `POST /internal/control/mode-report` (token-guarded, mirroring the
   liquidation-report handshake) at boot and on a 30 s heartbeat.
   The API holds the latest report in memory and marks
   `switching = (reported mode ≠ desired mode)`.

Because the paper runners reconcile from their own state files at
boot exactly as after any restart, switching to Simulator and back to
Paper disturbs nothing: kill-switch halts persist in the control
state as before, bot state files are untouched, and no strategy code
changed (`paper.ts` / `vega.ts` / `snapback.ts` behavior is
identical).

## The Live lock

"Live cash account" is **present in the dropdown but disabled** —
not selectable — and the API independently **refuses** to store it:
`POST /mode {mode: "connected"}` answers **403** with *"live cash
account mode is not enabled yet — going live is a per-bot, deliberate
step and is not wired to this switch"*. Defense in depth, UI and API.

Rationale (also encoded in comments in `api/src/mode.ts` and
`App.tsx`): going live is per-bot and deliberate — Keith's standing
rule — and a bare dropdown flip must never be able to reach real
money. No live order path, live keys, or live-anything was built in
this phase. When live trading is built, this entry gets an
arm-and-confirm step of its own (like the kill switch's arm toggle)
and the API refusal is revisited then. The engine's existing
`MODE=connected` guardrail is untouched: still reachable via
env/config exactly as before, still trading nothing.

## What Keith sees in the UI

- Header, upper right, under the status badges: a **Fleet mode**
  label + dropdown showing the current desired mode.
- Picking a different mode opens an **inline confirmation** under the
  dropdown (no modal): *"Switch the whole fleet to **Paper
  trading**? The engine will restart — the dashboard reconnects in a
  few seconds."* with **Switch to …** / **Cancel**. When leaving
  Paper it adds: *"Open **paper positions will sit unmanaged** while
  the fleet is in Simulator mode."*
- While a switch is in flight the dropdown is disabled and an amber
  note reads *"⟳ Restarting the engine into Paper trading…"* until
  the engine reports the new running mode (typically a few seconds).
- The mode badge now reflects the engine's **reported running mode**
  (falling back to the desired mode before the first report) instead
  of the API's env value, so it stays truthful after a switch.

## Boot / verification lines

Engine boot (every mode now starts with one of these):

```
[engine] MODE=sim (source: default)            ← no stored choice, no env
[engine] MODE=sim (source: env)                ← no stored choice, MODE env
[engine] MODE=paper (source: dashboard switch) ← stored choice won
```

Corrupt stored file (warning first, boot proceeds on env):

```
[engine] ⚠ stored mode file /data/mode-state.json is unreadable/corrupt (…) — ignoring it
```

A dashboard flip, in the engine log:

```
[engine] 🔀 mode switch: dashboard set the fleet mode to "paper" (this process is running "sim") — posting the switch event and exiting so Docker restarts the engine into "paper"
```

…followed by the container restart and the new boot line. The API log
announces its store at boot: `mode state: /data/mode-state.json
(desired: …)`.

## Verification (2026-11-04, this VM)

- **Typecheck**: clean across api / engine / shared / web.
- **Full build**: clean (only the pre-existing web chunk-size warning).
- **New harness** `app/packages/engine/harness/mode-harness.ts`:
  **36/36 passed** — boot precedence (stored > env > default; corrupt
  stored ignored + warning; unrecognized env preserves old fallback),
  ModeStore validation (400 unknown / non-string / missing; **403 on
  "connected"** with desired unchanged; same-mode no-op), write/read
  round trip through the real file read back by both a fresh
  ModeStore *and* the engine's boot resolution, switch detection with
  an injected exit hook (exactly one event + one exit(0); latching; a
  failing event post cannot block the exit), and running-mode
  reporting verified against a real local HTTP stub (path, token,
  body).
- **Regressions**: Vega harness **47/47**, Snapback harness **38/38**
  — unchanged.
- **API smoke** (real API, throwaway state): `GET /mode` initial
  state; `POST /mode paper` → 200 `changed:true` and the file
  persisted; internal control carries `desiredMode`; token-less
  internal call → 401; `connected` → 403; bogus → 400; mode-report
  flips `switching` true then false as the reported mode catches up;
  bad report mode → 400; repeat switch → `changed:false`.
- **Engine boot smokes**: `MODE=sim (source: default)` with nothing
  set; stored paper with no Alpaca keys (this VM) →
  `MODE=paper (source: dashboard switch)` followed by the existing
  loud fallback (*"Alpaca keys are not configured — Trendia, Vega and
  Snapback CANNOT trade paper. Running the simulator for every bot
  instead."*); corrupt stored file → `⚠` warning +
  `MODE=paper (source: env)`.
- **Full switch cycle, no Docker** (manual relaunch standing in for
  the restart policy): engine booted `sim (source: env)` and reported
  running sim → `POST /mode paper` → engine logged the 🔀 line and
  **exited (code 0, separately re-verified with the production exit
  hook)** → relaunched with the *same* `MODE=sim` env → booted
  `MODE=paper (source: dashboard switch)`, reported running paper,
  `switching:false` → `POST /mode sim` → exited → relaunched → booted
  `MODE=sim (source: dashboard switch)`.

## Files

- `app/packages/api/src/mode.ts` — **new**: ModeStore (persistence,
  validation incl. the live lock, public state), the file the engine
  reads at boot.
- `app/packages/api/src/index.ts` — ModeStore wiring; `GET /mode`,
  `POST /mode`; `desiredMode` on `GET /internal/control`;
  `POST /internal/control/mode-report`; "mode" WebSocket broadcasts.
- `app/packages/engine/src/mode.ts` — **new**: `resolveBootMode` /
  `readStoredMode` + `createModeSupervisor` (switch detection,
  switch event, injected exit, running-mode reporting).
- `app/packages/engine/src/control.ts` — poll surfaces `desiredMode`
  via a new optional `onControlState` callback (halt behavior
  untouched).
- `app/packages/engine/src/index.ts` — boot resolves via
  `resolveBootMode` and logs the source; supervisor wired into the
  control client; reporting started in every mode.
- `app/packages/engine/harness/mode-harness.ts` — **new** (above).
- `app/packages/web/src/App.tsx` — header mode switch (dropdown under
  the status badges, inline confirm, restarting state); badge driven
  by `GET /mode` + "mode" broadcasts instead of `GET /health`.
- `app/packages/web/src/styles.css` — header badges become a
  right-aligned column; mode-switch styles in the existing palette.
- `app/docker-compose.yml` — `MODE_STATE_PATH: /data/mode-state.json`
  added to the api and engine services (engine restart policy was
  already `unless-stopped`).
- `app/.env.example`, `app/README.md` — MODE documented as the
  initial default; the dashboard switch and the live lock documented.
- `PHASE5-DELIVERY.md` — this file.

Bots' `.md` files unchanged. No strategy code changed.
