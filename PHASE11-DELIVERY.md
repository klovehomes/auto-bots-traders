# Phase 11 (v19) — "the paper record is protected"

One fix, in one place: the API's event-history store
(`app/packages/api/src/history.ts`) can no longer let simulator
traffic evict the paper bots' decisions. No engine changes, no web
changes, no bot-file changes — plus one boot-log line in
`app/packages/api/src/index.ts` and a new verification harness.

## The problem (diagnosed live on the Mac, 2026-11-06)

Phase 6 gave the store two retention classes — 5,000 decision events
+ 1,000 others — on the premise that simulator chatter carries no
decision_id and would stay in the "other" ring. The premise was
wrong: the simulator mints a decision id for every event it emits
(engine `sim.ts`), so Wesley and PolyCrypt9000 — deciding every few
seconds, around the clock — compete in the SAME 5,000-deep pool as
the paper bots. A census of the live `/data/event-history.json`
found ≈2,498 Wesley + ≈2,496 PolyCrypt9000 name mentions (the whole
window), against Trendia 0 / Snapback 3 / Vega 2. Snapback's SPY
entry decision was written and then flushed within about a day.

**What this fix does not do:** resurrect the past. Decisions already
evicted (including that SPY entry record) are gone from the store
and stay gone — the trades themselves live on in Alpaca and the bot
state files. This fix protects everything from its first boot
forward.

## The change — three retention classes

| Class | Contents | Cap |
|---|---|---|
| Protected decisions | Decision events produced by a real-data runner (paper today, connected later) | 5,000 |
| Sim decisions | Decision events produced by the simulator | 1,000 |
| Other events | `decision_id` = null (evaluation summaries, engine/mode events) | 1,000 (unchanged) |

Reads are unchanged: `GET /events/history` still returns one merged
list, newest-first by `seq`; `seq` is stamped at ingest exactly as
before and stays monotonic across restarts (persisted counter,
never below a stored seq). The web seed + dedupe contract is
untouched — the Decisions tab looks identical; it just stops losing
the paper bots.

The "other" class needed no split: simulator events always carry a
decision_id, so sim traffic cannot land there at all (verified in
`sim.ts` — its emit unconditionally sets one). That class is mostly
the paper runners' own summaries and fleet events.

## Classification — follows the producing runner (the bot's mode)

The class of a decision is decided by **which kind of runner
produced it**, from a signal recorded at decision time: the
`decision_id` the emitting runner mints.

- Real-data runners (engine `paper.ts`, `snapback.ts`, `vega.ts`)
  mint **`<codename>-<counter>`** — e.g. `snapback-17`.
- The simulator (engine `sim.ts`) mints a **bare counter** — e.g.
  `4815`.

Codename-prefixed → **protected**; bare counter or any unrecognized
shape → **sim** (the expendable class is the default, so a surprise
can only ever cost a sim-class record).

Why this signal, stated plainly: the two sources one would reach
for first do not exist in this codebase. `FleetEvent` carries **no
mode field**, and the API holds **no per-bot effective-mode state** —
`ModeStore` is fleet-level, and the bot files' `mode:` strings
declare intent, not the running runner (Wesley's file says `paper`
while he simulates; PolyCrypt9000's says `paper + shadow`). The
effective runner is chosen inside the engine at boot. The minted
decision_id is the one artifact that (a) is created by the runner
itself at decision time, (b) is present identically in live events
and in every stored record — which is what makes the boot migration
below exact rather than a guess — and (c) involves no bot-name list
anywhere: the code pattern-matches the id's shape, never a codename.

Consequences, all deliberate:

- **A bot's class follows its runner automatically.** In fleet
  SIM mode, even Trendia's decisions are simulator-minted (bare
  ids) and land in the sim ring — correct, they *are* sim
  decisions. When Wesley someday runs a real paper runner, his
  decisions arrive codename-prefixed and are protected with no
  change here. Vega's shadow-mode decisions are produced by his
  real-data paper pipeline, so they are protected — also correct:
  they are real screens of real data, exactly the records worth
  keeping.
- **Stored events are never reclassified** after ingestion (a mode
  flip does not rewrite history). The single exception is the
  one-time v1→v2 boot migration, which applies this same rule to
  the stored ids.

## Persistence + boot migration

