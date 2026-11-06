# Phase 10 (v18) — Standing landscape rules: relative height cap + 25% closer framing

Two standing rules Keith set on 2026-11-06, for **all** versions of the
app — the private dashboard and the public showcase alike. Both changes
live in the one shared landscape module
(`app/packages/web/src/Landscape.tsx`), which the showcase entry tree
imports exactly like the private one, so a single change ships to both
apps: the private dashboard on its next `dev` push, the showcase on
its next `readonly` push. (Pushes not done — this phase is a local
commit only.)

## Files changed

- `app/packages/web/src/Landscape.tsx` — the only source change
  (+65/−11): the height cap, the framing zoom, one restructured
  height-target block, one compensating portrait-arc tweak.
- `app/tools/test-landscape-v18.ts` — new verification harness (below).
- `PHASE10-DELIVERY.md` — this file.

No engine, API, publisher, or gate changes. No `bots/*.md` edits.

## Change 1 — Relative height cap

Keith's words: "Once the tallest building is 4x larger than the
smallest it stops growing."

Building heights still come from the existing formula, unchanged:

    h = 3.9 × clamp(equity / START_EQUITY, 0.15, 4) ^ 0.75

After the row's five heights are computed, they are clamped against
each other (`applyHeightCap`, `MAX_HEIGHT_RATIO = 4`):

    h_i := min(h_i, 4 × min_j h_j)

The ceiling is **dynamic** — it rises as the smallest building grows.
Purely visual: equity values, name plates (which still show the true
equity), ordering, beams, and inspect dialogs are unaffected; only the
rendered tower heights clamp, and the existing height-easing animation
simply eases toward the capped target.

Implementation: the render loop's throttled label/target block now
derives all five display equities first (real or `?demoheights=1`
override — demo heights pass through the same cap), runs them through
`cappedHeightsForEquities`, and assigns the capped targets. The pure
functions (`heightForEquity`, `applyHeightCap`,
`cappedHeightsForEquities`) are exported from Landscape.tsx so the
harness tests the shipped code path, not a replica.

One honest note on when the cap binds: `heightForEquity` already
clamps the equity ratio to [0.15, 4], so a rich bot over $10k bots can
never exceed a 2.83× height spread — the cap binds when the *smallest*
bot is well below its starting book, which is exactly the lopsided
city Keith's rule targets. Harness numbers below show both regimes.

## Change 2 — Camera ~25% closer

Keith's words: "zoom in about 25 percent on all 5 buildings so they
fill more of the device or pc screen."

New named constant `FRAMING_ZOOM = 1.25` in Landscape.tsx. Each frame,
after the existing idle-drift position is computed, the camera is
pulled toward its look-at point:

    camera.position.sub(camTarget).divideScalar(FRAMING_ZOOM).add(camTarget);
    camera.lookAt(camTarget);

i.e. camera distance × 1/1.25 = **× 0.8**, on every viewport, around
the unchanged look-at targets. The underlying framing constants did
not change:

| Framing value | Old | New |
|---|---|---|
| Effective camera distance | × 1.0 | **× 0.8** (÷ FRAMING_ZOOM 1.25) |
| Desktop camZ base (aspect ≥ 1.5) | 17.5 | 17.5 (distance to target × 0.8 via the pull-in) |
| Mid camZ base (aspect < 1.5) | 20 | 20 (same pull-in) |
| Phone camZ base (portrait) | 13.2 | 13.2 (same pull-in) |
| Camera height base | 9.4 desktop / 6.3 portrait | unchanged (offset from target scaled by the pull-in) |
| Look-at target | (0, 2.1, −3.4) desktop / (0, 2.6, −3.0) portrait | unchanged |
| FOV | 52 / 60 / 76 by aspect | unchanged |
| Drift amplitudes | x ±2.3/±1.3, y ±0.55/±0.35, z ±0.9/±0.5 | unchanged |

### Compensating tweak (portrait arc)

Projection testing (Part 2 of the harness) showed the closer camera
was clean on desktop/tablet aspects but pushed the outer **towers**
past the edges of the narrowest phone screens at camera-drift
extremes (worst |x| NDC 1.28 at aspect 0.46, vs 1.02 pre-v18). The
portrait arc — chosen at scene init, portrait only — was tightened so
the buildings sit slightly closer together and nearer:

