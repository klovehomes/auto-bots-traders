# v34 — Per-bot performance reports generator

Keith's request (2026-11-19): *"We must add a reports generator per bot so that AI can analyze each bot's performance over a timeframe"* — with a screenshot of a broker Totals panel (Total Gains +$47,467.14 / Total Losses −$38,806.71 / Net Gain +$8,660.43 / Gain/Loss Ratio 55.02%). The reports below use that panel's exact terms and formula, computed per bot from the fleet's own event history.

Built locally on v33 (Build v33, XRP). **Not pushed** — parent presents, Keith approves the push. No snapshot-sync manifest.

## What you get

For any bot, over any timeframe, a self-describing performance report — JSON (the canonical AI input: bot, timeframe, generator version, full trade list, caveats) and a Markdown twin for humans:

- **Totals** in the screenshot's terms: Total Gains, Total Losses, Net Gain, Gain/Loss Ratio = gains / (gains + |losses|) — verified to reproduce 55.02% from the screenshot's numbers.
- **Metrics**: wins/losses/breakevens, win rate, profit factor, average win/loss, largest win/loss, expectancy per trade, opens/closes, max drawdown (USD, and % when an equity base is supplied), net PnL %.
- **Trades**: opens FIFO-matched to closes per symbol (entry price/time, hold hours, exit reason, PnL, decision id). A close whose open predates the window still counts its PnL and is flagged `entryKnown: false`.
- **Breakdowns**: per-symbol (trades, wins, win rate, net PnL) and per-day realized PnL (UTC dates).
- **Decisions**: signal / approved / rejected counts, top Risk Gate veto reasons, exit-reason breakdown, the first and last `params snapshot:` in the window (so parameter changes are visible in the analysis), and decision data classes (protected real-runner vs sim — with a caveat in the report whenever sim data is in the window).
- **Caveats, always**: realized PnL only (open positions listed at entry, never marked to market); % metrics are null — never computed against an invented equity base — unless a starting equity is provided.

## Where it lives

- **`app/packages/shared/src/reports.ts`** — the one pure implementation (`generateBotReport`, `generateFleetReports`, `renderBotReportMarkdown`, `renderFleetReportMarkdown`); no Node imports, so the web dashboard can import it later. Exported from `@fleet/shared` (index + a `./reports` package export).
- **API endpoints** (`app/packages/api/src/index.ts`), same trust boundary as `GET /events/history`:
  - `GET /reports?from=ISO&to=ISO&days=N&startingEquity=N` — all bots (from `loadBots`; falls back to bots present in events).
  - `GET /reports/:bot?format=json|md` — one bot; unknown bot → 404; invalid dates → 400. `days` applies only when `from` is absent.
- **CLI** (`app/packages/api/src/report-cli.ts`): `npm run report --workspace @fleet/api -- --bot snapback --days 30 [--format json|md] [--startingEquity 10000] [--history <path>] [--out <path>]`. History loader accepts the v2 persisted shape, a `{events:[...]}` snapshot, or a bare array; a missing/unparseable file is a clear stderr error, exit 1.

## Verification (actual outputs)

- **New harness `app/tools/test-reports-v34.ts`: 38/38** — the screenshot formula (55.02 / 8660.43 / profit factor 1.2232), FIFO across two opens of one symbol, matched win (24 h hold, exit-reason extraction), matched loss, unmatched close + caveat, approved/rejected counts + top veto reason ("daily loss cap reached"), params snapshot first/last, protected-vs-sim data classes, out-of-window exclusion, per-symbol/per-day, drawdown with and without an equity base, bot isolation, fleet generation, Markdown Totals terms.
- **Typecheck (4 packages) + full build green**; built web bundle grep-verified for `"v34"`.
- **CLI** run against the harness's synthetic history (md + json + fleet-md via `npm run report`): succeeds; missing history file → `[report] history file not found`, exit 1.
- **Live API e2e (sandbox)**: booted the real API against the synthetic history (17 retained events) — `GET /reports/snapback` returned net +100, 4 closes, ratio 75.00; `GET /reports` returned all five bots; `format=md` served `text/markdown; charset=utf-8`; unknown bot → 404; `from=banana` → 400.
- **Samples** at repo root: `sample-report-snapback.md` / `sample-report-snapback.json`, both labelled SYNTHETIC SAMPLE DATA (generated from the harness fixtures — not real trading history).

## Dual-app parity (deliberate difference, recorded)

The Prediction Markets Assistant app (latest snapshot `~/workspace/pm-mobile-trade-stream`, Build v28) does **NOT** get this in v34. It runs only PolyCrypt9000 and keeps its own history store, so there is no five-bot reporting surface to add there yet. The generator itself is shared code (`@fleet/shared/reports.ts` pattern), so a PM port is a cherry-pick of `reports.ts` + the two endpoints into the PM app's API — deferred to a PM phase at Keith's call, not silently skipped. Fleet header reads **Build v34** after deploy; the PM header stays **Build v28** until that port lands.

## Keith's steps after the push

1. On each VM: `git pull --rebase`, then in `app/`: `docker compose up -d --build` (header will read **Build v34**).
2. First real check: `curl localhost:8080/reports/snapback?days=7` (port per that VM's setup) — or run the CLI inside the api container against `/data/event-history.json` — and hand the JSON to the AI for analysis.
3. Deploy is pending on both VMs; nothing here is live until Keith deploys.
