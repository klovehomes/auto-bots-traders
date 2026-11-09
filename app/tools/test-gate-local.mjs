/**
 * Phase PM7 — gate harness for the IN-APP email gate.
 *
 * Spawns the real API (tsx) three times against throwaway state in
 * /tmp and drives it over HTTP:
 *
 *   Phase A (GATE_ENABLED=true, no Resend key → dev mode):
 *     (a) GET /bots without a cookie            → 401
 *     (b) POST /gate/register                    → 200 + dev_code
 *     (c) gate-state.json on disk                → NO plaintext code
 *     (d) wrong code ×5 burns the code; the CORRECT code then fails
 *     (e) fresh code + POST /gate/verify         → 200 + pm_session cookie
 *     (f) GET /bots with the cookie              → 200, exactly 1 bot
 *     (g) tampered cookie                        → 401
 *     (h) POST /internal/events with the internal token → 200 (gate on)
 *     (i) 6th register for one email in the hour → 429
 *   Phase B (same state dir, code record expired on disk):
 *     (j) verify with the expired code           → 401
 *   Phase C (GATE_ENABLED unset):
 *     (k) GET /bots without a cookie             → 200 (regression)
 *     (l) POST /gate/register                    → 403
 *     (m) GET /gate/status                       → enabled:false
 *
 * Run from app/:  node tools/test-gate-local.mjs
 * Exits non-zero if any check fails.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_DIR = join(APP_DIR, "..");
const PORT = 18099;
const BASE = `http://127.0.0.1:${PORT}`;
const INTERNAL_TOKEN = "pm7-harness-token";

let passed = 0;
let failed = 0;
function check(label, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  PASS ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function req(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data, headers: res.headers };
}

function sessionCookieFrom(headers) {
  const setCookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  for (const sc of setCookies) {
    if (sc.startsWith("pm_session=")) return sc.split(";")[0];
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startApi(stateDir, extraEnv) {
  const env = {
    ...process.env,
    API_PORT: String(PORT),
    MODE: "sim",
    BOTS_DIR: join(REPO_DIR, "bots"),
    INTERNAL_EVENT_TOKEN: INTERNAL_TOKEN,
    CONTROL_STATE_PATH: join(stateDir, "control-state.json"),
    MODE_STATE_PATH: join(stateDir, "mode-state.json"),
    EVENT_HISTORY_PATH: join(stateDir, "event-history.json"),
    ALLOCATIONS_STATE_PATH: join(stateDir, "allocations.json"),
    GATE_STATE_PATH: join(stateDir, "gate-state.json"),
    GATE_SESSION_SECRET: "pm7-harness-secret",
    RESEND_API_KEY: "",
    MAIL_FROM: "",
    ...extraEnv,
  };
  const child = spawn(
    join(APP_DIR, "node_modules", ".bin", "tsx"),
    ["packages/api/src/index.ts"],
    { cwd: APP_DIR, env, stdio: ["ignore", "pipe", "pipe"] },
  );
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/gate/status`);
      if (res.ok) return { child, log: () => log };
    } catch {
      /* not up yet */
    }
    if (child.exitCode !== null) break;
    await sleep(250);
  }
  child.kill("SIGKILL");
  throw new Error(`API did not come up.\n${log}`);
}

async function stopApi(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  const deadline = Date.now() + 10_000;
  while (child.exitCode === null && Date.now() < deadline) await sleep(100);
  if (child.exitCode === null) child.kill("SIGKILL");
}

const wrongCodeFor = (code) => (code === "000000" ? "000001" : "000000");

