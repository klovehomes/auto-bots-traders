# Phase PM6 — Mode-availability greying in Bot Trades

Keith's request (2026-11-09, reviewing the app on the VM with the RUN
MODE menu open and the Bot Trades panel circled): *"when it is set to
paper trading or live cash mode and it is really not possible because
of no api key or not available, grey out that section and add a
description of why it is not available, like 'not setup' or something
like 'not available on polymarket'."*

PM6 makes the Bot Trades panel tell the truth about what can REALLY
trade in the currently selected run mode. This phase is truthful
availability display + disabled controls ONLY: no paper/live runner
was built, the engine's order flow is not gated, and no credential
values are stored, logged, or displayed anywhere.

## The availability model

Single source of truth: the API. `computeAvailability()` in
`app/packages/api/src/availability.ts` is a pure function of —

1. **The stored run mode** — the API-owned desired mode
   (`ModeStore.desiredMode()`: the dashboard switch's stored choice,
   else the MODE env). The same source the dashboard mode switch
   uses. Computed fresh on every `GET /allocations`, so a mode flip
   is reflected on the panel's next fetch — never stale (verified
   live, see below).
2. **Broker configuration PRESENCE** — booleans only, computed once
   at API startup from its environment:
   - Alpaca keys present = `ALPACA_API_KEY` **and**
     `ALPACA_API_SECRET` both non-empty.
   - Kalshi demo creds present = `KALSHI_API_KEY_ID` non-empty
     **and** one of `KALSHI_PRIVATE_KEY` / `KALSHI_PRIVATE_KEY_PATH`
     / `KALSHI_API_KEY` non-empty (see "Kalshi env names" below).

   The key VALUES are never read beyond non-emptiness, never logged
   (the boot log prints only "configured"/"absent"), and never
   served. So the API can see them in Docker, `docker-compose.yml`
   now passes the four names through to the **api** service with a
   "PRESENCE ONLY" comment (previously only the engine received the
   Alpaca pair).

`GET /allocations` now also carries (see `AllocationState` in
`@fleet/shared` types):

- `runMode` — the mode the availability was computed for.
- `sleeveAvailability` — `[{ sleeve, available, reason }]` in UI
  order (crypto, kalshi, polymarket); `reason` is null when
  available.
- `botAllocationAvailable` — false when NO sleeve can trade in the
  mode (the Bot Allocation field + Save button grey out too).
- `botAllocationReason` — one-line summary of the blockers; null
  when the allocation control is available.

## The rules (exactly the truths of this build)

| Mode | Crypto | Kalshi | Polymarket | Bot Allocation |
|---|---|---|---|---|
| **sim** | available (simulator) | available (simulator) | available (simulator) | available |
| **paper** | unavailable — first blocker below | unavailable — first blocker below | unavailable — no paper mode | **unavailable** (no sleeve can trade) |
| **connected** | unavailable — live not enabled | unavailable — live not enabled | unavailable — live not enabled | **unavailable** |

Exact reason strings:

- Polymarket, paper: `Not available on Polymarket — Polymarket has no paper mode`
  (Polymarket has no paper/testnet mode at all — unavailable on
  principle, regardless of configuration.)
- Crypto, paper, no keys: `Not set up — no Alpaca paper API keys configured`
- Crypto, paper, keys present: `Not set up — the Alpaca paper runner isn't built yet`
  (PolyCrypt9000's Alpaca paper runner is not built in this build —
  it runs on the simulator in paper mode — so crypto is unavailable
  in paper either way; the reason names the FIRST blocker.)
- Kalshi, paper, no creds: `Not set up — Kalshi demo isn't connected (no API keys configured)`
- Kalshi, paper, creds present: `Not set up — the Kalshi demo runner isn't built yet`
  (Kalshi "paper" is its demo environment; the demo runner is not
  built in this build.)
- Any sleeve, connected: `Live cash mode is not enabled yet`
  (Live trading is a guardrail stub in this build; the mode switch
  already refuses to store "connected" and the dropdown lists it as
  not enabled yet. This row covers a connected mode set via env.)
- Bot Allocation, paper (panel-level note): `The bot can't trade in Paper trading yet — Polymarket has no paper mode, and the Crypto and Kalshi paper sleeves aren't set up in this build.`
- Bot Allocation, connected: `Live cash mode is not enabled yet`

## Kalshi env names checked

The true-paper phase has not defined Kalshi credential names yet —
no Kalshi runner or config exists anywhere in this codebase (the
only "kalshi" hits are the sleeve itself). PM6 therefore checks the
names that phase will use, documented in `app/.env.example`:
`KALSHI_API_KEY_ID` plus `KALSHI_PRIVATE_KEY` (PEM contents),
`KALSHI_PRIVATE_KEY_PATH`, or `KALSHI_API_KEY`. Until credentials
under those names exist, Kalshi counts as **not configured** and
shows the "isn't connected" reason. When the true-paper phase lands,
it should adopt these same names so the label flips automatically.

