# Phase 6 (v14 — "truth patch")

Built on the Phase 5 tree (local dev tip `62b7470`, tree-identical to
remote `875b27e`). Working tree only — nothing committed or pushed.
`bots/*.md` untouched; no strategy parameters changed beyond
Workstream B's exit/cooldown semantics and Workstream C's logging.

Three workstreams, all driven by what the 2026-11-04 paper session
actually did:

- **A.** The API discarded every event after broadcasting it, so the
  Decisions tab only ever showed what streamed while it was open.
  Events are now persisted with sequence numbers and served back.
- **B.** Snapback entered TSLA twice on the RSI(2) leg while price
  was **above** the 20-day mean ($389.03 / $388.54 vs mean $382.84),
  so her price ≥ mean exit was already true at entry and both
  positions closed within minutes (−$1.12, −$1.80). Keith:
  *"We are not trying to build a day trading bot here."*
- **C.** Vega's SMCI and RBLX signals died on chain-fetch HTTP 404s
  with only a console warning — no decision record. Fetch failures
  are now decisions.

---

## A. Event history — the API remembers

### The store (`app/packages/api/src/history.ts`, new)

`EventHistoryStore` follows the ModeStore/ControlStore discipline:

- Path from `EVENT_HISTORY_PATH` (default `./data/event-history.json`;
  compose sets `/data/event-history.json` on the **api** service —
  the shared `fleet-data` volume — so history survives API restarts
  and redeploys). Added to `app/docker-compose.yml` and
  `app/.env.example`.
- Atomic persistence: write `<path>.tmp`, rename over `<path>`.
- Missing file → silent empty start. Corrupt or wrong-shape file →
  loud `[history] could not load … — starting with an empty event
  history: <error>` on stderr and an empty history; the API never
  crashes on its own history file.
- Stored shape: `{ version: 1, nextSeq, decisions: [...], recent: [...] }`.

### Sequence numbers

Every event ingested at `POST /internal/events` is stamped with a
monotonically increasing `seq` at ingest — in the stored record,
in the WebSocket broadcast frame, and in the POST response
(`{ ok: true, delivered: n, seq }`). `nextSeq` is persisted with the
store, so numbering continues across API restarts (verified: after
a restart the next POST got seq 4 following a stored latest of 3).
Engine payloads are unchanged — the engine never sends `seq`; the
shared `FleetEvent` type gains only an optional `seq?: number`
documented as API-assigned, and the ingest zod schema is untouched.

### Retention — two classes, and why

The brief's cap is 5,000 events, with the explicit worry that
simulator volume could evict the day's sparse decision records.
Measured against how the fleet actually emits, a flat 5,000 cap
would still evict: in SIM every bot posts every simulated signal
and fill, while a whole paper day produced only a handful of
decision records (Snapback's two TSLA round trips, Vega's hourly
screens). So retention is **class-based**:

- **Decision events** — `decision_id` non-null: signals (entries,
  exits, gate rejections, NO TRADE records), opens and closes from
  the real runners. Capped at the most recent **5,000**.
- **Everything else** — simulator chatter, records without a
  decision id: ring-capped at the most recent **1,000**.

Worst case the store holds 6,000 events. Decision records can never
be evicted by simulator noise — only by 5,000 newer decisions,
which at the paper fleet's rate is months of trading days.
Verified directly against the store: after 3 seed decisions and a
3,000-event non-decision flood, all 3 decisions were retained, the
ring held exactly chatter #2000–#2999, and a reload from disk
preserved both buckets and the sequence counter.

