# Phase PM1 — Polymarket-only version (PolyCrypt9000 only)

## Purpose

Branch `polymarket-only`, cut from the five-bot app at `dev` v19
(remote tip `0140bb0`; local `dev` tip `3a03d30`). This variant keeps
exactly one bot: **PolyCrypt9000** — Polymarket mispricing shadow
sleeve + BTC/ETH/SOL crypto breakout sleeve, 50/50 under one combined
risk cap.

The dashboard header now reads **"Prediction Markets Assistant"**,
with the subtitle "Polymarket-only trader — Polymarket shadow sleeve +
BTC / ETH / SOL breakout sleeve." so the bot identity stays clear
under the new title.

## What was removed / changed

- Bots roster: `trendia.md`, `snapback.md`, `vega.md`, and `wesley.md`
  were moved with `git mv` to `bots/retired/` (the loader only reads
  top-level `bots/*.md`, and `retired/` is never read). Only
  `bots/polycrypt9000.md` stays active, content unchanged.
- Engine runners deleted (`git rm`): `paper.ts`, `snapback.ts`,
  `vega.ts`, `earnings.ts`, plus the harnesses `snapback-harness.ts`
  and `vega-harness.ts` (`mode-harness.ts` kept). `alpaca.ts`,
  `indicators.ts`, `control.ts`, `mode.ts`, and `sim.ts` are kept.
- Engine `index.ts` paper path rewritten: the deleted runners and
  their registrations are gone. See Behavior below.
- Simulator (`sim.ts`) trimmed to PolyCrypt9000 only: the stock,
  options, and income generators and their close-reason cases were
  removed; opening always uses the PolyCrypt9000 generator (Polymarket
  probability markets alternating with BTC/ETH/SOL breakouts).
  `START_PRICES` keeps only BTC, ETH, SOL, and the `PM:*` probability
  series. Kill-switch/liquidation logic, the seeded RNG, and the
  $10,000 sim equity are unchanged.
- Web: `App.tsx` header, subtitle, "Run mode" label, and single-bot
  kill/resume wording; `avatars.tsx` keeps only the PolyCrypt9000
  default/portrait and removes the retired bots' Robot-set entries
  (generic Astro entries, `astro-polycrypt`, and `astro-eth` kept);
  `Landscape.tsx` comment wording only — no layout math changed
  (a single bot, n=1, already centers).
- Docs/config: `app/README.md`, `app/.env.example`, and
  `app/docker-compose.yml` updated to the single-bot app; the removed
  bots' state-path env sections (`PAPER_STATE_PATH`, `VEGA_SHADOW`,
  `VEGA_STATE_PATH`, `SNAPBACK_STATE_PATH`) are gone from both
  `.env.example` and the engine service in `docker-compose.yml`.
- One extra one-line fix in `app/packages/api/src/history.ts`: a
  pre-existing type error on `dev` v19 (`parsed.version` on a `never`
  type in the unsupported-version throw) blocked `typecheck`/`build`
  on a pristine `dev` checkout as well. It is fixed with a minimal
  cast so verification passes; no behavior changes.

Not touched: `showcase.tsx`, `gate.tsx`, the showcase/gate entry
files, and `vite.showcase.config.ts`.

Push-time base check (2026-11-08): every file in this push was
compared blob-by-blob against the remote `pplymarket-only` tip
(`0140bb0`) before pushing. `app/.env.example` and
`app/docker-compose.yml` were rebased onto the remote versions —
the local tree carried the readonly-branch showcase sections in
those two files, and they are deliberately NOT carried into this
branch (same discipline as the `dev` pushes). `bots/retired/vega.md`
carries Keith's current Vega watchlist (with RIOT) from the remote
tip, not the older local copy.

## Resulting behavior

- Only PolyCrypt9000 loads (runtime-verified, below).
- `MODE=sim` → the simulator, as before.
- `MODE=paper` → the engine logs clearly that PolyCrypt9000's
  Polymarket shadow runner and Alpaca crypto sleeve are not built
  yet, runs `checkAlpacaPaperConnection()`, then runs PolyCrypt9000
  on the simulator (labelled SIM in its reasons) exactly as it did
  before. No Polymarket runner was invented: Polymarket has no
  paper/testnet (real USDC on Polygon only), so that sleeve is
  shadow-by-design until its runner phase lands.
- `MODE=connected` → unchanged guardrail: paper connection check +
  test emitter only; it never trades live.
- Retained from v19: the kill switch (per-bot and fleet scope in the
  API, now describing the single bot), the mode switch/supervisor,
  and the history retention split (protected vs sim decision classes)
  — all verified below.

## Verification (run in `app/` unless noted, 2026-11-08)

- `npm run typecheck` — PASS (all workspaces: api, engine, shared,
  web), after the one-line `history.ts` fix described above.
- `npm run build` — PASS (all workspaces; web `vite build` succeeded,
  with the pre-existing >500 kB chunk-size warning only).
- Mode harness — PASS: `npx tsx harness/mode-harness.ts` from
  `app/packages/engine` — 36 passed, 0 failed.
- History harness — PASS: `node_modules/.bin/tsx
  tools/test-history-v19.ts` from `app/` — 25/25 checks passed.
- Runtime smoke check (sim mode, `BOTS_DIR` = repo `bots/`):
  - Engine log: `[engine] loaded 1 bots` listing only
    `PolyCrypt9000 (polycrypt9000)`, `MODE=sim (source: env)`,
    simulator running, and a PolyCrypt9000 SIM open event.
  - API log: `loaded 1 bots`.
  - `curl http://localhost:8080/bots` returned exactly one bot:
    `polycrypt9000`.
  - All smoke processes were killed afterwards; no leftovers.
- Wording sweep: the dashboard, `app/README.md`, `.env.example`,
  `docker-compose.yml`, and the touched engine/web files contain no
  remaining multi-bot-count presentation of this app (the only
  historical reference is the single line in Purpose above).

## Not done

- No real or shadow Polymarket runner, and no Alpaca crypto runner,
  was built — both remain future phases on Keith's word.

## Addendum — PM1.1, 2026-11-08 (single-bot load filter)

The build was pushed to GitHub twice on 2026-11-08: first to the
double-p branch as `b07c515`, then — after Keith corrected the
spelling, deleted both wrong branches, and approved the clean fix —
to the recreated `polymarket-only` branch (created from `dev`
0140bb0) as `a109790`, read-back verified.

One gap remained in both pushes: the GitHub snapshot route cannot
delete files, so the four other bots' originals still sit in
top-level `bots/` on the branch (inherited from `dev`), and Keith
declined the per-file deletion approvals. His chosen finish
(2026-11-08, option 2) is a code-level guarantee instead:

- `app/packages/shared/src/loader.ts` now exports
  `ONLY_BOT_CODENAME = "polycrypt9000"`, and `loadBots()` filters
  its result to that codename. The engine, the API (`GET /bots`),
  and the Risk Gate control store all load through this one
  function, so on this branch only PolyCrypt9000 can ever be
  listed, controlled, or traded — regardless of which bot files
  are present in the directory.
- Verified with ALL FIVE bot files present in a test bots
  directory: engine and API both load exactly 1 bot
  (`polycrypt9000`), and `GET /bots` returns just PolyCrypt9000.
  Typecheck and build pass.

The other bots' files and the removed runners' files
(`paper.ts`, `snapback.ts`, `vega.ts`, `earnings.ts` and the two
harnesses, still present on the remote branch as dead code) can be
deleted from the branch at any time without changing behavior.
