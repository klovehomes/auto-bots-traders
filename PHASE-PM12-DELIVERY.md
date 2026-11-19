# PHASE PM12 — Totals bar shows progress animation while data resyncs (Build v29)

Port of fleet v36 ("totals bar shows progress animation while data resyncs")
to the Prediction Markets Assistant app, per Keith 2026-11-19: "apply this
to all the apps we are working on where bots exist."

- **Base:** branch `prediction-markets-assistant`, tip verified live with
  `git ls-remote` on 2026-11-19 before cloning:
  `2f20519cf1c58e13fc976b5544ab300cd2b3c1bf`
  ("PM11: mobile Trade Stream rows full-width (Build v28)").
  Memory's expected tip (2f20519) matched the live tip exactly.
- **Working tree:** `~/workspace/pm-v29-syncui` (clone of that branch tip,
  `.git` included; commit stacks on the tip).
- **Build version:** `app/packages/web/src/version.ts` default
  `"v28"` → `"v29"` (exactly one bump; the header comment now also records
  "PM12 is v29"). Verified in the built bundle: dist JS contains `"v29"`.
- **Commit:** local only — NOT pushed. Message:
  `PM12: totals bar shows progress animation while data resyncs (port of fleet v36)`

## What changed (3 files + this doc)

### `app/packages/web/src/App.tsx`
- New state in `Dashboard()`: `const [syncing, setSyncing] = useState(true);`
- Totals bar (`<section className="totals-bar">`) gains `aria-busy={syncing}`.
  While `syncing` is true, each of the four values — Realized profits,
  Realized losses, Net realized, Closed trades seen — renders
  `<span className="total-value total-syncing" role="status" aria-label="Syncing" />`
  instead of the number. Labels stay visible; only the value slot animates.
  When `syncing` is false the original value spans render unchanged
  (same classes, same `fmtMoney` calls).
- Wiring (see next section) sets/clears `syncing` in the initial seed
  effect and in `reseedAfterReset()`.

### `app/packages/web/src/styles.css`
- New `.total-syncing` shimmer placeholder + `@keyframes totals-sync-shimmer`
  in the Totals bar section, immediately after `.total-meta .total-value`.
  The placeholder keeps the value's footprint (`min-width: 96px`,
  `min-height: 29px`, matching the 24px value line) so the layout does not
  jump when real values land.
- `@media (prefers-reduced-motion: reduce)`: `.total-syncing { animation: none; }`.
- Mobile (`@media (max-width: 640px)`, next to the existing
  `.total-value { font-size: 19px; }` rule): `.total-syncing` shrinks to
  `min-width: 72px; min-height: 23px;` to match the smaller mobile value
  line. The existing mobile totals-bar layout (`flex-basis: 42%` etc.)
  is untouched.

### `app/packages/web/src/version.ts`
- Default `BUILD_VERSION` `"v28"` → `"v29"`.

## How `syncing` is wired in THIS app

Driven only by actual seed completion — no timers anywhere.

| Event in this app | Effect on `syncing` |
|---|---|
| Component mount | `useState(true)` — syncing from first render |
| Initial Phase 6 seed (`useEffect` fetching `GET /events/history`) applies rows | `setSyncing(false)` immediately after `setEvents(...)` merges the seed |
| Initial seed lands empty (`fresh.length === 0`) | `setSyncing(false)` — an empty seed IS the applied seed |
| Initial seed fetch fails (`.catch`) | `setSyncing(false)` if not cancelled — history is best-effort, the live WebSocket stream continues, so the bar must not animate forever over live data |
| `reseedAfterReset()` starts | `setSyncing(true)` before clearing `seenSeqRef` / `setEvents([])` |
| Reseed applies rows | `setSyncing(false)` immediately after `setEvents(...)` |
| Reseed lands empty | `setSyncing(false)` (same reasoning as the initial seed) |
| Reseed fetch fails (`.catch`) | `setSyncing(false)` (same best-effort reasoning) |

`reseedAfterReset()` itself is reached through exactly the paths that
already existed in this app:

1. `postControl(...)` — after a local Reset All Data POST returns a
   `reset` entry.
2. The WebSocket `onmessage` handler — a `control` broadcast whose entry
   action is `reset` (a reset fired from any other open dashboard).

## Parity with fleet v36

The fleet v36 working tree (`~/workspace/fleet-v36-syncui`, built in
parallel from fleet v35) was read directly during this build, and the
port matches it as follows:

- **Same class name:** `total-syncing` (on a `total-value` span) — identical.
- **Same CSS, verbatim:** the `.total-syncing` rule, the
  `@keyframes totals-sync-shimmer` (120% → −80% background-position,
  1.2s ease-in-out infinite, same gradient stops), the
  `prefers-reduced-motion` rule, and the mobile rule
  (`min-width: 72px; min-height: 23px` in the ≤640px breakpoint) are
  byte-for-byte the fleet v36 rules. This was safe because the pre-change
  totals-bar CSS in PM v28 and fleet v35 was already identical
  (`.totals-bar`, `.total`, `.total-label`, `.total-value`,
  `.total-meta .total-value`, and the mobile `.total-value`/`.total`
  rules all matched exactly).
- **Same JSX shape:** ternary per stat, same placeholder span
  (`className="total-value total-syncing" role="status" aria-label="Syncing"`),
  same `aria-busy={syncing}` on the section, labels untouched.
