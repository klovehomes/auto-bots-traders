# Dystopian City Landscape — Delivery Notes

Delivered 2026-11-01. The trader-bot Landscape (`app/packages/web/src/Landscape.tsx`)
was rebuilt from floating avatar discs over pads into a **futuristic dystopian
city**, following Keith's guide image (`1000018798_4_7hrd.png` — purple-blue
dusk haze, angular towers, neon, flying vehicles). Everything outside the 3D
scene (totals bar, tabs, trade stream, leaderboard, avatar defaults + picker)
is unchanged and keeps working exactly as before. No changes to bot `.md`
files, the shared schema, the engine, or the API.

## What each building is

Each bot is a **tower** on a plaza plinth, arranged in an arc around a central
hub (the old market-core spire, evolved into a hub tower + cyan activity spire
where all conduits land):

- **Plinth + momentum ring** — the old pad ring lives on the plinth and still
  tints green ↔ red with realized-PnL momentum (same `momentumAt` behavior).
- **Dome** — every tower is topped with a dark gray metal dome (metalness .9)
  with a glowing band at its base and an additive glow sprite. The band pulses
  **blue** steadily; on a winning close it flashes green/cyan, on a losing
  close red, then decays back to the blue pulse over ~1 s. Win/loss/open
  shocks, particle bursts, and the red loss flare are retained, now anchored
  at the dome.
- **Ground glow pool (synchronized)** — an additive radial glow disc baked
  into the ground directly under each building. It idles as a faint bot-color
  wash, and on a close event it fires **with** the dome flash: it is driven by
  the *same* flash state (same color, same strength, same 1 s decay curve) in
  the render loop, brightening and swelling as it fades. Red pool + red dome
  on a loss, green/cyan pool + green/cyan dome on a win — one mechanism, two
  surfaces, so they can never drift out of sync. This is separate from the
  plinth ring's slow momentum tint, which still runs independently.
- **Conduits ("tunnels/wires")** — from each plinth a dark pipe runs along the
  ground to the hub, with a bot-colored glow wire riding on top of it and
  three additive flow pulses per building continuously travelling along the
  wire toward the center.
- **Pixelated avatar screen** — each tower's front face carries a framed
  screen showing the bot's *currently selected* avatar (the picker-resolved
  image: default portrait, or whatever the user picked — it repaints live on
  picker changes via the same `AVATAR_CHOICE_EVENT` used before). The avatar
  is drawn into a **28×28 offscreen canvas** and upscaled with smoothing off,
  giving the chunky pixel look, plus scanlines and a bot-color halo. Bots with
  no image get the same treatment applied to their letter disc.
- **Open-position nodes** — retained: nodes orbit at mid-tower height with
  symbol labels and beam tethers to the roof.
- **Name plates** — unchanged format (name · equity · open count · realized),
  floating above the dome and rising/falling with the tower.

## Height = balance, 0.75 power

```
h = 3.9 × clamp(equity / 5000, 0.15, 4) ^ 0.75
```

- `equity` is the same client-side equity the name plates show
  (`START_EQUITY` 5000 + realized PnL accumulated since page load).
- The 0.75 power compresses differences (a bot at 2× the balance stands
  ~1.68× taller, not 2×); the ratio clamp keeps a ruined or runaway bot's
  tower sane (heights stay between ~0.95 and ~11 world units of tower).
- Height changes animate smoothly (per-frame lerp); the tower, facade window
  density, dome, screen, name plate, and node orbit all follow the height.

## Demo heights (`?demoheights=1`) — DEMO ONLY

Sim equities hover near $5,000, so real height differences are nearly
invisible. Opening the dashboard with **`?demoheights=1`** overrides the
*display* equities used by the scene and the name plates with a fixed spread —
PolyCrypt9000 $2,500 · Wesley $3,800 · Snapback $4,800 · Trendia $7,500 ·
Vega $10,000 — purely so height encoding can be seen/photographed. It is off
by default, touches nothing outside the landscape component (totals bar,
trade stream, and leaderboard still show real figures), and no real data is
modified. See `ui-preview/city-demoheights.png` for the effect.

## City dressing

Gradient dusk sky (indigo → violet with a magenta haze band), exponential
purple fog, 120 instanced backdrop towers with sparse lit windows fading into
the haze, dim stars, dark ground with a purple street grid, and three slow
flying vehicles with colored light trails crossing overhead. Facades use
seeded canvas window textures, so the city looks identical on every load.

## Verification (this build)

- `npm run typecheck` — all four packages pass; `vite build` passes.
- Ran natively (API + engine in `MODE=sim`, web via `vite preview :4173`):
  **zero console errors** across all captures.
- Screenshots in `~/workspace/trading-bots/ui-preview/`:
  - `city-desktop.png` — normal sim view after ~20 s of events (1440×900)
  - `city-demoheights.png` — `?demoheights=1`, heights settled; order on
    screen: Vega > Trendia > Snapback > Wesley > PolyCrypt9000, as spec'd
  - `city-mobile.png` — 390×844 portrait, normal view