The file stays `/data/event-history.json` (`EVENT_HISTORY_PATH`),
still one JSON document containing the events' full text (grepping
it by bot name keeps working). The on-disk format is now **v2**:
`{version, nextSeq, protected[], sim[], recent[]}`.

On boot with a v1 file, the store re-buckets every stored decision
under the classification rule, applies the new caps per class, logs
the migration (below), and marks itself dirty so the file is
rewritten as v2 on the next flush (≤2 s, or immediately on the next
decision). **On the live Mac file this will compact ~5,000 stored
simulator decisions into the 1,000-deep sim ring on first v19
boot** — that is the intended one-time correction, not data loss:
those are the records that were crowding out the paper trail. The
handful of surviving paper records are preserved in the protected
class.

One-way door, noted: a pre-v19 API reading a v2 file treats it as
an unsupported version and starts with an empty history (its
existing corrupt-file behavior, loudly logged). Rolling back the
API across this phase restarts the history — it does not corrupt
anything else.

## What Keith sees at boot

When the migration runs (first v19 boot only), the store logs:

```
[history] migrated v1 event history at /data/event-history.json: 4950 stored decisions re-bucketed → 150 protected (cap 5000) + 1000 sim (cap 1000); 3800 over-cap decisions dropped; 50 other events retained; file upgrades to v2 on next flush
```

(numbers are from the harness fixture; on the Mac the counts will
be his live file's — expect ~5,000 in, 1,000 sim kept, ~4,000
dropped.)

Every boot, the API's history line now reports per-class counts:

```
event history: /data/event-history.json (38 retained events — 5 protected decisions / 30 sim decisions / 3 other; latest seq 38)
```

(inside the API's JSON log envelope, as the `msg` field — same line
as before, extended).

## Verification

Harness: `app/tools/test-history-v19.ts` — **25/25 checks pass**,
exercising the real `EventHistoryStore`:

- **Classification (10 cases):** `snapback-17`, `trendia-1`,
  `vega-903`, `polycrypt9000-3` → protected; `4815`, `0`, `42-7`
  (numeric prefix), `weird`, `""`, `null` → sim.
- **The flood:** 12,000 sim decisions interleaved with 300 paper
  decisions (first one at seq 1) + 20 other events → protected 300
  (**all 300 retrievable, including seq 1**), sim exactly the most
  recent 1,000 (ids 11001–12000), other 20, merged snapshot
  newest-first with unique seqs, latestSeq 12,320.
- **Migration:** crafted v1 file (4,800 sim + 150 paper decisions,
  50 other, nextSeq 5001) → 150 protected / 1,000 sim / 50 other,
  zero protected loss, drop count 3,800 in the report, next append
  stamped seq 5001, file on disk rewritten as v2.
- **Restart:** v2 file reloads with identical classes, no second
  migration, next append seq 5002.
- **Runner-not-name:** `Wesley` + sim-minted id → sim class;
  `Trendia` + sim-minted id → sim class; `Wesley` + runner-minted
  id (`wesley-1`) → protected.

API smoke (real server, this VM): booted on a small v1 fixture
(35 decisions + 3 other) — migration line and per-class boot line
printed exactly as above; `GET /events/history` returned all 38
events with all 5 paper ids; a live POSTed paper decision
(`trendia-77`) landed in the protected bucket (5 → 6) at seq 39 and
a sim decision (`999999`) in the sim bucket (30 → 31) at seq 40;
on-disk file confirmed v2.

Root `npm run typecheck` and `npm run build` clean. No web or
engine files changed, so the v16 showcase greps were not re-run
(there is nothing new in any bundle).

## Files changed

- `app/packages/api/src/history.ts` — three-class retention,
  `classifyDecisionEvent`, v2 persistence + v1 boot migration,
  per-class `counts`, `migrationReport`.
- `app/packages/api/src/index.ts` — boot log line only (per-class
  counts alongside the total).
- `app/tools/test-history-v19.ts` — new harness (25 checks).
- `PHASE11-DELIVERY.md` — this file.

## Mac note

API-side only: pull, then rebuild the API
(`docker compose up -d --build` as usual). The history file
migrates in place on first boot — watch for the `[history]
migrated v1 event history …` line in the API log once; after that
the boot line shows the three counts on every start. The engine
and web containers run the same code as before; the Decisions tab
needs no changes and looks the same — it will simply still have
Snapback's, Trendia's and Vega's decisions in it when you open it
at night, which was the point.
