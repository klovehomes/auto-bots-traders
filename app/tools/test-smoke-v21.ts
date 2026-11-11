/**
 * Phase 12 (v21) boot smoke — real processes, fake keys, mocked by
 * construction (the fake keys point at real endpoints but belong to
 * no account; the assertions are about boot behavior, status surface
 * and event flow, never about a broker accepting an order):
 *
 *   1. API boots with a FAKE keys file (temp RSA keypair for Kalshi):
 *      GET /keys/status reports BOTH providers loaded, source=file —
 *      and the response body contains none of the secret strings.
 *   2. GET /bots returns all five bots.
 *   3. Engine in MODE=sim: events from all five bots reach the API
 *      history (SIM regression — unchanged behavior).
 *   4. Engine in MODE=paper with the same fake keys file: it logs the
 *      keys line ("alpaca paper: loaded (from file…"), enters paper
 *      mode, and stays alive (runner ticks fail against the real
 *      endpoints with fake keys and are caught per-tick, as designed).
 *
 *     node_modules/.bin/tsx tools/test-smoke-v21.ts        (from app/)
 *
 * Scratch under ~/workspace/trading-bots/scratch-v21/ (not /tmp).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const APP = join(import.meta.dirname, "..");
const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v21/smoke");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const PORT = 18099;
const BASE = `http://127.0.0.1:${PORT}`;
const FAKE_ALPACA_SECRET = "smoke-fake-alpaca-secret-zzz";
const FAKE_ALPACA_ID = "SMOKEALPACAKEYID4242";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pemPath = join(SCRATCH, "kalshi-demo.pem");
writeFileSync(pemPath, privateKey.export({ type: "pkcs8", format: "pem" }).toString());
const keysPath = join(SCRATCH, "traderbot-keys.txt");
writeFileSync(
  keysPath,
  [
    `ALPACA_API_KEY_ID=${FAKE_ALPACA_ID}`,
    `ALPACA_API_SECRET_KEY=${FAKE_ALPACA_SECRET}`,
    "KALSHI_API_KEY_ID=smoke-kalshi-key-id-7777",
    `KALSHI_PRIVATE_KEY_PATH=${pemPath}`,
    "KALSHI_ENV=demo",
  ].join("\n"),
);

const children: ChildProcess[] = [];
function run(args: string[], env: NodeJS.ProcessEnv, cwd: string): { proc: ChildProcess; log: () => string } {
  let buf = "";
  const proc = spawn(join(APP, "node_modules/.bin/tsx"), args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout?.on("data", (d: Buffer) => { buf += d.toString(); });
  proc.stderr?.on("data", (d: Buffer) => { buf += d.toString(); });
  children.push(proc);
  return { proc, log: () => buf };
}
function kill(proc: ChildProcess): void {
  try { proc.kill("SIGTERM"); } catch { /* already gone */ }
}
async function waitFor(what: string, cond: () => Promise<boolean> | boolean, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await cond()) return true;
    await sleep(500);
  }
  console.log(`  (timeout waiting for: ${what})`);
  return false;
}

// ------------------------------------------------------------------ API
const api = run([join(APP, "packages/api/src/index.ts")], {
  API_PORT: String(PORT),
  KEYS_FILE: keysPath,
  CONTROL_STATE_PATH: join(SCRATCH, "control-state.json"),
  MODE_STATE_PATH: join(SCRATCH, "mode-state.json"),
  EVENT_HISTORY_PATH: join(SCRATCH, "event-history.json"),
}, APP);

const apiUp = await waitFor("API health", async () => {
  try {
    const r = await fetch(`${BASE}/health`);
    return r.ok;
  } catch {
    return false;
  }
});
check("API boots", apiUp);

if (apiUp) {
  const statusRes = await fetch(`${BASE}/keys/status`);
  const statusText = await statusRes.text();
  const status = JSON.parse(statusText) as {
    alpaca: { loaded: boolean; source: string };
    kalshi: { loaded: boolean; source: string };
  };
  check("keys/status: alpaca loaded from file", status.alpaca.loaded && status.alpaca.source === "file");
  check("keys/status: kalshi loaded from file", status.kalshi.loaded && status.kalshi.source === "file");
  check("keys/status: no alpaca secret in the response", !statusText.includes(FAKE_ALPACA_SECRET));
  check("keys/status: no pem material in the response", !statusText.includes("PRIVATE KEY"));
  check("keys/status: no full key id in the response", !statusText.includes(FAKE_ALPACA_ID));

  const bots = (await (await fetch(`${BASE}/bots`)).json()) as { codename: string }[];
  check("bots: all five load", bots.length === 5, `got ${bots.length}`);

  // ---------------------------------------------------------- engine SIM
  const sim = run([join(APP, "packages/engine/src/index.ts")], {
    MODE: "sim",
    API_BASE_URL: BASE,
  }, SCRATCH);
  const ALL = ["Trendia", "Snapback", "Vega", "Wesley", "PolyCrypt9000"];
  const simOk = await waitFor("sim events from all five bots", async () => {
    const h = (await (await fetch(`${BASE}/events/history`)).json()) as {
      events: { bot: string }[];
    };
    const seen = new Set(h.events.map((e) => e.bot));
    return ALL.every((n) => seen.has(n));
  }, 45000);
  check("SIM regression: all five bots stream events", simOk);
  kill(sim.proc);

  // -------------------------------------------------------- engine PAPER
  // The dashboard flow: flip the API's stored fleet mode to Paper
  // first — an engine booted in a different mode than the stored one
  // exits by design (v13) so Docker restarts it into the stored mode.
  const modeRes = await fetch(`${BASE}/mode`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "paper" }),
  });
  check("mode flip: API stores fleet mode = paper", modeRes.ok);
  const paper = run([join(APP, "packages/engine/src/index.ts")], {
    MODE: "paper",
    API_BASE_URL: BASE,
    KEYS_FILE: keysPath,
  }, SCRATCH);
  const paperOk = await waitFor("paper boot log", () =>
    paper.log().includes("MODE=paper") && paper.log().includes("alpaca paper: loaded (from file"),
    25000,
  );
  check("PAPER boot: keys line reports file-loaded Alpaca", paperOk, paperOk ? "" : paper.log().slice(0, 400));
  await sleep(4000);
  check("PAPER boot: engine stays alive with fake keys (ticks fail soft)", paper.proc.exitCode === null);
  kill(paper.proc);
}

for (const c of children) kill(c);
await sleep(500);
for (const c of children) {
  try { c.kill("SIGKILL"); } catch { /* already gone */ }
}
console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
