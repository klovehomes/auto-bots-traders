# Trader Bots — App

TypeScript monorepo (npm workspaces) for Keith's Polymarket-only
single-bot app — PolyCrypt9000 only (branch `pplymarket-only`). This is
the app cut down to that one bot: its Polymarket mispricing shadow
sleeve plus its BTC/ETH/SOL crypto breakout sleeve, 50/50 under one
risk cap. It retains the bot `.md` loader, the event bus, an Alpaca
connection check, and the landscape page — packaged for Docker Compose
from day one. No real trading yet; everything runs in paper/shadow
mode as the phases land.

## Layout

```
app/
  packages/
    shared/   @fleet/shared — FleetEvent/BotConfig types, zod schemas,
              and the bot .md loader (gray-matter)
    engine/   @fleet/engine — loads the bots, checks the Alpaca paper
              connection, and (Phase 0) emits a synthetic test event
              every ~5s to prove the pipeline end to end
    api/      @fleet/api — Fastify server: GET /health, GET /bots,
              POST /internal/events (token-guarded), WS /events
    web/      @fleet/web — React + Vite placeholder landscape: bot avatar
              discs, WebSocket status, live event feed (Three.js is Phase 2)
  docker-compose.yml
  .env.example
```

Bot definitions are **not** in this repo folder — they live in `../bots/`
(one `.md` per bot) and are read at runtime. Only top-level `*.md` files
load; `bots/retired/` is never read.

### How the loader treats bot files

Identity fields (`name`, `codename`, `enabled`, `mode`, `market`,
`broker`, `strategy`, `viz.color/form/avatar_accessory`) are validated
strictly with zod — a malformed bot file fails loudly at startup.
`rules`, `risk`, and `universe` are passed through as loose data on
purpose: the files intentionally carry prose there (e.g. *"3 (per
Polymarket position) / 15 (per crypto position)"*), and the per-strategy
plugins that interpret them arrive in Phase 1+.

### Event flow

```
engine ──POST /internal/events (x-internal-token)──► api ──WS /events──► web
```

Events match the schema in `../PLAN.md`:
`{bot, type, decision_id, symbol, side, qty, price, pnl, reason, ts}`.

## Run it natively

```bash
cd app
npm install
cp .env.example .env        # optional; defaults work without it

npm run dev                 # api + engine + web together (concurrently)
# or individually:
npm run dev:api             # http://localhost:8080  (GET /health, /bots)
npm run dev:engine          # loads bots, posts a test event every ~5s
npm run dev:web             # http://localhost:5173
```

Other root scripts: `npm run typecheck`, `npm run build`
(the web build runs `vite build`; the backend packages typecheck —
services run from TypeScript source via `tsx`).

Sanity checks once running:

```bash
curl http://localhost:8080/health   # {"ok":true}
curl http://localhost:8080/bots     # the one bot config as JSON
```

## Run it with Docker Compose

```bash
cd app
cp .env.example .env        # set real values if you have them
docker compose up --build
```

- API on http://localhost:8080, landscape on http://localhost:4173
- `../bots` is mounted read-only at `/bots` in the engine and API
  containers (`BOTS_DIR=/bots`), so editing a bot file + restarting a
  container picks it up; secrets come from your `.env`, never the image
- All services use `restart: unless-stopped`

## Alpaca stub mode

The engine only attempts an Alpaca connection when **both**
`ALPACA_API_KEY` and `ALPACA_API_SECRET` are set. Until then it logs:

```
[alpaca] stub mode: Alpaca keys not configured (ALPACA_API_KEY / ALPACA_API_SECRET unset) — skipping broker connection check.
```

…and keeps running. That is the expected state until the Alpaca paper
account exists. Keys go in `.env` (gitignored) — never in the bot `.md`
files, never in git. `ALPACA_PAPER` defaults to `true`; the bot stays
in paper/shadow mode until a live gate is approved (see PLAN.md).

## Run modes (MODE)

The app has three run modes. The `MODE` env var (default `sim`) is
only the *initial* default: since Phase 5 the dashboard has a mode
switch (upper right, under the status indicator) whose choice the API
persists to `MODE_STATE_PATH` on the data volume — and a stored choice
beats the env value on every later boot. Flipping the switch makes the
engine exit and Docker's restart policy relaunches it into the new
mode; the boot log says where the mode came from (`(source: dashboard
switch)` vs `(source: env)`). The switch offers `sim` and `paper`;
**Live cash account is listed but locked** — going live stays a
per-bot, deliberate step, never a dropdown flip. The MODE is the
ceiling: the bot file's own `mode` can hold the bot below it, never
above it.

- **`sim`** — synthetic market, no broker. A seeded random-walk price
  book, a small position book for the bot with $10,000 of sim equity, and
  opens/closes in the bot's own voice flowing through the normal event
  pipeline. The web page shows a **SIMULATED DATA** badge (from the
  engine's reported running mode, `GET /mode`). This is the mode for
  running the stack on a laptop under WSL + Docker — see
  `../LOCAL-RUN.md`.
- **`paper`** — Alpaca paper account: the stub-aware connection check
  runs, then PolyCrypt9000 runs on the simulator until its shadow/crypto
  runners land. Polymarket has no paper/testnet, so its Polymarket
  sleeve is shadow-by-design; its crypto sleeve will use the Alpaca
  paper account once that runner is built.
- **`connected`** — live accounts. **Not implemented in this build**: the
  engine logs that live trading is not enabled and runs paper-check
  behavior only. The config shape and the guardrail exist now so the
  mode is a deliberate, per-bot-approved step later, never an accident.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `MODE` | engine, api | `sim` (initial default only — a stored dashboard choice wins) |
| `MODE_STATE_PATH` | api (writes), engine (reads at boot) | `data/mode-state.json`; Docker: `/data/mode-state.json` |
| `ALPACA_API_KEY` / `ALPACA_API_SECRET` | engine | unset → stub mode |
| `ALPACA_PAPER` | engine | `true` |
| `INTERNAL_EVENT_TOKEN` | engine, api | `dev-token` |
| `BOTS_DIR` | engine, api | `../../bots` layout default |
| `API_PORT` | api | `8080` |
| `API_BASE_URL` | engine | `http://localhost:8080` |
| `UI_URL` | api (CORS allowlist) | unset → reflect any origin (local dev); set to the dashboard's public origin for production |
| `API_URL` | web (build time) | unset → same host as the page, port 8080; Compose passes it to the web build as `VITE_API_URL`, baked into the bundle — changing it requires a rebuild |
