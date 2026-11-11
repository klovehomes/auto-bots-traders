# Phase v21 — Local key-file loader + paper trading for all five bots

Keith's direction (2026-11-10): the app pulls the keys it needs for
Alpaca and Kalshi **paper** trading from a **local text file** on his
Mac (a vault integration comes later — the loader is designed so the
source can be swapped), and **all five bots can paper trade**.
`BUILD_VERSION` default bumped `v20` → `v21` (the version line under
"Trader Bot Landscape" from v20 is unchanged; the `BUILD_VERSION`
env override still wins).

Local commit on `dev`, on top of v20 (`0f93dbe`). **Not pushed** —
Keith reviews first, as always.

---

## Part 1 — the key-file loader

One implementation, in the shared package so engine and API read the
exact same parse: `app/packages/shared/src/keys.ts`, exported from
`@fleet/shared` and the `@fleet/shared/keys` subpath.

- **Source file**: env `KEYS_FILE`, default `~/traderbot-keys.txt`
  (`~` expanded). The default lives **outside the repo on purpose** —
  secrets never sit in the working tree. `app/keys.example.txt` is
  the committed template (where each value comes from, `chmod 600`
  advice). Root + `app/` gitignores now cover `keys.txt`,
  `traderbot-keys.txt` and `*.keys.txt` (verified with
  `git check-ignore`), so even a keys file dropped inside the repo
  can't be committed.
- **Format**: dotenv-style `KEY=VALUE`, `#` comments, blank lines,
  optional surrounding quotes, junk lines tolerated.
- **Recognized**: `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` (the
  Alpaca **paper** account keys), `KALSHI_API_KEY_ID`,
  `KALSHI_PRIVATE_KEY_PATH` (path to the Kalshi demo `.pem`; the
  loader reads it and refuses content that doesn't contain a private
  key), `KALSHI_ENV` (default `demo`; **any other value is refused
  in this phase** — production Kalshi keys are withheld, loudly, in
  the status detail). Legacy env names `ALPACA_API_KEY` /
  `ALPACA_API_SECRET` still work as fallback.
