#!/usr/bin/env node
/**
 * publish-snapshot.mjs — TraderBot public showcase publisher (Phase 8).
 *
 * Run on the same machine as the PRIVATE stack (Keith's Mac today, the
 * VPS later). It reads the fleet's current state through the API's
 * existing read-only GET endpoints and writes ONE sanitized
 * `snapshot.json` that the public read-only showcase site polls.
 *
 *   node tools/publish-snapshot.mjs --api http://localhost:8080 --out ./snapshot.json
 *
 * Endpoints consumed (all read-only):
 *   GET /health          → fleet mode
 *   GET /bots            → bot configs (only whitelisted fields survive)
 *   GET /events/history  → retained events (balances/positions are
 *                          derived from them, exactly like the private
 *                          dashboard's own client-side math)
 *
 * It NEVER calls /control or /mode, and it never copies a bot config
 * wholesale: bot entries and events are rebuilt field-by-field from an
 * explicit whitelist, so local file paths (sourcePath), the bot files'
 * prose, and any future config field cannot leak by construction.
 * As a backstop, the serialized output is scanned against a denylist
 * (see FORBIDDEN_PATTERNS) before writing — a single hit refuses the
 * write and exits non-zero.
 *
 * Failure contract: any error (API down, invalid data, denylist hit)
 * exits non-zero with a plain message and leaves an existing snapshot
 * file byte-for-byte untouched. Writes are tmp-file + rename, so a
 * reader never sees a half-written snapshot.
 *
 * Plain Node (>= 18, global fetch), no dependencies.
 */
import { renameSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const SNAPSHOT_VERSION = 1;
/** Equal starting allocation per bot ($10,000 since 2026-11-03). */
export const START_EQUITY = 10000;

const DEFAULT_TRADES_CAP = 50;
const DEFAULT_DECISIONS_CAP = 50;

/**
 * Denylist scanned against the SERIALIZED snapshot before any write.
 * A hit = refuse to write, exit non-zero. These patterns are the
 * tripwires for the things a public file must never contain:
 * broker credentials, account identifiers, contact details, local
 * filesystem paths, and the private stack's control internals.
 */
export const FORBIDDEN_PATTERNS = [
  {
    name: "broker API key id (Alpaca-style PK…/AK…)",
    re: /\b[AP]K[A-Z0-9]{10,}\b/,
  },
  {
    name: "UUID (account-identifier shape)",
    re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
  },
  {
    name: "email address",
    re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
  },
  {
    name: "local filesystem path",
    re: /(\/Users\/|\/home\/|[A-Za-z]:\\|sourcePath)/,
  },
  {
    name: "control-surface internal (kill/control/token plumbing)",
    re: /(kill-liquidate|x-internal-token|INTERNAL_EVENT_TOKEN|control-state\.json|\/control\/)/,
  },
];

/**
 * Scan serialized snapshot text for forbidden content. `extraSecrets`
 * lets the caller add literal values that must never appear (the
 * publisher passes the INTERNAL_EVENT_TOKEN env value when set).
 * Returns a list of human-readable hit descriptions (empty = clean).
 */
export function scanForLeaks(text, extraSecrets = []) {
  const hits = [];
  for (const { name, re } of FORBIDDEN_PATTERNS) {
    const m = text.match(re);
    if (m) hits.push(`${name}: "${m[0]}"`);
  }
  for (const secret of extraSecrets) {
    if (secret && text.includes(secret)) {
      hits.push("internal event token value present in output");
    }
  }
  return hits;
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const round2 = (v) => Math.round(v * 100) / 100;

/** Rebuild one event from the explicit public field whitelist. */
export function pickEvent(e) {
  return {
    bot: String(e.bot ?? ""),
    type: String(e.type ?? ""),
    decision_id:
      e.decision_id === null || e.decision_id === undefined
        ? null
        : String(e.decision_id),
    symbol: e.symbol === null || e.symbol === undefined ? null : String(e.symbol),
    side: e.side === "buy" || e.side === "sell" ? e.side : null,
    qty: num(e.qty),
    price: num(e.price),
    pnl: num(e.pnl),
    reason: String(e.reason ?? ""),
    ts: String(e.ts ?? ""),
  };
}

/**
 * Build the snapshot object from API payloads.
 * `bots` = GET /bots array, `history` = GET /events/history body,
 * `fleetMode` = GET /health mode, `now` = Date for generatedAt and the
 * day-PnL boundary (publisher host's local day).
 *
 * Balances and open positions are derived by replaying the retained
 * history oldest → newest — the same math the private dashboard runs
 * client-side (fleetState.computeStats): equity = START_EQUITY +
 * cumulative realized PnL; a close retires the oldest open position
 * for that symbol.
 */
export function buildSnapshot({ bots, history, fleetMode, now = new Date(), tradesCap = DEFAULT_TRADES_CAP, decisionsCap = DEFAULT_DECISIONS_CAP }) {
  const events = Array.isArray(history?.events) ? history.events : [];
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  // Per-bot accumulators.
  const acc = new Map();
  const accFor = (name) => {
    let a = acc.get(name);
    if (!a) {
      a = { realized: 0, dayPnL: 0, positions: [] };
      acc.set(name, a);
    }
    return a;
  };

  const chronological = [...events].reverse();
  for (const raw of chronological) {
    const e = pickEvent(raw);
    const a = accFor(e.bot);
    if (e.type === "open") {
      a.positions.push({
        symbol: e.symbol ?? "?",
        qty: e.qty,
        side: e.side,
        avgEntry: e.price,
      });
    } else if (e.type === "close") {
      const pnl = e.pnl ?? 0;
      a.realized += pnl;
      if (Date.parse(e.ts) >= dayStart.getTime()) a.dayPnL += pnl;
      const idx = a.positions.findIndex((p) => p.symbol === e.symbol);
      if (idx >= 0) a.positions.splice(idx, 1);
    }
  }

  const botEntries = (Array.isArray(bots) ? bots : []).map((b) => {
    const a = accFor(String(b.name ?? ""));
    return {
      codename: String(b.codename ?? ""),
      displayName: String(b.name ?? ""),
      color: String(b.viz?.color ?? "#8b98a9"),
      mode: String(b.mode ?? fleetMode ?? "sim"),
      balance: round2(START_EQUITY + a.realized),
      dayPnL: round2(a.dayPnL),
      positions: a.positions.map((p) => ({
        symbol: p.symbol,
        qty: p.qty,
        side: p.side,
        avgEntry: p.avgEntry,
        // The API exposes no live marks, so currentPrice /
        // unrealizedPnL are omitted rather than invented.
      })),
    };
  });

  const newestFirst = [...events].map(pickEvent);
  const recentTrades = newestFirst
    .filter((e) => e.type === "open" || e.type === "close")
    .slice(0, tradesCap);
  const recentDecisions = newestFirst
    .filter((e) => e.decision_id !== null)
    .slice(0, decisionsCap);

  return {
    version: SNAPSHOT_VERSION,
    generatedAt: now.toISOString(),
    fleetMode: String(fleetMode ?? "sim"),
    bots: botEntries,
    recentTrades,
    recentDecisions,
    totals: {
      equity: round2(botEntries.reduce((s, b) => s + b.balance, 0)),
      dayPnL: round2(botEntries.reduce((s, b) => s + b.dayPnL, 0)),
    },
  };
}

/** Structural validation shared by the publisher and its harness. */
export function validateSnapshot(s) {
  const problems = [];
  if (!s || typeof s !== "object") return ["snapshot is not an object"];
  if (s.version !== SNAPSHOT_VERSION) problems.push(`version must be ${SNAPSHOT_VERSION}`);
  if (typeof s.generatedAt !== "string" || Number.isNaN(Date.parse(s.generatedAt))) {
    problems.push("generatedAt missing or unparseable");
  }
  if (!Array.isArray(s.bots)) {
    problems.push("bots is not an array");
  } else {
    for (const [i, b] of s.bots.entries()) {
      for (const field of ["codename", "displayName", "color", "mode"]) {
        if (typeof b[field] !== "string") problems.push(`bots[${i}].${field} not a string`);
      }
      if (typeof b.balance !== "number") problems.push(`bots[${i}].balance not a number`);
      if (typeof b.dayPnL !== "number") problems.push(`bots[${i}].dayPnL not a number`);
      if (!Array.isArray(b.positions)) problems.push(`bots[${i}].positions not an array`);
    }
  }
  if (!Array.isArray(s.recentTrades)) problems.push("recentTrades is not an array");
  if (!Array.isArray(s.recentDecisions)) problems.push("recentDecisions is not an array");
  if (typeof s.totals?.equity !== "number") problems.push("totals.equity not a number");
  if (typeof s.totals?.dayPnL !== "number") problems.push("totals.dayPnL not a number");
  return problems;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return res.json();
}

/** Fetch the API state, build + validate + scan, then atomically write. */
export async function publish({ api, out, tradesCap, decisionsCap }) {
  const base = api.replace(/\/+$/, "");
  const [health, bots, history] = await Promise.all([
    fetchJson(`${base}/health`),
    fetchJson(`${base}/bots`),
    fetchJson(`${base}/events/history`),
  ]);
  const snapshot = buildSnapshot({
    bots,
    history,
    fleetMode: health?.mode,
    tradesCap,
    decisionsCap,
  });
  const problems = validateSnapshot(snapshot);
  if (problems.length > 0) {
    throw new Error(`snapshot failed validation: ${problems.join("; ")}`);
  }
  const text = `${JSON.stringify(snapshot, null, 2)}\n`;
  const leaks = scanForLeaks(text, [process.env.INTERNAL_EVENT_TOKEN ?? ""]);
  if (leaks.length > 0) {
    throw new Error(
      `REFUSING TO WRITE — sanitization scan tripped: ${leaks.join(" · ")}`,
    );
  }
  const tmp = `${out}.tmp-${process.pid}`;
  writeFileSync(tmp, text, "utf8");
  renameSync(tmp, out);
  return snapshot;
}

function parseArgs(argv) {
  const args = { api: "http://localhost:8080", out: "./snapshot.json" };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--api") args.api = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--trades") args.tradesCap = Number(argv[++i]);
    else if (a === "--decisions") args.decisionsCap = Number(argv[++i]);
    else if (a === "--help" || a === "-h") args.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return args;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`publish-snapshot: ${err.message}`);
    process.exit(2);
  }
  if (args.help) {
    console.log(
      "Usage: node tools/publish-snapshot.mjs [--api http://localhost:8080] [--out ./snapshot.json] [--trades 50] [--decisions 50]",
    );
    return;
  }
  try {
    const snapshot = await publish(args);
    console.log(
      `publish-snapshot: wrote ${args.out} — ${snapshot.bots.length} bots, ` +
        `equity $${snapshot.totals.equity.toFixed(2)}, day PnL $${snapshot.totals.dayPnL.toFixed(2)}, ` +
        `${snapshot.recentTrades.length} trades, ${snapshot.recentDecisions.length} decisions ` +
        `(generated ${snapshot.generatedAt})`,
    );
  } catch (err) {
    console.error(
      `publish-snapshot: FAILED — ${err instanceof Error ? err.message : String(err)}`,
    );
    console.error(
      "publish-snapshot: no snapshot written; any existing file was left untouched.",
    );
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
