# Phase 7 (v15 — production URLs: UI_URL / API_URL)

Driven by the 2026-11-05 Cloudflare test: the dashboard bundle built
its API and WebSocket addresses as `http://` / `ws://` against the
page's own hostname, port 8080. On any HTTPS page the browser kills
that WebSocket at construction (`SecurityError: An insecure
WebSocket connection may not be initiated from a page loaded over
HTTPS`), and on a public host there is no API on :8080 anyway. The
addresses are now configurable for a production VPS build.

## The two .env values (app/.env)

| Variable | Example | Consumed by |
|---|---|---|
| `UI_URL` | `https://traderbot.example.com` | API — its CORS allowlist (only this origin may call it from a browser) |
| `API_URL` | `https://api.traderbot.example.com` | Web build — the address browsers use for API fetches and the event WebSocket |

Both blank (the default) = local behaviour, unchanged: the dashboard
talks to the API on the same host, port 8080.

## How the values flow

- **API_URL → web bundle.** A browser app cannot read a server .env
  at runtime, so the value is supplied at build time: Compose passes
  `API_URL` as the web image's `VITE_API_URL` build arg
  (`docker-compose.yml` → `packages/web/Dockerfile` `ARG`/`ENV`), and
  Vite bakes it into the static bundle. Consequence: **changing
  API_URL requires `docker compose up -d --build`** — a restart or a
  plain `up -d` keeps the old baked-in address.
- **WebSocket derivation.** `EVENTS_URL` is derived from the API base
  in `packages/web/src/App.tsx`: `https:` → `wss:`, `http:` → `ws:`,
  path preserved, `/events` appended. An `API_URL` with a path prefix
  (e.g. `https://traderbot.example.com/api` behind a reverse proxy)
  therefore yields `wss://traderbot.example.com/api/events`.
- **Fallback protocol fix.** With no API_URL set, the old same-host
  :8080 default now follows the page's own protocol instead of being
  hardcoded to http/ws.
- **UI_URL → API CORS.** `packages/api/src/index.ts` reads `UI_URL`
  at boot (Compose passes it from the same .env). Set → CORS reflects
  only that origin, and the boot log prints `CORS allowlist: <url>
  (UI_URL)`. Unset → reflect any origin, as in local development.

## What this does NOT do

Code alone cannot give the VPS public addresses. The VPS/reverse
proxy still has to route the names: the UI name serving the web app
over HTTPS, and the API name (or the /api path) proxying to the API
container on :8080 **with WebSocket upgrade support** for /events.
Until that routing and TLS exist, a hosted page remains a shell —
this phase makes the bundle point at the right place once they do.

## Verification (run on the build VM, 2026-11-05)

- Root `npm run build` (typecheck + all workspace builds): clean.
- Web build with `VITE_API_URL=https://api.example.com`: the bundle
  contains the baked API URL and the `wss:` derivation; a default
  build contains no baked URL.
- API booted with `UI_URL=https://ui.example.com`: a request with
  that Origin gets `access-control-allow-origin:
  https://ui.example.com`; a request from another origin gets no
  such header; the boot log prints the allowlist line. Booted
  without UI_URL: arbitrary origins are reflected, as before.
- `docker-compose.yml` parses; web build arg and api env wiring
  confirmed in the parsed YAML.

## Files

- `app/packages/web/src/App.tsx` — configurable API base + derived
  events URL (+ protocol-following local fallback).
- `app/packages/web/src/vite-env.d.ts` — `VITE_API_URL` typing.
- `app/packages/web/Dockerfile` — `ARG`/`ENV VITE_API_URL` before the
  build step.
- `app/packages/api/src/index.ts` — `UI_URL` CORS allowlist.
- `app/docker-compose.yml` — web build arg from `API_URL`; api env
  from `UI_URL`.
- `app/.env.example`, `app/README.md` — documented.
