# Phase v23 — Fix: Alpaca option contract lookup endpoint

Keith's report (2026-11-11, with screenshot): Vega's Decisions tab
fills with real PAPER entry signals, but every one ends
`Contract pick: NO TRADE — chain fetch failed for X: option contracts
for X: HTTP 404 — {"message":"Not Found"}` (SMCI, NET, RBLX, SNAP).
No trades. He was right to flag it — the signals were real; the
contract lookup behind them was broken.

`BUILD_VERSION` default bumped `v22` → `v23` (the version line under
"Trader Bot Landscape" from v20; the `BUILD_VERSION` env override
still wins).

Local commit on `dev`, on top of v22 (`7c9a854`). **Not pushed** —
parent reviews and asks Keith first.

---

## Root cause, in plain terms

When the options runner was built (Phase 3), the code that asks
Alpaca "which option contracts exist for this stock?" was pointed at
Alpaca's **Market Data** API:

    https://data.alpaca.markets/v1beta1/options/contracts

That address has never existed. Alpaca keeps contract discovery on
its **Trading API** instead — the same side of the house that takes
orders:

    GET /v2/options/contracts
    paper → https://paper-api.alpaca.markets
    live  → https://api.alpaca.markets

So every lookup got a 404 and every Vega entry signal died at the
contract-pick step, before open-interest / spread / premium checks
ever ran. This is also what killed Vega's SMCI and RBLX signals back
on **2026-11-04** — same bug, same 404. It only *looked* new today
because Phase 6 later taught the runner to publish its failures as
NO TRADE decisions instead of dying silently in a console log. The
bug was there from the start; the visibility arrived in v14/v21.

The method is shared, so the bug was not Vega-only: **Wesley's**
options-income scans call the same `getOptionContracts`, so his
chain scans were hitting the same dead address too.

## The fix (one shared method, nothing else moves)

`app/packages/engine/src/alpaca.ts` — `getOptionContracts()` in the
real client (used by both Vega and Wesley):

- URL now built from the Trading API host, selected by the **same
  paper flag** the SDK client in that function already computes
  (`ALPACA_PAPER`, default true): paper →
  `https://paper-api.alpaca.markets/v2/options/contracts`,
  non-paper → `https://api.alpaca.markets/v2/options/contracts`.
- Same auth headers (the paper keys), same filters
  (`underlying_symbols`, `type`, `expiration_date_gte/lte`,
  `limit=1000`), same bounded pagination following
  `next_page_token` (max 10 pages), same response parsing
  (`option_contracts[].symbol / underlying_symbol / type /
  strike_price / expiration_date / open_interest`).
- One addition: `status=active`, so only listed, tradable contracts
  come back (the endpoint otherwise also knows inactive ones).
- The stale interface comment claiming contracts are "served from
  the Market Data API" is corrected.

Deliberately untouched:

- Option **snapshots** stay on the Market Data API
  (`v1beta1/options/snapshots`, indicative feed) — that endpoint is
  real and working.
- No strategy or parameter changes (Vega's pick rules, Wesley's
  wheel rules, caps, windows — all identical).
- No mode/live changes, no keys-loader changes.

## What it unblocks

- **Vega**: a paper entry signal can now get past contract pick —
  the chain comes back, the 5%-OTM strike in the 2–4 week window is
  chosen, and the pick proceeds to the OI / spread / premium-cap
  checks that were previously unreachable.
- **Wesley**: his covered-call / cash-secured-put chain scans query
  the same fixed method, so his scans can find contracts again.

## Verification

New focused test — `app/tools/test-option-contracts-v23.ts`
(**21/21**): drives the REAL `createAlpacaClient()` with mocked
`fetch` and dummy paper keys from a scratch keys file (v21 loader
pattern; no real keys anywhere). Asserts the request host/path is
the paper Trading API `/v2/options/contracts`; the query carries
underlying/type/expiry window/`status=active`; auth headers are the
dummy keys; pagination follows `next_page_token` and stops; contracts
parse (strike/expiry/OI, missing OI → 0); `ALPACA_PAPER=false`
selects the live Trading host; and a 500 response still throws the
Phase 6 error shape (context + status + body excerpt) that lands in
NO TRADE decisions.

The Vega harness stubs the client interface, so it never contained
the old URL — no fixture change needed. Its Phase 6 check (item 15:
a chain-fetch failure emits a NO TRADE decision carrying the error)
still passes: NO TRADE visibility for genuine failures is intact.

Full battery, all green:

| Suite | Result |
| --- | --- |
| option contracts (new, v23) | 21/21 |
| typecheck (4 packages) | pass |
| full build (incl. web bundle, carries `"v23"`) | pass |
| vega harness | 55/55 |
| wesley harness | 22/22 |
| mode harness | 36/36 |
| keys v21 | 32/32 |
| keys v21.1 | 34/34 |
| history v19 | 25/25 |
| reset v22 | 21/21 |
| boot smoke v21 | 11/11 |

## What remains Keith-side

The sandbox cannot reach Alpaca, so — same as v21 — the first
live-paper confirmation happens on the Mac after deploy:

- **Expected proof**: the next Vega paper entry signal no longer
  dies with the contracts 404. It should progress past contract pick
  to either an actual paper trade **or** a later-stage NO TRADE with
  a different reason (open interest too low, spread too wide,
  premium over the 6% cap, Risk Gate veto). Any of those outcomes
  proves the chain fetch works; the 404 should simply never appear
  again.
- Wesley's next scan likewise should find contracts instead of
  failing the fetch.

## Keith's steps (after the push is approved)

1. On the Mac, in the clone: `git pull --rebase`
2. In `app/`: `docker compose up -d --build`
3. Confirm the header reads **Build v23**, then watch Vega's next
   hourly signal in the Decisions tab.

## Files in this phase

- `app/packages/engine/src/alpaca.ts` (endpoint + comment fix)
- `app/tools/test-option-contracts-v23.ts` (new)
- `app/packages/web/src/version.ts` (`"v22"` → `"v23"`)
- `PHASE-V23-DELIVERY.md` (this doc)
