#!/usr/bin/env node
/**
 * test-publish-snapshot.mjs — fixture harness for the Phase 8
 * showcase publisher. Spins up a fake API on a local port and checks:
 *   (a) a normal run writes a schema-valid snapshot with the fleet
 *       math right, and local-only fields (sourcePath, bot prose)
 *       never reach the file;
 *   (b) a POISONED fixture (broker key id / email inside an event
 *       reason) makes the publisher refuse to write, exit non-zero,
 *       and leave any pre-existing snapshot untouched;
 *   (c) an API-down run exits non-zero and leaves an existing good
 *       snapshot byte-for-byte intact;
 *   (d) the shipped sample snapshot (packages/web/public/snapshot.json)
 *       validates against the same schema and passes the same scan.
 *
 * Plain Node, no dependencies. Run from anywhere:
 *   node tools/test-publish-snapshot.mjs
 * Prints PASS/FAIL per check; exit code is non-zero on any failure.
 */
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  scanForLeaks,
  validateSnapshot,
} from "./publish-snapshot.mjs";

const execFileP = promisify(execFile);
const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.dirname(TOOLS_DIR);
const PUBLISHER = path.join(TOOLS_DIR, "publish-snapshot.mjs");
const SCRATCH = path.join(TOOLS_DIR, ".tmp-harness");
const SAMPLE = path.join(APP_DIR, "packages", "web", "public", "snapshot.json");

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

// --- Fixtures -----------------------------------------------------------
const FIXTURE_BOTS = [
  {
    name: "Trendia",
    codename: "trendia",
    enabled: true,
    mode: "paper",
    market: "us_equities",
    broker: "alpaca",
    strategy: "trend",
    viz: { color: "#22d3ee", form: "avatar_disc", avatar_accessory: "" },
    rules: {},
    risk: {},
    philosophy: "Fixture prose that must never be published.",
    // The leak this fixture exists to catch: a local absolute path.
    sourcePath: "/Users/keith/traderbots/bots/trendia.md",
    raw: {},
  },
  {
    name: "Wesley",
    codename: "wesley",
    enabled: true,
    mode: "paper",
    market: "us_equities",
    broker: "alpaca",
    strategy: "income",
    viz: { color: "#4ade80", form: "avatar_disc", avatar_accessory: "" },
    rules: {},
    risk: {},
    philosophy: "Fixture prose.",
    sourcePath: "/Users/keith/traderbots/bots/wesley.md",
    raw: {},
  },
];

const ev = (over) => ({
  bot: "Trendia",
  type: "signal",
  decision_id: null,
  symbol: null,
  side: null,
  qty: null,
  price: null,
  pnl: null,
  reason: "fixture",
  ts: new Date().toISOString(),
  seq: 0,
  ...over,
});

function fixtureEvents(poison) {
  const now = Date.now();
  const iso = (msAgo) => new Date(now - msAgo).toISOString();
  const events = [
    ev({ type: "open", bot: "Trendia", decision_id: "t-4", symbol: "NVDA", side: "buy", qty: 2, price: 131.0, reason: "20-day breakout", ts: iso(30_000) }),
    ev({ type: "close", bot: "Trendia", decision_id: "t-3", symbol: "QQQ", side: "sell", qty: 4, price: 610.0, pnl: -40.0, reason: "stop hit", ts: iso(60_000) }),
    ev({ type: "open", bot: "Trendia", decision_id: "t-2", symbol: "QQQ", side: "buy", qty: 4, price: 615.5, reason: "20-day breakout", ts: iso(120_000) }),
    ev({ type: "close", bot: "Trendia", decision_id: "t-1", symbol: "SPY", side: "sell", qty: 3, price: 590.25, pnl: 150.25, reason: "trailing stop", ts: iso(180_000) }),
    ev({ type: "open", bot: "Trendia", decision_id: "t-0", symbol: "SPY", side: "buy", qty: 3, price: 575.0, reason: "20-day breakout", ts: iso(240_000) }),
    ev({ type: "open", bot: "Wesley", decision_id: "w-1", symbol: "F", side: "sell", qty: 100, price: 12.4, reason: "cash-secured put", ts: iso(300_000) }),
    ev({ type: "signal", bot: "Wesley", decision_id: "w-0", symbol: null, reason: poison ?? "no qualifying premium today", ts: iso(360_000) }),
  ];
  return { latestSeq: events.length, events }; // newest first, like the API
}

function startFixtureApi(poison) {
  const server = http.createServer((req, res) => {
    const send = (body) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.url === "/health") return send({ ok: true, mode: "paper" });
    if (req.url === "/bots") return send(FIXTURE_BOTS);
    if (req.url === "/events/history") return send(fixtureEvents(poison));
    res.writeHead(404);
    res.end("{}");
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, port: server.address().port }),
    );
  });
}

