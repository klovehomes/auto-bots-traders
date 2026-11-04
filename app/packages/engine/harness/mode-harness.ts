/**
 * Phase 5 harness — the dashboard mode switch, end to end minus
 * Docker. Covers:
 *
 *   1. boot-mode resolution precedence (engine/src/mode.ts):
 *      stored dashboard choice beats the MODE env; env applies when
 *      nothing is stored; "sim" is the default when neither exists;
 *      corrupt/invalid stored content is ignored WITH a warning and
 *      never crashes the boot resolution.
 *   2. the API's mode store (api/src/mode.ts) — the endpoint's
 *      validation lives there: unknown modes rejected (400),
 *      "connected" refused (403, the live lock), same-mode is a
 *      successful no-op; write/read round trip through the real
 *      on-disk file, read back by BOTH a fresh ModeStore and the
 *      engine's boot resolution (the cross-service file contract).
 *   3. switch detection (createModeSupervisor): desired ≠ running
 *      posts exactly one switch event and calls the injected exit
 *      hook exactly once with code 0; desired == running and
 *      desired == undefined never fire; a postEvent failure cannot
 *      block the exit.
 *   4. running-mode reporting: the supervisor POSTs its boot mode +
 *      source to /internal/control/mode-report with the internal
 *      token (verified against a real local HTTP stub).
 *
 * Run: npx tsx harness/mode-harness.ts   (from packages/engine)
 * Exit code 0 = all checks passed.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FleetEvent } from "@fleet/shared";
import {
  createModeSupervisor,
  readStoredMode,
  resolveBootMode,
} from "../src/mode.js";
import { ModeStore } from "../../api/src/mode.js";

// ---------------------------------------------------------------- setup

let passed = 0;
let failed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

const dir = mkdtempSync(join(tmpdir(), "mode-harness-"));
const storedPath = join(dir, "mode-state.json");

function writeStored(raw: string): void {
  writeFileSync(storedPath, raw);
}

// ------------------------------------------------------- 1. boot resolution

console.log("\n[1] boot-mode resolution precedence");
{
  writeStored(JSON.stringify({ version: 1, mode: "paper", updatedAt: null, updatedBy: "web-ui" }));
  let r = resolveBootMode({ storedPath, envRaw: "sim" });
  check("stored paper beats env sim", r.mode === "paper" && r.source === "dashboard switch" && r.warning === null,
    JSON.stringify(r));

  writeStored(JSON.stringify({ version: 1, mode: "sim", updatedAt: null, updatedBy: "web-ui" }));
  r = resolveBootMode({ storedPath, envRaw: "paper" });
  check("stored sim beats env paper", r.mode === "sim" && r.source === "dashboard switch",
    JSON.stringify(r));

  r = resolveBootMode({ storedPath: join(dir, "absent.json"), envRaw: "paper" });
  check("no stored file → env applies", r.mode === "paper" && r.source === "env" && r.warning === null,
    JSON.stringify(r));

  r = resolveBootMode({ storedPath: join(dir, "absent.json"), envRaw: undefined });
  check("no stored, no env → sim default", r.mode === "sim" && r.source === "default",
    JSON.stringify(r));

  r = resolveBootMode({ storedPath: join(dir, "absent.json"), envRaw: "PAPER" });
  check("env is case-insensitive, no warning", r.mode === "paper" && r.source === "env" && r.warning === null,
    JSON.stringify(r));

  writeStored("{not json at all");
  r = resolveBootMode({ storedPath, envRaw: "paper" });
  check("corrupt stored file ignored → env applies, warning names the corruption",
    r.mode === "paper" && r.source === "env" && r.warning !== null && /corrupt|unreadable/.test(r.warning),
    JSON.stringify(r));
  check("readStoredMode reports corrupt content as invalid, never throws",
    readStoredMode(storedPath).status === "invalid");

  writeStored(JSON.stringify({ version: 1, mode: "live", updatedAt: null, updatedBy: null }));
  r = resolveBootMode({ storedPath, envRaw: "sim" });
  check("stored unrecognized mode ignored → env applies + warning",
    r.mode === "sim" && r.source === "env" && r.warning !== null && /unrecognized mode/.test(r.warning),
    JSON.stringify(r));

  writeStored(JSON.stringify({ version: 99, mode: "paper", updatedAt: null, updatedBy: null }));
  r = resolveBootMode({ storedPath, envRaw: "paper" });
  check("stored wrong version ignored → env applies + warning",
    r.mode === "paper" && r.source === "env" && r.warning !== null && /version/.test(r.warning),
    JSON.stringify(r));

  writeStored(JSON.stringify({ version: 1, mode: null, updatedAt: null, updatedBy: null }));
  r = resolveBootMode({ storedPath, envRaw: "paper" });
  check("stored file with mode:null records no choice → env applies, no warning",
    r.mode === "paper" && r.source === "env" && r.warning === null,
    JSON.stringify(r));

  r = resolveBootMode({ storedPath: join(dir, "absent.json"), envRaw: "turbo" });
  check("unrecognized env falls back to sim + warning (pre-Phase-5 semantics)",
    r.mode === "sim" && r.source === "env" && r.warning !== null && /unrecognized MODE/.test(r.warning),
    JSON.stringify(r));
}

// ------------------------------------------------------- 2. API mode store

console.log("\n[2] ModeStore validation + persistence round trip");
{
  const storePath = join(dir, "api-mode.json");
  const store = new ModeStore(storePath, "sim");
  check("fresh store: desired = env default", store.desiredMode() === "sim");
  check("fresh store: publicState source is env, not switching",
    store.publicState().desiredSource === "env" && store.publicState().switching === false);

  const bad1 = store.requestMode("turbo", "web-ui");
  check("unknown mode rejected with 400", !bad1.ok && bad1.status === 400, JSON.stringify(bad1));
  const bad2 = store.requestMode(42, "web-ui");
  check("non-string mode rejected with 400", !bad2.ok && bad2.status === 400, JSON.stringify(bad2));
  const bad3 = store.requestMode(undefined, "web-ui");
  check("missing mode rejected with 400", !bad3.ok && bad3.status === 400, JSON.stringify(bad3));

  const locked = store.requestMode("connected", "web-ui");
  check("LIVE LOCK: 'connected' refused with 403 + not-enabled message",
    !locked.ok && locked.status === 403 && /not enabled/.test(locked.error),
    JSON.stringify(locked));
  check("LIVE LOCK: desired mode unchanged after the refused request",
    store.desiredMode() === "sim");

  const sw = store.requestMode("paper", "web-ui");
  check("switch to paper accepted and marked changed", sw.ok && sw.changed === true && sw.mode === "paper");
  check("desired is paper after the switch", store.desiredMode() === "paper");

  const onDisk = JSON.parse(readFileSync(storePath, "utf8")) as {
    version?: number; mode?: string; updatedBy?: string;
  };
  check("stored file on disk: version 1, mode paper, updatedBy web-ui",
    onDisk.version === 1 && onDisk.mode === "paper" && onDisk.updatedBy === "web-ui",
    JSON.stringify(onDisk));

  const noop = store.requestMode("paper", "web-ui");
  check("re-selecting the desired mode is a successful no-op",
    noop.ok && noop.changed === false);

  const reread = new ModeStore(storePath, "sim");
  check("round trip: a fresh ModeStore reads the persisted choice",
    reread.desiredMode() === "paper" && reread.publicState().desiredSource === "dashboard");

  const boot = resolveBootMode({ storedPath: storePath, envRaw: "sim" });
  check("round trip: engine boot resolution reads the API-written file (stored beats env)",
    boot.mode === "paper" && boot.source === "dashboard switch", JSON.stringify(boot));

  const corruptPath = join(dir, "api-mode-corrupt.json");
  writeFileSync(corruptPath, "][ garbage");
  const corruptStore = new ModeStore(corruptPath, "paper");
  check("corrupt store file: ModeStore falls back to env default without throwing",
    corruptStore.desiredMode() === "paper");

  // publicState switching math
  store.reportRunning("sim", "env");
  check("publicState: running sim vs desired paper → switching",
    store.publicState().switching === true);
  store.reportRunning("paper", "dashboard switch");
  const ps = store.publicState();
  check("publicState: running catches up → switching clears; running report carried",
    ps.switching === false && ps.running?.mode === "paper" && ps.running?.source === "dashboard switch");
  check("publicState: switchable list is sim + paper only (live locked)",
    JSON.stringify(ps.switchable) === JSON.stringify(["sim", "paper"]));
}

// ------------------------------------------------------- 3. switch detection

console.log("\n[3] switch detection (injected exit hook)");
{
  const events: FleetEvent[] = [];
  const exits: number[] = [];
  const sup = createModeSupervisor({
    runningMode: "sim",
    bootSource: "env",
    apiBaseUrl: "http://127.0.0.1:1", // reporting not started here
    token: "test-token",
    postEvent: async (e) => { events.push(e); },
    exit: (code) => { exits.push(code); },
  });

  sup.observeDesiredMode(undefined);
  sup.observeDesiredMode("sim");
  await sleep(50);
  check("no switch when desired is absent or equals running",
    exits.length === 0 && events.length === 0 && sup.switchTriggered === false);

  sup.observeDesiredMode("paper");
  await sleep(50);
  check("desired paper vs running sim → exactly one exit(0)",
    exits.length === 1 && exits[0] === 0, JSON.stringify(exits));
  check("switch event posted: Engine signal naming sim → paper",
    events.length === 1 && events[0]!.bot === "Engine" && events[0]!.type === "signal" &&
      events[0]!.reason.includes("sim → paper"),
    JSON.stringify(events[0] ?? null));

  sup.observeDesiredMode("paper");
  sup.observeDesiredMode("sim");
  await sleep(50);
  check("the restart path latches: repeat observations never re-fire",
    exits.length === 1 && events.length === 1);

  // Reverse direction + a failing postEvent must not block the exit.
  const exits2: number[] = [];
  const sup2 = createModeSupervisor({
    runningMode: "paper",
    bootSource: "dashboard switch",
    apiBaseUrl: "http://127.0.0.1:1",
    token: "test-token",
    postEvent: async () => { throw new Error("API down"); },
    exit: (code) => { exits2.push(code); },
  });
  sup2.observeDesiredMode("sim");
  await sleep(50);
  check("paper → sim also fires, and a failed event post cannot block the exit",
    exits2.length === 1 && exits2[0] === 0, JSON.stringify(exits2));
}

// ------------------------------------------------------- 4. running-mode report

console.log("\n[4] running-mode reporting (real HTTP stub)");
{
  const received: { url?: string; token?: string; body?: string } = {};
  const server: Server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => { body += String(chunk); });
    req.on("end", () => {
      received.url = req.url;
      received.token = req.headers["x-internal-token"] as string;
      received.body = body;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr !== null ? addr.port : 0;

  const sup = createModeSupervisor({
    runningMode: "paper",
    bootSource: "dashboard switch",
    apiBaseUrl: `http://127.0.0.1:${port}`,
    token: "test-token",
    postEvent: async () => {},
    exit: () => {},
    reportIntervalMs: 60_000,
  });
  sup.startReporting();
  await sleep(300);
  sup.stopReporting();
  server.close();

  check("report POSTed to /internal/control/mode-report",
    received.url === "/internal/control/mode-report", String(received.url));
  check("report carries the internal token", received.token === "test-token");
  const body = JSON.parse(received.body ?? "{}") as { mode?: string; source?: string };
  check("report body: running mode + boot source",
    body.mode === "paper" && body.source === "dashboard switch",
    JSON.stringify(body));
}

// ------------------------------------------------------- summary

console.log(
  `\n${failed === 0 ? "ALL CHECKS PASSED" : "FAILURES PRESENT"} — ${passed} passed, ${failed} failed`,
);
if (failures.length > 0) {
  console.log(`failed checks:\n - ${failures.join("\n - ")}`);
}
process.exit(failed === 0 ? 0 : 1);
