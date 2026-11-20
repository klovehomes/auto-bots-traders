# Phase v37 — Schwab integration (fleet five-bot app)

Keith's decision (2026-11-20, Multi-user rewrite planning chat; build
authorized the same day in the app planning chat): Schwab is added as a
feature INSIDE the fleet app — one codebase, no separate app — running
as a separate deployment instance when live. This document records
what was built, the design choices, the verification, and what remains
Keith's to do on the Schwab side. **Nothing in this build has talked
to the real Schwab API** — every Schwab HTTP call in code goes through
an injectable client, and all verification ran against a mocked
Schwab server. Keith's Schwab app is not approved yet, so the first
live OAuth + verify can only happen through the wizard once his app
is Ready For Use.

## What shipped

### Shared (`app/packages/shared`)
- `keys.ts`: the loader now resolves `SCHWAB_APP_KEY` /
  `SCHWAB_APP_SECRET` with the same discipline as Alpaca/Kalshi —
  keys file first, environment fallback, both-or-neither, and the
  status surface exposes only presence, source, and the app key's
  last 4. `KeysStatus` gains a `schwab` provider entry;
  `describeKeysStatus` reports it; a properly named
  `resetPaperKeysCache()` was added (the API calls it after a
  credential save so the new values are live without a restart).
- NEW `schwab.ts` — the Schwab core, shared because BOTH the API
  (OAuth, verify, test endpoints) and the engine (execution adapter)
  need it, and the monorepo's package graph only meets at shared:
  - `SchwabClient` — all HTTP via an injectable `fetchImpl`
    (default: global fetch). OAuth token exchange/refresh, account
    hash lookup (instance-cached), account/positions/orders reads,
    order place (order id parsed from the 201 `Location` header),
    preview, cancel. Schwab response shapes are mapped once, here
    (including the quantity-weighted fill average from
    `orderActivityCollection` execution legs).
  - Token store — a JSON file OUTSIDE the repo holding access +
    refresh tokens and issue times: `TRADERBOT_SCHWAB_TOKEN_FILE`,
    default `~/traderbot-schwab-tokens.json`. Atomic tmp+rename
    writes, mode 0600. Tokens are never logged and never appear in
    any status surface (the harness asserts the public status has no
    token fields at all).
  - Refresh semantics: the access token auto-refreshes inside a
    60-second skew window. Schwab's 7-day refresh window is anchored
    at the ORIGINAL authorization and does not reset on refresh —
    when Schwab rotates the refresh token, the new token is stored
    but the original `refreshIssuedAt` anchor is kept, so the
    days-left math (ceil of remaining days, 0 when expired) stays
    honest. States: `no-key` / `not-authorized` / `authorized` /
    `expired`, composed into `schwabPublicStatus()` =
    `{ configured, last4, state, refreshDaysLeft, live: true }`.
  - `buildEquityOrderBody` (Schwab's documented equity shape),
    `extractSchwabAuthCode` (bare code OR a pasted full redirect
    URL), `buildSchwabAuthUrl`, `deriveSchwabWizardStep` (pure:
    no credentials → 4, not-authorized/expired → 5, authorized but
    unverified → 6, verified → 7).

### Engine (`app/packages/engine`)
- NEW `venue.ts` — the single gate every Schwab order path goes
  through. Venue comes from the bot file's existing `broker:` field
  (default `alpaca`). `effectiveMode()` applies the fleet MODE
  ceiling (a bot's mode can sit below the fleet mode, never above).
  Schwab is refused, with a plain-language reason, for: PolyCrypt9000
  (excluded entirely — Schwab has no crypto or prediction markets),
  Vega and Wesley (Schwab options contract mapping not yet
  verified), any bot whose effective mode is not CONNECTED, and any
  unrecognized venue string.
- NEW `schwab.ts` — the execution adapter: wraps the shared client
  into the runners' existing `AlpacaClientLike` surface. Execution
  (account, positions, open orders, order place/cancel,
  close-position) goes to Schwab with Schwab shapes mapped onto the
  internal ones (status map FILLED→filled, CANCELED→canceled, …;
  net qty = long − short; zero rows skipped). **Market data stays on
  Alpaca**: bars/clock/latest-price delegate to the Alpaca client.
  Options methods throw — Vega/Wesley can never reach this adapter
  (the venue gate refuses them first). One mapping to know: Trendia's
  market-on-open (`opg`) orders become Schwab DAY market orders — a
  DAY market order placed after the close queues for the next
  session's open, which is the same economic fill.
- `index.ts` wiring, deliberately surgical:
  - Paper branch: Trendia/Snapback with `broker: schwab` are
    venue-resolved before startup; the ceiling makes that resolution
    fail in paper mode, so the bot gets one clear NO-TRADE decision
    record (the reason + "running on the simulator until its Schwab
    venue can serve it") and falls back to the simulator — the same
    shape as the missing-keys path. Alpaca behavior for all five bots
    is unchanged (every regression suite below passes at its v36
    counts).
  - Connected branch: the pre-v37 guardrail (paper check + test
    emitter) still covers everything EXCEPT a Schwab-assigned
    Trendia/Snapback. Such a bot, when the venue gate passes AND the
    Schwab connection is authorized, runs its real runner on the
    Schwab execution client behind the same Risk Gate control router
    (kill switch semantics untouched), with a loud
    `⚠ <name> is LIVE on Schwab (CONNECTED)` boot log. When the gate
    fails or Schwab isn't authorized, the bot gets one
    `CONNECTED · NO TRADE — …` record instead. Live-started bots are
    excluded from the test emitter.

### API (`app/packages/api`)
- `GET /keys/status` now returns the composed public Schwab object
  (`{ configured, last4, state, refreshDaysLeft, live: true }`) in
  place of the loader's provider-level field.
- NEW `schwab.ts` routes (same private-network trust boundary as the
  kill switch; no response ever contains a secret, a token, or a
  full account number):
  - `GET /schwab/status` — public status, last-verified summary,
    derived wizard step, callback URL, and per-bot venue/eligibility
    read fresh from the bot files.
  - `POST /schwab/credentials` — writes App Key/Secret into the keys
    file at the loader's path (lines replaced in place or appended,
    everything else preserved byte-for-byte), then resets the loader
    cache. The submitted values are never echoed.
  - `GET /schwab/auth-url`, `POST /schwab/oauth/exchange` (bare code
    or pasted redirect URL), `GET /schwab/callback` (the OAuth
    landing route — returns a small static HTML page, renders no
    code/token/secret).
  - `POST /schwab/verify` — read-only: account hash, balances,
    positions; persists a masked last-verified summary
    (account "…last4", equity, cash, position count) into the token
    record.
  - `POST /schwab/test/preview` and `POST /schwab/test/place-cancel`
    — the test sequence. Place-and-cancel refuses unless the request
    carries `confirmLiveTest: true`, and its refusal text states
    plainly that Schwab has NO paper mode and this places a REAL
    order (1 share of AAPL, limit $1.00 — far below market, cancelled
    immediately). A cancel failure answers 502 naming the order id
    so it can be cancelled manually in Schwab.
  - `POST /schwab/venue` — per-bot venue assignment by line-editing
    the bot's .md frontmatter (the appendCandidate discipline —
    never a YAML re-serialize), optionally setting `mode: connected`
    for the per-bot go-live. Refuses Schwab for Vega/Wesley/
    PolyCrypt9000 with the reasons. Takes effect on engine restart;
    the response says so, and the in-memory bot entry is refreshed.

### Web (`app/packages/web`)
- `BUILD_VERSION` "v36" → "v37".
- The keys readout gains the **Schwab chip** next to Alpaca/Kalshi:
  **LIVE tag + red outline** (Schwab-only styling — the other chips
  are untouched), text driven by the token state: "no key" /
  "not authorized" / "✓ · refresh Nd left" / "expired — re-login
  needed". A button beside it opens the wizard ("Schwab setup", or
  "Schwab re-login" when expired).
