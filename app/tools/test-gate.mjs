#!/usr/bin/env node
/**
 * Phase 9 (v17) — harness for the showcase email gate.
 *
 * Imports the REAL Pages Function modules (showcase-functions/) and
 * runs them against a fake in-memory D1 that implements exactly the
 * SQL surface the gate uses (keyed off the SQL constants exported by
 * the lib, so the fake cannot drift from the code). A tiny dispatcher
 * simulates the Pages runtime: _middleware wraps the function routes
 * and the static assets.
 *
 * Plain Node >= 19, no dependencies. Run:
 *   node tools/test-gate.mjs
 */
import {
  SQL,
  makeSessionCookie,
  sha256Hex,
} from "../packages/web/showcase-functions/_lib/gate.js";
import { onRequestPost as register } from "../packages/web/showcase-functions/api/register.js";
import { onRequestPost as verify } from "../packages/web/showcase-functions/api/verify.js";
import { onRequest as middleware } from "../packages/web/showcase-functions/_middleware.js";

// --- fake D1 ---------------------------------------------------------------

function makeFakeDB() {
  const registrations = new Map();
  const codes = new Map();
  const rateEvents = [];
  class Stmt {
    constructor(sql) {
      this.sql = sql.replace(/\s+/g, " ").trim();
      this.args = [];
    }
    bind(...args) {
      this.args = args;
      return this;
    }
    async first() {
      const [a, b, c] = this.args;
      switch (this.sql) {
        case SQL.getRegistration: {
          const r = registrations.get(a);
          return r ? { ...r } : null; // real D1 returns a fresh copy
        }
        case SQL.getCode: {
          const r = codes.get(a);
          return r ? { ...r } : null;
        }
        case SQL.countRate:
          return {
            n: rateEvents.filter((e) => e.kind === a && e.key === b && e.ts > c)
              .length,
          };
        default:
          throw new Error(`fake D1: unexpected first(): ${this.sql}`);
      }
    }
    async run() {
      const a = this.args;
      switch (this.sql) {
        case SQL.upsertRegistration:
          if (!registrations.has(a[0])) {
            registrations.set(a[0], {
              email: a[0],
              created_at: a[1],
              verified_at: null,
              unsubscribed: 0,
            });
          }
          return { success: true };
        case SQL.markVerified: {
          const r = registrations.get(a[1]);
          if (r) r.verified_at = a[0];
          return { success: true };
        }
        case SQL.upsertCode:
          codes.set(a[0], {
            email: a[0],
            code_hash: a[1],
            expires_at: a[2],
            attempts: 0,
            created_at: a[3],
          });
          return { success: true };
        case SQL.bumpAttempts: {
          const r = codes.get(a[0]);
          if (r) r.attempts += 1;
          return { success: true };
        }
        case SQL.deleteCode:
          codes.delete(a[0]);
          return { success: true };
        case SQL.addRate:
          rateEvents.push({ kind: a[0], key: a[1], ts: a[2] });
          return { success: true };
        case SQL.pruneRate:
          for (let i = rateEvents.length - 1; i >= 0; i--) {
            if (rateEvents[i].ts < a[0]) rateEvents.splice(i, 1);
          }
          return { success: true };
        default:
          throw new Error(`fake D1: unexpected run(): ${this.sql}`);
      }
    }
    async all() {
      throw new Error("fake D1: all() not implemented");
    }
  }
  return {
    prepare: (sql) => new Stmt(sql),
    _state: { registrations, codes, rateEvents },
  };
}

// --- simulated Pages runtime -------------------------------------------------

const GATE_HTML = "<!doctype html><title>gate</title>GATE PAGE";
const SNAPSHOT_BODY = JSON.stringify({ version: 1, generatedAt: "x", bots: [] });