- **Same state mechanism:** a plain boolean `useState(true)`, set true at
  the start of `reseedAfterReset()`, cleared only after the seed data has
  been applied to `events`, on an empty seed, or when the seed fetch
  settles as failed. No timer in either app.
- **Same lifecycle for the initial seed and for Reset All Data reseeds:**
  identical set/clear points in the Phase 6 seed effect and in
  `reseedAfterReset()` (both functions exist in this app with the same
  bodies as the fleet's, verified before adapting).

### Deliberate differences from the fleet implementation

1. **No engine-restart reseed trigger (the one real difference).**
   Fleet v36 also reseeds — and therefore animates — when a WebSocket
   `control` broadcast carries `entry.action === "restart"` (the fleet's
   v30 Watch List "Restart now" flow: `POST /engine/restart`, a
   `"restart"` member of its `AuditEntry.action` union, and
   `ControlState.pendingRestart`). **None of that exists in this app**,
   verified in the PM tree:
   - `AuditEntry.action` here is `"kill" | "kill-liquidate" | "resume" | "reset"`
     — no `"restart"` member (adding the comparison would not typecheck
     against this union and would be dead code).
   - `ControlState` has no `pendingRestart`.
   - Nothing in `app/packages/web/src/` calls `POST /engine/restart`.
   - PolyCrypt9000's Watch List is read-only in this app (Add Symbols
     disabled), so there is no user action that restarts the engine to
     make a symbol tradable.
   - The WebSocket frame kinds the API sends here are only `control`,
     `mode`, and `weather`, plus event frames — there is no restart frame
     kind to react to.
   Mode switches do restart the engine in this app, but the dashboard
   does not reseed on `mode` frames — the API's persisted history
   survives an engine restart and the live stream continues — so wiring
   `syncing` to mode frames would have invented a resync that does not
   happen. Result: in this app the reseed triggers are the initial seed
   and Reset All Data (local POST + remote broadcast) only. The reason
   is documented in a comment at the WebSocket reset branch in App.tsx.
2. **Version numbering:** this app bumps `"v28"` → `"v29"` and the phase
   is PM12, where the fleet bumps `"v35"` → `"v36"` as fleet v36. Same
   one-step bump rule, different sequences — the two apps' Build labels
   have never shared a numbering line (PM8 = v25 … PM11 = v28).
3. **Comment tags:** code comments say "PM12" where the fleet's say
   "v36", so each tree's history references its own phase. No functional
   effect.
4. **Showcase untouched:** `app/packages/web/src/showcase.tsx` also
   renders a `totals-bar`, but it is the separate public read-only
   snapshot app (no live seed/reseed lifecycle — it renders a published
   snapshot), so it is out of scope for this change, exactly as the
   fleet change is scoped to its dashboard `App.tsx`.

## Verification (2026-11-19, in `~/workspace/pm-v29-syncui/app`)

- `npm run typecheck` (all workspaces: api, engine, shared, web) — **pass**
  (exit 0, no errors).
- `npm run build` (production build from the app/ workspace root) — **pass**
  (exit 0). Web bundle: `dist/assets/index-Dne0P9sN.css` 22.03 kB,
  `dist/assets/index-CUkZL_lJ.js` 866.32 kB (the >500 kB chunk-size warning
  is pre-existing Vite advice, not an error).
- Built bundle contains the animation:
  - dist CSS: `total-syncing` ×3, `totals-sync-shimmer` ×2, including
    `@keyframes totals-sync-shimmer` — **present**.
  - dist JS: `total-syncing` — **present**; `"v29"` — **present**.
- Test tools in `app/tools` (run with `node_modules/.bin/tsx` from `app/`
  unless noted):
  - `test-history-v19.ts` — **25/25 checks passed** (run by the
    coordinating agent at final verification, after the build worker's
    session ended before these three completed).
  - `test-reset-v22.ts` — **21/21 checks passed** (same coordinator run).
  - `test-smoke-v21.ts` — **11/11 checks passed** (same coordinator run).
  - Coordinator also re-ran `npm run typecheck` and `npm run build`
    independently — both pass; the rebuilt dist CSS contains
    `total-syncing` / `@keyframes totals-sync-shimmer` and the dist JS
    contains `"v29"`.
  - `test-weather-v24.ts` — **32/32 checks passed** (includes the source
    pins on App.tsx wiring).
  - `test-option-contracts-v23.ts` — **21/21 checks passed**.
  - `test-keys-v21.ts` — **32/32 checks passed**.
  - `test-keys-v21-1.ts` — **34/34 checks passed**.
  - `test-landscape-v18.ts` — **15/15 checks pass**.
  - `test-landscape-flash.ts` — **26/26 checks pass**.
  - `test-publish-snapshot.mjs` (node) — **ALL CHECKS PASSED** (23 PASS lines).
  - `test-gate-local.mjs` — not run: it exercises the email-gate flow,
    which this change does not touch (no gate code, API code, or shared
    code changed — web dashboard UI only).

## Not verified

- No live/browser render check: the dashboard was not run against a live
  API in a browser, so the animation's on-screen appearance (and the
  mobile render at phone width) is verified only from the source, the
  compiled CSS in dist, and the identical fleet treatment — not visually.
- Fleet v36 was read from its parallel working tree while it was still
  uncommitted; if that build changes its class names or CSS before it
  lands, this port's parity notes should be re-checked against its final
  diff.
