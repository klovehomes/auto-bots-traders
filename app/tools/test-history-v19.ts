/**
 * Phase 11 (v19) verification harness — run with tsx from app/:
 *
 *     node_modules/.bin/tsx tools/test-history-v19.ts
 *
 * Exercises the REAL EventHistoryStore (packages/api/src/history.ts —
 * no replica) against the diagnosed failure: the Phase 6 store kept
 * ONE shared 5,000-deep decision pool, the simulator mints decision
 * ids like everyone else, and its around-the-clock volume evicted
 * the paper bots' decisions within ~a day (live census: ≈2,498
 * Wesley + ≈2,496 PolyCrypt9000 mentions ≈ the whole window).
 *
 * Part 0: the classification rule (runner-minted id shapes).
 * Part 1: the flood — 12,000 sim decisions interleaved with 300
 *         paper decisions; every paper decision must survive.
 * Part 2: boot migration of a v1-format file (4,800 sim + 150 paper
 *         decisions) — re-bucketing, caps, no protected loss, seq
 *         continuity, file rewritten as v2.
 * Part 3: restart on the migrated file — classes and seq persist.
 * Part 4: classification follows the producing runner, not the bot
 *         name (a sim-minted id from "Trendia" is sim class; a
 *         runner-minted id from "Wesley" is protected).
 *
 * Scratch files live under ~/workspace/trading-bots/scratch-v19/
 * (never /tmp — it is wiped on runtime restart).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { FleetEvent } from "../packages/shared/src/types.ts";
import {
  EventHistoryStore,
  classifyDecisionEvent,
  PROTECTED_DECISION_CAP,
  SIM_DECISION_CAP,
  RECENT_CAP,
  type StoredEvent,
} from "../packages/api/src/history.ts";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail: string): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v19");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const TS = "2026-11-06T12:00:00.000Z";
function ev(bot: string, decision_id: string | null): FleetEvent {
  return {
    bot,
    type: "open",
    decision_id,
    symbol: "SPY",
    side: "buy",
    qty: 1,
    price: 100,
    pnl: null,
    reason: `${bot} harness event`,
    ts: TS,
  };
}

// ---------------------------------------------------------------------
console.log("\n== Part 0: classification rule ==");
const cases: Array<[string | null, string]> = [
  ["snapback-17", "protected"],
  ["trendia-1", "protected"],
  ["vega-903", "protected"],
  ["polycrypt9000-3", "protected"], // prefix has digits, not all-digit
  ["4815", "sim"], // simulator bare counter
  ["0", "sim"],
  ["42-7", "sim"], // numeric prefix = unrecognized → expendable default
  ["weird", "sim"], // no counter suffix → unrecognized
  ["", "sim"],
  [null, "sim"], // defensive: null never reaches the decision classes
];
for (const [id, want] of cases) {
  const got = classifyDecisionEvent({ decision_id: id });
  check(
    `classify ${JSON.stringify(id)}`,
    got === want,
    `got ${got}, want ${want}`,
  );
}

// ---------------------------------------------------------------------
console.log("\n== Part 1: the flood (12,000 sim vs 300 paper decisions) ==");
const floodPath = join(SCRATCH, "flood-history.json");
const flood = new EventHistoryStore(floodPath);
const paperIds = new Set<string>();
let paperCount = 0;
const addPaper = (): void => {
  paperCount += 1;
  const id = `snapback-${paperCount}`;
  paperIds.add(id);
  flood.append(ev("Snapback", id));
};
addPaper(); // the earliest paper decision — the one eviction used to kill first
const SIM_TOTAL = 12_000;
for (let i = 1; i <= SIM_TOTAL; i++) {
  flood.append(ev(i % 2 === 0 ? "Wesley" : "PolyCrypt9000", String(i)));
  if (i % 40 === 0 && paperCount < 300) addPaper();
  if (i === 6_000) {
    for (let r = 0; r < 20; r++) flood.append(ev("Snapback", null));
  }
}
const fc = flood.counts;
check(
  "flood counts",
  fc.protectedDecisions === 300 &&
    fc.simDecisions === SIM_DECISION_CAP &&
    fc.other === 20 &&
    fc.total === 300 + SIM_DECISION_CAP + 20,
  `protected=${fc.protectedDecisions} sim=${fc.simDecisions} other=${fc.other} total=${fc.total}`,
);
const snap = flood.snapshot();
const snapIds = new Set(
  snap.events.map((e) => e.decision_id).filter((x) => x !== null),
);
check(
  "all 300 paper decisions survive the flood",
  [...paperIds].every((id) => snapIds.has(id)),
  `${[...paperIds].filter((id) => snapIds.has(id)).length}/300 present`,
);
const firstPaper = snap.events.find((e) => e.decision_id === "snapback-1");
check(
  "the earliest paper decision (seq 1) is still retained",
  firstPaper !== undefined && firstPaper.seq === 1,
  firstPaper ? `seq ${firstPaper.seq}` : "MISSING",
);
const retainedSimIds = new Set(
  snap.events
    .map((e) => e.decision_id)
    .filter((x): x is string => x !== null && /^\d+$/.test(x)),
);
const expectedSimIds = new Set(
  Array.from({ length: SIM_DECISION_CAP }, (_, k) =>
    String(SIM_TOTAL - SIM_DECISION_CAP + 1 + k),
  ),
);
check(
  "sim ring holds exactly the most recent 1,000 sim decisions",
  retainedSimIds.size === SIM_DECISION_CAP &&
    [...expectedSimIds].every((id) => retainedSimIds.has(id)),
  `retained ${retainedSimIds.size}, expected seq-ids ${SIM_TOTAL - SIM_DECISION_CAP + 1}..${SIM_TOTAL}`,
);
const seqs = snap.events.map((e) => e.seq);
check(
  "merged snapshot is newest-first with unique seqs",
  seqs.every((s, i) => i === 0 || s < seqs[i - 1]!) &&
    new Set(seqs).size === seqs.length,
  `${seqs.length} events, head seq ${seqs[0]}, tail seq ${seqs[seqs.length - 1]}`,
);
check(
  "latestSeq accounts for every append",
  flood.latestSeq() === SIM_TOTAL + 300 + 20,
  `latestSeq=${flood.latestSeq()}, expected ${SIM_TOTAL + 300 + 20}`,
);
flood.close();

// ---------------------------------------------------------------------
console.log("\n== Part 2: v1 → v2 boot migration ==");
const migPath = join(SCRATCH, "migration-history.json");
const fixtureDecisions: StoredEvent[] = [];
let fixturePaper = 0;
for (let s = 1; s <= 4_950; s++) {
  if (s % 33 === 0) {
    fixturePaper += 1;
    fixtureDecisions.push({ ...ev("Vega", `vega-${s}`), seq: s });
  } else {
    fixtureDecisions.push({
      ...ev(s % 2 === 0 ? "Wesley" : "PolyCrypt9000", String(s)),
      seq: s,
    });
  }
}
const fixtureRecent: StoredEvent[] = Array.from({ length: 50 }, (_, k) => ({
  ...ev("Snapback", null),
  seq: 4_951 + k,
}));
writeFileSync(
  migPath,
  JSON.stringify({
    version: 1,
    nextSeq: 5_001,
    decisions: fixtureDecisions,
    recent: fixtureRecent,
  }),
);
const mig = new EventHistoryStore(migPath);
const mc = mig.counts;
check(
  "migration re-buckets to the new caps with no protected loss",
  mc.protectedDecisions === 150 &&
    mc.simDecisions === SIM_DECISION_CAP &&
    mc.other === 50,
  `protected=${mc.protectedDecisions}/150 sim=${mc.simDecisions}/${SIM_DECISION_CAP} other=${mc.other}/50 (fixture paper=${fixturePaper})`,
);
check(
  "migration is reported (and logged at load)",
  mig.migrationReport !== null && mig.migrationReport.includes("re-bucketed"),
  mig.migrationReport ?? "no report",
);
check(
  "migration report carries the over-cap drop count",
  mig.migrationReport !== null &&
    mig.migrationReport.includes("3800 over-cap"),
  "4,800 sim stored − 1,000 kept = 3,800 dropped",
);
const migIds = new Set(
  mig.snapshot().events.map((e) => e.decision_id).filter((x) => x !== null),
);
check(
  "every migrated paper decision is retrievable",
  fixtureDecisions
    .filter((e) => e.decision_id !== null && e.decision_id.includes("-"))
    .every((e) => migIds.has(e.decision_id)),
  "150/150 vega-* ids present",
);
const continued = mig.append(ev("Snapback", "snapback-999"));
check(
  "seq continues from the v1 file (no reset, no collision)",
  continued.seq === 5_001 && mig.counts.protectedDecisions === 151,
  `appended seq=${continued.seq}, protected now ${mig.counts.protectedDecisions}`,
);
mig.close();
const onDisk = JSON.parse(readFileSync(migPath, "utf8")) as {
  version?: number;
  protected?: unknown[];
  sim?: unknown[];
  recent?: unknown[];
};
check(
  "the file on disk is now v2 with three buckets",
  onDisk.version === 2 &&
    Array.isArray(onDisk.protected) &&
    Array.isArray(onDisk.sim) &&
    Array.isArray(onDisk.recent) &&
    onDisk.protected.length === 151,
  `version=${onDisk.version} protected=${onDisk.protected?.length} sim=${onDisk.sim?.length} recent=${onDisk.recent?.length}`,
);

// ---------------------------------------------------------------------
console.log("\n== Part 3: restart on the migrated (v2) file ==");
const restarted = new EventHistoryStore(migPath);
const rc = restarted.counts;
check(
  "v2 load keeps classes, runs no second migration",
  restarted.migrationReport === null &&
    rc.protectedDecisions === 151 &&
    rc.simDecisions === SIM_DECISION_CAP &&
    rc.other === 50,
  `protected=${rc.protectedDecisions} sim=${rc.simDecisions} other=${rc.other}`,
);
const afterRestart = restarted.append(ev("Wesley", "777777"));
check(
  "seq stays monotonic across the restart",
  afterRestart.seq === 5_002,
  `appended seq=${afterRestart.seq}, expected 5002`,
);
restarted.close();

// ---------------------------------------------------------------------
console.log("\n== Part 4: class follows the producing runner, not the name ==");
const flipPath = join(SCRATCH, "flip-history.json");
if (existsSync(flipPath)) rmSync(flipPath);
const flip = new EventHistoryStore(flipPath);
flip.append(ev("Wesley", "4412")); // Wesley, simulator-minted id
flip.append(ev("Trendia", "90210")); // Trendia, simulator-minted id (fleet in sim mode)
flip.append(ev("Wesley", "wesley-1")); // Wesley, real-runner-minted id (his future paper runner)
const lc = flip.counts;
check(
  "sim-minted ids are sim class whatever the bot; runner-minted ids are protected whatever the bot",
  lc.simDecisions === 2 && lc.protectedDecisions === 1,
  `sim=${lc.simDecisions} (Wesley "4412", Trendia "90210") protected=${lc.protectedDecisions} (Wesley "wesley-1")`,
);
flip.close();

console.log(
  `\n${checks - failures}/${checks} checks passed` +
    (failures > 0 ? ` — ${failures} FAILURE(S)` : ""),
);
process.exit(failures > 0 ? 1 : 0);