- **Precedence**: the keys file wins over `.env`/environment for the
  same variable (it's the newer source of truth); env remains the
  fallback, so nothing breaks when the file is absent. Missing file
  is **not** an error: in paper mode a bot whose venue keys aren't
  loaded posts one clear "paper keys not loaded" NO-TRADE decision
  and falls back to the simulator — exactly today's no-keys behavior,
  now with the reason on the record.

### The swap point for a future vault

```ts
interface SecretProvider {
  readonly name: string;                       // "file" | "env" | (later) "vault"
  get(key: string): string | undefined;
}
```

`loadPaperKeys()` tries providers in order (file, then env) per key.
A vault provider slots in as one more entry in that chain — no
runner, API or UI changes needed when it lands.

### Security invariants (harness-proven)

Secret **values** are never logged, never returned by any API, never
written to state files or decision records. The only status surface
is per-provider: `loaded` boolean, `source` (`file`/`env`/`none`),
and `keyIdTail` — the last 4 characters of the key **ID** only
(never of a secret or the PEM; IDs of ≤4 chars show nothing).

- Engine boot logs one line, e.g.:
  `paper keys — alpaca paper: loaded (from file, key …4242); kalshi demo: loaded (from file, key …7777); keys file /Users/…/traderbot-keys.txt found`
- API: `GET /keys/status` returns that same safe presence map.
- Dashboard: a compact readout under the mode switch —
  `Paper keys: Alpaca ✓ (file) · Kalshi ✗` — refreshed every 60s.
- Docker: compose mounts the host keys file read-only at
  `/keys/traderbot-keys.txt` (`KEYS_FILE` points there); the host
  path comes from `TRADERBOT_KEYS_FILE` in `app/.env`, defaulting to
  `/dev/null` (an empty mount) when unset, so nothing breaks before
  the file exists.

### Wiring

The existing Alpaca paper paths (Trendia / Snapback / Vega) now
resolve their keys through the loader (`createAlpacaClient()` /
`keysConfigured()` in `engine/src/alpaca.ts`) — same behavior with
env-only setups, file support for free.

## Part 2 — Wesley paper trading (Alpaca paper options)

New runner `app/packages/engine/src/wesley.ts`, built on Vega's
paper-runner architecture: same Risk Gate calls, same decision
records, state-only reconcile, own state file
(`WESLEY_STATE_PATH`, default `data/paper-wesley-state.json`).

Strategy strictly from `bots/wesley.md`:

- Cash-secured puts and covered calls on his $5–$55 universe, in
  100-share blocks; per-position cap 100%; daily loss cap 6%.
- Contract rules (pure, exported `pickWheelContract`, shared with the
  harness): strike 5–10% out of the money, |delta| 0.20–0.30, open
  interest ≥ 500, bid/ask spread ≤ 8% of mid, premium floor 1%
  (of the strike for puts, of spot for calls); weekly cycle 4–12
  days / monthly 28–45 days, best premium % wins. Entries are limit
  orders at the mid, with Vega's one 60-second reprice.
- **The wheel, with an explicit cash ledger** in his state: CSP
  premium lands in cash at fill and strike×100×qty is reserved;
  assignment converts the reserved cash into a share block at the
  strike (verified against the broker's posted shares at expiry);
  covered calls sell against tracked blocks only; called-away
  converts shares back to cash at the call strike. Income is booked
  leg by leg in the decision log (the.md's full-cycle accounting).
- Exits: buy back at ≤ 50% of the premium collected (limit at mid);
  defense buy-back at ≥ 2× premium (market). Expiry settlement:
  shares at the broker ⇒ assigned; spot on the safe side ⇒ expired
  worthless; a put finishing ITM with no shares posted is booked as
  assigned at the strike with the decision saying exactly that, so
  the ledger never silently diverges from the broker.
- **Documented gap**: the.md's defense says "buy it back **or roll
  it out**" — v21 implements the buy-back leg only. Rolling is a
  deliberate follow-up, not an oversight.
- Foreign positions (untracked OCC symbols, untracked share lots in
  his universe) are ignored at reconcile — never adopted, never
  sold. Kill / Kill+Liquidate flow through the same control seam as
  the other runners (buy back shorts, sell only tracked shares,
  quantity-sized — never `closePosition`).

## Part 3 — PolyCrypt9000 paper trading

New runner `app/packages/engine/src/polycrypt.ts` + Kalshi client
`app/packages/engine/src/kalshi.ts`. State at `POLYCRYPT_STATE_PATH`,
default `data/paper-polycrypt-state.json`. The 50/50 sleeve split
under her **one combined 2.5% daily loss cap** is unchanged — the
cap reads the merged per-day realized ledger, so a bad crypto day
stops the Kalshi sleeve too (harness-proven).

### Crypto sleeve — Alpaca paper (BTC/ETH/SOL)

Her SIM breakout logic, with broker fills: hourly Donchian(20)
breakout that requires **both** volume above the 20-bar average
**and** ATR(14) expansion (the.md's two confirmations — Alpaca's
crypto bars carry volume, so no proxy was needed), 2× entry-ATR
trailing stop on the fast tick, max 15% of the book per position,
max 3 positions, market orders with `gtc` (crypto time-in-force).
State-only reconcile with the `BTC/USD` ↔ `BTCUSD` symbol mapping;
foreign crypto positions are never adopted or sold. One honest
limit: Alpaca's paper crypto book is thinner than live — fills on
Keith's Mac are the real check.

### Prediction sleeve — Kalshi demo

Client against `https://demo-api.kalshi.co/trade-api/v2`, auth per
Kalshi's scheme: `KALSHI-ACCESS-KEY`, `KALSHI-ACCESS-TIMESTAMP`
(ms), `KALSHI-ACCESS-SIGNATURE` = RSA-PSS (SHA-256, salt length 32)
over `timestamp + METHOD + path` (path includes the `/trade-api/v2`
prefix, excludes the query string), signed with the PEM from the
keys file via `node:crypto`. Demo only — the loader and the client
factory both refuse non-demo. Balance, market list/read, order
create (limit, cents)/get/cancel.

**Documented model adaptation**: her.md's Polymarket model needs a
fair value to measure mispricing against, and her SIM uses an
internal model price. Kalshi demo has no model feed either, so the
scan anchors on the market's **own last traded YES price** — the
crowd's most recent consensus — and flags an edge when a side can
be bought ≥ 8 points cheaper than that anchor implies (the.md's
8-point minimum edge), with the.md's other filters carried over:
skip markets closing within 24h (her 1–30-day window's floor),
spread ≤ 15 points, volume ≥ 100 contracts. Sizing is her formula
unchanged — quarter-Kelly with the extra ½ haircut, capped at 3%
of the book per position and 5% of the sleeve per market, max 10
open. Exits: settlement at the official result, a market exit in
the final hour before close, and an early exit when the bid returns
to within 1 point of the anchor (edge captured/closed).

### Polymarket sleeve — SHADOW, exactly as designed

Polymarket has **no paper mode** (real USDC on Polygon only), so
nothing about it is faked: the runner emits one SHADOW decision
record per day stating that the sleeve placed no orders and booked
no fills in paper mode, and there is no code path from this runner
to a Polymarket order. When Kalshi keys aren't loaded, the sleeve
posts one NO-TRADE boot decision ("Kalshi demo keys not loaded")
and the crypto sleeve trades on unaffected.

## Guardrails — verified unchanged

Fleet MODE remains the ceiling and per-bot mode never exceeds it;
CONNECTED/live is still refused server-side (engine and API) —
nothing in v21 touches that path; kill switches (per-bot + team,
Kill / Kill+Liquidate, arm toggle) cover both new runners through
the same `PaperControl` seam as the existing three; state-only
reconcile everywhere (no bot adopts or liquidates another's
positions — harness-checked for both new runners).

## Verification (all mocked — no real keys exist in this sandbox)

| Suite | Result |
| --- | --- |
| `npm run typecheck` (all workspaces) | pass |
| `npm run build` | pass |
| Loader harness `app/tools/test-keys-v21.ts` | **32/32** — parse, file-beats-env precedence, legacy env fallback, missing file, PEM refusal cases, `KALSHI_ENV=production` refusal; status JSON proven to contain no secret, no PEM, no full key IDs |
| Kalshi harness `app/packages/engine/harness/kalshi-harness.ts` | **20/20** — signatures verified **server-side** by a local mock Kalshi (RSA-PSS, documented payload), header shape, both price shapes (`*_dollars` strings and integer cents), order payloads (cents, side-specific price field), cancel, factory refusals |
| Wesley harness `app/packages/engine/harness/wesley-harness.ts` | **22/22** — monthly-beats-weekly CSP entry (9 contracts, premium + reservation ledger), 50% early exit (+$135), 2× defense exit at market (−$279), assignment → shares → covered call, gate veto at the 6% cap with zero orders, foreign positions untouched, pure pick rules |
| PolyCrypt harness `app/packages/engine/harness/polycrypt-harness.ts` | **21/21** — Donchian+volume+ATR entry (gtc, 15% sizing), 2× ATR trailing-stop exit, Kalshi edge entry (252 contracts — quarter-Kelly halved, asserted), edge-closed exit (+$23.94), combined-cap veto of BOTH sleeves, missing-keys NO-TRADE with crypto unaffected, SHADOW note emitted, foreign crypto ignored |
| Boot smoke `app/tools/test-smoke-v21.ts` | **11/11** — API + fake keys file: `/keys/status` both providers `loaded/source=file` with no secret material in the body; `/bots` = 5; SIM regression (all five bots stream events); PAPER boot logs the masked keys line and stays alive with runner ticks failing soft |
| Regressions | history v19 **25/25**, mode harness **36/36**, Vega **55/55**, Snapback **49/49**, landscape v18 **15/15** |

**Limits, stated plainly**: every broker interaction above is
mocked or fake-keyed. The sandbox cannot reach Alpaca (its egress
proxy rejects the host) and holds no real keys — by design. The
first live-paper confirmation happens on Keith's Mac: real Alpaca
paper fills for Trendia/Snapback/Wesley (+ Vega with
`VEGA_SHADOW=false`), real Alpaca paper crypto fills, and real
Kalshi demo fills. Kalshi demo's book is simulated, so demo fills
prove plumbing, not live execution quality.

**One drive-by repair**: `app/packages/api/src/history.ts` failed
typecheck on the pristine v20 base under this sandbox's TS 5.9.3
(a `never` narrowing at the unsupported-version throw). Fixed with
a behavior-identical one-line change (the raw version is captured
before narrowing) — flagged here so it isn't mistaken for a v21
feature change.

## Keith's Mac setup (one time)

1. Create the keys file from the template:
   `cp app/keys.example.txt ~/traderbot-keys.txt` (or copy the
   template's contents into a new file at that path), then fill in:
   - `ALPACA_API_KEY_ID` / `ALPACA_API_SECRET_KEY` — from the Alpaca
     **paper** account dashboard.
   - `KALSHI_API_KEY_ID` — from **demo.kalshi.co** (demo keys are
     separate from production).
   - `KALSHI_PRIVATE_KEY_PATH` — the path to the Kalshi demo `.pem`
     downloaded when the demo key was created.
   - Leave `KALSHI_ENV=demo`.
2. `chmod 600 ~/traderbot-keys.txt`
3. Pull + rebuild as usual (`git pull` — note your dev clone carries
   your own commit, so `--rebase` as usual — then
   `docker compose up -d --build`). For the Docker run, also set
   `TRADERBOT_KEYS_FILE=/Users/<you>/traderbot-keys.txt` in
   `app/.env` so compose mounts the file into the containers;
   running the engine directly on the Mac needs nothing extra (the
   default path is already `~/traderbot-keys.txt`).
4. Flip **RUN MODE** to **Paper trading** in the dashboard.
5. Watch: the header readout should say
   `Paper keys: Alpaca ✓ (file) · Kalshi ✓ (file)`, then each bot's
   first paper decisions in the Decisions tab — Trendia/Snapback/
   Wesley entries against Alpaca paper, Vega shadow unless
   `VEGA_SHADOW=false`, PolyCrypt9000's crypto + Kalshi demo
   entries and her daily Polymarket SHADOW note.
