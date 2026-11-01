# Five-Bot Trading System — Implementation Plan

*Drafted 2026-10-29 in the "app planning" chat. Status: planning. Nothing trades yet — everything below starts in paper/shadow mode. Vega added, Bastion rebuilt as Wesley, and Oracle + Pulse merged into PolyCrypt9000 — all 2026-10-30.*

## The idea

Five autonomous trading bots, each defined by its own Markdown file in `bots/`:
the YAML frontmatter is the machine-enforced parameter set, and the prose body is
the bot's trading philosophy. Two bots trade US stocks, two trade options (one
aggressive, one for income), and one trades Polymarket and crypto together.
A futuristic 3D "landscape" web page shows all five bots live:
when a bot closes a winning trade it fires a bright green/cyan pulse; a losing
trade fires a red flare.

| Bot | Market | Style | Color in the landscape |
|---|---|---|---|
| Trendia | US stocks | Large-cap momentum / trend following | Cyan |
| Snapback | US stocks + ETFs | Mean reversion (buy the dip in uptrends) | Violet |
| Vega | US options | Options on highly volatile stocks/ETFs ($5–$200 underlyings); 75% of holdings in options | Pink |
| Wesley | US options + stocks | Income only — covered calls + cash-secured puts on $5–$55 stocks (the wheel) | Green |
| PolyCrypt9000 | Polymarket + crypto | Mispricing vs. model (shadow mode) + BTC/ETH/SOL breakout, in one bot | Gold |

## Architecture

```
bots/*.md ──► Bot Engine (TypeScript / Node.js)
                │  loads frontmatter params + philosophy text
                │  one worker per bot, strategy plugin per bot
                ▼
             Risk Gate  ◄── hard limits live HERE, outside any LLM:
                │         position caps, daily-loss breaker, kill switch
                ▼
        Broker adapters
          ├─ Alpaca      → US stocks + crypto (paper first)
          ├─ Polymarket  → CLOB v2 (shadow mode first)
          └─ ccxt        → optional later crypto venue
                │
                ▼
        Event bus (WebSocket) ──► trades, fills, PnL events
                │
        ┌───────┴────────┐
        ▼                ▼
   SQLite/Postgres    Viz server (Fastify)
   trade + decision log       │
                           ▼
                    React + Three.js landscape
```

Key design rule: **the LLM (if used) advises, the Risk Gate decides.** A bot's
philosophy prose can be fed to an LLM "advisor" that proposes or vetoes trades
and writes a plain-English reason into the audit log — but it can never exceed
the frontmatter params. The Risk Gate enforces those params in plain code.

