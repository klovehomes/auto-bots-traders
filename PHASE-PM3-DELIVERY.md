# Phase PM3 — Split-Screen Scans + Bot Trades (delivery notes)

Branch: `polymarket-only`, built on remote tip `608184f`. Dashboard title
unchanged: "Prediction Markets Assistant". The loader filter
(`ONLY_BOT_CODENAME`), kill switch, and RUN MODE switch are untouched —
exactly one bot (PolyCrypt9000) still loads.

## What was built

The dashboard's Landscape section is now a **split screen** (header
summary cards, kill-switch bar, and RUN MODE are unchanged):

- **Left panel — Polymarket scans + manual selection.** Pick one scan,
  results load live from the Polymarket Gamma API (fetched server-side
  by the API package, cached ~5 minutes). Each result row has a
  checkbox and a per-market dollar input. Checking/typing executes
  nothing — the **Submit selections** button books the whole batch via
  `POST /user-selections`, validated against the shared pool (below).
- **Right panel — "Bot Trades".** Bot-allocation dollar input + Save
  (pool-validated, persisted), three independent sleeve toggles —
  **Crypto / Kalshi / Polymarket**, all default ON, persisted — and
  PolyCrypt9000's live activity (open positions + recent trades with
  P&L) from the dashboard's existing bot data.
- **Bottom section** keeps its existing tabs and gains one new tab,
  **"Your Selections"**: every booked user selection with question,
  outcome, scan source, amount, price at selection, current price
  (re-fetched from Gamma by market id when the tab loads; falls back
  to the selection price), estimated value and P&L
  (shares = amount ÷ price-at-selection; value = shares × current
  price), status Open, and a totals row.

## The four scans

Tradable = active, not closed/archived, `acceptingOrders` and order
book enabled. `outcomePrices` arrives as a JSON string and is parsed.
A market counts **once** even if several outcomes qualify (the first
qualifying outcome is the one listed); child markets of multi-outcome
events count separately. All ranked by total volume, descending.
Gamma ordering uses `order=volumeNum` (the numeric field — plain
`volume` sorts the string field lexicographically).

1. **Full Universe** — all active tradable markets, buyable outcome at
   82–90¢ inclusive, top 20 listed. The top 20 returns fast from
   volume-ordered paging; the total in-band count needs full
   pagination, so it is computed by a background sweep and returned
   as `count: null` until known.
2. **Top 800** — top 800 markets by volume, same band, **all** in-band
   results listed (53 on the verification run — matches the
   2026-11-06 scan exactly).
3. **Near-Term (26 days)** — the flipped form Keith asked for: the
   universe is first filtered to markets ending within 26 days, the
   top 800 of those by volume, same band, top 20 listed. (The other
   form — global top-800 ∩ ending ≤26 days — found only 6 markets on
   2026-11-06; noted here per the brief, not implemented.)
4. **Long Shots** — Keith's addendum (2026-11-08 ~23:13 PT), folded
   into this build **before the PM3 commit was made, so it ships
   inside the main PM3 commit** (not a follow-up). Mirror image of
   the favourite band: buyable outcome priced **under 25¢** (strictly
   < 0.25), market ends within the next **10 days**, **top 50** by
   volume displayed. Same flipped form as Scan 3 (end-date window
   first, then volume rank, then band), same checkbox + amount +
   Submit flow, same shared pool, selections record scan 4 as their
   source. Its `count` is the number qualifying among the top-800-by-
   volume inside the 10-day window (604 on the verification run).

## Endpoints (API package)

- `GET /scans` — the four scan definitions.
- `GET /scans/:id/results` — `{scanId, label, fetchedAt, count,
  results:[{marketId, question, outcome, price, volume, endDate,
  slug}]}`; `count` nullable (Scan 1 until the sweep lands).
  404 unknown scan, 502 when Gamma fails.
- `GET /allocations` — the one fund view both panels render:
  `{totalFunds, botAllocation, userSelectionsTotal, remaining,
  sleeveToggles, userSelections}`.
- `POST /allocations/bot` `{amount}` — set the Bot Trades allocation.
- `POST /allocations/sleeves` `{crypto?, kalshi?, polymarket?}`.
- `POST /user-selections` `{items:[{scanId, marketId, outcome,
  amount}]}` — books a batch atomically (see pool rules).
- `GET /user-selections` — booked selections with live re-pricing and
  totals.

## Fund model (shared pool)