- NEW `SchwabWizard.tsx` — the 8-step setup wizard as a modal in the
  existing UI patterns: 1 account check (funded; options-approval
  note for Vega/Wesley), 2 developer portal (copyable callback
  `https://127.0.0.1:8182` and 120 orders/min), 3 approval wait
  (Ready For Use guidance; resumable, non-blocking), 4 app
  credentials paste (into the app only), 5 OAuth connect (launch
  Schwab login; paste-the-URL/code fallback, with the plain
  explanation that the 127.0.0.1 page erroring is expected), 6
  verify (read-only check; lights the chip), 7 test sequence
  (preview, then the confirm-gated 1-share limit-away-and-cancel,
  under a "Schwab has NO paper mode — the first real order is live
  money" warning), 8 assign + go live (Trendia/Snapback selectable;
  Vega/Wesley disabled with the options-mapping reason; PolyCrypt
  shown as excluded). Progress derives from real system state
  (credentials present? tokens valid? verified?), so reopening the
  wizard resumes at the right step — and step 5 is the re-login home
  when the 7-day refresh token nears expiry.

### Deployment (`app/docker-compose.yml`, `app/.env.example`)
- The token store must be writable and persistent (tokens refresh),
  and the keys file is mounted read-only — so tokens do NOT live in
  or next to the keys file. Compose sets
  `TRADERBOT_SCHWAB_TOKEN_FILE: /data/schwab-tokens.json` for the api
  and engine services: the shared fleet-data volume both already
  mount read-write.