async function runPublisher(args) {
  try {
    const { stdout, stderr } = await execFileP("node", [PUBLISHER, ...args]);
    return { code: 0, stdout, stderr };
  } catch (err) {
    return { code: err.code ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

async function main() {
  rmSync(SCRATCH, { recursive: true, force: true });
  mkdirSync(SCRATCH, { recursive: true });

  // (a) Happy path ------------------------------------------------------
  {
    const { server, port } = await startFixtureApi(null);
    const out = path.join(SCRATCH, "good.json");
    const run = await runPublisher(["--api", `http://127.0.0.1:${port}`, "--out", out]);
    check("(a) publisher exits 0 against fixture API", run.code === 0, run.stderr.trim());
    check("(a) snapshot file written", existsSync(out));
    const text = readFileSync(out, "utf8");
    const snap = JSON.parse(text);
    check("(a) snapshot validates against schema", validateSnapshot(snap).length === 0, validateSnapshot(snap).join("; "));
    const trendia = snap.bots.find((b) => b.codename === "trendia");
    check("(a) balance math: 10000 + 150.25 − 40 = 10110.25", trendia?.balance === 10110.25, `got ${trendia?.balance}`);
    const wesley = snap.bots.find((b) => b.codename === "wesley");
    check("(a) open position survives replay (Wesley F ×100)", wesley?.positions.length === 1 && wesley.positions[0].symbol === "F" && wesley.positions[0].qty === 100);
    check("(a) closed positions retired (Trendia holds only the fresh NVDA)", trendia?.positions.length === 1 && trendia.positions[0].symbol === "NVDA");
    check("(a) totals.equity is the bots' sum", snap.totals.equity === 10110.25 + 10000, `got ${snap.totals.equity}`);
    check("(a) local path / bot prose absent from file", !text.includes("/Users/") && !text.includes("sourcePath") && !text.includes("Fixture prose"));
    check("(a) denylist scan clean on written file", scanForLeaks(text).length === 0);
    check("(a) trades + decisions capped arrays present", Array.isArray(snap.recentTrades) && snap.recentTrades.length === 6 && snap.recentDecisions.length === 7);
    server.close();
  }

  // (b) Poisoned fixtures ------------------------------------------------
  for (const [label, poison] of [
    ["email in a decision reason", "reach me at klovehomes@gmail.com for details"],
    ["broker key id in a decision reason", "key PK1234567890ABCDEFGH rejected"],
  ]) {
    const { server, port } = await startFixtureApi(poison);
    const out = path.join(SCRATCH, "poisoned.json");
    writeFileSync(out, "PRE-EXISTING GOOD SNAPSHOT\n");
    const run = await runPublisher(["--api", `http://127.0.0.1:${port}`, "--out", out]);
    check(`(b) poisoned fixture refused (${label})`, run.code !== 0, `exit ${run.code}`);
    check(`(b) refusal names the tripwire (${label})`, /REFUSING TO WRITE/.test(run.stderr));
    check(`(b) pre-existing snapshot untouched (${label})`, readFileSync(out, "utf8") === "PRE-EXISTING GOOD SNAPSHOT\n");
    server.close();
  }

  // (c) API down ---------------------------------------------------------
  {
    const out = path.join(SCRATCH, "down.json");
    writeFileSync(out, "LAST GOOD SNAPSHOT\n");
    // Port 9 (discard) — nothing listens there on a normal machine;
    // connection refused either way.
    const run = await runPublisher(["--api", "http://127.0.0.1:9", "--out", out]);
    check("(c) API-down run exits non-zero", run.code !== 0, `exit ${run.code}`);
    check("(c) existing snapshot left byte-for-byte intact", readFileSync(out, "utf8") === "LAST GOOD SNAPSHOT\n");
  }

  // (d) Shipped sample snapshot ------------------------------------------
  {
    check("(d) sample snapshot exists", existsSync(SAMPLE), SAMPLE);
    if (existsSync(SAMPLE)) {
      const text = readFileSync(SAMPLE, "utf8");
      const snap = JSON.parse(text);
      const problems = validateSnapshot(snap);
      check("(d) sample validates against schema", problems.length === 0, problems.join("; "));
      check("(d) sample passes the denylist scan", scanForLeaks(text).length === 0, scanForLeaks(text).join("; "));
      // PM2 (polymarket-only): the sample is single-bot by design.
      check("(d) sample carries exactly one bot", snap.bots?.length === 1, `got ${snap.bots?.length}`);
      const poly = snap.bots?.find((b) => b.codename === "polycrypt9000");
      check("(d) sample carries PolyCrypt9000's known book ($10,017.45)", poly?.balance === 10017.45, `got ${poly?.balance}`);
    }
  }

  rmSync(SCRATCH, { recursive: true, force: true });
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

await main();
