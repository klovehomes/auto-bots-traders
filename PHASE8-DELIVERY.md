# Phase 8 (v16 — the public READ-ONLY showcase, Phase A)

Keith's idea (2026-11-05): a separate, public, read-only version of
the dashboard on its own URL, to promote the TraderBot system while
the paper track record builds. This phase is the showcase itself.
The email gate (Phase B) and milestone letters (Phase C) are NOT
built — see "Honest limits" below.

## The shape of it

```
private stack (Mac / VPS)                public (Cloudflare Pages)
┌─────────────────────────┐   snapshot   ┌────────────────────────┐
│ engine → API (private)  │ ───────────▶ │ showcase page (static) │
│        ▲ publisher      │  .json file  │ polls snapshot.json    │
│ tools/publish-          │              │ every 60 s             │
│   snapshot.mjs          │              │ NO controls, NO socket │
└─────────────────────────┘              └────────────────────────┘
```

The public page never talks to the private API. A standalone
publisher tool reads the API's **existing read-only GET endpoints**
(`/health`, `/bots`, `/events/history`) and writes ONE sanitized
`snapshot.json`; the showcase page polls that file. The delay is the
security model: the public sees a minutes-old, field-whitelisted,
denylist-scanned extract — never a live connection, never the
control surface.

## 1) Showcase build flavor (packages/web)

A **separate entry tree**, chosen at build time — `src/App.tsx` and
`src/main.tsx` are byte-for-byte untouched, so the private build
cannot regress:

- `index-showcase.html` → `src/showcase-main.tsx` → `src/showcase.tsx`
  (`ShowcaseApp`), selected by `vite.showcase.config.ts`
  (`npm run build:showcase` in the web package).
- App.tsx — the kill switch, the arm toggle, the mode switch, every
  `/control` and `/mode` code path, the WebSocket client — is never
  imported by this entry, so **none of that code exists in the
  showcase bundle** (grep-verified, below). Shared with the private
  dashboard are only presentational pieces: `Landscape`,
  `Leaderboard`, `avatars`, `fleetState` formatters.
- No WebSocket. State loads from `snapshot.json` (path overridable
  with `VITE_SNAPSHOT_URL`, baked in at build time like v15's
  `VITE_API_URL`) and re-polls every 60 s; a failed refresh keeps the
  last good snapshot on screen and says so.
- The snapshot adapter (`botConfigFor` / `statsForBot` /
  `snapshotEvents` in showcase.tsx) maps the snapshot schema onto the
  shapes the shared components already consume: landscape with live
  balances, leaderboard, bot rows, trade stream, decisions list, and
  a read-only building-inspect dialog (holdings + recent trades,
  marks shown when the publisher has them — no buttons but Close).
  New opens/closes in a fresh snapshot still fire the landscape's
  beam effects.
- Persistent banner, top of page: **"READ-ONLY SHOWCASE — PAPER
  TRADING"**. Footer: **"Paper trading with simulated funds. Not
  investment advice."**
- Build plumbing mirrors v15: the web Dockerfile takes
  `VITE_SHOWCASE` / `VITE_SNAPSHOT_URL` build args and runs
  `build:showcase` when `VITE_SHOWCASE=1`; Compose gains an additive
  `showcase` service (port 4174) — the existing `web` service is
  unchanged. `SNAPSHOT_URL` in app/.env feeds the arg.
- Default (non-showcase) build verified behaviorally unchanged: same
  entry, same WS flow, controls present in its bundle as before.

## 2) Publisher (app/tools/publish-snapshot.mjs)

Plain Node ≥ 18, no dependencies. Run it where the private stack
runs:

```
node tools/publish-snapshot.mjs --api http://localhost:8080 --out ./snapshot.json
```

- Reads ONLY `GET /health`, `GET /bots`, `GET /events/history`. It
  never calls `/control` or `/mode`. **No API or engine changes were
  needed at all** — balances and open positions are derived by
  replaying the retained event history (equity = $10,000 + realized
  PnL; a close retires the oldest open for that symbol), the same
  math the private dashboard runs client-side. Live price marks are
  NOT available from the API, so `currentPrice` / `unrealizedPnL`
  are omitted from positions rather than invented.