Flush discipline: decision appends persist **synchronously**
(they're rare and they're the record Keith reads); other appends
are batched by a 2 s background flusher (unref'd timer), and the
store flushes on API shutdown (`onClose` hook).

### Serving and the web merge

- `GET /events/history` returns `{ latestSeq, events }` — both
  buckets merged, newest first (seq descending).
- Web (`App.tsx`): on mount the app fetches history and **seeds**
  the stream state; live WebSocket frames and the seed are merged
  by `seq` — a frame whose seq was already seen is dropped, so
  history and live overlap produces no duplicates, and the seed
  fills everything that happened while the tab was closed.
  History-seeded events deliberately do **not** replay landscape
  animations/sounds — those fire only from the live path; a
  refreshed tab shows the record, not a light show.
- The client applies the same two-class trim (5,000 decisions /
  1,000 others — the old flat 400-event slice is gone), so a
  long-open tab converges to the same retention as the server.
- The Decisions tab now shows the full day (and every retained
  day before it) even if the tab was closed when decisions
  happened. The stale "there is no history API yet" comment is
  updated in `App.tsx`, and the matching note in `fleetState.ts`.

Unchanged, per spec: the engine's event posting, the
internal-token auth (a tokenless POST still returns 401 — verified),
and the event schemas.

---

## B. Snapback — no more same-day churn

Semantics, exactly as specified (`app/packages/engine/src/snapback.ts`):

- **Entry side is recorded.** When an entry fills, the tracked
  position now stores `entryMean` (the 20-day mean at signal time,
  carried on the pending entry) and `entryBelowMean`
  (`filledAvgPrice < entryMean`).
- **Mean-reversion exit is gated on the entry side.** It fires only
  when the position was entered **below** the mean AND current
  price ≥ the **current** 20-day mean:
  `entryBelowMean === true && price >= stretch.mean20`.
  Positions entered at/above the mean exit ONLY on the +4% take
  profit, the −5% stop, or the 5-trading-day max hold. Exit-check
  precedence is unchanged (stop → max hold → take profit → mean).
- **Same-day re-entry cooldown.** Every exit fill (including
  kill + liquidate exits, which flow through the same path) records
  `lastExitBySymbol[symbol] = <ET date>` in her state. In the
  hourly evaluation, a symbol whose last exit was **today (ET)**
  and which produces a fresh signal is skipped and counted; the
  summary line gains its own count:
  `… 0 trend-filter blocks, 1 cooldown-skips, 7 no-signal; …`.
  The next trading day the same symbol may re-enter normally.
  The cooldown check runs after the signal test and before the
  trend filter — re-entry is barred that day regardless of trend.
- **Legacy state.** Positions tracked before this change lack the
  new fields. On boot (reconcile) and as a backstop on the first
  exit tick that has stretch data, the runner derives the side
  from `entryPrice` vs the **current** 20-day mean (the only mean
  recoverable for an old position), persists it, and logs the
  derivation:
  `[snapback] Snapback: SPY position predates Phase 6 — derived entry side from the current 20-day mean: entry $98.00 vs mean $99.95 → entered BELOW the mean (mean-reversion exit applies)`.
  Missing fields never crash: a position whose symbol has no bars
  yet simply doesn't derive until a tick provides a stretch.
- Her decisions' params snapshot now reads: "exits at the 20-day
  mean (only when entered below it) / +4% / stop 5% / 5 trading
  days max hold, no same-day re-entry after an exit, …".

Nothing else about her strategy moved: same universe, same stretch
definition, same +4% / −5% / 5-day parameters, same sizing and
Risk Gate numbers.

---

## C. Vega — fetch failures are decisions now

- **Decision records.** In `vega.ts`, a chain-fetch failure and a
  snapshot-fetch failure each emit a **NO TRADE** decision record
  through the same emit path as every other rejection — visible in
  the Decisions tab (and, via Workstream A, persistent). The reason
  carries the full error text, e.g.:
  `Contract pick: NO TRADE — chain fetch failed: option contracts for SMCI: HTTP 404 — {"code":404,"message":"…"}`.
  The old console-only warnings are gone.
- **Errors explain themselves.** In `alpaca.ts`,
  `getOptionContracts` and `getOptionSnapshots` now throw
  `"<context>: HTTP <status> — <body excerpt>"`, the excerpt
  whitespace-collapsed and bounded to 300 characters, so the next
  404 lands in the decision record with Alpaca's own explanation
  attached.
- **Summary arithmetic closes.** The old merged "rejected/no-trade"
  counter is split so every signal lands in exactly one bucket.
  The hourly summary now reads:
  `… 25 screened in, 1 signals, 0 entries submitted, 0 gate-rejected, 0 no-trade, 1 fetch-failed, 0 earnings-blocked; …`
  and always: **signals = entries + gate-rejected + no-trade +
  fetch-failed + earnings-blocked**. ("Gate-rejected" = already
  holding the underlying, premium-cap blocks, and Risk Gate
  verdicts; "no-trade" = empty chain / unusable contract pick;
  "fetch-failed" = the two new paths.)

No Vega strategy parameters changed — screen, breakout definition,
strike/expiry rules, caps, exits are all as of v12.

---

## Verification

### Harnesses (`app/packages/engine/harness/`)

| Suite | Before | After | Notes |
|---|---|---|---|
| mode | 36/36 | **36/36** | untouched |
| snapback | 38/38 | **49/49** | +11 checks (S13); **no existing check changed** — the below-mean mean-exit scenario still proves the classic path |
| vega | 47/47 | **55/55** | +8 checks (S13); no existing check changed (none asserted the old summary wording) |

New Snapback checks: RSI(2) entry above the mean records
`entryMean`/`entryBelowMean=false`; the position holds through
ticks above the mean (where the old code exited instantly) and
exits on +4% (pnl +$79.80 on the fixture); an exit stamps
`lastExitBySymbol`; a same-day re-signal is skipped, counted as
`1 cooldown-skips` in the summary, and produces no second order;
the next trading day re-entry is allowed; legacy positions without
the new fields derive their side at boot — below-mean keeps the
mean exit (+$25.00 on the fixture), above-mean is not churned.

New Vega checks: fake-broker chain fetch throwing
`HTTP 404 — {"code":404,"message":"not found"}` produces a NO
TRADE decision carrying the status and body excerpt, no order is
placed, and the summary reports `1 fetch-failed` with the
arithmetic closing; same for a snapshot fetch throwing HTTP 500.

### Typecheck / build

- `npm run typecheck` — clean across shared, api, engine, web.
- `npm run build` — clean (all four packages; the web bundle
  contains the `/events/history` fetch).

### Smokes (no Docker)

- **API ingest → restart → read-back** (real API via tsx, temp
  state dir): POST a decision event → response `seq: 1`; POST a
  non-decision event → `seq: 2`; tokenless POST → 401;
  `GET /events/history` → both events, newest first. A live
  WebSocket client received the next broadcast frame **with
  `seq: 3` embedded**. API killed and restarted → boot log
  `event history: … (3 retained events, latest seq 3)`, history
  read-back intact, next POST assigned `seq: 4`.
- **Corrupt history file**: API boots with the loud
  `[history] could not load …` warning, serves an empty history,
  and assigns seq 1 to the next event.
- **Retention**: store-level check (above) — decisions survive a
  3,000-event simulator flood; ring holds exactly the newest
  1,000; reload preserves buckets and sequence.
- **End-to-end**: real engine in `MODE=sim` against the real API
  for ~12 s → 13 events from all five bots persisted with seqs
  and readable from `/events/history`.
- **Web merge**: verified by construction and build — the seed
  merge and live dedupe share one `seq`-keyed path in `App.tsx`
  (seen-set + seq-descending union + the two-class trim), and the
  production bundle was confirmed to contain the history fetch.
  No browser was available in this environment for a visual
  click-through; the parent agent can confirm on the Mac by
  opening the dashboard after a bot decision and refreshing.

### Boot / verification lines to expect on the Mac

- API: `event history: /data/event-history.json (<n> retained events, latest seq <m>)`
- Snapback summary: `… trend-filter blocks, N cooldown-skips, …`
- Snapback legacy derivation (only if she ever holds a pre-v14
  position): the `predates Phase 6` line quoted in §B.
- Vega summary: `… gate-rejected, … no-trade, … fetch-failed, … earnings-blocked; …`
- Vega fetch failure in Decisions: a Vega **NO TRADE** signal
  record whose reason starts `Contract pick: NO TRADE — chain
  fetch failed:` or `snapshot fetch failed:` followed by
  `HTTP <status> — <Alpaca's response body>`.

---

## Files changed

| File | Change |
|---|---|
| `app/packages/api/src/history.ts` | **new** — EventHistoryStore (seq, two-class retention, atomic persistence) |
| `app/packages/api/src/index.ts` | ingest stamps seq + stores before broadcast; `GET /events/history`; store boot log + shutdown flush |
| `app/packages/shared/src/types.ts` | `FleetEvent.seq?: number` (API-assigned) |
| `app/packages/web/src/App.tsx` | history seed + seq merge/dedupe, two-class client trim, stale comment updated |
| `app/packages/web/src/fleetState.ts` | header comment updated for the history API |
| `app/docker-compose.yml` | `EVENT_HISTORY_PATH: /data/event-history.json` (api service) |
| `app/.env.example` | `EVENT_HISTORY_PATH` documented |
| `app/packages/engine/src/snapback.ts` | entry-side recording + gated mean exit, same-day re-entry cooldown + summary count, legacy derivation |
| `app/packages/engine/src/vega.ts` | fetch failures emit NO TRADE decisions; summary split into gate-rejected / no-trade / fetch-failed |
| `app/packages/engine/src/alpaca.ts` | option fetch errors include HTTP status + bounded body excerpt |
| `app/packages/engine/harness/snapback-harness.ts` | +S13 (entry side, cooldown, legacy) |
| `app/packages/engine/harness/vega-harness.ts` | +S13 (fetch failures, summary arithmetic); fake broker gains error knobs |

## Judgment calls

1. **Retention is two-class, not a flat 5,000** — the spec's own
   example (keep all decision-id events + a capped ring of the
   rest), with the decision class itself capped at 5,000 so the
   file stays bounded. Justification in §A.
2. **Decision appends flush synchronously; other appends batch**
   on a 2 s timer — decisions are rare and load-bearing; chatter
   is neither. A crash can lose at most ~2 s of non-decision
   events, never a decision.
3. **History seed does not replay landscape effects** — the
   landscape answers "what is happening," the Decisions tab
   answers "what happened." Replaying a day of pulses on every
   tab refresh would make the dashboard unusable.
4. **Cooldown is checked after the signal test, before the trend
   filter** — a same-day re-entry is barred on a day she exited,
   full stop; trend state doesn't soften it. Only signals that
   would otherwise be evaluated count as cooldown-skips, so the
   count means "re-signals we refused," not "symbols we hold a
   grudge against."
5. **Legacy derivation uses the current 20-day mean.** The mean
   at a pre-v14 entry is unrecoverable; entry price vs today's
   mean is the honest approximation, it is logged when it happens,
   and Snapback is flat today so this path is fleet robustness,
   not a live-position decision.
6. **Vega's buckets were split rather than extended** — the old
   merged "rejected/no-trade" count made the arithmetic
   unverifiable; only the split (gate-rejected / no-trade /
   fetch-failed) makes "every signal accounted for exactly once"
   a checkable property, and the harness now checks it.