Editing a bot = editing its `.md` file. The engine watches the folder and
hot-reloads params (risk changes apply immediately; strategy changes apply on
the bot's next evaluation cycle).

## Kill switch and emergency controls (Keith, 2026-11-01)

A kill switch existed in the original design (Risk Gate + bot-control MCP);
Keith sharpened the required scope on 2026-11-01:

- **Two scopes:** every control exists **per individual bot** and
  **team-wide (all bots at once)**.
- **Kill (halt):** immediately stops that bot (or all bots) from trading —
  no new evaluations or orders, pending/open orders for the affected bot(s)
  are cancelled, and the halt **persists across restarts** until Keith
  deliberately re-enables the bot. Existing positions are left open.
- **Kill + liquidate:** the same halt and cancellation, **plus** closing the
  affected positions — only the positions tracked to that bot for a per-bot
  liquidation, or all team-managed positions for a team-wide one.
  Liquidation requires an explicit confirmation (it is a separate, more
  destructive action than halt), uses market/best-available exits, and any
  position that cannot be closed is reported, never silently dropped.
- **Surfaces:** the landscape HUD (per-bot controls + team controls), the
  bot-control API, and the bot-control MCP tools all drive the same Risk Gate
  state — there is one source of truth for "this bot is killed."
- **Audit:** every kill, liquidate, and re-enable action is written to the
  audit/decision log and emitted as an event, with who/what triggered it
  (manual UI, MCP, or an automatic daily-loss breaker trip).

## Languages and libraries

**Core engine — TypeScript on Node.js** (decided by Keith 2026-10-30: his
TypeScript experience and debugging comfort, and one language across
engine, API, and frontend — so the Decision/Trade event types are shared
code between the engine and the landscape, never two definitions that can
drift apart)

- `@alpacahq/alpaca-trade-api` — Alpaca's TypeScript SDK: stocks,
  options + crypto, paper and live, market data. (Publishes as
  `alpaca-trade-api`, not `alpaca-trading-api` — corrected during the
  Phase 0 build, 2026-10-31. The scaffold pins v3.1.3's classic client;
  v5 is a ground-up rewrite, to adopt deliberately if ever.)
- `@polymarket/clob-client` — Polymarket's official TypeScript CLOB
  client. ⚠️ CLOB v2 only: v1-signed orders no longer work on production
  since the 2026-04-28 cutover; collateral is now pUSD, and new API users
  use the deposit-wallet flow (signature type 3, POLY_1271).
- `ccxt` — only if PolyCrypt9000 later needs a non-Alpaca crypto venue
  (ccxt is TypeScript-native)
- `trading-signals` — 120+ indicators (SMA/EMA, RSI, ATR, z-score,
  Donchian), streaming for live trading and batch for backtests — no
  hand-rolled indicator math
- `gray-matter` + `zod` — parse and validate the bot `.md` files
  (frontmatter → typed, schema-checked params)
- `fastify` + `ws` — API + live event stream to the landscape
- `drizzle-orm` over SQLite — decisions/trades log (Postgres when it grows)
- `croner` — market-hours-aware scheduling for the stock/options bots

**Backtester (in-house, TypeScript)** — a bar-replay harness that runs the
*same* strategy code as the live engine against cached historical bars,
with a simulated broker (fills at next-bar open + a slippage assumption),
writing results to the same decisions/trades schema — so backtest, paper,
and live logs are directly comparable at the quarterly review. Covers the
stock bots and PolyCrypt9000's crypto sleeve. Vega and Wesley skip
backtesting by Keith's call (historical options data is the bottleneck in
any language); they prove out in paper trading instead.

**Landscape frontend — TypeScript, same monorepo as the engine**
- `react` + `vite`, `three` via `@react-three/fiber` + `@react-three/drei`
- `lightweight-charts` — per-bot equity sparklines in the HUD
- `tailwindcss` — HUD styling

**Secrets** — API keys and the Polymarket wallet key live in environment
variables or your HashiCorp Vault (you already have the Vault setup from the
access_vault work). **Never in the `.md` files, never in git.**

## MCP servers

MCP is the *supervision and development* layer, not the execution path
(bots execute through the SDKs directly — faster and more reliable).

1. **Alpaca MCP Server (official)** — `uvx alpaca-mcp-server`. Lets Claude/
   Cursor/VS Code query the Alpaca paper account, positions, and market data
   in natural language during development and daily supervision.
2. **Custom "bot-control" MCP server (we build it, ~1 file)** — tools:
   `list_bots`, `bot_status`, `bot_pnl`, `pause_bot`, `resume_bot`,
   `kill_bot`, `kill_all_bots`, `kill_and_liquidate_bot`,
   `kill_all_and_liquidate`, `tail_audit_log`. This is how you ask an AI
   "how did my bots do today, and why did PolyCrypt9000 pass on that market?"
3. **Filesystem MCP** — an AI client can read/edit the bot `.md` files to
   tune philosophies and params under your approval.

## Market-specific notes

**US stocks (Trendia, Snapback)** — Alpaca paper account: free,
$100k simulated, full order lifecycle against real market data. Free IEX feed
is enough to start; SIP feed is a paid upgrade if the bots ever need
full-market data. Stock bots only run during market hours.

