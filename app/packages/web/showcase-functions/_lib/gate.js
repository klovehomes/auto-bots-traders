/**
 * Phase 9 (v17) — email gate core library for the public showcase.
 *
 * Plain JavaScript (JSDoc-typed) so the exact same modules run in
 * Cloudflare Pages Functions AND in the Node test harness
 * (app/tools/test-gate.mjs) with no build step and no dependencies.
 * Only standard Web APIs are used: crypto.subtle, Request/Response,
 * fetch — all present in Workers and Node >= 19.
 *
 * Security posture (this is a promo lead-gate, not a bank):
 * - Activation codes are 6 digits, 10-minute expiry, max 5 attempts.
 * - Only the SHA-256 hash of a code is ever stored in D1.
 * - Sessions are stateless HMAC-signed cookies (no session table).
 * - Register responds generically; verify failures are uniform.
 */

/**
 * @typedef {Object} GateEnv
 * @property {{ prepare: (sql: string) => any }} DB - Cloudflare D1 binding.
 * @property {{ fetch: (req: Request) => Promise<Response> }} [ASSETS]
 * @property {string} [SESSION_SECRET] - HMAC secret (Cloudflare secret).
 * @property {string} [RESEND_API_KEY] - Resend API key (Cloudflare secret).
 * @property {string} [MAIL_FROM] - From address for activation emails.
 */

export const COOKIE_NAME = "tb_session";
export const SESSION_MAX_AGE_S = 60 * 24 * 60 * 60; // ~60 days
export const CODE_TTL_MS = 10 * 60_000; // 10 minutes
export const CODE_MAX_ATTEMPTS = 5;
const HOUR_MS = 60 * 60_000;
export const REGISTER_PER_EMAIL_PER_HOUR = 5;
export const REGISTER_PER_IP_PER_HOUR = 20;

/** SQL statements — the single source of truth (the test harness keys
 *  its fake D1 off these exact strings). */
export const SQL = {
  upsertRegistration:
    "INSERT INTO registrations (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
  getRegistration:
    "SELECT email, verified_at, unsubscribed FROM registrations WHERE email = ?",
  markVerified:
    "UPDATE registrations SET verified_at = ? WHERE email = ?",
  upsertCode:
    "INSERT INTO activation_codes (email, code_hash, expires_at, attempts, created_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, created_at = excluded.created_at",
  getCode:
    "SELECT code_hash, expires_at, attempts FROM activation_codes WHERE email = ?",
  bumpAttempts:
    "UPDATE activation_codes SET attempts = attempts + 1 WHERE email = ?",
  deleteCode: "DELETE FROM activation_codes WHERE email = ?",
  countRate:
    "SELECT COUNT(*) AS n FROM rate_events WHERE kind = ? AND key = ? AND ts > ?",
  addRate: "INSERT INTO rate_events (kind, key, ts) VALUES (?, ?, ?)",
  pruneRate: "DELETE FROM rate_events WHERE ts < ?",
};

// --- small helpers -------------------------------------------------------

/** @param {unknown} data @param {number} status @param {Record<string,string>} [headers] */
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim + lowercase + validate. Returns null for anything unusable. */
export function normalizeEmail(raw) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

/** A 6-digit code from a CSPRNG. */
export function generateCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return bytesToHex(digest);
}

/** Length-checked constant-time string comparison. */
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- sessions (stateless HMAC cookies) -----------------------------------

