# Phase PM4 — Dashboard UI changes (Polymarket-only)

Built on branch `polymarket-only`, base tip `658139b` (PM3). Keith
reviewed PM3 live on his Google Cloud VM and requested exactly these
five changes. Web-only phase: no API, engine, or shared-package
changes.

## 1. Leaderboard removed from the private dashboard

- `App.tsx`: the `Leaderboard` import, the "Landscape | Leaderboard"
  tab nav, the `MainTab`/`tab` state, and the Leaderboard view branch
  are all gone. The split screen is now the only main view, rendered
  unconditionally. The building-inspect dialog's old `tab ===
  "landscape"` guard went with it (the dialog itself stays — see #3).
- **Leaderboard file decision: `src/Leaderboard.tsx` is KEPT.** The
  PM2 showcase (`src/showcase.tsx`) still imports and renders it, and
  the showcase is out of this phase's scope. The private dashboard no
  longer references it anywhere; its CSS section also stays in
  `styles.css` for the showcase. If the showcase ever drops the
  Leaderboard, the component file and its CSS can be deleted then.

## 2. Loading animation in Market Scans

- While a scan fetch is in flight, the results area of the Market
  Scans panel now shows an animated loading state instead of a blank
  or stale-looking list: a spinning ring (`.scan-spinner`,
  `scan-spin` keyframes) plus three pulsing skeleton rows
  (`.scan-skeleton-row`, `scan-pulse` keyframes) shaped like result
  rows. `loadScan` already cleared the previous results on click, so
  the loader occupies exactly the space the results will land in. It
  clears when results arrive or when an error is shown. Honors
  `prefers-reduced-motion` (animation disabled).

## 3. Landscape returns inside the Bot Trades column

- `App.tsx` builds the landscape node and passes it to `SplitView` as
  a new `landscape` prop; `BotTradesPanel` renders it after the Bot
  Allocation field, the sleeve toggles, and the bot stats line — i.e.
  exactly where Open Positions began — and **Open Positions now
  render below the landscape** in the same column.
- The node is the existing `Landscape` component, wired with the same
  props the pre-PM3 main view used (`bots`, `statsRef`, `effectsRef`,
  `haltedRef`, `onUnavailable`, `onInspect`, `inspectAnchorRef`,
  `inspectControlRef`) — App still maintained all of those refs, so
  no API/engine change was needed, and the building-inspect dialog
  (holdings + today's trades, with kill/resume controls) works again
  from the column landscape, exactly as before PM3. WebGL failure
  falls back to the same `.landscape-fallback` message pattern.
- Sizing: wrapped in `.landscape-wrap.bot-landscape` — height
  `min(46vh, 420px)`, min-height 260px (240px on small screens), so
  the city fits the half-width column responsively. The component's
  own framing rules (height cap ratio, camera framing) are untouched
  — no new visual was written.

## 4. Recent bot trades section removed

- The compact "Recent bot trades" list in the Bot Trades panel is
  deleted, along with the now-unused `trades` prop plumbing through
  `SplitView`/`BotTradesPanel` and App's per-bot event filter that
  fed it. Nothing is lost: the Trade Stream below keeps the full
  history. Open Positions stay (moved per #3).

## 5. Trade Stream unchanged

- The Trade Stream below both sections — full width, collapsible bar,
  Trades / Decisions / Your Selections tabs, filters — is untouched,
  as are the four scans and their endpoints, the shared-pool
  allocation math and over-pool validation, the kill switch, the RUN
  MODE control, Simulator labelling, and the single-bot loader filter.

## Files changed

- `app/packages/web/src/App.tsx`
- `app/packages/web/src/SplitView.tsx`
- `app/packages/web/src/styles.css`
- `PHASE-PM4-DELIVERY.md` (this file)

## Verification

- `npm run typecheck` (from `app/`): **PASS** (all workspaces).
- Main build (`npm run build`): **PASS**. Showcase build
  (`npm run build:showcase --workspace @fleet/web`): **PASS**.
- Main dashboard bundle grep: `Leaderboard` — **0 hits** (no tab, no
  view, no component chunk); `Recent bot trades` — **0 hits**;
  `Prediction Markets Assistant` and `Bot Trades` present; the
  `scan-spinner` styles are in the main CSS bundle. The showcase
  bundle still contains its own Leaderboard (1 label hit) — expected
  and legitimate: the showcase legitimately uses the kept component.
- Native sim smoke (no Docker; API + engine via tsx, MODE=sim, all
  state paths in /tmp): `GET /bots` returned **exactly 1 bot**
  (PolyCrypt9000); `GET /scans` listed all 4 scans; `GET
  /scans/2/results` returned **count 53, 53 results** from live Gamma
  (top: "Will the U.S. invade Iran before 2027?" — No @ 0.885);
  engine produced SIM-labelled PolyCrypt trades. Stack killed
  afterwards and verified down (ports 8080/4173 free).
- Web mount sanity: `vite preview` over the built main bundle served
  the app HTML with **HTTP 200** at `/`.

## Deploy (Keith, on the VM)

```bash
ssh <vm>   # or the Google Cloud console SSH for prediction-markets-assist-vm
cd ~/apps/prediction-markets-only/auto-bots-traders
git pull
cd app
docker compose up -d --build
```

Then open http://100.105.73.95:4173 — expect: no Leaderboard tab,
a spinner + skeleton animation in Market Scans while a scan loads,
the animated tower landscape in the right Bot Trades column with
Open Positions below it, and no recent-trades list in that column.
