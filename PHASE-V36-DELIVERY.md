# Phase v36 — Totals bar shows a progress animation while data resyncs

Built 2026-11-19 in `~/workspace/fleet-v36-syncui`, copied from the verified
v35 tree (`fleet-v35-exits`, tip `cadd108`) excluding `node_modules`/`dist`
but including `.git`, so this commit stacks on the v35 commits.
**Local commit only — NOT pushed.** The parent agent pushes after review.
Header version: `BUILD_VERSION` `"v35"` → `"v36"`.

## What Keith asked for

The totals bar at the top of the web dashboard (`Realized profits`,
`Realized losses`, `Net realized`, `Closed trades seen`) must show a
progress animation in place of the values whenever the app is
(re)syncing its data, instead of showing stale/zero values while a seed
or reseed is in flight.

## What changed (files)

- `app/packages/web/src/App.tsx`
  - New `syncing` state (`useState(true)` — see wiring below).
  - `reseedAfterReset()` sets `syncing` at its start and clears it only
    after the fresh history seed has been applied to `events`.
  - The initial (Phase 6) seed effect clears `syncing` only after the
    seed has been applied to `events`.
  - WebSocket control handler: unchanged from v35 (reset broadcasts
    reseed; restart broadcasts do not — see the review note below).
  - Totals-bar render: while `syncing`, each of the four stats renders
    `<span className="total-value total-syncing" role="status"
    aria-label="Syncing" />` in place of its value; stat labels stay
    visible in all states, and the section carries `aria-busy={syncing}`.
    Nothing else in the render changed.
- `app/packages/web/src/styles.css`
  - ONE treatment, chosen: a shimmer placeholder. `.total-syncing`
    (gradient bar, `background-size: 200% 100%`) animated by the new
    `@keyframes totals-sync-shimmer` (1.2s ease-in-out infinite).
  - Stable slot size so the layout does not jump: `min-width: 96px` /
    `min-height: 29px` (matching the 24px value line) on desktop, and
    `min-width: 72px` / `min-height: 23px` inside the existing
    `max-width: 640px` media query (matching the 19px mobile value
    line), so the mobile totals-bar layout is intact.
  - `@media (prefers-reduced-motion: reduce)` disables the animation.
- `app/packages/web/src/version.ts` — `BUILD_VERSION` `"v35"` → `"v36"`.
- `PHASE-V36-DELIVERY.md` — this file.

Explicitly NOT touched: `Landscape.tsx` — its per-bot realized figures
are not part of this change (verified by grep, below).

## How the `syncing` state is wired (real lifecycle, no timer)

No `setTimeout`/timer fakes the animation. `syncing` is driven only by
the app's actual seed/reseed lifecycle:

**Set to `true`:**
1. On mount — `useState(true)` initial value. The Phase 6 initial seed
   (fetch of `GET /events/history`) has not landed yet.
2. At the start of `reseedAfterReset()`. That function is invoked by:
   - `postControl()` when a Reset All Data POST returns a `reset`
     audit entry (this tab initiated the reset), and
   - the WebSocket control handler when a control broadcast carries a
     `reset` audit entry (a reset initiated from any open dashboard), and
   - REVIEW NOTE (parent review, 2026-11-19): the first v36 build also
     routed engine-restart broadcasts (`restart` audit entries) through
     this reseed, so the indicator would show after restarts. That was
     reverted before push: in v35 and earlier a restart frame never
     reseeded this tab's stream (the tab's data survives an engine
     restart; nothing is stale), so routing it through a wipe-and-
     reseed would have been a behavior change beyond the requested
     display change. v36 as pushed keeps restart behavior identical
     to v35 — no resync happens on a restart frame, so no animation
     shows then. Adding restart reseeds is a separate change if
     Keith wants it.

**Cleared to `false`:**
1. Initial seed: in the seed effect's success handler, after the
   history rows have been merged into `events` via `setEvents(...)`.
   The empty-history case also clears: `fresh.length === 0` means the
   seed landed and was empty, which is the seed applied.
2. Reseed: in `reseedAfterReset()`'s success handler, after the fresh
   rows have been applied via `setEvents(...)`; the empty-fresh case
   clears the same way (the fresh seed landed and held no trade events).
3. Failure settlement (both seed and reseed): if the history fetch
   fails, the existing code treats history as best-effort — the live
   WebSocket stream still delivers everything from that point on. The
   `.catch` therefore also clears `syncing` (guarded by the seed
   effect's `cancelled` flag where one exists), so the bar cannot
   animate forever over live data after a failed fetch. This is a
   fetch-settlement, not a timer.

While `syncing` is true, all four totals values are replaced by the
shimmer placeholder; the moment it clears, the real computed totals
(`computeTotals(events)`, unchanged) render in the same slots.

## Verification (all run in this tree, from `app/` unless noted)

- `npm install` — added 292 packages (fresh tree; `node_modules` was
  excluded from the copy, as instructed).
- `npm run typecheck` — **PASS**, all four workspaces
  (`@fleet/api`, `@fleet/engine`, `@fleet/shared`, `@fleet/web`),
  no errors.
- `npm run build` (production) — **PASS**, all workspaces; web bundle:
  `dist/index.html 0.43 kB`, `dist/assets/index-DHDS3YCK.css 16.84 kB`,
  `dist/assets/index-DPRnwNf-.js 859.72 kB`, "✓ built in 4.08s"
  (the >500 kB chunk-size warning is pre-existing Vite advice, not a
  failure).
- Built bundle contains the animation: the built CSS contains
  `total-syncing` (3 occurrences) and `@keyframes totals-sync-shimmer`
  (present, 2 mentions of the keyframe name), and the built JS
  contains the `total-syncing` class string.
- `node_modules/.bin/tsx tools/test-reset-v22.ts` — **21/21 checks
  passed** (same count as v35; seed/reset flows unregressed).
- `node_modules/.bin/tsx tools/test-smoke-v21.ts` — **11/11 checks
  passed** (same count as v35).
- Grep of the web sources confirms the animation is wired ONLY in the
  totals bar: `total-syncing` / `totals-sync-shimmer` / `syncing`
  appear only in `App.tsx` (state, its set/clear sites, and the four
  totals-bar value slots) and `styles.css` (`.total-syncing` +
  `@keyframes totals-sync-shimmer` + the mobile/reduced-motion rules).
  No matches in `Landscape.tsx` or `Leaderboard.tsx`.

## Not verified / Keith's check after deploy

- **Live visual check is Keith's after deploy** — no live render is
  possible in the sandbox. What to look for: on dashboard load and
  after Reset All Data, the four totals values show the shimmer bar
  (labels visible, bar size unchanged) and swap to real numbers the
  moment the seed lands; check the mobile layout at phone width too.

## Out of scope — deliberate

- **The readonly Cloudflare showcase is deliberately OUT OF SCOPE for
  this change.** It renders a static snapshot and has no resync
  lifecycle (no live seed/reseed, no WebSocket), so there is no syncing
  state to show there. It is untouched.
- No changes to `computeTotals`/`computeStats`, the seed/reseed data
  semantics, the API, the engine, or any bot file.