**Crypto (PolyCrypt9000's crypto sleeve)** — Alpaca also does crypto in the
same paper account, so the sleeve starts there with zero extra setup and
trades 24/7. ccxt/Kraken is a
later option if you ever want a real crypto venue.

**US options (Vega, Wesley)** — Alpaca supports options in the same paper account,
so Vega needs no second broker. Its underlyings are not a fixed list: a
daily screen keeps only stocks/ETFs priced **$5–$200 per share** with high
realized/implied volatility and liquid options chains (open interest and
spread limits in its `.md`). **75% of Vega's invested capital sits in
options premium, 25% in shares** of the same underlyings; every position is
long premium (defined risk — the premium paid is the max loss per contract).
Wesley runs the options wheel on the same access: cash-secured puts and
covered calls on $5–$55 stocks in weekly/monthly premium cycles — income
only, every put fully cash-backed and every call fully covered.

**Polymarket (PolyCrypt9000's Polymarket sleeve)** — three APIs: Gamma (market discovery), CLOB
(trading), Data (positions/history). Gotchas verified 2026-10-29:
- CLOB v2 only (see SDK note above); collateral is now **pUSD**, not USDC.e
- New API users use the deposit-wallet flow, signature type 3 (`POLY_1271`)
- Gamma gives a `condition_id`; CLOB needs the per-outcome `token_id`
  (from Gamma's `clobTokenIds`) — the classic #1 beginner bug
- **There is no Polymarket testnet.** The sleeve therefore runs in *shadow mode*
  first: it reads real order books, makes decisions, and logs hypothetical
  fills at the real bid/ask without a wallet or funds. Going live later =
  micro-size ($1–5) orders to validate the plumbing, your explicit call.
- Maker orders are fee-free; takers pay a per-market fee; 2% winner fee at
  settlement — the sleeve's minimum edge threshold (8 points) already accounts
  for this.

## The landscape (visualization spec)

One fullscreen Three.js scene, dark futuristic valley:

- A glowing grid terrain with a central "market core" spire whose brightness
  tracks overall market activity (index volume/volatility).
- Each bot is a floating **circular avatar** — a Muse-style character disc in
  the bot's color, with a customizable face/accessory (from its `.md` file's
  `viz` block) — hovering over its own pad. Its ring tints green↔red with its
  unrealized PnL. The same avatar appears next to its trades in the feed and
  on the leaderboard.
- **Open position:** a beam fires from the bot toward a small orbiting node
  labeled with the ticker/market; the node stays tethered while the position
  is open.
- **Winning close:** bright green/cyan shockwave ring + particles rising
  from that bot.
- **Losing close:** red flare + a downward red pulse into the terrain.
- HUD overlay: per-bot equity sparkline, today's PnL, open positions,
  scrolling trade feed, per-bot kill controls on each bot, and team-wide
  KILL / KILL + LIQUIDATE controls in the HUD (all wired to the same
  bot-control API; liquidation asks for an explicit confirmation).

Event schema from engine → frontend (WebSocket `/events`):
`{bot, type: open|close|signal|halt, decision_id, symbol, side, qty, price, pnl, reason, ts}`

## Below the landscape: trade feed, YTD totals, leaderboard

The landscape is the show; directly under it sits the data, one click away.

**Collapsible trade stream.** A "Trade Stream" bar below the landscape,
collapsed by default. Clicking it expands a live feed of every trade from
every bot, newest first (WebSocket for new rows, REST for history):

```
Trendia   bought  "NVDA"        · Oct 29, 9:41 AM PT
Snapback  sold    "AMD"         · Oct 29, 9:37 AM PT · +$128.40
PolyCrypt9000 bought "YES — Fed holds in December" · Oct 29, 9:12 AM PT
PolyCrypt9000 sold   "ETH/USD"     · Oct 29, 8:58 AM PT · −$42.17
```

Format rule: `BotName bought|sold "item" · timestamp`, and on closes the
realized profit/loss — **profits in green text, losses in red**. Opens show
no PnL (nothing realized yet). Small avatar disc beside each row; filter by
bot.

**YTD totals bar.** Pinned above the feed: a running total of **all bots'
realized losses YTD in red**, total realized profits YTD in green beside it,
and the net. (Keith asked for the losses total specifically — it sits next
to its green counterpart so the number is honest at a glance.)

**Leaderboard tab.** Tabs beside the landscape: `Landscape | Leaderboard`.
The leaderboard lists every bot in the system ranked by net PnL % (fair
across bots because everyone starts with the same allocation): avatar +
name, net PnL ($ and %), win rate, trade count, current equity vs. starting
allocation, and max drawdown. Clicking a bot opens its `.md` philosophy and
current positions.

## Decision log — every trade explains itself

Alongside the trade log sits a **decision log**, linked foreign-key style:

- **`decisions`** — one row per signal-level decision: `decision_id`, bot,
  timestamp, instrument, proposed action, the **trigger condition that
  fired** in plain English ("20-day high breakout; RSI(14) 67, inside the
  55–80 band; price above the 200DMA ✓"), the indicator values at signal
  time, a **snapshot of the bot's params exactly as they were at that
  moment** (params get edited later — history must never be rewritten by a
  later edit), and the Risk Gate's verdict: approved, resized, or rejected,
  with the reason.
- **`trades`** — every executed trade carries `decision_id` as a foreign
  key back to the decision that caused it. An exit gets its own decision
  ("8% trailing stop hit") chained to the entry decision, so a position's
  whole lifecycle — entry reason, exit reason — reads as one story.
- **Vetoes are logged too.** A signal the Risk Gate rejected becomes a
  decision row with no trades — exactly the row you want when asking "why
  didn't it buy?" Routine no-signal evaluations are counted, not logged
  row by row (PolyCrypt9000 scans every 30 minutes; the log would drown).

**UI:** every row in the trade stream gets a small **ⓘ icon** at the end.
Clicking it opens the decision detail: trigger condition, indicator
values, the param snapshot, the gate verdict, and signal-to-fill timing.
The collapsible section gets a second tab — `Trades | Decisions` — listing
every decision, vetoes greyed out with their rejection reason; clicking a
decision highlights the trades it produced.

## Equal starting allocation

Every bot — Keith's five and any approved outsider bot — starts with the
**same dollar amount**: one system config value, `starting_allocation_usd`
(decided 2026-10-30: **$5,000 per bot in paper mode, $500 per bot when a bot
goes live**). The engine keeps a
virtual sub-ledger per bot inside the single Alpaca paper account and
enforces each bot's budget independently, so "same start" is real, not
cosmetic. Leaderboard ranks on % return so it stays fair even if the
allocation amount is changed later for new bots.

**Small-account reality check (2026-10-30):** percentage limits scale down
cleanly, but shares and contracts don't subdivide. At $500 live, Vega's 6%
premium cap is $30 — less than a single options contract on most of its
names — and one cash-secured put for Wesley ties up strike × 100 ($500
minimum at his $5 floor, his entire account). Keith's fix for Wesley
(2026-10-30): his per-position cap is 100% — he may go all-in on a single
100-share block, since the wheel can't be subdivided. So $500-live results will not
mirror $5k-paper results for the options bots: fewer, more concentrated
positions, and daily-loss caps that a single contract's normal swing can
trip. Trendia/Snapback survive on Alpaca fractional shares, with
engine-managed stops (Alpaca doesn't support trailing-stop orders on
fractional positions). PolyCrypt9000 is unaffected — fractional crypto and
micro-size Polymarket orders work at any size.

## Bot submissions (outsiders)

Anyone can submit a bot; only Keith can let one in.

1. **Submit:** a web form — upload a `.md` file (or paste it), plus
   submitter name/contact and a one-line pitch.
2. **Automated checks:** frontmatter parses against the same schema as the
   house bots; risk params must sit *within system caps* (a submission can't
   grant itself a bigger position limit than the house allows); the strategy
   field must name one of the built-in strategy plugins.
3. **Keith's approval queue:** an admin view showing the parsed philosophy,
   params, and check results. Approve or reject with one click.
4. **On approval:** the file lands in `bots/approved/`, the engine hot-loads
   it with the standard starting allocation and a default avatar the
   submitter can customize (color, face, accessory — within the avatar
   system), and it appears in the landscape, feed, and leaderboard like any
   house bot.

Safety model, non-negotiable: **a submission is data, never code.** The
`.md` can express philosophy + parameters for existing strategy types only —
no arbitrary code execution from uploads, ever. Submitted bots run paper
only, under the same Risk Gate, and Keith can pause or evict any bot from
the admin view.

## Run modes (Keith, 2026-10-31)

Three modes, permanent — including in the production build:

- **`sim`** — synthetic market data, no broker connected. The safe
  default, and how the local WSL/Docker version runs.
- **`paper`** — Alpaca paper account: real market data, fake money.
- **`connected`** — live broker accounts, real money.

A team-wide `MODE` setting is the ceiling. A bot file's own `mode`
field can hold that bot *below* the ceiling (team on `paper`, one bot
still in `sim`) but never above it — a bot trades `connected` only when
the team mode is `connected` AND its own file says so. Going connected
stays per-bot and Keith's call only.

*Implemented in the scaffold 2026-10-31:* the `MODE` env switch exists
now — `sim` runs the built-in simulator, `paper` runs the Alpaca paper
check, and `connected` is guarded to paper-check behavior (with a clear
log line) until live trading is deliberately built.

## How it runs

Docker Compose, one command (`docker compose up`), four services:
`engine` (the 5 bot workers + risk gate), `api` (Fastify + event bus),
`web` (the landscape), `db` (Postgres; SQLite file is fine for phase 0–2).

- **Home: a small VPS (decided 2026-10-31)** — ~2 vCPU / 4 GB RAM, Ubuntu
  LTS (Hetzner / DigitalOcean class, roughly $6–25/mo depending on
  provider). PolyCrypt9000 runs overnight, so the team needs an always-on
  box. Provisioning: SSH key-only login, firewall allowing only SSH +
  Tailscale traffic, automatic security updates, non-root deploy user.
- **Deployment:** git repo → `git pull` on the box →
  `docker compose up -d --build`. The repo exists as of 2026-11-01:
  **github.com/klovehomes/auto-bots-traders** — Keith pushed it public,
  then had it made private the same night (2026-11-01), matching the
  plan's original assumption.
  Containers restart automatically
  (`restart: unless-stopped`). Secrets (Alpaca/Polymarket keys) live in a
  locked-down `.env` on the box (or Vault), never in git.
- **Access:** the landscape + API sit behind **Tailscale** — reachable
  only from Keith's own devices. The dashboard carries a kill switch, so
  it is never exposed on a public URL in v1. A public domain + login can
  come later if he ever wants to share the landscape.
- **Backups:** nightly snapshot of the DB volume + the `bots/` folder.
- Landscape is just a web page — open it from your phone or PC over the
  tailnet.
- Everything is paper/shadow until a phase gate you approve. Going live is
  per-bot, never global.

## Implementation phases

- **Phase 0 — Scaffold (days):** repo, `.md` loader + validation, Alpaca
  paper connection, event bus, empty landscape page receiving test events.
  Packaged as Docker Compose from day one, so the VPS deploy is just a
  `git pull` + `docker compose up`. **Status: built and verified natively
  2026-10-31** — the `app/` monorepo loads and validates all 5 bots,
  `/health` + `/bots` respond, test events flow over the WebSocket, and
  the web build passes. Docker's first real build happens on the VPS
  (the dev VM has no Docker).
- **Phase 1 — First bot (week 1):** Trendia end-to-end on Alpaca paper:
  data → signal → risk gate → order → audit log.
- **Phase 1.5 — Backtester:** bar-replay harness over cached historical
  bars running the same strategy code, so Trendia, Snapback, and
  PolyCrypt9000's crypto sleeve get validated before and during paper
  trading. (Options bots skip backtesting by Keith's call — they prove
  out in paper.)
- **Phase 2 — Landscape MVP (week 2):** bots appear as avatar discs; open/close
  flashes wired to Trendia's real paper events; HUD with equity + feed.
- **Phase 3 — The bench (week 3):** Snapback, Vega and Wesley
  (Alpaca paper) and PolyCrypt9000's crypto sleeve come online with
  their own `.md` files.
- **Phase 4 — PolyCrypt9000's Polymarket sleeve (week 4):** shadow mode
  against live books; weekly shadow report (hypothetical PnL, calibration)
  for your review.
- **Phase 5 — Hardening:** kill-switch drills (per-bot, team-wide, and
  kill-and-liquidate), daily-loss breakers tested,
  bot-control MCP server, end-of-day summary. **Live-money gate: your call,
  per bot, only after paper results you like.**
- **Phase 6 — Community layer:** leaderboard tab + YTD totals, collapsible
  trade stream polish, public bot submissions with Keith's approval queue,
  per-bot avatar customization.

## Quarterly bot review (every 90 days)

A scheduled job (`quarterly-bot-review`, tracked as "Quarterly trading-bot
review") fires every 90 days — first run Thu Jan 28, 2027 — and delivers a
per-bot summary report for the trailing quarter in the app planning chat:
PnL ($ and %), win rate, trade count, max drawdown, decision-log highlights
(decisions vs. vetoes, top veto reasons), and params now vs. at period start
(from decision-log snapshots), ending with concrete tuning proposals. It
opens a discussion; it never changes a parameter on its own — tuning edits
happen only with Keith's approval in chat. Until the team is built and
trading, the run reports build status instead of performance numbers.

## Broker platform research (2026-10-29)

Full sourced comparison was researched and delivered 2026-10-29; conclusion:
**Alpaca stays the default.** Ranking for this system: 1 Alpaca, 2 Tradier,
3 tastytrade, 4 Interactive Brokers, 5 Webull, 6 TradeStation, 7 Schwab,
8 E*TRADE. Robinhood has no equities API (crypto only) and Fidelity has no
retail API — both excluded.

tastytrade is the designated add-on candidate **only if futures, futures
options, or index options enter the strategies** (Alpaca has none). Its Open
API is strong (REST + DXLink streaming, official Python SDK plus the popular
community `tastytrade` package, OAuth2 with a non-expiring refresh token,
and an official self-hosted MCP server — which defaults to production, so it
must be pinned to sandbox + read-only). But its cert sandbox resets every
24 hours and serves no REST market data, so it is an order-flow test harness,
not a persistent paper portfolio — it cannot replace Alpaca paper for
development. If futures or index options are ever added, they get a
tastytrade adapter at that point; Vega's and Wesley's equity options run
fine on Alpaca, so no change to the current plan.

## Decisions for Keith

1. **Run location — DECIDED (2026-10-31): VPS.** A small always-on Ubuntu
   box (PolyCrypt9000 runs 24/7); dev uses the identical Docker Compose
   stack, so what runs locally is what ships. Rollout detail in "How it
   runs" below.
2. **LLM advisor in v1**, or pure rules first and add the advisor in phase 5?
   (Recommendation: rules first — the philosophy prose still gets written now
   and shapes the rules; the advisor becomes a veto/explain layer later.)
3. **Crypto venue:** Alpaca crypto paper only (recommended for v1), or plan
   ccxt/Kraken from the start?
4. **Landscape style:** avatar discs over a valley (as specced) or a
   different scene — orbital station, city grid, aquarium? Easy to reskin.
   Keith (2026-10-30) expects to tweak the visuals and UI later — treat
   the current spec as a starting point, not a final design; don't
   gold-plate the first cut.
5. **Starting allocation per bot — DECIDED (2026-10-30):** $5,000 per bot
   in paper mode; $500 per bot when a bot goes live. One config value per
   phase; every bot gets exactly the same.
6. **Submissions:** open to the public at launch, or invite-only until the
   system has a track record?
7. **Engine language — DECIDED (2026-10-30): TypeScript.** Keith's call:
   his TS experience and debugging comfort win. Backtesting is covered by
   the in-house TS replay backtester over the same strategy code plus the
   `trading-signals` library, and he is not concerned about backtesting
   the options bots (Vega/Wesley prove out in paper). The stack section
   above is specced in TypeScript; the Python comparison snippets stay in
   `compare/` for reference.
