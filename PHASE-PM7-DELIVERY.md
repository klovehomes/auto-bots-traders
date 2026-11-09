# Phase PM7 — Email activation-code gate, inside the app

PM6 was the mode greying; the fix on top of it made the building base
pulse share one flash color with the satellite beam. PM7 adds the
email gate Keith asked for on 2026-11-09 — with his explicit
correction applied: **the gate runs inside this Docker stack, not on
Cloudflare.** No Pages Functions, no D1, no wrangler anywhere in this
phase. Registrations live in a database owned by the API service, on
the same Docker volume as the rest of the app's state, on Keith's
own Google Cloud VM.

The mechanics are a native port of the proven v17 showcase gate
(readonly branch): same rules, same response shapes, same failure
posture — reimplemented against this stack's Fastify API and its
JSON-store persistence pattern.

## Architecture

### The gate DB — `GateStore` (`app/packages/api/src/gate.ts`)

A store in the API package following the ControlStore pattern
(atomic tmp+rename JSON writes, corrupt file → loud log + empty
start, never wedging the API). Path from env `GATE_STATE_PATH`;
docker-compose sets it to **`/data/gate-state.json` on the existing
`fleet-data` volume**, next to control-state.json, mode-state.json,
event-history.json and allocations.json — so the registration list
is inside Keith's deployment and inside his VM disk snapshots.

Contents:
- `registrations` — `{email, createdAt, verifiedAt}` (the list
  itself; Keith can read/export the file on the volume any time).
- `codes` — one live record per email: `{email, codeHash, createdAt,
  expiresAt, attempts, usedAt}`. **Only the SHA-256 hash of a code
  is ever stored — a plaintext code never touches disk** (harness
  check (c) greps the state file for the live code).
- `rateEvents` — `{kind: register_email | register_ip, key, ts}`,
  pruned past 24 h on save (dead code records prune the same way).

### Endpoints (public by design — they ARE the gate)

- `GET /gate/status` → `{enabled, authenticated}` — `authenticated`
  reflects the request's `pm_session` cookie.
- `POST /gate/register` `{email}` → validates + normalizes the
  email (400 `invalid_email`), rate-limits (**5 requests per email
  per hour, 20 per IP per hour** → 429 `rate_limited`), upserts the
  registration, generates a **6-digit code (10-minute expiry)**,
  stores only its hash, and emails it. The success response is
  deliberately generic (`{ok:true}`) — it never reveals whether the
  address was already registered. Mail failures are logged loudly
  and still return the generic success (v17 posture).
- `POST /gate/verify` `{email, code}` → every failure is the same
  uniform **401 `invalid_code`**: no live code, already used,
  expired, burned, or hash mismatch. A mismatch bumps `attempts`;
  at **5 attempts the code is burned** — even the correct code then
  fails. On success the code is marked used (single-use), the
  registration is marked verified, and the session cookie is set.
- With the gate disabled, register/verify return **403
  `gate_disabled`** and status reports `enabled:false`.

### Mail — Resend, from the API

`sendActivationCode` posts to the Resend API when `RESEND_API_KEY`
is configured (sender `MAIL_FROM`, "Prediction Markets Assistant"
branding in subject + body). **Dev mode:** with no key configured,
no mail can be sent, so the code is logged to the API console and
returned in a `dev_code` response field — strictly only in that
mode. The harness's production-mode probe (dummy key set) verified
the register response contains **no `dev_code`** — with a key set
the field is impossible, exactly like v17.

### Session

Cookie **`pm_session`**: `base64url(payload).base64url(HMAC-SHA256)`,
payload `{email, iat}` only, secret from env `GATE_SESSION_SECRET`,
**~60 days**, `HttpOnly; SameSite=Lax; Path=/`. Stateless — no
session table; verification recomputes the HMAC (constant-time
compare) and checks the age on every request.

**Cookie Secure note:** the `Secure` attribute is env-driven
(`GATE_COOKIE_SECURE`, default **false**). The VM dashboard is
served over plain http on Tailscale — a Secure cookie would never
be sent back by the browser there, silently breaking the gate.
Set `GATE_COOKIE_SECURE=true` only when the app is behind a real
HTTPS deployment. (A future public deployment on its own domain
would also want SameSite review for the cross-site case; over
Tailscale/localhost the API and dashboard are same-site, so Lax
cookies ride along, including on the WebSocket handshake.)

### Enforcement — only when `GATE_ENABLED=true`

A single `onRequest` guard in the API (registered after CORS, so
preflights are answered by the CORS plugin first):

- Exempt: `/gate/*` (the gate itself) and `/internal/*` — the
  engine-facing channel stays guarded by `INTERNAL_EVENT_TOKEN`
  exactly as before; the engine never carries a cookie and keeps
  working untouched (harness check (h)).
- **Everything else requires a valid session → 401
  `{ok:false, error:"unauthorized"}`**: `/bots`, `/control` reads
  and kill actions, `/mode`, `/events/history`, the scans,
  allocations and user-selections endpoints — **and the `/events`
  WebSocket upgrade** (the hook runs before the upgrade completes).
  The kill switch being behind the session is the point of the gate.
