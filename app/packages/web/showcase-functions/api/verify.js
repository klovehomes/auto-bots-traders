/**
 * Phase 9 (v17) — POST /api/verify
 *
 * Checks an activation code: hash match, not expired, attempt budget
 * intact (max 5 — the code is burned on the 5th miss). On success the
 * code is deleted (single use), the registration is marked verified,
 * and a signed ~60-day session cookie is set. Every failure returns
 * the same uniform 401.
 */
import {
  SQL,
  json,
  makeSessionCookie,
  normalizeEmail,
  readJsonBody,
  safeEqual,
  sha256Hex,
  CODE_MAX_ATTEMPTS,
} from "../_lib/gate.js";

const fail = () => json({ ok: false, error: "invalid_code" }, 401);

/** @param {{ request: Request, env: import("../_lib/gate.js").GateEnv }} context */
export async function onRequestPost({ request, env }) {
  const body = await readJsonBody(request);
  const email = normalizeEmail(body?.email);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!email || !/^\d{6}$/.test(code)) return fail();
  if (!env.DB) return json({ ok: false, error: "not_configured" }, 500);

  const row = await env.DB.prepare(SQL.getCode).bind(email).first();
  if (!row) return fail();

  const now = Date.now();
  if (row.expires_at <= now || row.attempts >= CODE_MAX_ATTEMPTS) {
    await env.DB.prepare(SQL.deleteCode).bind(email).run();
    return fail();
  }

  const codeHash = await sha256Hex(code);
  if (!safeEqual(codeHash, row.code_hash)) {
    // Decide from the pre-bump count read above — do not re-derive
    // from `row` after the UPDATE (a driver may alias the row).
    const attemptsAfter = row.attempts + 1;
    await env.DB.prepare(SQL.bumpAttempts).bind(email).run();
    if (attemptsAfter >= CODE_MAX_ATTEMPTS) {
      await env.DB.prepare(SQL.deleteCode).bind(email).run();
    }
    return fail();
  }

  // Success: burn the code, mark the registration verified, and hand
  // back the session cookie. The cookie payload is email + issued-at
  // only — no sensitive data.
  await env.DB.prepare(SQL.deleteCode).bind(email).run();
  await env.DB.prepare(SQL.markVerified).bind(now, email).run();
  const cookie = await makeSessionCookie(env, email, now);
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}