## What the panel does with it

- A sleeve the API marks unavailable renders dimmed
  (`.sleeve-row.unavailable`), its switch is `disabled`, and the
  reason appears in amber (`.sleeve-reason`, the palette's existing
  `#f0b429`) under the sleeve's description. The saved ON/OFF
  preference still renders (dimmed with the row) — availability
  never edits stored preferences; a greyed sleeve simply can't be
  flipped, and can't take effect, while unavailable. `flipSleeve`
  also refuses unavailable sleeves in code (defense in depth).
- When no sleeve is available, the Bot Allocation row greys the
  same way (input + Save disabled) and the panel-level note
  (`botAllocationReason`) appears under it in amber.
- Freshness: App passes its desired run mode (kept live by the
  WebSocket mode broadcasts) into `SplitView`, whose allocations
  effect re-fetches whenever it changes — plus the panel already
  re-fetches on load and after every allocation/toggle write. In
  sim mode, nothing changes from PM5 behavior.
- Unchanged, per scope: the Market Scans panel, Your Selections,
  the Trade Stream, the kill switch, and the RUN MODE dropdown
  itself (including its existing "Live cash account — not enabled
  yet" lock).

## Verification (all run 2026-11-09, native tsx, state in /tmp)

- `npm run typecheck` (all workspaces) — PASS.
- Main build (`npm run build`) — PASS. Showcase build
  (`build:showcase`) — PASS.
- **(a) MODE=sim** → `runMode: "sim"`, all three sleeves
  `available: true, reason: null`; `botAllocationAvailable: true`.
- **(b) MODE=paper, no keys** → crypto: `Not set up — no Alpaca
  paper API keys configured`; kalshi: `Not set up — Kalshi demo
  isn't connected (no API keys configured)`; polymarket: `Not
  available on Polymarket — Polymarket has no paper mode`;
  `botAllocationAvailable: false` with the Paper-trading summary
  note above.
- **(c) MODE=paper, dummy non-empty ALPACA_API_KEY/SECRET** →
  crypto reason flips to `Not set up — the Alpaca paper runner
  isn't built yet` (first-blocker logic proven); kalshi and
  polymarket unchanged. Dummy values were passed only in the
  throwaway test process env — never written to any file, and a
  repo-wide grep confirms none leaked.
- **Live mode flip, same API process:** started in sim (all
  available) → `POST /mode {"mode":"paper"}` → the next
  `GET /allocations` reports `runMode: "paper"` with every sleeve
  unavailable and `botAllocationAvailable: false`. Availability is
  never stale after a switch.
- All test stacks killed afterwards; every test port verified free
  and no test processes remain.

## Deploy (Keith, on the VM)

1. SSH in: `cd ~/apps/prediction-markets-only/auto-bots-traders && git pull`
2. `cd app && docker compose up -d --build`
3. Open http://100.105.73.95:4173 — in Simulator mode the Bot Trades
   panel looks exactly as before.
4. Flip RUN MODE to **Paper trading** (confirm the switch) and watch
   the Bot Trades panel: all three sleeves grey out with their
   reasons, and the Bot Allocation control greys with the summary
   note. Flip back to Simulator and everything re-enables.

## PM6 fix — building base pulse vs satellite beam color (Keith, 2026-11-09)

Keith spotted that the bottom of a building did not always pulse the
same color as its satellite beam. He was right, and here is why, in
plain terms: the beam and the glow pool under the building were driven
by one flash, but the expanding shockwave rings at the building's base
were a *second, separate* color system. Each ring kept whatever color
it was born with for its own lifetime — a winning trade even spawned a
cyan ring under a green beam — and when trades landed back-to-back
(the simulator does this constantly), the beam and pool switched to
the new trade's color while the previous trade's ring was still
expanding at the base in the old color.

The fix makes one flash per building the only source of pulse color:
the flash is created once from the trade (green for a win, red for a
loss, the bot's own color for an open), and the beam, the dish glow
and ring, the ground pool, the base shockwaves, and the particle
bursts all take that one color. The shockwaves now live exactly as
long as the flash, and the moment a new trade fires, the building's
old shockwaves are removed in the same step — before the next frame
is drawn — so nothing at the base can ever show a stale color. The
slow plinth ring that drifts green/red with recent profit/loss is a
separate effect and is unchanged.

Verified by a deterministic harness (`app/tools/test-landscape-flash.ts`,
26/26 checks) that drives the shipped flash functions through
win → loss → open events back-to-back and confirms the beam color and
pool color are identical — and are the latest event's color — at every
point in the decay, plus source pins that tie the render loop to those
functions. Typecheck and both builds pass; the v18 landscape harness
still passes 15/15. This fix rides with the PM6 push.