- The api service's keys-file mount loses its `:ro`: the API is now
  the writer for the wizard's credential save (the v30
  writable-bots precedent — the API already writes bot files; the
  engine's mount stays read-only).

## Design choices worth naming

- **OAuth callback approach.** The registered callback is
  `https://127.0.0.1:8182`, which matches neither the Docker
  dashboard port (4173) nor the API port (8080), and 8182 is an
  HTTPS URL on the user's own machine while the app serves plain
  HTTP locally. So the **primary path is paste-the-URL**: Keith logs
  in at Schwab, the redirect lands on a dead 127.0.0.1:8182 page
  (expected), he copies the full address-bar URL into wizard step 5,
  and the API extracts the code and exchanges it. The
  `GET /schwab/callback` API route also exists and performs the same
  exchange for any deployment where the browser CAN reach the API
  (e.g. a local non-Docker run with a hosts/proxy mapping for
  127.0.0.1:8182) — it is not the path the Docker deployment relies
  on, and the wizard copy says so honestly.
- **Core client in shared, not engine.** The brief put the adapter
  next to `alpaca.ts`; the adapter IS there (`engine/src/schwab.ts`).
  The HTTP/token core sits in shared because the API package cannot
  import from the engine package, and the wizard's OAuth/verify/test
  endpoints need the same client. One implementation, two consumers.
- **Venue = the bot file's `broker:` field**, which already existed
  in every bot file (`broker: alpaca`). No new config format was
  invented; the wizard's assignment endpoint edits that line (and
  `mode:` for go-live), effective on engine restart like every other
  bot-file change (the v30 candidates precedent).
- **Single Schwab account assumption**: the first account returned
  by `accountNumbers` is the trading account (Keith's setup has one
  brokerage account for the bots). Noted in the shared module header.

## Verification (all run in the sandbox, 2026-11-20)

- `npm run typecheck` — PASS (all four workspaces).
- `npm run build` — PASS; the built web bundle contains the `v37`
  version string, the Schwab chip CSS (`key-chip-schwab`), and the
  wizard code.
