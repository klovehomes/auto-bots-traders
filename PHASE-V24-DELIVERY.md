# v24 — Market weather inside the hub dome

Keith's request (2026-11-11): *"add an animation inside of that glowing dome that displays weather — we are in breakout weather or downturn weather for the day. The breakout should show green sparklies inside the dome and on downturn days it should look like a mini red meteor shower inside the dome."*

Built locally on v23 (`41a8c78`). **Not pushed** — parent presents, Keith approves the push.

## What you will see

The particle weather lives **inside the central hub's dome** (the dark dome on top of the command station that pulses blue with fleet activity):

- **Breakout day** — ~150–300 **green sparklies** (#2fe89a family) floating inside the dome, twinkling and slowly drifting upward.
- **Downturn day** — a **mini red meteor shower**: ~30–45 glowing red-orange streaks (#ff4d42 family) spawning in the dome's upper half, falling diagonally, fading before they reach the dome's base, respawning continuously.
- A small chip overlays the landscape's top-left corner with the same verdict in words: `✦ Breakout weather · SPY +0.82%` or `☄ Downturn weather · SPY −1.15%`.
- **Intensity**: the busier the day, the busier the sky. Particle counts and speeds scale with |SPY's day change| — a flat day is sparse and gentle, a ±2.5% day runs at full density/speed. Phones render 60% of the counts.

## The weather rule (decided, implemented exactly)

Judged on **SPY**, day change = latest price vs the prior completed close:

- **breakout** if the latest price is at/above the **prior 20-trading-day high**, **or** the day change is **≥ +0.75%**
- **downturn** if the day change is **≤ −0.75%**, **or** the latest price is at/below the **prior 20-trading-day low**
- otherwise the sign decides: ≥ 0 → breakout, < 0 → downturn

Exactly one of the two always displays. The rule is a pure function (`classifyWeather` in `app/packages/shared/src/weather.ts`) shared by the engine, the web, and the test harness — one implementation, three consumers.

Edge handling in `weatherFromBars`: during the session, the live price is judged against completed bars; after the close/weekends, the most recent completed bar *is* "the day" (so the dome keeps showing that session's character instead of a flat 0.00%).

## Where the data comes from

The **engine** computes the weather at boot and then **hourly**, and reports it to the API (`POST /internal/weather`, same internal-token trust as the mode report). The API stores it (`/data/weather-state.json` on the fleet-data volume), serves it at `GET /weather` — so a freshly loaded dashboard shows the correct weather immediately — and broadcasts changes over the event WebSocket (`{kind: "weather"}` frames). The web keeps the latest payload in a ref the landscape reads every frame.

- **Paper mode**: real SPY daily bars (70-day lookback) + the latest SPY trade, through the existing Alpaca client and paper keys — the same feed Trendia's regime gate reads. Connected mode reads the same paper feed for display only (no orders, as always).
- **Sim mode** (and the paper-with-no-keys simulator fallback): the simulator's own live SPY walk, judged against a synthesized prior-day frame — 25 seeded daily bars built at boot whose last close anchors the sim day. The sim weather starts near flat and genuinely flips as the walk drifts up or dips down, so the demo sky works and switches too.

## The dome transparency tweak

The dome shell was opaque dark metal — interior particles would have been invisible. Its material is now **modestly transparent (opacity 0.52, no depth write, renderOrder under the particles)** so the weather reads through it. The blue heartbeat is untouched: the same animation still drives the shell's emissive intensity, the base band, and the glow sprite, and the v18 pulse-fix behavior (one flash record per building per event) is in code paths this phase doesn't touch — the landscape harness (15/15, incl. its source pins) still passes.

If the engine has never reported (first seconds of a first-ever boot), the dome shows the calm default — gentle breakout sparklies at minimum intensity — and the chip stays hidden until the first real verdict lands. Surfaces that render the landscape without a live engine (the public showcase) get the same calm default: the weather prop is optional and nothing crashes or looks broken on static data.

## Verification (actual outputs)

- **New harness `app/tools/test-weather-v24.ts`: 32/32** — classification fixtures (breakout by 20-day high, breakout by day gain, downturn by day loss, downturn by 20-day low on a small-loss day, flat-day sign fallback both ways, both ±0.75% boundaries), intensity floor/cap/monotonicity, the three `weatherFromBars` day-selection cases + insufficient-history null, `weatherModeFor` payload→mode selection incl. the null default, particle population scaling/caps/small-screen, and source pins proving the shipped App/Landscape/API/engine wiring.
- **Live end-to-end (sandbox, sim mode)**: booted the real API + engine; the engine judged the day at boot and reported it; `GET /weather` returned `{"kind":"breakout","spyChangePct":0,"source":"sim",…}` and the state file persisted on disk.
- **Regressions, all green**: typecheck (4 packages) + full build; landscape v18 15/15; Vega 55/55; Snapback 49/49; Wesley 22/22; PolyCrypt 21/21; Kalshi 20/20; mode 36/36; history v19 25/25; keys v21 32/32; keys v21.1 34/34; option-contracts v23 21/21; reset v22 21/21; boot smoke 11/11. Built web bundle grep-verified for `"v24"`, `Breakout weather`, `Downturn weather`, and the `weather-chip` class.
- **Honest limit**: the sandbox cannot screenshot the live Three.js scene. The particle math, bounds, counts, and state flow are harness- and source-verified, but the *look* — sparkle density against the dome glass, meteor streak length — gets its first visual check on Keith's screen after deploy, same as the v18 pulse fix.

## Keith's steps after the push

1. On the Mac: `git pull --rebase` in the clone, then in `app/`: `docker compose up -d --build` (header will read **Build v24**).
2. Open the dashboard: within a few seconds of engine boot the chip appears over the landscape and the dome fills with the day's weather.
3. Sanity anchor: the chip's SPY % should match the day's SPY move on any quote screen; the kind should match the rule above.