async function main() {
  // ---------------- Phase A: gate on, dev mode ----------------
  console.log("Phase A — GATE_ENABLED=true, no Resend key");
  const dirA = mkdtempSync(join(tmpdir(), "pm7-gate-a-"));
  let api = await startApi(dirA, { GATE_ENABLED: "true" });
  try {
    const status = await req("/gate/status");
    check("status: enabled:true, authenticated:false",
      status.status === 200 && status.data?.enabled === true && status.data?.authenticated === false,
      JSON.stringify(status.data));

    const botsAnon = await req("/bots");
    check("(a) GET /bots without cookie → 401", botsAnon.status === 401, `got ${botsAnon.status}`);

    const email = "keith@example.com";
    const reg = await req("/gate/register", { method: "POST", body: { email } });
    const devCode = reg.data?.dev_code;
    check("(b) register → 200 + dev_code (dev mode)",
      reg.status === 200 && typeof devCode === "string" && /^\d{6}$/.test(devCode),
      JSON.stringify(reg.data));

    const stateText = readFileSync(join(dirA, "gate-state.json"), "utf8");
    check("(c) gate-state.json contains NO plaintext code",
      !stateText.includes(`"${devCode}"`) && !stateText.includes(`: ${devCode}`) && !stateText.includes(devCode),
      "code string found in state file");
    check("(c2) state file DOES contain a sha256 hash + the registration",
      /[a-f0-9]{64}/.test(stateText) && stateText.includes(email));

    // (d) burn: fresh email, 5 wrong attempts, then the correct code.
    const burnEmail = "burn@example.com";
    const burnReg = await req("/gate/register", { method: "POST", body: { email: burnEmail } });
    const burnCode = burnReg.data?.dev_code;
    let allWrong401 = true;
    for (let i = 0; i < 5; i++) {
      const w = await req("/gate/verify", {
        method: "POST",
        body: { email: burnEmail, code: wrongCodeFor(burnCode) },
      });
      if (w.status !== 401) allWrong401 = false;
    }
    check("(d) 5 wrong codes → all 401", allWrong401);
    const afterBurn = await req("/gate/verify", {
      method: "POST",
      body: { email: burnEmail, code: burnCode },
    });
    check("(d2) CORRECT code after burn → 401", afterBurn.status === 401, `got ${afterBurn.status}`);

    // (e) fresh code for the main email, verify → cookie.
    const reg2 = await req("/gate/register", { method: "POST", body: { email } });
    const code2 = reg2.data?.dev_code;
    const ver = await req("/gate/verify", {
      method: "POST",
      body: { email, code: code2 },
    });
    const cookie = sessionCookieFrom(ver.headers);
    check("(e) verify → 200 + pm_session cookie",
      ver.status === 200 && typeof cookie === "string" && cookie.startsWith("pm_session="),
      `status ${ver.status}, cookie ${cookie ? "present" : "MISSING"}`);

    const statusAuthed = await req("/gate/status", { cookie });
    check("(e2) status with cookie → authenticated:true",
      statusAuthed.data?.authenticated === true, JSON.stringify(statusAuthed.data));

    const bots = await req("/bots", { cookie });
    check("(f) GET /bots with cookie → 200, exactly 1 bot (polycrypt9000)",
      bots.status === 200 && Array.isArray(bots.data) && bots.data.length === 1 && bots.data[0].codename === "polycrypt9000",
      `status ${bots.status}, body ${JSON.stringify(bots.data).slice(0, 120)}`);

    const tampered = cookie.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
    const botsTampered = await req("/bots", { cookie: tampered });
    check("(g) tampered cookie → 401", botsTampered.status === 401, `got ${botsTampered.status}`);

    const internal = await req("/internal/events", {
      method: "POST",
      headers: { "x-internal-token": INTERNAL_TOKEN },
      body: {
        bot: "PolyCrypt9000",
        type: "signal",
        decision_id: null,
        symbol: null,
        side: null,
        qty: null,
        price: null,
        pnl: null,
        reason: "pm7 harness probe",
        ts: new Date().toISOString(),
      },
    });
    check("(h) POST /internal/events with internal token → 200 while gate on",
      internal.status === 200 && internal.data?.ok === true,
      `got ${internal.status} ${JSON.stringify(internal.data)}`);

    // (i) rate limit: 5 registers OK for a fresh email, 6th → 429.
    const rlEmail = "ratelimit@example.com";
    let okCount = 0;
    for (let i = 0; i < 5; i++) {
      const r = await req("/gate/register", { method: "POST", body: { email: rlEmail } });
      if (r.status === 200) okCount += 1;
    }
    const sixth = await req("/gate/register", { method: "POST", body: { email: rlEmail } });
    check("(i) 6th register within the hour → 429",
      okCount === 5 && sixth.status === 429,
      `ok=${okCount}, 6th=${sixth.status}`);

    // Register the expiry guinea pig (code captured for Phase B).
    const expEmail = "expiry@example.com";
    const expReg = await req("/gate/register", { method: "POST", body: { email: expEmail } });
    var expiryCode = expReg.data?.dev_code;
    check("(setup) expiry guinea-pig registered", typeof expiryCode === "string");
  } finally {
    await stopApi(api.child);
  }

  // ---------------- Phase B: expired code ----------------
  console.log("Phase B — expired code record (state edited on disk, API restarted)");
  const statePath = join(dirA, "gate-state.json");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const rec = state.codes.find((c) => c.email === "expiry@example.com");
  if (!rec) throw new Error("expiry code record missing from state file");
  rec.expiresAt = Date.now() - 1000;
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  api = await startApi(dirA, { GATE_ENABLED: "true" });
  try {
    const ver = await req("/gate/verify", {
      method: "POST",
      body: { email: "expiry@example.com", code: expiryCode },
    });
    check("(j) verify with expired code → 401", ver.status === 401, `got ${ver.status}`);
    const status = await req("/gate/status");
    check("(j2) registrations persisted across restart (status sane)",
      status.status === 200 && status.data?.enabled === true);
  } finally {
    await stopApi(api.child);
  }

  // ---------------- Phase C: gate off regression ----------------
  console.log("Phase C — GATE_ENABLED unset (regression)");
  const dirC = mkdtempSync(join(tmpdir(), "pm7-gate-c-"));
  api = await startApi(dirC, {});
  try {
    const bots = await req("/bots");
    check("(k) GET /bots without cookie → 200 with gate off",
      bots.status === 200 && Array.isArray(bots.data) && bots.data.length === 1,
      `got ${bots.status}`);
    const reg = await req("/gate/register", {
      method: "POST",
      body: { email: "keith@example.com" },
    });
    check("(l) POST /gate/register with gate off → 403", reg.status === 403, `got ${reg.status}`);
    const status = await req("/gate/status");
    check("(m) GET /gate/status → enabled:false",
      status.status === 200 && status.data?.enabled === false,
      JSON.stringify(status.data));
    check("(m2) no gate-state.json written while gate off",
      !existsSync(join(dirC, "gate-state.json")));
  } finally {
    await stopApi(api.child);
  }

  console.log(`\nGate harness: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("harness error:", err);
  process.exit(1);
});
