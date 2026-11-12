# Phase PM8 — Merge dev v20–v24 into the Prediction Markets Assistant (Build v25)

**Branch:** `prediction-markets-assistant` (in `klovehomes/auto-bots-traders`)
**Base:** `polymarket-only` at `3f24dbd` (PM1–PM7) · **Merged from:** `dev` at `306c674` (v24)
**Date:** 2026-11-11 · **App version:** Build v25 (was v24 in the merged tree; `version.ts` default bumped `v24` → `v25`, shown under the "Prediction Markets Assistant" title — the title itself is unchanged)
**Status:** built, typechecked, harnesses run (see § Verification). Push via connector snapshot-push; `polymarket-only` untouched at `3f24dbd`.

## What landed

### v20 — Build version line (first time on this app)
- `app/packages/web/src/version.ts` (new file for this branch) + `BUILD_VERSION` env override via `VITE_BUILD_VERSION`.
- Small muted `Build v25` line directly under the "Prediction Markets Assistant" header, per Keith's standing rule from the fleet app.

### v21 + v21.1 — True-paper phase: keys-file loader + real PolyCrypt9000 paper runner
- Keys loader (`app/packages/shared/src/keys.ts`, `app/keys.example.txt`, `GET /keys/status`): paper keys come from a local text file (`KEYS_FILE`, default `~/traderbot-keys.txt`, outside the repo); file wins over `.env`; status reports presence only (last-4 of Key ID). Compose mounts the file read-only into the api + engine containers.
- New PolyCrypt9000 runner (`app/packages/engine/src/polycrypt.ts`) + Kalshi client (`app/packages/engine/src/kalshi.ts`, RSA-PSS, **demo only** — `KALSHI_ENV` ≠ demo is refused):
  - Crypto sleeve: Donchian-20 breakout on Alpaca paper (BTC/ETH/SOL), 2×ATR trailing stop, 15%/position, 3 max.
  - Kalshi sleeve: demo venue, anchor = the market's own last traded YES price, edge ≥ 8pts, quarter-Kelly × ½, 3%/5% caps.
  - Polymarket sleeve stays **shadow by design** — Polymarket has no paper/testnet.
- v21.1: the Kalshi private key can live **inline** in the keys file (`KALSHI_PRIVATE_KEY=` multi-line PEM). This matters more here than on the Mac: on the VM the `.pem` file is never mounted into Docker, so the inline key is what makes Kalshi demo actually load there.
- `app/packages/engine/src/index.ts` now takes the dev paper branch: PolyCrypt9000 starts her paper runner when keys exist; with no keys she logs clear NO-TRADE decisions instead of going silent.

### v22 — Reset All Data
- Armed kill-switch bar → typed-RESET confirm modal → halt → wipe event history → every bot book back to $10,000 → stays halted until Resume. App data only — broker positions are NOT closed (they become untracked).
- **PM8 decision (Keith did not object to the recommendation): Reset clears the shared-pool ledger too.** `AllocationStore.reset()` (new in `app/packages/api/src/allocations.ts`) returns the ledger to fresh-install state — bot allocation $0, all three sleeve toggles on, no booked user selections — called from the API's `runReset()` alongside the history wipe. A reset that left booked selections against a $10,000 book would be incoherent. The reset modal copy says so, reworded for one bot ("halts PolyCrypt9000").

### v23 — Alpaca options-contract fix (shared client hygiene)
- `getOptionContracts()` now calls the Trading API (`paper-api.alpaca.markets/v2/options/contracts`) instead of the nonexistent Market Data path. PolyCrypt9000 places no options, so she never hit the 404 — but the corrected client is what her crypto sleeve uses. Mocked-fetch test rides along (`app/tools/test-option-contracts-v23.ts`).

### v24 — SPY market weather in the hub dome
- Engine classifies the day from SPY (breakout / downturn / sign fallback — exactly one always shows) → `GET /weather` + WebSocket broadcast → the Landscape renders it **inside the central hub dome**: green sparklies on breakout days, red meteor shower on downturn days, plus the overlay chip "✦ Breakout weather · SPY +x%" / "☄ Downturn weather · SPY −x%".
- PM wiring: `weatherRef` is passed into the Landscape node inside the split-screen Bot Trades column and the chip renders over that landscape (`.landscape-wrap` is `position: relative`, so the absolute chip anchors correctly). In sim mode the weather comes from the simulator's SPY series.