- `GATE_ENABLED` not true → **zero behavior change**: the hook
  returns immediately, no store is opened, no state file is
  written (harness phase C).

CORS gained `credentials: true` so the dashboard (web :4173 →
api :8080, cross-origin) can carry the cookie; the origin stays
pinned to `UI_URL` when set and reflected (a specific origin, never
`*`) when not.

### Web — gate screen + wrapper (`GateScreen.tsx`, `App.tsx`)

- The exported `App` is now a thin wrapper; the previous dashboard
  component is unchanged inside it (`Dashboard`).
- On load the wrapper fetches `GET /gate/status`. Enabled + not
  authenticated → the **gate screen** renders instead of the
  dashboard: PM-branded card (text-only monogram — no binary
  assets), email step → code step → success beat → the wrapper
  swaps the dashboard in. Errors mirror v17's copy (invalid email,
  rate-limited, code mismatch/expiry).
- Status call failing (API down, older API build) → falls back to a
  **normal dashboard boot**; the gate can never wedge the app.
- A single fetch interceptor (installed by the wrapper) (1) adds
  `credentials:"include"` to every API call so the cookie is sent
  and stored cross-origin, and (2) turns any non-gate API **401**
  into a bounce: the wrapper re-checks status and, only if the
  gate is on and the session is really gone, returns the user to
  the gate screen (expired/tampered session handling).

### Showcase — untouched

The Cloudflare showcase is a separate static artifact; the gate
does not apply to it. Its build still passes, and its bundle was
verified to contain no gate/dashboard code (no `gate/register`
strings). Nothing about PM2 changes.

## Env (documented in `app/.env.example`, passed by compose to the API)

```
GATE_ENABLED=false            # true turns the gate on
GATE_SESSION_SECRET=          # long random — `openssl rand -hex 32`
GATE_STATE_PATH=              # compose sets /data/gate-state.json
GATE_COOKIE_SECURE=false      # true only behind real HTTPS
RESEND_API_KEY=               # empty = dev mode (codes in response)
MAIL_FROM=                    # sender on your verified Resend domain
```

Boot logs announce the gate state, the state path + registration
count, whether mail is Resend or DEV MODE, and warn loudly if the
gate is on without `GATE_SESSION_SECRET` (an insecure dev fallback
secret is used so local runs don't wedge — set the real one).

## Verification

- `npm run typecheck` — PASS (all workspaces).
- Main build — PASS; showcase build — PASS (no gate leakage, above).
- **Gate harness `app/tools/test-gate-local.mjs`: 20 passed, 0
  failed** — the real API over HTTP, throwaway state in /tmp:
  - Gate on, dev mode: /bots 401 without cookie; register returns
    `dev_code`; **state file contains no plaintext code** (and does
    contain the hash + registration); 5 wrong codes burn the code
    and the correct code then fails; fresh verify sets the cookie;
    /bots with cookie → 200 with exactly 1 bot (polycrypt9000);
    tampered cookie → 401; engine `POST /internal/events` with the
    internal token → 200 while the gate is on; 6th register for one
    email within the hour → 429.
  - Expiry: a code record expired on disk + API restart → verify
    with the (previously correct) code → 401.
  - Gate off: /bots → 200 without any cookie; register → 403;
    status `enabled:false`; no gate-state file written.
- **Production-mode probe:** API booted with a (dummy) Resend key
  set → boot log "Resend configured"; register → `{ok:true}` with
  **no `dev_code`** (the send itself fails against the dummy key
  and is swallowed/logged by design — no real email was sent).
- All test stacks killed; ports 8080/4173/18098/18099 verified free.

## Keith's VM enablement steps

On the VM, in `~/apps/prediction-markets-only/auto-bots-traders/app`:

1. Edit `.env` and set:
   ```
   GATE_ENABLED=true
   GATE_SESSION_SECRET=<output of: openssl rand -hex 32>
   RESEND_API_KEY=<your Resend key>        # when ready; empty = dev mode
   MAIL_FROM=<sender on your verified Resend domain>
   ```
   (Leave `GATE_COOKIE_SECURE` unset/false — the dashboard is http
   on Tailscale.)
2. Rebuild + restart: `docker compose up -d --build`
3. Open the dashboard (http://100.105.73.95:4173): you should land
   on the gate screen. Register **your own email first**, enter the
   code (emailed once Resend is set; shown on-screen in dev mode
   until then), and you're in — the cookie lasts ~60 days.
4. Your registration list lives at **`/data/gate-state.json` on the
   `traders_fleet-data` volume** on the VM (registrations with
   created/verified timestamps; codes only as hashes). It's yours
   to read or export at any time, and it's covered by the VM disk
   snapshots.

Nothing in this phase was pushed to GitHub — the PM6 + pulse-fix +
PM7 stack stays local until Keith approves the push.