function makeEnv(db, extra = {}) {
  return {
    DB: db,
    SESSION_SECRET: "harness-secret",
    ASSETS: {
      fetch: async (req) => {
        const p = new URL(req.url).pathname;
        if (p === "/gate.html") {
          return new Response(GATE_HTML, {
            status: 200,
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response("missing", { status: 404 });
      },
    },
    ...extra,
  };
}

async function dispatch(env, path, { method = "GET", headers = {}, body } = {}) {
  const req = new Request(`https://showcase.test${path}`, {
    method,
    headers: body
      ? { "Content-Type": "application/json", ...headers }
      : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const next = async () => {
    if (path === "/api/register" && method === "POST") {
      return register({ request: req, env });
    }
    if (path === "/api/verify" && method === "POST") {
      return verify({ request: req, env });
    }
    if (path === "/snapshot.json") {
      return new Response(SNAPSHOT_BODY, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path === "/gate.html") {
      return new Response(GATE_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
    if (path === "/") {
      return new Response("APP SHELL", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
    return new Response("ASSET", { status: 200 });
  };
  return middleware({ request: req, env, next });
}

// --- tiny check runner --------------------------------------------------------

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`);
  }
}

const wrongCodeFor = (code) => (code === "000000" ? "000001" : "000000");
async function registerFor(env, email, ip) {
  return dispatch(env, "/api/register", {
    method: "POST",
    headers: { "CF-Connecting-IP": ip },
    body: { email },
  });
}

// === Env A: dev mode (no RESEND_API_KEY) — the full happy path ==============
console.log("Env A — dev mode, full flow");
{
  const db = makeFakeDB();
  const env = makeEnv(db);
  const ip = "198.51.100.1";
  const email = "Visitor@Example.com"; // exercises normalization
  const norm = "visitor@example.com";

  let res = await dispatch(env, "/", { headers: { Accept: "text/html" } });
  check("document without cookie → gate page served", res.status === 200 && (await res.text()) === GATE_HTML);

  res = await dispatch(env, "/gate.html", {});
  check("gate.html itself is public", res.status === 200);

  res = await dispatch(env, "/assets/app.js", {});
  check("static assets are public", res.status === 200 && (await res.text()) === "ASSET");

  res = await dispatch(env, "/snapshot.json", {});
  check("snapshot without cookie → 401", res.status === 401);

  res = await registerFor(env, "not-an-email", ip);
  check("register invalid email → 400", res.status === 400);

  res = await registerFor(env, email, ip);
  const regBody = await res.json();
  check("register valid email → 200 ok", res.status === 200 && regBody.ok === true);
  const code = regBody.dev_code;
  check("dev mode returns dev_code (6 digits)", typeof code === "string" && /^\d{6}$/.test(code));
  check("dev code also in X-Dev-Activation-Code header", res.headers.get("X-Dev-Activation-Code") === code);

  const row = db._state.codes.get(norm);
  check("code row stored for normalized email", !!row);
  check("DB stores a hash, never the plaintext code", row.code_hash !== code);
  check("stored hash === sha256(code)", row.code_hash === (await sha256Hex(code)));
  check("code row starts with 0 attempts + future expiry", row.attempts === 0 && row.expires_at > Date.now());
  const plaintextLeak = [...db._state.registrations.values(), ...db._state.codes.values()]
    .flatMap((r) => Object.values(r))
    .some((v) => v === code);
  check("no DB field anywhere holds the plaintext code", !plaintextLeak);

  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: norm, code: wrongCodeFor(code) },
  });
  check("wrong code → uniform 401", res.status === 401);
  check("attempt counter incremented", db._state.codes.get(norm).attempts === 1);

  res = await dispatch(env, "/snapshot.json", {});
  check("snapshot still 401 before verify", res.status === 401);

  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: norm, code },
  });
  check("correct code → 200", res.status === 200);
  const setCookie = res.headers.get("Set-Cookie") ?? "";
  check(
    "session cookie set (tb_session, HttpOnly, Secure, SameSite=Lax)",
    setCookie.startsWith("tb_session=") &&
      setCookie.includes("HttpOnly") &&
      setCookie.includes("Secure") &&
      setCookie.includes("SameSite=Lax"),
  );
  const cookiePair = setCookie.split(";")[0];
  check("registration marked verified", typeof db._state.registrations.get(norm).verified_at === "number");
  check("code burned after success", !db._state.codes.has(norm));

  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: norm, code },
  });
  check("code reuse → 401", res.status === 401);

  res = await dispatch(env, "/snapshot.json", { headers: { Cookie: cookiePair } });
  check("snapshot with session cookie → 200", res.status === 200 && (await res.text()) === SNAPSHOT_BODY);

  res = await dispatch(env, "/", {
    headers: { Accept: "text/html", Cookie: cookiePair },
  });
  check("document with session cookie → app shell", res.status === 200 && (await res.text()) === "APP SHELL");

  // Flip a mid-signature character (the final base64url char of a
  // 32-byte HMAC carries ignored padding bits, so tamper mid-string).
  const dot = cookiePair.lastIndexOf(".");
  const pos = dot + 3;
  const orig = cookiePair[pos];
  const tampered =
    cookiePair.slice(0, pos) +
    (orig === "A" ? "B" : "A") +
    cookiePair.slice(pos + 1);
  res = await dispatch(env, "/snapshot.json", { headers: { Cookie: tampered } });
  check("tampered cookie → 401", res.status === 401);

  const foreign = await makeSessionCookie(
    { SESSION_SECRET: "a-different-secret" },
    norm,
  );
  res = await dispatch(env, "/snapshot.json", {
    headers: { Cookie: foreign.split(";")[0] },
  });
  check("cookie signed with another secret → 401", res.status === 401);
}

// === Env B: expiry + attempt budget ==========================================
console.log("Env B — expiry and attempt budget");
{
  const db = makeFakeDB();
  const env = makeEnv(db);
  const ip = "198.51.100.2";

  let res = await registerFor(env, "expiry@example.com", ip);
  const code1 = (await res.json()).dev_code;
  db._state.codes.get("expiry@example.com").expires_at = Date.now() - 1;
  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: "expiry@example.com", code: code1 },
  });
  check("expired code → 401", res.status === 401);
  check("expired code row deleted", !db._state.codes.has("expiry@example.com"));

  res = await registerFor(env, "patient@example.com", ip);
  const code2 = (await res.json()).dev_code;
  for (let i = 0; i < 4; i++) {
    res = await dispatch(env, "/api/verify", {
      method: "POST",
      body: { email: "patient@example.com", code: wrongCodeFor(code2) },
    });
    if (res.status !== 401) break;
  }
  check("4 wrong attempts → code still alive", db._state.codes.get("patient@example.com")?.attempts === 4);
  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: "patient@example.com", code: code2 },
  });
  check("correct code still works after 4 misses", res.status === 200);

  res = await registerFor(env, "locked@example.com", ip);
  const code3 = (await res.json()).dev_code;
  for (let i = 0; i < 5; i++) {
    res = await dispatch(env, "/api/verify", {
      method: "POST",
      body: { email: "locked@example.com", code: wrongCodeFor(code3) },
    });
    if (res.status !== 401) break;
  }
  check("5th wrong attempt burns the code", !db._state.codes.has("locked@example.com"));
  res = await dispatch(env, "/api/verify", {
    method: "POST",
    body: { email: "locked@example.com", code: code3 },
  });
  check("correct code after lockout → 401", res.status === 401);
}

// === Env C: rate limits ========================================================
console.log("Env C — rate limits");
{
  const db = makeFakeDB();
  const env = makeEnv(db);

  let lastStatus = 0;
  for (let i = 0; i < 6; i++) {
    const res = await registerFor(env, "spammy@example.com", "198.51.100.5");
    lastStatus = res.status;
    if (i < 5 && res.status !== 200) break;
  }
  check("6th register for one email within the hour → 429", lastStatus === 429);

  let statuses = [];
  for (let i = 0; i < 21; i++) {
    const res = await registerFor(env, `ip-user-${i}@example.com`, "198.51.100.6");
    statuses.push(res.status);
  }
  check(
    "21st register from one IP within the hour → 429",
    statuses.slice(0, 20).every((s) => s === 200) && statuses[20] === 429,
  );
}

// === Env D: Resend production sender ==========================================
console.log("Env D — Resend sender wiring (fetch stubbed, no network)");
{
  const db = makeFakeDB();
  const env = makeEnv(db, {
    RESEND_API_KEY: "rk_test_key",
    MAIL_FROM: "TraderBot <hello@example.com>",
  });
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: "msg_1" }), { status: 200 });
  };
  try {
    const res = await registerFor(env, "prod@example.com", "198.51.100.9");
    const body = await res.json();
    check("prod register → 200", res.status === 200 && body.ok === true);
    check("prod register does NOT leak dev_code", !("dev_code" in body) && res.headers.get("X-Dev-Activation-Code") === null);
    check("exactly one Resend call", calls.length === 1 && calls[0].url === "https://api.resend.com/emails");
    const sent = JSON.parse(calls[0].init.body);
    check("Resend call carries the bearer key", calls[0].init.headers.Authorization === "Bearer rk_test_key");
    check("Resend from = MAIL_FROM, to = visitor", sent.from === "TraderBot <hello@example.com>" && sent.to[0] === "prod@example.com");
    const m = /(\d{6})/.exec(sent.text);
    check("emailed body contains a 6-digit code", !!m);
    check(
      "DB hash matches the emailed code",
      !!m && db._state.codes.get("prod@example.com").code_hash === (await sha256Hex(m[1])),
    );
  } finally {
    globalThis.fetch = realFetch;
  }
}

console.log(`\n${passed}/${passed + failed} checks pass`);
process.exit(failed === 0 ? 0 : 1);