function b64urlEncode(bytes) {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncodeText(text) {
  return b64urlEncode(new TextEncoder().encode(text));
}

function b64urlDecodeText(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * The HMAC secret. SESSION_SECRET must be set in production (a
 * Cloudflare secret). The fallback exists ONLY so local dev/harness
 * runs work without config; it is called out in PHASE9-DELIVERY.md.
 */
function sessionSecret(env) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  console.warn(
    "[gate] SESSION_SECRET is not set — using the insecure dev fallback. Set it in Cloudflare before real visitors.",
  );
  return "dev-insecure-session-secret";
}

async function hmacKey(env) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(env, payloadB64) {
  const key = await hmacKey(env);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return b64urlEncode(sig);
}

/** Build the Set-Cookie header value for a fresh session. */
export async function makeSessionCookie(env, email, now = Date.now()) {
  const payloadB64 = b64urlEncodeText(JSON.stringify({ e: email, iat: now }));
  const sig = await signPayload(env, payloadB64);
  const value = `${payloadB64}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_S}`;
}

/**
 * Read + verify the session cookie on a request.
 * @returns {Promise<{ email: string, iat: number } | null>}
 */
export async function readSession(request, env) {
  const header = request.headers.get("Cookie") ?? "";
  let value = null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === COOKIE_NAME) {
      value = part.slice(eq + 1).trim();
      break;
    }
  }
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);
  try {
    const key = await hmacKey(env);
    const sigBytes = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64),
    );
    if (!ok) return null;
    const payload = JSON.parse(b64urlDecodeText(payloadB64));
    if (typeof payload.e !== "string" || typeof payload.iat !== "number") {
      return null;
    }
    if (Date.now() - payload.iat > SESSION_MAX_AGE_S * 1000) return null;
    return { email: payload.e, iat: payload.iat };
  } catch {
    return null;
  }
}

// --- rate limiting (D1-backed counters) -----------------------------------

async function countRate(db, kind, key, sinceMs) {
  const row = await db
    .prepare(SQL.countRate)
    .bind(kind, key, sinceMs)
    .first();
  return row && typeof row.n === "number" ? row.n : 0;
}

/**
 * Check both register limits. Returns a 429 Response when limited,
 * otherwise records the events and returns null.
 */
export async function registerRateGate(db, email, ip, now = Date.now()) {
  const since = now - HOUR_MS;
  const perEmail = await countRate(db, "register_email", email, since);
  if (perEmail >= REGISTER_PER_EMAIL_PER_HOUR) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }
  const perIp = await countRate(db, "register_ip", ip, since);
  if (perIp >= REGISTER_PER_IP_PER_HOUR) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }
  await db.prepare(SQL.addRate).bind("register_email", email, now).run();
  await db.prepare(SQL.addRate).bind("register_ip", ip, now).run();
  // Opportunistic cleanup so the table stays tiny.
  if (Math.random() < 0.05) {
    await db.prepare(SQL.pruneRate).bind(now - 24 * HOUR_MS).run();
  }
  return null;
}

// --- mail ------------------------------------------------------------------

/**
 * Send the activation code.
 *
 * Production: Resend (plain fetch; RESEND_API_KEY + MAIL_FROM from
 * env). NOTE: Resend's onboarding sender (onboarding@resend.dev) only
 * delivers to the Resend account owner's own address — real visitors
 * need a verified sending domain in Resend, with MAIL_FROM set to an
 * address on it. See PHASE9-DELIVERY.md.
 *
 * DEV MODE: when RESEND_API_KEY is unset we cannot send mail, so the
 * code is logged to the function console and flagged via the return
 * value; the register handler then exposes it in a dev-only response
 * field/header. This path is impossible when a key is configured.
 *
 * @returns {Promise<{ dev: boolean }>} dev=true only in dev mode.
 */
export async function sendActivationCode(env, email, code) {
  if (!env.RESEND_API_KEY) {
    console.log(
      `[gate][DEV MODE] activation code for ${email}: ${code} (no RESEND_API_KEY set — not emailed)`,
    );
    return { dev: true };
  }
  const from = env.MAIL_FROM || "TraderBot <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your TraderBot showcase activation code",
      text:
        `Your activation code for the TraderBot read-only showcase is ${code}.\n\n` +
        `It expires in 10 minutes. If you didn't request it, you can ignore this email.\n`,
      html:
        `<p>Your activation code for the TraderBot read-only showcase is:</p>` +
        `<p style="font-size:28px;font-weight:700;letter-spacing:0.2em">${code}</p>` +
        `<p>It expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  return { dev: false };
}

/** Parse a JSON request body without throwing. */
export async function readJsonBody(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}
