import {
  createHash,
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

/**
 * Phase PM7 — the email activation-code gate, INSIDE the app.
 *
 * Keith's direction (2026-11-09): the gate runs in this Docker stack
 * on his own VM — NOT on Cloudflare. Registrations live in a database
 * owned by this API service, persisted to GATE_STATE_PATH (in Docker:
 * /data/gate-state.json on the fleet-data volume, next to the control,
 * mode, history and allocation state). The mechanics are a native
 * port of the proven v17 showcase gate (readonly branch):
 *
 * - 6-digit activation codes, 10-minute expiry, max 5 attempts, then
 *   the code is burned; single-use.
 * - Only the SHA-256 hash of a code is ever stored — a plaintext code
 *   never touches disk.
 * - Rate limits: 5 code requests per email per hour, 20 per IP per
 *   hour, recorded as rate events in the same store.
 * - Sessions are stateless HMAC-SHA256-signed cookies (pm_session,
 *   ~60 days) — no session table; the cookie payload is email +
 *   issued-at only.
 * - Mail goes through Resend when RESEND_API_KEY + MAIL_FROM are
 *   configured in the API env. Without a key the API is in DEV MODE:
 *   register returns the code in a `dev_code` field and logs it. That
 *   path is impossible when a key is set (mirrors v17 exactly).
 *
 * Enforcement lives in index.ts: when GATE_ENABLED=true, every route
 * except /gate/* and the token-guarded /internal/* requires a valid
 * session cookie. When the gate is off this module is inert.
 */

export const GATE_COOKIE_NAME = "pm_session";
export const SESSION_MAX_AGE_S = 60 * 24 * 60 * 60; // ~60 days
export const CODE_TTL_MS = 10 * 60_000; // 10 minutes
export const CODE_MAX_ATTEMPTS = 5;
const HOUR_MS = 60 * 60_000;
export const REGISTER_PER_EMAIL_PER_HOUR = 5;
export const REGISTER_PER_IP_PER_HOUR = 20;
/** Rate events / dead code records older than this are pruned on save. */
const PRUNE_AFTER_MS = 24 * HOUR_MS;

export interface GateRegistration {
  email: string;
  /** Epoch ms of the first register request for this address. */
  createdAt: number;
  /** Epoch ms of the first successful verify; null until then. */
  verifiedAt: number | null;
}

export interface GateCode {
  email: string;
  /** SHA-256 hex of the 6-digit code. The code itself is never stored. */
  codeHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  /** Epoch ms when the code was successfully used; null until then. */
  usedAt: number | null;
}

export interface GateRateEvent {
  kind: "register_email" | "register_ip";
  key: string;
  ts: number;
}

interface PersistedGateState {
  version: 1;
  registrations: GateRegistration[];
  codes: GateCode[];
  rateEvents: GateRateEvent[];
}

// --- small helpers (ported from the v17 gate library) -------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim + lowercase + validate. Returns null for anything unusable. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

/** A 6-digit code from a CSPRNG. */
export function generateCode(): string {
  return String(100000 + randomInt(0, 900000));
}

export function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Length-checked constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

// --- sessions (stateless HMAC cookies) -----------------------------------

function b64urlEncodeText(text: string): string {
  return Buffer.from(text, "utf8").toString("base64url");
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payloadB64, "utf8")
    .digest("base64url");
}

/** The raw `payload.signature` cookie value for a fresh session. */
export function makeSessionValue(
  email: string,
  secret: string,
  now: number = Date.now(),
): string {
  const payloadB64 = b64urlEncodeText(JSON.stringify({ e: email, iat: now }));
  return `${payloadB64}.${signPayload(payloadB64, secret)}`;
}

/**
 * Build the full Set-Cookie header value. `secure` is env-driven
 * (GATE_COOKIE_SECURE): the VM dashboard is served over plain http on
 * Tailscale, where a Secure cookie would never be sent by the browser
 * — so it defaults OFF and is only for a future HTTPS deployment.
 */
export function makeSessionCookie(
  email: string,
  secret: string,
  secure: boolean,
  now: number = Date.now(),
): string {
  const value = makeSessionValue(email, secret, now);
  const base =
    `${GATE_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; ` +
    `Max-Age=${SESSION_MAX_AGE_S}`;
  return secure ? `${base}; Secure` : base;
}

/** Parse a Cookie header into a name→value map. */
export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

export interface GateSession {
  email: string;
  iat: number;
}

/** Verify a pm_session cookie value. Returns null for anything off:
 *  bad shape, bad signature, unparseable payload, expired session. */
export function readSessionValue(
  value: string | undefined,
  secret: string,
  now: number = Date.now(),
): GateSession | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!safeEqual(sig, signPayload(payloadB64, secret))) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { e?: unknown; iat?: unknown };
    if (typeof payload.e !== "string" || typeof payload.iat !== "number") {
      return null;
    }
    if (now - payload.iat > SESSION_MAX_AGE_S * 1000) return null;
    return { email: payload.e, iat: payload.iat };
  } catch {
    return null;
  }
}

// --- mail ------------------------------------------------------------------

export interface GateMailConfig {
  resendApiKey: string;
  mailFrom: string;
}

/**
 * Send the activation code via Resend (plain fetch, like v17).
 *
 * DEV MODE: when no RESEND_API_KEY is configured we cannot send mail,
 * so the code is logged to the API console and flagged via the return
 * value; the register handler then exposes it in a dev-only response
 * field. This path is impossible when a key is configured.
 *
 * @returns dev=true only in dev mode.
 */