| Portrait arc constant | Old | New |
|---|---|---|
| `arcSpread` | 1.05 | **0.88** |
| `arcRadius` | 9.5 | **8.5** |

(Desktop arc unchanged: spread 1.7, radius 11.5.) With the tweak, the
outer towers' worst-case extent at the new zoom is back at the pre-v18
level on narrow phones (1.04 at aspect 0.46 vs 1.02 before; 0.95 at
0.50 vs 0.94) while the buildings themselves render ~25% larger.
Known remainder, unchanged in kind from pre-v18: on the narrowest
full-screen portrait aspects (≤ 0.5), the *tips* of the two outer name
plates and plinth corners can slip past the screen edge at drift
extremes — they already did before this change (worst |x| 1.28
pre-v18); the towers, dishes, and hub do not.

## Verification

Harness: `app/tools/test-landscape-v18.ts`, run with tsx from `app/`:

    node_modules/.bin/tsx tools/test-landscape-v18.ts

**15/15 checks pass**, including source pins proving the shipped
render loop calls the tested functions and uses the modeled portrait
arc constants.

### Height cap (real shipped functions)

| Fixture equities | Raw heights | After cap |
|---|---|---|
| [10000 ×5] | [3.900 ×5] | unchanged — ratio exactly 1 |
| [40000, 10000 ×4] | tallest 11.031, shortest 3.900 | unchanged — ceiling 15.600 does not bind; ratio 2.828 |
| [250000, 10000 ×4] | tallest 11.031 (= 2.83× shortest; formula's own equity clamp) | unchanged — under the 15.600 ceiling |
| [40000, 2500 ×4] | tallest 11.031, shortest 1.379 | **tallest capped to 5.515 = exactly 4× shortest** |
| [10000, 1500 ×4] | tallest 3.900, shortest 0.940 (formula floor) | **tallest capped to 3.760 = exactly 4× shortest** |
| [12000, 10000, 9000, 11000, 10500] | [4.471, 3.900, 3.604, 4.189, 4.045] | identical — formula untouched below the cap |
| demo set [5000, 9600, 15000, 20000, 7600] | [2.319, 3.782, 5.286, 6.559, 3.174] | identical — ceiling 9.276, demo passes through the same cap |

Dynamic ceiling (same $40,000 tall bot, rising floor): floor $2,500 →
tallest capped at 5.515; floor $5,000 → 9.276; floor $10,000 → ceiling
15.600 clears the formula height 11.031 (uncapped). Edge cases: empty
row → empty; a single building keeps its formula height.

### Framing projection (three's own projection, worst case over a full drift cycle)

- Desktop aspects 1.78 / 1.33 / 1.20, realistic scenarios (all bots at
  start; capped spread): **everything in frame** at FRAMING_ZOOM —
  worst |x| 0.906, worst top 0.981, worst bottom −0.425 (towers,
  plates, plinths, hub all ≤ 1.0 NDC).
- Portrait 0.50 / 0.46 with the arc tweak: towers' worst |x|
  0.954 / 1.037 vs pre-v18 0.935 / 1.017 — parity, as designed.
- Far-future extreme (all five bots at the formula-max height 11.029,
  i.e. every book at 4× start): name-plate tops sit above the frame —
  already true pre-v18 (top NDC 1.529 before, 2.083 after at aspect
  1.78). Reported for completeness; not a state the fleet is near.

### Builds + bundle greps

- Root `npm run build` (typecheck + all workspaces, default flavor):
  clean. Web `build:showcase`: clean.
- Showcase bundle: the v16 forbidden set — `kill-liquidate`,
  `/control`, `kill switch`, `TEAM KILL`, `WebSocket`,
  `fleet-mode-select`, `/mode`, `liquidate`, `resume` — **all
  absent**; `READ-ONLY SHOWCASE`, `Not investment advice`,
  `snapshot.json` — **present**.
- Default bundle checked the other way: `kill-liquidate`, `/control`,
  `TEAM KILL`, `WebSocket`, `liquidate` present; showcase banner
  strings absent. Controls intact.

## Standing-rule note

Both rules are implemented once, in the shared landscape, so they
apply to every future version of both apps. This change ships to the
private dashboard on its next `dev` push and to the showcase on its
next `readonly` push — pushes not done in this phase.
