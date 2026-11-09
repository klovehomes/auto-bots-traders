# Phase PM5 — Market Scans panel shows Your Selections holdings when no scan is selected

One layout change, requested by Keith on 2026-11-09 while reviewing
PM4 live on his VM (annotated screenshot): the large area inside the
Market Scans panel (left column) that sat empty before a scan was
picked now shows the user's current holdings.

Base: `polymarket-only` tip `658139b` (PM3) + PM4 commit `d195ec0`
(remote `23f90f4`). Web-only change — no API/engine changes.

## The change

Files: `app/packages/web/src/SplitView.tsx`,
`app/packages/web/src/styles.css`.

### Default state = Your Selections holdings
When no scan is selected (initial page load, before any scan chip is
clicked), the Market Scans panel's results area renders a
**"Your Selections — current holdings"** view:

- Per holding: market question, outcome/side, entry price → current
  price, allocated dollars, current value, and P&L (green/red), plus
  the scan it came via and its status.
- A totals line (total allocated · current value · net P&L) identical
  to the bottom tab's totals.
- Empty state when nothing is booked yet: “No selections yet — pick a
  scan above, check some markets, and Submit.”

### One data path, reused — nothing parallel invented
The panel view and the bottom “Your Selections” tab now share:

- the `useUserSelections` hook — `GET /user-selections`, the PM3
  endpoint that returns each booked selection re-priced live from
  Polymarket (`currentPrice`, `currentValue`, `pnl`) plus totals;
- the row sub-line, value/P&L badge, and totals-text components.

The bottom **“Your Selections” tab is unchanged** — the panel view is
an additional at-a-glance home for the same data, not a replacement.

### Selecting a scan — unchanged PM4 behavior
Clicking a scan chip swaps the area to that scan: spinner + skeleton
rows during the fetch, then the results list with
checkboxes/amounts/Submit. After a successful Submit the user stays
on the scan results (no auto-switch); the holdings data bumps its
refresh key behind the scenes so it is fresh when they return.

### Two ways back to holdings
1. **“Show current holdings” button** (Keith's addendum,
   2026-11-09 ~00:45 PT): a distinct full-width button **above** the
   row of scan chips. It clears any active scan selection and shows
   the holdings view, and it carries the active/selected highlight
   (same blue as the active scan chip) whenever the holdings view is
   the one displayed.
2. **Chip toggle**: clicking the currently-active scan chip again
   deselects it and returns to the holdings view.

### Freshness
The holdings view re-prices when it mounts (panel load), when the
user returns to it (button or chip-deselect), and after a Submit
completes (refresh key bump). No new polling was added.

## Verification

- `npm run typecheck` (from `app/`) — PASS, all workspaces.
- Main build — PASS. Showcase build — PASS (built before main so the
  final `dist` is the main bundle; the PM3 rule that the showcase
  contains no PM3+ panel code is unaffected — SplitView's panel is
  not part of the showcase entry).
- Built main bundle grep: `Your Selections — current holdings`,
  `Show current holdings`, and `No selections yet` all present.
- Native sim smoke (tsx, MODE=sim, all state paths in /tmp):
  - `GET /bots` returned exactly **1 bot** (PolyCrypt9000).
  - Booked a real selection through the API: Scan 2 result “Will the
    U.S. invade Iran before 2027?” — No @ 0.885, **$100**,
    `POST /user-selections` → booked; pool went $10,000 → $9,900
    remaining (within-pool validation intact).
  - `GET /user-selections` — the exact endpoint the panel holdings
    view fetches — returned the selection with re-priced fields
    (`currentPrice` 0.885, `currentValue` 100, `pnl` 0) and totals
    (allocated 100 · value 100 · P&L 0).
  - Stack killed afterwards; ports 8080/4173 verified free, no
    processes remain.

## Keith's deploy steps (VM)

1. SSH into the VM, then:
   `cd ~/apps/prediction-markets-only/auto-bots-traders && git pull`
2. `cd app && docker compose up -d --build`
3. Open http://100.105.73.95:4173 — the Market Scans panel now opens
   on your current holdings; pick a scan to browse markets, and use
   **Show current holdings** (or click the active scan again) to
   come back.