export async function sendActivationCode(
  config: GateMailConfig,
  email: string,
  code: string,
): Promise<{ dev: boolean }> {
  if (!config.resendApiKey) {
    console.log(
      `[gate][DEV MODE] activation code for ${email}: ${code} ` +
        `(no RESEND_API_KEY set — not emailed)`,
    );
    return { dev: true };
  }
  const from =
    config.mailFrom || "Prediction Markets Assistant <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Prediction Markets Assistant activation code",
      text:
        `Your activation code for the Prediction Markets Assistant is ${code}.\n\n` +
        `It expires in 10 minutes. If you didn't request it, you can ignore this email.\n`,
      html:
        `<p>Your activation code for the Prediction Markets Assistant is:</p>` +
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

// --- the store ---------------------------------------------------------------

export type VerifyOutcome =
  | { ok: true }
  | { ok: false; reason: "no_code" | "used" | "expired" | "burned" | "mismatch" };

export class GateStore {
  private readonly path: string;
  private registrations: GateRegistration[] = [];
  private codes: GateCode[] = [];
  private rateEvents: GateRateEvent[] = [];

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedGateState;
      if (parsed.version !== 1) return;
      this.registrations = Array.isArray(parsed.registrations)
        ? parsed.registrations
        : [];
      this.codes = Array.isArray(parsed.codes) ? parsed.codes : [];
      this.rateEvents = Array.isArray(parsed.rateEvents)
        ? parsed.rateEvents
        : [];
    } catch (err) {
      // A corrupt gate file must never wedge the API: start empty and
      // say so loudly. Visitors simply register again.
      console.error(
        `[gate] could not load ${this.path} — starting with an empty gate DB:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  private save(): void {
    const now = Date.now();
    // Opportunistic pruning so the file stays tiny: rate events past
    // the 24h window, and code records that are used/burned/expired
    // and older than 24h (live codes are never pruned).
    this.rateEvents = this.rateEvents.filter((e) => now - e.ts < PRUNE_AFTER_MS);
    this.codes = this.codes.filter((c) => {
      const dead =
        c.usedAt !== null || c.attempts >= CODE_MAX_ATTEMPTS || c.expiresAt <= now;
      return !(dead && now - Math.max(c.createdAt, c.expiresAt) > PRUNE_AFTER_MS);
    });
    const data: PersistedGateState = {
      version: 1,
      registrations: this.registrations,
      codes: this.codes,
      rateEvents: this.rateEvents,
    };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data, null, 2));
      renameSync(tmp, this.path);
    } catch (err) {
      console.error(
        `[gate] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  /** Read-only snapshot of the registration list (Keith's own data —
   *  he can also just read the state file on the volume). */
  listRegistrations(): GateRegistration[] {
    return this.registrations.map((r) => ({ ...r }));
  }

  /**
   * Check both register rate limits. When allowed, records the two
   * rate events and returns true; when limited, records nothing and
   * returns false (mirrors the v17 registerRateGate).
   */
  checkAndRecordRegister(email: string, ip: string, now: number): boolean {
    const since = now - HOUR_MS;
    const perEmail = this.rateEvents.filter(
      (e) => e.kind === "register_email" && e.key === email && e.ts > since,
    ).length;
    if (perEmail >= REGISTER_PER_EMAIL_PER_HOUR) return false;
    const perIp = this.rateEvents.filter(
      (e) => e.kind === "register_ip" && e.key === ip && e.ts > since,
    ).length;
    if (perIp >= REGISTER_PER_IP_PER_HOUR) return false;
    this.rateEvents.push(
      { kind: "register_email", key: email, ts: now },
      { kind: "register_ip", key: ip, ts: now },
    );
    this.save();
    return true;
  }

  /** Upsert the registration row (first-seen wins for createdAt) and
   *  replace any outstanding code for the email with a fresh one. */
  registerWithCode(email: string, codeHash: string, now: number): void {
    if (!this.registrations.some((r) => r.email === email)) {
      this.registrations.push({ email, createdAt: now, verifiedAt: null });
    }
    this.codes = this.codes.filter((c) => c.email !== email);
    this.codes.push({
      email,
      codeHash,
      createdAt: now,
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      usedAt: null,
    });
    this.save();
  }

  /**
   * Attempt a verify. All state transitions (attempt bumps, burn,
   * single-use marking, registration verification) happen here so the
   * endpoint stays a thin uniform-failure wrapper, exactly like v17.
   */
  verify(email: string, code: string, now: number): VerifyOutcome {
    const rec = this.codes.find((c) => c.email === email);
    if (!rec) return { ok: false, reason: "no_code" };
    if (rec.usedAt !== null) return { ok: false, reason: "used" };
    if (rec.expiresAt <= now) return { ok: false, reason: "expired" };
    if (rec.attempts >= CODE_MAX_ATTEMPTS) return { ok: false, reason: "burned" };

    if (!safeEqual(sha256Hex(code), rec.codeHash)) {
      rec.attempts += 1;
      this.save();
      return {
        ok: false,
        reason: rec.attempts >= CODE_MAX_ATTEMPTS ? "burned" : "mismatch",
      };
    }

    rec.usedAt = now;
    const reg = this.registrations.find((r) => r.email === email);
    if (reg) {
      if (reg.verifiedAt === null) reg.verifiedAt = now;
    } else {
      this.registrations.push({ email, createdAt: now, verifiedAt: now });
    }
    this.save();
    return { ok: true };
  }
}