- Output is written atomically (tmp file + rename). Any failure —
  API down, invalid data, denylist hit — exits non-zero with a plain
  message and leaves an existing snapshot byte-for-byte untouched.

### Snapshot schema (version 1)

```jsonc
{
  "version": 1,
  "generatedAt": "ISO-8601",
  "fleetMode": "paper",
  "bots": [{
    "codename": "snapback", "displayName": "Snapback",
    "color": "#a78bfa", "mode": "paper",
    "balance": 9997.08, "dayPnL": 0,
    "positions": [{ "symbol": "TSLA", "qty": 5, "side": "buy",
                    "avgEntry": 389.03,
                    "currentPrice": null,        // optional; omitted when unknown
                    "unrealizedPnL": null }]     // optional; omitted when unknown
  }],
  "recentTrades":   [ /* event objects, newest first, cap 50 */ ],
  "recentDecisions":[ /* decision-bearing events, newest first, cap 50 */ ],
  "totals": { "equity": 50059.33, "dayPnL": 62.25 }
}
```

Event objects carry ONLY: `bot, type, decision_id, symbol, side,
qty, price, pnl, reason, ts`. `dayPnL` uses the publisher host's
local day boundary.

### Sanitization — the point of the tool

Two layers:

1. **Whitelist by construction.** Bot entries and events are rebuilt
   field-by-field from the lists above. A bot config is never copied
   wholesale, so `sourcePath` (local file paths), the bot files'
   prose, raw frontmatter, and any future config field cannot leak.
2. **Denylist scan of the serialized output** before writing; one
   hit refuses the write and exits non-zero:
   - Alpaca-style broker key ids: `\b[AP]K[A-Z0-9]{10,}\b` (`PK…`/`AK…`)
   - UUIDs (account-identifier shape)
   - Email addresses
   - Local filesystem paths (`/Users/…`, `/home/…`, `C:\…`, the
     literal `sourcePath`)
   - Control internals: `kill-liquidate`, `/control/`,
     `x-internal-token`, `INTERNAL_EVENT_TOKEN`, `control-state.json`
   - Plus the literal value of `INTERNAL_EVENT_TOKEN` when that env
     var is set in the publisher's environment.

## 3) Sample snapshot + static zip

