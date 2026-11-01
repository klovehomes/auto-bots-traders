# Landscape UI (Phase 2) — Delivery Notes

Built 2026-11-01 against the Phase 0 stack (engine sim → API → WebSocket →
React/Three.js). Everything below is in `app/packages/web`; the engine and
API were not changed.

## What was built, mapped to PLAN.md

### "The landscape (visualization spec)"
- **Dark futuristic valley** in Three.js (`src/Landscape.tsx`): glowing
  grid terrain over a dark valley floor, star field, fog, and a central
  **market core spire** whose emissive brightness and light track event
  activity in the last ~10 seconds.
- **Five pads in a shallow arc**, one per bot, built from `GET /bots`
  (name, `viz.color`, `viz.avatar_accessory` come straight from each
  bot's `.md` file).
- **Floating circular avatar per bot**: canvas-textured disc in the bot's
  color with its initial letter and accessory label ("visor shades",
  "bow tie", …), bobbing over its pad. A name plate floats above it
  showing **name, current equity, open-position count, and realized PnL**
  (refreshed live).
- **Glow ring per pad** that shifts green ↔ red with the bot's
  realized-PnL *momentum* (recent closes, exponentially decayed) — see
  Limitations for why it's momentum, not unrealized PnL.
- **Open positions**: a beam fires from the bot's avatar to a small
  **orbiting node labeled with the ticker/market**; the node stays
  tethered while the position is open and disappears on close.
- **Winning close**: expanding green/cyan **shockwave rings + rising
  particle burst** at that bot's pad. **Losing close**: **red flare +
  downward (falling) red particle pulse** + red ground ring. Opens get a
  small neutral pulse in the bot's color.
- **Slow idle camera drift**; framing adapts to aspect ratio (portrait
  screens get a tighter arc, wider FOV, closer camera). If WebGL is
  unavailable, the scene is replaced by a message and everything else
  stays live.

### "Below the landscape: trade feed, YTD totals, leaderboard"
- **YTD totals bar** pinned above the tabs: realized **profits (green)**,
  realized **losses (red)** — the number Keith specifically asked to see —
  **net**, and closed-trade count. All computed live from the stream.
- **Tabs: `Landscape | Leaderboard`** beside the scene.
- **Collapsible Trade Stream** below the landscape (collapsed by default,
  per the plan; the bar shows a live count badge and the latest trade).
  Rows follow the plan format exactly: `BotName bought|sold "item" ·
  timestamp`, realized PnL in **green/red on closes only**, a mini avatar
  disc per row, and a **filter by bot**. (`?feed=open` deep-links it open,
  `?tab=leaderboard` deep-links the leaderboard.)
- **Leaderboard tab**: ranked by **net PnL %** vs the equal $5,000 start,
  with net $, win rate, trade count, current equity vs starting
  allocation, **max drawdown** (peak-to-trough of the client-side equity
  curve), and a per-bot **equity sparkline**. Clicking a bot expands its
  `.md` philosophy and its currently open positions (per the plan).

### "Decision log — every trade explains itself"
- Every trade row has a **ⓘ** that opens a **decision-detail modal**:
  `decision_id`, the full trigger/reason text, action/side, instrument,
  qty, price, realized PnL, timestamp, and the bot's equity.
- The stream has a **`Trades | Decisions`** tab pair: Decisions lists
  every decision from the stream (id, bot, trigger text, time); clicking
  one opens the same detail modal and **highlights the trade rows with
  that decision id** in the Trades tab.

## Files
- `app/packages/web/src/Landscape.tsx` — the Three.js scene (new)
- `app/packages/web/src/Leaderboard.tsx` — leaderboard tab (new)
- `app/packages/web/src/fleetState.ts` — client-side aggregation:
  per-bot equity/curve/drawdown/open positions, fleet totals, PnL
  momentum (new)
- `app/packages/web/src/App.tsx` — header/badges, totals bar, tabs,
  landscape mount, trade stream + Decisions tab, decision modal (rewritten)
- `app/packages/web/src/styles.css` — full restyle incl. mobile layout
- `three` (+ `@types/three`) added to the web package
- Screenshots: `ui-preview/landscape-desktop.png` (1440×900),
  `ui-preview/landscape-mobile.png` (390×844),
  `ui-preview/leaderboard-desktop.png` (bonus)
- Package: `~/workspace/your_files/trading-bots-local-v3.zip`

## How to run
Same as v2 (see LOCAL-RUN.md): unzip, `cd app`, `docker compose up`, open
http://localhost:4173 — or natively with `npm install` then
`npm run dev` / the api+engine `start` scripts with `MODE=sim`.
The stack was verified natively on the build VM: API + engine in
`MODE=sim`, web via `vite preview` on 4173, ~20 s of live events, then
headless-Chrome screenshots. Desktop DOM check showed 16–20 trade rows,
totals updating, `SIMULATED DATA` badge, WebSocket connected, WebGL canvas
live, zero console errors; leaderboard showed all 5 bots ranked with
sparklines; the decision modal opened with full detail.

## Limitations (honest list)
- **No history API yet.** The Phase 0 API only broadcasts live events, so
  every aggregate (equity, totals, win rate, drawdown, open positions)
  accumulates **from the moment the page connects**. Reloading resets
  them; trades that happened before the page loaded are missed (the sim
  engine's own equity, shown in its log reasons, may differ). A REST
  history endpoint + persistence is the natural next API step.
- **Ring tint is momentum-based, not unrealized PnL.** The plan's
  green↔red ring tracks *unrealized* PnL, but the event stream carries no
  position marks — only realized closes. Until the engine streams marks,
  the ring leans on recent realized closes (decayed), which reads the
  same at a glance.
- **Equity = $5,000 + realized PnL.** Open-position value isn't marked to
  market, so equity/leaderboard move only on closes.
- **Decision records are stream-derived.** The modal shows what the event
  schema carries (trigger text + fill). The plan's full decision record —
  **param snapshot, indicator values, Risk-Gate verdict, signal-to-fill
  timing** — needs the Phase 1 engine to write decisions; veto rows will
  appear in the Decisions tab (greyed) once the engine emits them. Today
  the sim emits only executed decisions.
- **Open-position matching is by symbol.** A close retires the oldest open
  with the same symbol for that bot; simultaneous same-symbol positions
  would merge visually into one node.
- **No kill switch yet.** The plan's big red KILL SWITCH waits on the
  Phase 5 bot-control API — there is nothing to wire it to yet.
- **Bundle size**: the single JS chunk is ~790 KB (Three.js); fine for a
  local dashboard, worth code-splitting later.
- Deep-link params (`?feed=open`, `?tab=leaderboard`) are conveniences
  for screenshots/sharing, not plan features.
