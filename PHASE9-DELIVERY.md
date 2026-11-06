# Phase 9 (v17 — the email gate for the public showcase, Phase B)

Keith's design (2026-11-05/06): the public read-only showcase gets a
front door. A visitor registers with an email address, receives a
6-digit activation code by email, and the code unlocks the site.
Registrations live in **Cloudflare D1** (Keith's call) — the list
stays his own exportable asset; the email service is only the
delivery truck. Milestone letters (Phase C) will mail this list;
they are NOT built yet.

This phase is showcase-line only: `packages/api`, `packages/engine`,
`src/App.tsx` and `src/main.tsx` are untouched, and the default web
build is behaviorally unchanged (verified below).

## The shape of it

```
visitor → Cloudflare Pages (showcase site)
            ├── gate.html ──▶ POST /api/register ──▶ D1 + Resend
            │                    (code, hashed, 10-min expiry)
            └── POST /api/verify ──▶ signed session cookie (~60 d)
          _middleware.js guards everything else:
            no cookie → documents get gate.html, /snapshot.json → 401
```

The functions ship WITH the site: sources live in
`packages/web/showcase-functions/` and the packaging script copies
them to `functions/` at the deploy root (Pages' convention). They
are plain JavaScript (JSDoc-typed) — no build step, no new
dependencies — and use only standard Web APIs, which is also what
lets the Node harness run the real modules in tests.

## 1) Gate backend (packages/web/showcase-functions/)

- `api/register.js` — `POST /api/register {email}`:
  validates + normalizes the email (trim/lowercase); rate-limits
  (5 code requests per email per hour, 20 per IP per hour, counted
  in D1 `rate_events`; the IP is `CF-Connecting-IP`); upserts the
  registration; generates a 6-digit code; stores **only its SHA-256
  hash** with a 10-minute expiry and a zeroed attempt counter;
  sends the code via the mail sender; responds with a generic
  `{ok:true}` that never reveals whether the address was already
  registered.
- `api/verify.js` — `POST /api/verify {email, code}`: checks the
  hash, the expiry, and the attempt budget (max 5 — the code is
  burned on the 5th miss; the post-attempt count is decided from the
  pre-update row, a subtlety the harness caught during this build).
  On success: code deleted (single use), registration marked
  verified, and a session cookie is set — `tb_session`, HttpOnly,
  Secure, SameSite=Lax, ~60 days, payload = email + issued-at,
  HMAC-SHA256-signed with `SESSION_SECRET`. Every failure is the
  same uniform 401.
- `_middleware.js` — the guard. Public: `/api/register`,
  `/api/verify`, `/gate.html`, and all static assets (the gate needs
  its JS/CSS/logo before anyone has a cookie). Everything else:
  `/snapshot.json` and any other `/api/*` path require a valid
  session (else a hard 401 — the fleet data is NOT fetchable by
  guessing the URL); document requests without a session are served
  `gate.html` in place of the app shell; with a session they pass
  through to the showcase.
- `_lib/gate.js` — the shared core: email validation, code
  generation (CSPRNG), hashing, cookie sign/verify, the rate gate,
  and the mail sender behind one function.

**Mail sender.** Production = Resend (plain `fetch` to
`api.resend.com`; key from `RESEND_API_KEY`, From from `MAIL_FROM` —
both Cloudflare-side config, never in the repo). **Dev mode:** when
`RESEND_API_KEY` is unset, no mail can be sent, so the code is
logged to the function console AND returned in a `dev_code` response
field + `X-Dev-Activation-Code` header, and the gate page shows it
in a clearly-marked dev box. This is guarded strictly on the missing
key — with a key configured, a register response never contains a
code (harness-verified). It exists so Keith can test the whole flow
alone before any domain/email setup; treat "dev_code in a response"
in production as a config alarm.

## 2) D1 schema (packages/web/showcase-db/schema.sql)

Binding name: **`DB`**. Idempotent (`IF NOT EXISTS`); timestamps are
integer epoch-ms.

- `registrations(email PK, created_at, verified_at NULL,
  unsubscribed DEFAULT 0)` — the list. (`unsubscribed` is there for
  Phase C letters; no unsubscribe flow is built yet.)
- `activation_codes(email PK, code_hash, expires_at, attempts,
  created_at)` — hashes only, one live code per email.
- `rate_events(id, kind, key, ts)` + lookup index — the minimal
  rate-limit log; pruned opportunistically by the register handler.
- No sessions table — cookies are stateless.

## 3) Gate UI (showcase entry tree)

- `index-gate.html` → `src/gate-main.tsx` → `src/gate.tsx`
  (`GateApp`), built as a second entry of the showcase build
  (`vite.showcase.config.ts`); the packaging script renames the
  output to `gate.html` at the site root. TraderBot-styled card,
  Keith's official v13 logo (`public/traderbot-logo.png`, copied
  from the branding folder and downscaled to 480px for the page),
  three states: email form → code form ("Registered? We emailed you
  a code…", 10-minute expiry noted, "use a different email" escape)
  → success, which reloads into the dashboard.
- `src/showcase.tsx`: a 401 from the snapshot fetch now routes the
  visitor to `/gate.html` (with a brief "registered viewers" notice)
  instead of the old generic load error. Locally (vite preview, no
  middleware) the snapshot is a static file and never 401s, so local
  behavior is unchanged.
- `src/styles.css`: gate classes appended in a Phase 9 section;
  nothing existing was modified.

## 4) Packaging (tools/package-showcase.mjs)

`node tools/package-showcase.mjs` builds the showcase flavor,
stages the deploy root at `~/workspace/trading-bots/showcase-site/`
(site + `functions/` + `wrangler.toml` + `showcase-db/`), and writes
**`~/workspace/your_files/traderbots-showcase-v17.zip`**.
`packages/web/wrangler.toml` names the Pages project
(`traderbots-showcase`), sets the compatibility date, and declares
the D1 binding with a placeholder `database_id` Keith replaces.

Deploy route — be precise: **use wrangler**
(`wrangler pages deploy <folder> --project-name traderbots-showcase`).
The Pages dashboard's direct/zip upload is documented by Cloudflare
for static sites; projects with Functions + bindings are the
wrangler/Git flow, and the earlier zip-upload friction on this
project points the same way. What I verified here: the zip's
contents and static serving (below) — the live Pages deploy itself
is Keith's step and was not executed from this VM.

## Keith's Cloudflare / Resend steps, in order

1. **Get the code** when v17 is pushed (showcase/`readonly` line):
   the zip is already built — `~/workspace/your_files/traderbots-showcase-v17.zip`.
   Unzip it somewhere on the Mac.
2. **Wrangler**: `npm i -g wrangler` if needed, `wrangler login`.
3. **Create the database**: `wrangler d1 create traderbots-showcase`.
   Copy the printed `database_id` into the unzipped folder's
   `wrangler.toml` (replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`).
4. **Apply the schema**:
   `wrangler d1 execute traderbots-showcase --remote --file=showcase-db/schema.sql`
   (run from the unzipped folder).
5. **Resend**: create the account; **add and verify a sending
   domain** (DNS records Resend gives you); create an API key.
   ⚠️ Until a domain is verified, Resend's test sender
   (`onboarding@resend.dev`) delivers ONLY to the Resend account
   owner's own email — fine for your solo end-to-end test, useless
   for real visitors. **A domain decision is the one real external
   dependency for taking registrations public.**
6. **Set the project's secrets** (dashboard → Pages project →
   Settings → Environment variables, or `wrangler pages secret put`):
   - `SESSION_SECRET` — a long random string (e.g. from
     `openssl rand -hex 32`). Never reuse it elsewhere.
   - `RESEND_API_KEY` — from step 5.
   - `MAIL_FROM` — e.g. `TraderBot <showcase@yourdomain>` on the
     verified domain (a plain variable is fine; it's not a secret).
   If the Pages project already exists from the static tests, also
   confirm the D1 binding there (Settings → Functions → D1
   bindings, name must be `DB`) — the wrangler.toml covers
   wrangler deploys; the dashboard binding covers dashboard deploys.
7. **Deploy**: `wrangler pages deploy <unzipped folder> --project-name traderbots-showcase`.
8. **Test it like a visitor**: open the site in a private window →
   you should land on the gate, not the dashboard. Register with
   your own email → code arrives → enter it → dashboard loads.
   Then, still in the private window, open `/snapshot.json`
   directly → it must say 401 until you've verified.

Local pre-flight (optional): `wrangler pages dev <unzipped folder>`
+ `wrangler d1 execute traderbots-showcase --local --file=showcase-db/schema.sql`
gives a fully local D1; leave `RESEND_API_KEY` unset there and the
gate runs in dev mode — the code appears on the gate page itself.

## Verification (build VM, 2026-11-06)

- **Gate harness** (`node tools/test-gate.mjs`) — **40/40 checks
  pass**, importing the real function modules against a fake
  in-memory D1 (keyed off the lib's own SQL constants): full flow
  register → dev code → wrong code rejected with the attempt counter
  incremented → correct code → cookie issued and validating;
  snapshot 200 with the cookie / 401 without; gate page served for
  cookieless document requests while assets stay public; code reuse
  rejected; expired code rejected and deleted; 4 misses leave the
  code alive, the 5th burns it; per-email (6th → 429) and per-IP
  (21st → 429) rate limits trip; tampered and foreign-secret cookies
  rejected; **no DB field ever holds a plaintext code** (hash =
  sha256(code)); the Resend path (fetch stubbed) sends exactly one
  correctly-addressed call and leaks no `dev_code`.
- **Builds**: root `npm run build` (typecheck + all workspaces,
  default flavor) clean; `build:showcase` clean.
- **Bundle greps**: the v16 set (`kill-liquidate`, `/control`,
  `kill switch`, `TEAM KILL`, `WebSocket`, `fleet-mode-select`,
  `/mode`, `liquidate`, `resume`) — all absent from the showcase +
  gate bundles; `READ-ONLY SHOWCASE`, `Not investment advice`,
  `snapshot.json` present; the gate bundle carries `/api/register`,
  `/api/verify`. The default bundle re-checked the opposite way
  (controls present; showcase banner and gate endpoints absent).
- **Zip**: `traderbots-showcase-v17.zip` lists `index.html`,
  `gate.html`, `snapshot.json`, the full `functions/` tree,
  `wrangler.toml`, `showcase-db/schema.sql`, and the logo; the
  staged `functions/` is byte-identical to the source tree; an
  unzip-and-serve smoke test returned 200 for index, gate,
  snapshot, logo, and the gate bundle.

## Files

New:
- `app/packages/web/showcase-functions/_lib/gate.js` — gate core.
- `app/packages/web/showcase-functions/api/register.js`,
  `api/verify.js`, `_middleware.js` — the endpoints + guard.
- `app/packages/web/showcase-db/schema.sql` — the D1 schema.
- `app/packages/web/index-gate.html`, `src/gate-main.tsx`,
  `src/gate.tsx` — the gate page (showcase entry tree).
- `app/packages/web/wrangler.toml` — Pages project + D1 binding
  (placeholder id).
- `app/packages/web/public/traderbot-logo.png` — v13 logo for the
  gate (static asset; also lands in the default build's output as a
  file only — no behavior change).
- `app/tools/test-gate.mjs` — the harness (new).
- `app/tools/package-showcase.mjs` — the zip packager (new).

Edited:
- `app/packages/web/vite.showcase.config.ts` — gate as second entry.
- `app/packages/web/src/showcase.tsx` — 401 → gate routing + notice.
- `app/packages/web/src/styles.css` — appended gate styles.

Untouched: API, engine, shared, bot files, `src/App.tsx`,
`src/main.tsx`, `vite.config.ts`, docker-compose.

## Honest limits

- **Not yet run under real Cloudflare.** The functions were
  verified against a faithful fake D1 and the standard Web APIs
  they use — not under wrangler/miniflare or a live Pages deploy
  (this VM has no Cloudflare access). The API surface used is small
  and bog-standard, but the first real deploy is still a first.
- **The gate guards the data, not the code.** The app bundle is
  public (it contains no fleet data — that was already true in
  Phase A); what a cookie protects is `snapshot.json` and the app
  shell routing. Anyone determined can read the JS; nobody without
  a session can read the fleet's numbers. That is the right shape
  for a promo lead-gate and should not be mistaken for account
  security.
- **Email is the dependency.** No verified Resend domain → no codes
  reach real visitors (test sender = owner's inbox only). Dev mode
  (no key) deliberately bypasses email entirely — never run the
  public site in that configuration.
- **Rate limits are coarse.** Per-email/per-IP counters in D1,
  best-effort pruning; behind Cloudflare the IP is real, anywhere
  else all visitors share one "unknown" bucket. Fine for a lead
  gate; not an anti-abuse system.
- **Still sample data behind the gate** until the Phase A publisher
  refresh cycle replaces `snapshot.json`; and the snapshot is
  minutes-stale by design, as before.
- **Phase C is not built**: no milestone detection, no letters, no
  unsubscribe flow (the schema's `unsubscribed` flag waits for it).
  The promotion line from Phase A stands unchanged.