## Limitations

- Equity (and therefore height) still accumulates from page load only — the
  known no-history-API limitation from the landscape build; a reload resets
  towers to base height until new closes land.
- The conduits run behind the front arc of towers from the default camera,
  so they read as colored ground lines converging on the hub rather than
  full-length pipes; the flow pulses are the clearest tell.
- Pixel screens are drawn from the same avatar files as the rest of the app;
  very detailed picker choices will read as colored pixel mosaics at distance
  (by design — that's the billboard look).
- Bundle is a single ~822 KB chunk (pre-existing; Three.js dominates).
- `?demoheights=1` is a display override for demos/screenshots only — it is
  not a data mode and must not be used to judge bot performance.

---

## v2 addendum — Keith's corrections (2026-11-01, package v6)

The v5 reveal put a dome on every building; that was a misread of Keith's
description. This round corrects the skyline:

- **One dome only — at the center.** The domes are gone from all five
  trader buildings. The hub is now a proper **central control station**:
  a wide stepped command structure (broad platform, facade tier, tapered
  drum) topped by the city's single dark gray metal dome. Its base band
  and glow keep the blue pulse, with brightness tracking team closing
  activity over the last ~10 s. Conduits still run from every building
  into the station (they now land on the wider platform edge).
- **Satellite-dish tops that fire pulses into the sky.** Each building's
  crown carries a parabolic dish on a short mount, tilted up toward the
  sky. The dish is the building's event emitter: a winning close fires a
  **green** pulse up — a bright vertical beam column, an expanding ring
  at the dish, and a glow burst (~1 s decay); a losing close fires
  **red**. The beam/ring/glow are driven by the *same* flash state as
  the ground-glow pool under the same building, so the sky pulse and
  the ground pool fire in lockstep and can never drift apart. (Open
  events fire a weaker beam in the bot's own color, as before.) Idle
  dishes are dark metal with only a faint cool rim glint — no constant
  beam. The win/loss shockwaves and particle bursts are retained.
- **Thinner towers, irregular toward the top.** Shafts slimmed from
  2.5 → 1.7 units wide. Above the shaft (70–78% of the height), each
  tower stacks 2–3 stepped setback segments — narrower, offset, some
  slightly rotated, some with a jagged fin — seeded by codename so no
  two crowns match. The pixelated avatar screen stays on the main
  shaft's front face; the balance^0.75 height rule, smooth lerp,
  clamps, and `?demoheights=1` are unchanged, and the whole stepped
  silhouette grows/shrinks as one.
- **Snapback ↔ Vega default avatars swapped** (Keith's direction): in
  `avatars.tsx`, codename `snapback` now defaults to `/avatars/vega.webp`
  and `vega` to `/avatars/snapback.webp`. Files were not renamed and the
  picker library is unchanged (its portrait entries follow the files);
  saved picker picks still override defaults. Documented in
  `app/AVATARS.md`.
- **Skin-tone portrait revisions** (same round): `trendia.webp` content
  replaced with the warm medium-brown-skin Trendia
  (`trendia_avatar_v3.webp`) and `snapback.webp` with the deep
  rich-brown-skin Snapback (`snapback_avatar_v5.webp`). Same filenames,
  so the library updates automatically; combined with the swap, Vega's
  default face is now the deep-brown bearded portrait.

Verification (this round): typecheck + `vite build` pass; native stack
in `MODE=sim`, fresh-profile headless Chrome, **zero console errors**.
Screenshots: `city2-desktop.png` (one dome at the station, dishes on all
five towers), `city2-demoheights.png` (height order unchanged:
Vega > Trendia > Snapback > Wesley > PolyCrypt9000; swapped screens
visible), `city2-mobile.png` (390×844), plus `city2-beam.png` — a burst
capture that caught Snapback's dish firing a green beam mid-pulse on a
winning close (ring + dish glow + synced ground pool in frame), and
`city2-leaderboard.png` + row inspection confirming the swap and both
new skin tones. Red pulses were confirmed in burst frames by pixel
analysis (strong saturated-red clusters above the towers).

Limitations (new/changed): on mobile the name plates still crowd
together (pre-existing portrait constraint); at base height the towers
still read stocky in the normal view — the slimming reads best in the
demo-heights spread; a mid-flash still is luck-dependent (the
`city2-beam.png` capture is the proof frame this round).

---

## v3 addendum (2026-11-01) — phone framing, building inspect dialog, stream parity

Three additions on top of the v2 city, all in `packages/web`
(`Landscape.tsx`, `App.tsx`, `styles.css`). No changes to bot `.md`
files, the shared schema, the engine, or the API.

### 1. Phone framing zooms in by default

On portrait viewports (aspect < 1, e.g. a 390×844 phone) the landscape
camera now sits **lower and much closer** (z ≈ 13.2 vs 18.5, height
≈ 6.3 vs 8.8, aimed slightly higher at the towers, reduced drift), so
the five buildings + central control station fill most of the landscape
card instead of bunching at the top over a field of empty ground (the
v2 mobile problem). Desktop and mid-aspect framing are byte-for-byte
the original values — unchanged.

### 2. Building inspect dialog — holdings + today's trades

Every building is inspectable, via raycast against its meshes + name
plate in `Landscape.tsx`:

- **Desktop:** hovering a building for ~250 ms (hover intent) opens
  the dialog; it closes after a ~375 ms grace once the pointer leaves.
  The pointer can move into the dialog itself without it vanishing
  (the dialog holds the close off via an imperative control the scene
  exposes), and hovering a different building switches the dialog to
  that bot. The cursor turns into a pointer over buildings.
- **Phone/touch:** tapping a building pins its dialog open; tapping
  another building switches, tapping empty space or the same building
  again dismisses it, and there's an ✕ button (Escape also closes on
  desktop).
- **Position:** the scene publishes the inspected building's
  name-plate anchor (viewport pixels) every frame; the dialog re-reads
  it on its own rAF and pins itself under the plate (flipping above it
  near the viewport bottom), clamped to the viewport — it tracks the
  idle camera drift with no React re-renders.
- **Content** (DOM overlay in `App.tsx`, styled like the decision
  modal): header with the bot's picker-resolved avatar (`BotAvatar`,
  so picker picks show here too), name, ✕; a stats line (equity,
  realized PnL, open count); then **Current holdings** — the bot's open
  positions from the client team state (symbol, side, qty, entry
  price, opened time — every field comes from the open events the page
  has seen; nothing is invented), with "No open positions right now."
  as the empty state; then **Today's trades** BELOW the holdings —
  that bot's opens/closes, newest first, bought/sold + item + time,
  realized PnL in green/red on closes, no amount on opens. The dialog
  is live: it re-renders from App state as new events land, no
  reopening needed.

**Data caveat (standing limitation, recorded here, not in the UI):**
all dialog data comes from the existing client-side team state, which
accumulates from page load — there is still no history API. "Today's
trades" therefore means the trades this page has seen this session,
and a position opened before the page loaded shows in PnL but not in
holdings (its close simply won't match an open the page saw). This is
the same caveat the leaderboard has carried since v1.

### 3. Trade Stream parity — same bar under the landscape in both views

Confirmed and locked in: the **single** collapsible Trade Stream bar
is the same component in both viewports and sits **directly below the
landscape section** in the page flow on phone exactly as on desktop
(verified in the DOM: the feed section is the landscape card's next
sibling in both). It is **collapsed by default** with its count badge
and latest-trade preview; expanding it drops down the running list of
all transactions with the existing features intact (bot filter,
Trades | Decisions tabs, decision ⓘ buttons). Nothing was redesigned
or duplicated — this round only verified parity and placement.

In the list, the **dollar amounts themselves are font-colored**:
realized PnL on closes renders green (`#3fb950`) for profits and red
(`#f85149`) for losses, on the amount text element itself; opens show
no amount, as before. (Verified via computed styles in both
viewports; the same coloring also applies to the PnL column in the
inspect dialog's "Today's trades".)

### Verification (v3)

Typecheck passes across all four packages; `vite build` passes.
Native stack in `MODE=sim`, fresh-profile headless Chrome, **zero
console errors** in every session. Screenshots in `ui-preview/`:

- `inspect-desktop.png` (1440×900) — hover dialog open on Snapback
  (found by a cursor scan + 250 ms dwell): 5–6 holdings with qty/entry
  price/opened times, today's trades below with colored PnL, live
  counts ticking between probe and capture.
- `inspect-mobile.png` (390×844) — the new closer default phone
  framing: city fills the landscape card.
- `inspect-mobile-dialog.png` (390×844) — tap-opened dialog on
  PolyCrypt9000, both sections populated.
- `inspect-desktop-stream.png` / `inspect-mobile-stream.png` — the
  stream bar expanded directly under the landscape in each viewport,
  amounts green/red in the list.

### Limitations (v3)

- On the desktop the inspect dialog is tall (holdings + up to 40
  trades, internal scroll); near the bottom of the viewport it flips
  above the name plate and can overlap the totals bar while open. It
  tracks the plate and dismisses cleanly, but a future pass could cap
  the trades list shorter.
- Name plates still crowd horizontally at phone width (their sprites
  overlap slightly), though the closer framing makes them larger and
  readable; plates are part of the raycast surface, so tapping a plate
  also opens its building.
- Hover intent means a fast mouse sweep across the city opens nothing
  (by design); the first dwell of ~250 ms is the interaction cost.