One pool under both sides, exactly as Keith confirmed ("Shared
pool"):

- `totalFunds` = PolyCrypt9000's current book equity as the API
  reports it (10,000 start + realized P&L from the event history;
  fallback 10,000 if unavailable).
- Ledger persisted by the API in a JSON file next to the control
  state (same pattern as the kill-switch `ControlStore`: versioned
  file, atomic tmp+rename writes). Path: `ALLOCATIONS_STATE_PATH`
  env, default `./data/allocations.json`; docker-compose sets
  `/data/allocations.json` so it survives on the data volume.
  Contents: `{botAllocation, sleeveToggles:{crypto, kalshi,
  polymarket}, userSelections:[…]}`.
- `remaining = totalFunds − botAllocation − Σ open user selections`.
- Validation is whole-batch: a Submit (or a bot-allocation save) that
  would push the total over `totalFunds` is rejected with a clear
  error spelling out the math; **nothing is partially booked**.
- Booking prices come from the scan results the user saw (server
  cache), falling back to a fresh Gamma lookup by market id; an item
  that cannot be priced rejects the batch.

## What is NOT in this cut (per brief — stated, not faked)

- **No external execution.** User selections book inside the app only.
  Kalshi demo and Alpaca paper execution is the next phase and needs
  Keith's credentials (entered by him directly, never in chat).
- **Engine order flow is not gated** by the allocation ledger or the
  sleeve toggles. The toggles are stored settings surfaced in the UI
  in this cut; PolyCrypt9000 trades as before.
- **No Kalshi trades exist yet** for its toggle to gate.
- The old 3D Landscape component is no longer rendered (the split
  view replaces it, per the brief); its code remains in `App.tsx`
  unused for now.
- The showcase entry/build contains none of the PM3 code (verified:
  showcase bundle has zero "Bot Trades" / "user-selections" markers).

## Verification (native sim run, 2026-11-08 evening PT)

Typecheck: all 4 packages pass. Full build passes (main + showcase).

Live Gamma smoke (API + engine in sim mode):

- `GET /scans` → 4 scans (Full Universe / Top 800 / Near-Term
  (26 days) / Long Shots).
- Scan 2: **count 53, 53 results, 0 out-of-band**, volume-desc;
  #1 "Will the U.S. invade Iran before 2027?" — No @ 0.885,
  vol 78,942,730.
- Scan 1: 20 results in 0.67 s, count `null` while the sweep ran;
  the sweep then completed: **19,185 in-band** (2026-11-06's full
  scan found 16,641 — the count moves with the market).
- Scan 3: count 180 in-band among the near-term top-800, top 20
  listed.
- Scan 4 (Long Shots): **50 results, every price < 0.25, every end
  date within 10 days, volume-desc**; count 604.
- Pool math: `totalFunds` 9,996.23 (10,000 + sim realized −3.77).
  Bot allocation $3,000 → remaining 6,996.23. Booked two selections
  ($500 @ 0.885 Iran "No" + $250 @ 0.899) → userSelectionsTotal 750,
  remaining **6,246.23**. Over-pool batch ($999,999) → **HTTP 400**
  with the pool math in the error, nothing booked; bot-allocation
  save of $9,500 likewise rejected. Sleeve toggle Kalshi → OFF
  persisted. `GET /user-selections` re-priced both from Gamma with
  value/P&L and totals. Ledger file survived an API restart intact.

### Two Gamma behaviours found during verification (and handled)

- **Deep-offset 422s:** Gamma rejects offsets beyond a result-window
  cap (~5,000–10,000) with HTTP 422. The first sweep implementation
  (global offset paging) completed once — the 19,185 above — then
  failed on a later run when the cap bit. The shipped sweep pages
  **end-date ranges** in parallel batches of 6 pages and splits a
  range in half by time whenever it hits the cap (dedupe by market
  id makes the overlap harmless); the completion log notes if any
  dense range still capped out. Scans 2/3/4 page at most 800 deep
  and are unaffected. Note the first sweep under the shipped code is
  slow under Gamma throttling (measured ~1.7 s/page from this host
  on verification night; the run was still in progress at commit
  time) — by design the count simply stays `null` until it lands.
- **Empty-page bursts:** under heavy request bursts Gamma can answer
  200 with empty pages, which briefly produced a `count: 0` Scan 2.
  `gammaFetch` now retries once on 429/5xx/timeout, and a scan build
  that collects zero qualifying markets throws (→ 502) instead of
  caching an empty payload for 5 minutes.

## Files

- `app/packages/shared/src/types.ts` — PM3 shared types.
- `app/packages/api/src/gamma.ts` (new) — Gamma scan service.
- `app/packages/api/src/allocations.ts` (new) — allocation ledger.
- `app/packages/api/src/index.ts` — routes + fund model wiring.
- `app/packages/web/src/SplitView.tsx` (new) — split view + tab.
- `app/packages/web/src/App.tsx`, `app/packages/web/src/styles.css`
  — wiring + styles.
- `app/docker-compose.yml` — `ALLOCATIONS_STATE_PATH` for the API.
