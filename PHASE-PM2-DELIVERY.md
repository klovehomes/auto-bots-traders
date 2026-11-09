# Phase PM2 — Cloudflare showcase for the Polymarket-only version

## Purpose

A public, read-only Cloudflare Pages showcase for the
`polymarket-only` variant (single bot: PolyCrypt9000, dashboard
title "Prediction Markets Assistant"), following the Phase 8 (v16)
showcase pattern: a separate entry tree that polls a published
`snapshot.json` — no WebSocket, no kill switch, no mode switch, no
control code in the bundle at all.

**Ungated v1.** There is no email gate in this package. The gate
(Pages Functions + D1 + Resend, Phase 9 / v17) stays a `readonly`-
branch feature for now and can be ported later from that pattern
if Keith wants registration on this site too.

## What was ported / trimmed

- `app/packages/web/src/showcase.tsx` — trimmed to the single bot:
  h1 "Prediction Markets Assistant"; subtitle "Polymarket-only
  trader — Polymarket shadow sleeve + BTC / ETH / SOL breakout
  sleeve. Watch PolyCrypt9000 trade on paper, live-ish and in
  public."; banner "…a few minutes behind the bot."; totals labels
  "Bot equity (paper)" / "Bot"; footer "· Prediction Markets
  Assistant — public showcase". The READ-ONLY banner, the "Paper
  trading with simulated funds. Not investment advice." footer, and
  all snapshot logic are unchanged.
- `app/packages/web/index-showcase.html` — title "Prediction
  Markets Assistant — Read-Only Showcase".
- `app/packages/web/vite.showcase.config.ts` — the gate entry was
  removed from the rollup inputs (showcase entry only); gate source
  files remain in the tree, unbuilt.
- `app/tools/make-sample-snapshot.mjs` — sample snapshot rewritten
  to exactly one bot: PolyCrypt9000, SIM-labelled events, $10,000
  start; publisher math derives $10,017.45 with one SOL/USD
  breakout position open. Regenerated
  `app/packages/web/public/snapshot.json`.
- `app/tools/test-publish-snapshot.mjs` — the one hardcoded
  five-bot sample check (Snapback's $9,997.08 book) replaced with
  the single-bot equivalents: exactly 1 bot, PolyCrypt9000 at
  $10,017.45.
- Unchanged and reused as-is: `showcase-main.tsx`,
  `app/tools/publish-snapshot.mjs` (sanitized publisher with the
  denylist tripwire).

## The snapshot in the package

**Fresh sim-run snapshot (not the sample).** The stack from this
tree was run locally in MODE=sim for ~150 seconds; PolyCrypt9000
accumulated 13 opens / 12 closes, and the publisher produced the
package's `snapshot.json` from the live API: 1 bot (polycrypt9000),
equity $10,088.52, day PnL $88.52, 26 trades / 26 decisions,
fleetMode "sim". It is simulator data by design — PolyCrypt9000's
real/shadow runners are still future phases — and the showcase
labels the mode honestly (SIMULATED DATA badge). The regenerated
sample snapshot remains in `packages/web/public/` as the in-repo
placeholder.

## Verification (2026-11-08)

- `npm run typecheck` (app root) — PASS, all workspaces.
- `npm run build` (private dashboard) — PASS.
- Showcase build — PASS via `npm run build:showcase --workspace
  @fleet/web` (note: the app root has no `build:showcase` script;
  it lives in the web workspace). Emitted `index-showcase.html`
  and NO gate HTML.
- Publisher harness `node tools/test-publish-snapshot.mjs` —
  23/23 PASS (first run failed exactly one check: the stale
  Snapback sample assertion, updated as described above).
- Bundle grep over the showcase `dist/`: the JS bundle has ZERO
  hits for `kill`, `/control`, `WebSocket`, `fleet-mode`. The only
  hits anywhere are `.kill…` class names in the shared stylesheet
  (presentational CSS shared with the private dashboard; the
  components that use those classes are not in this bundle).
- Staged package served locally: `index.html` 200 (title
  "Prediction Markets Assistant — Read-Only Showcase"),
  `snapshot.json` 200 with exactly 1 bot, avatar webp 200.

## The package

`prediction-markets-showcase-v1.zip` — site root contains
`index.html` (the renamed showcase page), `assets/`, `avatars/`
(incl. `polycrypt9000.webp`), `snapshot.json` (the fresh sim-run
snapshot), and `traderbot-logo.png`. No gate files.

## Keith's deploy steps

1. Unzip the package, then from inside the unzipped folder:
   `npx wrangler pages deploy . --project-name prediction-markets`
   → serves at `prediction-markets.pages.dev` (a NEW project; the
   five-bot `traderbots` showcase is untouched).
2. Refresh the data later: with the app stack running on the Mac,
   from `app/` run
   `node tools/publish-snapshot.mjs --api http://localhost:8080 --out snapshot.json`,
   replace the deployed site's `snapshot.json` with the new file
   (redeploy the folder, or upload just the file) — no rebuild
   needed; the page picks it up within a minute.
3. Optional later: add the email gate from the `readonly` pattern
   (D1 + Pages Functions + Resend) as a PM3 phase.
