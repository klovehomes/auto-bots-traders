/**
 * Phase 9 (v17) — POST /api/register
 *
 * Starts (or restarts) registration for an email address: upserts the
 * registration row, generates a fresh 6-digit activation code, stores
 * ONLY its SHA-256 hash in D1 with a 10-minute expiry, and emails the
 * code. The response is deliberately generic — it never reveals
 * whether the address was already registered.
 *
 * Dev mode: with no RESEND_API_KEY configured, no mail can be sent,
 * so the code is ALSO returned in a `dev_code` response field and an
 * `X-Dev-Activation-Code` header. That is guarded strictly on the
 * missing key and must never happen with production config.
 */
import {
  SQL,
  generateCode,
  json,
  normalizeEmail,
  readJsonBody,
  registerRateGate,
  sendActivationCode,
  sha256Hex,
  CODE_TTL_MS,
} from "../_lib/gate.js";

/** @param {{ request: Request, env: import("../_lib/gate.js").GateEnv }} context */
export async function onRequestPost({ request, env }) {
  const body = await readJsonBody(request);
  const email = normalizeEmail(body?.email);
  if (!email) return json({ ok: false, error: "invalid_email" }, 400);
  if (!env.DB) return json({ ok: false, error: "not_configured" }, 500);

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const limited = await registerRateGate(env.DB, email, ip);
  if (limited) return limited;

  const now = Date.now();
  await env.DB.prepare(SQL.upsertRegistration).bind(email, now).run();

  const code = generateCode();
  const codeHash = await sha256Hex(code);
  await env.DB.prepare(SQL.upsertCode)
    .bind(email, codeHash, now + CODE_TTL_MS, now)
    .run();

  let dev = false;
  try {
    dev = (await sendActivationCode(env, email, code)).dev;
  } catch (err) {
    // Mail delivery problems (e.g. Resend domain not yet verified)
    // must not leak account state; the visitor simply never gets a
    // code and can retry. The failure is loud in the function log.
    console.error(`[gate] activation email to ${email} failed:`, err);
  }

  const headers = {};
  const payload = { ok: true };
  if (dev) {
    payload.dev_code = code;
    headers["X-Dev-Activation-Code"] = code;
  }
  return json(payload, 200, headers);
}