## What was deliberately left out / kept
- The other four bots' runners (Trendia / Snapback / Vega / Wesley) land as files but **never run** — the PolyCrypt9000-only filter is untouched (`loader.ts`: `ONLY_BOT_CODENAME = "polycrypt9000"`; `loadBots()` filters to it). Their engine starters guard on `byCodename()` and never find their bot. Inert dead code, exactly as on PM1.1.
- The Leaderboard tab stays removed (PM4). Five-bot / "TEAM" wording in the UI was reworded to PolyCrypt9000 (kill/reset/audit copy, reset modal, engine DATA_RESET audit text).
- All PM features survive: split screen (Market Scans + Bot Trades), shared-pool allocations ledger, Your Selections tab, all 4 scans incl. Long Shots, sleeve toggles, PM6 greying, PM7 in-Docker email gate, Traderbot.ai logo avatar.
- PM6 greying re-pointed (PM8 integration job): sleeve availability now reads the **keys file** via `getPaperKeys().status` (keys file first, `.env` fallback), so a Kalshi demo key in `~/traderbot-keys.txt` counts as connected. And in paper mode a sleeve is now available exactly when its keys are configured — the "runner isn't built" reason is gone, because both paper runners exist now. Polymarket's sleeve stays unavailable in paper on principle (no paper mode).

## Merge notes (for the next merge)
- 7 files conflicted (15 hunks): `app/.env.example`, `app/docker-compose.yml`, `app/packages/api/src/history.ts` (took dev's one-line typecheck fix), `app/packages/api/src/index.ts`, `app/packages/engine/src/index.ts` (took dev's paper branch; registry comment + boot log reworded to the PM truth), `app/packages/engine/src/sim.ts`, `app/packages/web/src/App.tsx` (kept PM title + split screen; folded in Build line, reset wording, weather wiring). Everywhere else the rule was "keep both sides" (gate vars + keys file, allocations + weather paths, gate endpoints + weather broadcaster).
- One deviation from a pure merge: `sim.ts` was taken **wholesale from dev**, not PM-trimmed + the v24 hunk. The PM trim had deleted the other bots' sim generators and the SPY price series; the v24 weather service in sim mode needs that SPY series, and the other generators never run here (only PolyCrypt9000 is loaded). Cosmetic PM wording in the sim header comment was lost in the process — behaviour is dev's.
- `.env.example` / `docker-compose.yml` keep the other bots' state-path vars as inert entries (same as the runner files); the valuable lines are `POLYCRYPT_STATE_PATH` + `KEYS_FILE` + `WEATHER_STATE_PATH`.

## Verification (run 2026-11-11 in `~/workspace/pm-update-plan`, before push)
- `npm run typecheck` — **pass**, all 4 workspaces (@fleet/api, engine, shared, web).
- `npm run build` — **pass** (web Vite build; pre-existing >500 kB chunk warning only). Built bundle contains `Build v25` (`v25` constant) and "Prediction Markets Assistant"; browser-tab title fixed to "Prediction Markets Assistant" (was still the fleet title in `index.html`).
- Harnesses (mocked, no broker): polycrypt 21/21, kalshi 20/20, wesley 22/22 (inert on this branch, still passes).
- Tools tests: test-keys-v21 32/32, test-keys-v21-1 34/34, test-smoke-v21 11/11, test-reset-v22 21/21, test-option-contracts-v23 21/21, test-weather-v24 32/32.
- Two fleet-test expectations were adapted to this branch (not fudged): test-smoke-v21 now asserts the loader filter itself (exactly 1 bot, PolyCrypt9000) and waits for events from every *loaded* bot; test-reset-v22's seed threshold is ≥10 events for the single bot instead of ≥30 for five (observed ~15 in the window). The reset mechanics themselves were never in question — history wipes to exactly one DATA_RESET audit event, books return to $10,000, resume works.
- NOT verified here (needs Keith's own keys, which never enter this environment): the live happy path — Kalshi demo key in `~/traderbot-keys.txt` on the VM → Paper mode → a real Kalshi demo order fills. Same open item as v21 on the fleet app.

## Deploy (VM — Keith's step, not done by the agent)
The VM currently tracks `polymarket-only`. Switch it to the new branch first, then pull + rebuild:
```
cd ~/apps/prediction-markets-only/auto-bots-traders
git checkout prediction-markets-assistant
git pull
cd app
docker compose up -d --build
```
Then open http://100.105.73.95:4173 and confirm the header reads **Build v25**. To use paper mode: put the keys file on the VM host and set `TRADERBOT_KEYS_FILE` in `app/.env` to its path (Kalshi demo key **must be RSA**, not Ed25519 — the app signs RSA-PSS), then flip the dashboard mode switch to Paper and check `Paper keys: Alpaca ✓ · Kalshi ✓`.
