# Trading-Bot Fleet — App (Phase 0 scaffold)

TypeScript monorepo (npm workspaces) for Keith's five-bot trading fleet.
This is the **Phase 0 scaffold** from `../PLAN.md`: the bot `.md` loader,
the event bus, an Alpaca connection check, and a placeholder landscape
page — packaged for Docker Compose from day one. No real trading yet;
everything runs in paper/shadow mode as the phases land.

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
curl http://localhost:8080/bots     # the five bot configs as JSON
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
files, never in git. `ALPACA_PAPER` defaults to `true`; the fleet stays
in paper/shadow mode until a per-bot live gate is approved (see PLAN.md).

## Run modes (MODE)

The fleet has three run modes, set by the `MODE` env var (default
`sim`). The fleet MODE is the ceiling: a bot file's own `mode` can hold
that bot below it, never above it.

- **`sim`** — synthetic market, no broker. A seeded random-walk price
  book, a small position book per bot with $5,000 of sim equity each, and
  opens/closes in each bot's own voice flowing through the normal event
  pipeline. `GET /health` reports `mode: "sim"` and the web page shows a
  **SIMULATED DATA** badge. This is the mode for running the stack on a
  laptop under WSL + Docker — see `../LOCAL-RUN.md`.
- **`paper`** — Alpaca paper account: the stub-aware connection check
  (plus the Phase 0 test emitter until real strategy workers land).
- **`connected`** — live accounts. **Not implemented in this build**: the
  engine logs that live trading is not enabled and runs paper-check
  behavior only. The config shape and the guardrail exist now so the
  mode is a deliberate, per-bot-approved step later, never an accident.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `MODE` | engine, api | `sim` |
| `ALPACA_API_KEY` / `ALPACA_API_SECRET` | engine | unset → stub mode |
| `ALPACA_PAPER` | engine | `true` |
| `INTERNAL_EVENT_TOKEN` | engine, api | `dev-token` |
| `BOTS_DIR` | engine, api | `../../bots` layout default |
| `API_PORT` | api | `8080` |
| `API_BASE_URL` | engine | `http://localhost:8080` |