- NEW `app/tools/test-schwab-v37.ts` — **153/153 checks passed**
  (run twice, plus once more at integration). Fully mocked Schwab
  HTTP (an injected fake fetch playing Schwab, recording every
  request): token exchange + 0600 on-disk storage, Basic-auth header
  and form body shape, code extraction (bare / full URL /
  URL-encoded / error-param / garbage), refresh rotation with the
  7-day anchor preserved and days-left = 4 at day 3, expiry math and
  all four chip states, account-hash caching (2 calls → 1 network
  hit), equity payload shapes (market buy/sell, limit, price as
  "1.00" string), place (Location-header id), preview, cancel,
  positions mapping incl. the weighted fill average 101.2, engine
  adapter mapping (net-zero position skipped, OCC-symbol and GTC
  refusals, null-data error, closePosition SELL), redaction (no fake
  secret/token/full-key string in any public payload; the public
  status has no token fields at all), venue gating (ceiling in both
  directions, Vega/Wesley/PolyCrypt refusals, unknown venue), and
  wizard-step derivation.
- Regression — every pre-existing suite at its v36 counts:
  tools: history 25/25, keys 32/32, keys-v21-1 34/34, landscape
  15/15, option-contracts 21/21, reports 38/38, reset 21/21, smoke
  11/11, weather 32/32. Engine harnesses: kalshi 20/20, mode 47/47,
  polycrypt 24/24, snapback 56/56, vega 59/59, wesley 27/27.

## Deliberate exclusions

- **No PM-app port.** The Prediction Markets Assistant app is
  PolyCrypt9000-only, and PolyCrypt9000 is Schwab-excluded — there
  is nothing to port. (Dual-app parity checked and consciously not
  applied.)
- **No Schwab for Vega/Wesley** until Schwab options contract
  mapping is verified; the refusal is enforced in the venue gate,
  the assignment endpoint, and the wizard UI alike.
- **No live-mode changes for Alpaca.** CONNECTED + Alpaca keeps its
  pre-v37 guardrail behavior; v37's live path is Schwab-only.
- The readonly Cloudflare showcase is untouched (no keys surface).

## Known cosmetic limits (honest list)

- Decision records written by the Trendia/Snapback runners still
  carry their `PAPER ·` reason prefix when running live on Schwab in
  the connected deployment — the prefix is baked into the runners'
  reason strings (pre-v37) and changing it fleet-wide was out of
  scope for the venue change. The boot log and the bots' venue/mode
  fields state the live Schwab status unambiguously.
- In the connected deployment, bots that were skipped (venue or
  authorization) still receive the guardrail test emitter's events,
  as every non-started bot did pre-v37; only live-started bots are
  excluded from it.
- Token-store contention: the API and the engine both read the token
  file fresh before use and writes are atomic, but two processes
  refreshing in the same instant is not locked against. In practice
  only the engine refreshes during trading; the wizard's flows are
  user-paced. Noted, not solved, in v37.

## What remains Keith's

1. Schwab-side setup (his steps, in wizard order): funded Schwab
   account (+ options approval at the right level if Vega/Wesley are
   ever included), register at developer.schwab.com as an Individual
   Developer, request Trader API – Individual access, create the app
   with callback `https://127.0.0.1:8182` and 120 orders/min, and wait
   for **Ready For Use** (Schwab-side: ~2 business days product
   review + a few days app approval). App Key/Secret are entered by
   Keith directly into the wizard — never in chat.
2. The first live OAuth connect, verify, and test sequence can only
   happen through the wizard after Ready For Use; none of it is
   exercisable in the sandbox, and no sandbox result above should be
   read as evidence about Schwab's live responses.
3. Going live stays per-bot and Keith's call only: assign the venue
   (+ set the bot live) in wizard step 8, then run the separate
   CONNECTED deployment instance. Deploying v37 itself is the usual
   `git pull` + `docker compose up -d --build` once pushed; the
   dashboard header will read **Build v37**. NOT pushed by this
   build — local commits only, awaiting Keith's push call.