- `tools/make-sample-snapshot.mjs` generates
  `packages/web/public/snapshot.json` — **SAMPLE DATA**, hand-shaped
  to the fleet's known 2026-11-05 state (it is not live output):
  Trendia and Vega at untouched $10,000 paper books with their real
  NO TRADE / no-signal decisions; **Snapback at $9,997.08** with her
  two real 2026-11-04 TSLA round trips (−$1.12, −$1.80 — day PnL 0,
  they were yesterday's); Wesley and PolyCrypt9000 still simulator
  bots, with SIM-labelled sample activity. Timestamps are relative
  to generation time; re-run the generator to refresh them. A
  showcase build serves this file by default until a real published
  snapshot replaces it.
- `~/workspace/your_files/traderbots-showcase-v16.zip` — the ready
  static site: showcase build output with `index.html` at the root
  and the sample `snapshot.json` beside it, packaged exactly like
  the earlier Cloudflare test zip. Upload it as-is; no build step
  needed on the Mac.

## Mac steps

**Deploy / refresh the public site (Cloudflare Pages):**
1. Upload `traderbots-showcase-v16.zip` the same way as the earlier
   static test (wrangler pages deploy of the unzipped folder, or the
   Pages upload flow). It comes up immediately with the sample data.
2. A *site* refresh (new code) only happens when a new zip ships.
   A *data* refresh is just replacing `snapshot.json` — see below.

**Publish REAL data (the refresh cycle):**
1. With the private stack running (`docker compose up -d`), from
   the `app/` folder:
   `node tools/publish-snapshot.mjs --api http://localhost:8080 --out ./snapshot.json`
2. Put that `snapshot.json` where the showcase page can fetch it:
   drop it next to the deployed site (re-deploy the folder with the
   new file, or upload just the file if the host allows it). The
   page picks it up within a minute — no site rebuild.
3. To keep it hands-off later, run the publisher on a timer
   (launchd/cron every few minutes) and sync the file to the host;
   that automation is deliberately not built yet — manual first, so
   Keith sees exactly what leaves the machine. The publisher prints
   a one-line summary of what it wrote, and refuses loudly if the
   sanitization scan ever trips.

**Optional local preview of the flavor:**
`docker compose up -d --build showcase` → http://localhost:4174
(reads the baked-in sample snapshot; it has no API connection).

## Verification (run on the build VM, 2026-11-05)

- Root `npm run build` (typecheck + all workspaces, default
  flavor): clean. Web `build:showcase`: clean.
- Bundle grep assertions on the showcase JS: `kill-liquidate`,
  `/control`, `kill switch`, `TEAM KILL`, `WebSocket`,
  `fleet-mode-select`, `/mode`, `liquidate`, `resume` — **all
  absent**. `READ-ONLY SHOWCASE`, `Not investment advice`,
  `snapshot.json` — **present**. Default bundle sanity-checked the
  other way (controls present, showcase banner absent).
- Publisher harness (`node tools/test-publish-snapshot.mjs`) —
  **22/22 checks pass**: fixture API → schema-valid snapshot with
  exact balance math and local paths/prose absent; poisoned
  fixtures (email, broker key id in a decision reason) → non-zero
  exit, write refused, pre-existing file untouched; API down →
  non-zero exit, existing snapshot byte-for-byte intact; shipped
  sample snapshot → schema-valid, scan-clean, Snapback $9,997.08.
- Live end-to-end on this VM: the real API booted in simulator
  mode, publisher ran against it — valid snapshot, 5 bots at their
  $10,000 starts, no local paths in the output.
- Zip smoke test: unzipped and served locally — `index.html`,
  the JS bundle, and `snapshot.json` all return HTTP 200.
- `docker-compose.yml` parses; the `showcase` service's build args
  confirmed in the parsed YAML.

## Files

- `app/tools/publish-snapshot.mjs` — the publisher (new).
- `app/tools/test-publish-snapshot.mjs` — its fixture harness (new).
- `app/tools/make-sample-snapshot.mjs` — sample generator (new).
- `app/packages/web/public/snapshot.json` — the sample (new).
- `app/packages/web/index-showcase.html`, `src/showcase-main.tsx`,
  `src/showcase.tsx`, `vite.showcase.config.ts` — showcase entry
  tree (new). `src/App.tsx` / `src/main.tsx`: untouched.
- `app/packages/web/package.json` — `build:showcase` script.
- `app/packages/web/src/vite-env.d.ts` — `VITE_SNAPSHOT_URL` typing.
- `app/packages/web/src/styles.css` — appended showcase-only classes.
- `app/packages/web/Dockerfile` — `VITE_SHOWCASE` / `VITE_SNAPSHOT_URL`
  args + flavor-conditional build.
- `app/docker-compose.yml` — additive `showcase` service.
- `app/.env.example` — `SNAPSHOT_URL` documented.
- No changes: API package, engine package, shared package, bot files.

## Honest limits

- **Stale by design.** The public view is a snapshot — minutes
  behind, refreshed only when the publisher runs and the file is
  re-uploaded. There is no live feed and no live price marks
  (positions show entry prices; unrealized PnL appears only if a
  future publisher source provides marks).
- **Balances are history-derived.** Equity/day-PnL come from the
  API's retained event history (5,000 decisions + 1,000 other
  events) — the same window the private dashboard itself shows.
- **Phases B and C are not built.** No email gate, no registration
  list, no activation codes, no milestone detection, no letters.
  The site is public to anyone with the URL.
- The promotion line stands: the page promotes the system and its
  story — paper trading, labelled as such. It makes no investment
  offer and no return promises; counsel blesses any future fund use
  of an audience built here before that use happens.
