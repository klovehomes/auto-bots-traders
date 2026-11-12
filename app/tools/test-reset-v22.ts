/**
 * v22 Reset All Data — verification harness.
 *
 * Leg 1 (SIM, real API + engine processes):
 *   seed live simulator activity (opens, closes with PnL, open
 *   positions, non-initial books) → fleet kill → drain → POST
 *   /control/fleet/reset through the real API (with a second reset
 *   fired concurrently — it must no-op) → assert: the API history
 *   holds ONLY the DATA_RESET audit event (seq 1, bot "system"); the
 *   on-disk history file matches; control state shows the team halted
 *   with no pending reset; the coordinator deleted a stale paper
 *   state file; a bot-scoped reset route 404s → resume → trading
 *   restarts from clean books (each bot's first post-reset close
 *   shows sim equity == $10,000 + that close's PnL).
 *
 * Leg 2 (PAPER runners, in-process):
 *   Trendia + Snapback runners against fake brokers with pre-dirtied
 *   state files (realized PnL ≠ 0, open entries). Flip a pending
 *   reset through the PaperControl seam → both runners cancel, swap
 *   in fresh state (startCapital $10,000, realized 0, no entries),
 *   persist it, and note application exactly once; re-offering the
 *   SAME id changes nothing; a NEW id applies again.
 *
 *     node_modules/.bin/tsx tools/test-reset-v22.ts        (from app/)
 *
 * Scratch under ~/workspace/trading-bots/scratch-v22/ (not /tmp).
 */
import { spawn, type ChildProcess } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { BotConfig, FleetEvent } from "@fleet/shared";
import type {
  AlpacaClientLike,
  AlpacaOrder,
  AlpacaPosition,
} from "../packages/engine/src/alpaca.js";
import type { PaperControl } from "../packages/engine/src/paper.js";
import type { PendingReset } from "../packages/engine/src/control.js";

// Trendia's runner reads its tick + state path from env at
// module/start time — set them BEFORE the dynamic imports below.
const APP = join(import.meta.dirname, "..");
const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v22");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });
const LEG2 = join(SCRATCH, "leg2");
mkdirSync(LEG2, { recursive: true });
process.env.PAPER_TICK_MS = "40";
process.env.PAPER_STATE_PATH = join(LEG2, "paper-trendia-state.json");

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));
async function waitFor(
  what: string,
  cond: () => Promise<boolean> | boolean,
  timeoutMs = 30000,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await cond()) return true;
    await sleep(400);
  }
  console.log(`  (timeout waiting for: ${what})`);
  return false;
}

// =====================================================================
// LEG 1 — SIM end-to-end through the real API
// =====================================================================
const PORT = 18098;
const BASE = `http://127.0.0.1:${PORT}`;
const L1 = join(SCRATCH, "leg1");
mkdirSync(L1, { recursive: true });
const stalePaperState = join(L1, "paper-trendia-state.json");
writeFileSync(
  stalePaperState,
  JSON.stringify({ startCapital: 10000, realizedTotal: -999, entries: { SPY: {} } }),
);

const children: ChildProcess[] = [];
function run(
  args: string[],
  env: NodeJS.ProcessEnv,
  cwd: string,
): { proc: ChildProcess; log: () => string } {
  let buf = "";
  const proc = spawn(join(APP, "node_modules/.bin/tsx"), args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout?.on("data", (d: Buffer) => {
    buf += d.toString();
  });
  proc.stderr?.on("data", (d: Buffer) => {
    buf += d.toString();
  });
  children.push(proc);
  return { proc, log: () => buf };
}
function kill(proc: ChildProcess): void {
  try {
    proc.kill("SIGTERM");
  } catch {
    /* already gone */
  }
}

interface HistEvent {
  bot: string;
  type: string;
  seq: number;
  pnl: number | null;
  reason: string;
  decision_id: string | null;
}
const getHistory = async (): Promise<{ events: HistEvent[] }> =>
  (await (await fetch(`${BASE}/events/history`)).json()) as {
    events: HistEvent[];
  };
interface ControlView {
  allHalted: boolean;
  pendingReset: boolean;
  audit: { action: string; reset?: { status: string } }[];
}
const getControl = async (): Promise<ControlView> =>
  (await (await fetch(`${BASE}/control`)).json()) as ControlView;
const post = async (path: string): Promise<{ status: number; body: never }> => {
  const res = await fetch(`${BASE}${path}`, { method: "POST" });
  return { status: res.status, body: (await res.json()) as never };
};

const api = run(
  [join(APP, "packages/api/src/index.ts")],
  {
    API_PORT: String(PORT),
    CONTROL_STATE_PATH: join(L1, "control-state.json"),
    MODE_STATE_PATH: join(L1, "mode-state.json"),
    EVENT_HISTORY_PATH: join(L1, "event-history.json"),
  },
  APP,
);
const apiUp = await waitFor("API health", async () => {
  try {
    return (await fetch(`${BASE}/health`)).ok;
  } catch {
    return false;
  }
});
check("L1: API boots", apiUp);

if (apiUp) {
  const engine = run(
    [join(APP, "packages/engine/src/index.ts")],
    {
      MODE: "sim",
      API_BASE_URL: BASE,
      MODE_STATE_PATH: join(L1, "mode-state.json"),
      PAPER_STATE_PATH: stalePaperState,
      RESET_PROGRESS_PATH: join(L1, "reset-progress.json"),
    },
    L1,
  );

  // Seed: real trading activity — opens AND closes, at least one bot
  // holding an open position, at least one non-zero realized PnL.
  // PM8: the ≥30-event threshold was written for five bots streaming
  // at once; this branch loads PolyCrypt9000 only, so the threshold
  // scales to ≥10 events for the single bot (observed ~15 in the
  // window on this branch — the margin is real, not a fudge).
  const seeded = await waitFor(
    "seeded sim activity",
    async () => {
      const h = await getHistory();
      const opens = h.events.filter((e) => e.type === "open").length;
      const closes = h.events.filter((e) => e.type === "close");
      return (
        h.events.length >= 10 &&
        opens > closes.length &&
        closes.some((e) => e.pnl !== null && e.pnl !== 0)
      );
    },
    90000,
  );
  const seedHist = await getHistory();
  const seedOpens = seedHist.events.filter((e) => e.type === "open").length;
  const seedCloses = seedHist.events.filter((e) => e.type === "close").length;
  check(
    "L1: seeded activity (events ≥ 10, opens > closes ⇒ a position is open, a close carries PnL)",
    seeded,
    `${seedHist.events.length} events, ${seedOpens} opens, ${seedCloses} closes`,
  );

  // Kill first (the documented operator flow), let in-flight sim
  // actions drain, then reset.
  await post("/control/fleet/kill");
  await sleep(1500);
  const countBefore = (await getHistory()).events.length;

  // Fire two resets concurrently: exactly one may take effect.
  const [r1, r2] = await Promise.all([
    post("/control/fleet/reset"),
    post("/control/fleet/reset"),
  ]);
  const bodies = [r1.body, r2.body] as {
    entry?: { action?: string } | null;
    noop?: boolean;
  }[];
  const withEntry = bodies.filter((b) => b.entry?.action === "reset");
  const noops = bodies.filter((b) => b.noop === true);
  check(
    "L1: concurrent double reset — exactly one takes effect, the other no-ops",
    withEntry.length === 1 && noops.length === 1,
    `entries=${withEntry.length} noops=${noops.length}`,
  );

  const completed = await waitFor(
    "reset completion",
    async () => {
      const c = await getControl();
      return !c.pendingReset && c.audit[0]?.reset?.status === "complete";
    },
    45000,
  );
  check("L1: reset completes (pendingReset clears, audit entry complete)", completed);

  const ctl = await getControl();
  check("L1: team is HALTED after the reset", ctl.allHalted === true);

  const hist = await getHistory();
  check(
    "L1: history holds exactly ONE event after the reset",
    hist.events.length === 1,
    `got ${hist.events.length} (had ${countBefore} before)`,
  );
  const only = hist.events[0];
  check(
    "L1: the sole entry is the DATA_RESET audit event at seq 1",
    only?.type === "data_reset" && only?.bot === "system" && only?.seq === 1,
    only ? `type=${only.type} bot=${only.bot} seq=${only.seq}` : "none",
  );

  const diskHist = JSON.parse(
    readFileSync(join(L1, "event-history.json"), "utf8"),
  ) as {
    nextSeq: number;
    protected: unknown[];
    sim: unknown[];
    recent: { type: string }[];
  };
  check(
    "L1: on-disk history file holds only the audit event, nextSeq = 2",
    diskHist.protected.length === 0 &&
      diskHist.sim.length === 0 &&
      diskHist.recent.length === 1 &&
      diskHist.recent[0]?.type === "data_reset" &&
      diskHist.nextSeq === 2,
  );

  const diskCtl = JSON.parse(
    readFileSync(join(L1, "control-state.json"), "utf8"),
  ) as {
    bots: Record<string, { halted: boolean }>;
    pendingReset: unknown;
  };
  check(
    "L1: on-disk control state — all halted, no pending reset",
    Object.values(diskCtl.bots).every((b) => b.halted) &&
      diskCtl.pendingReset === null,
  );

  check(
    "L1: coordinator deleted the stale paper state file",
    !existsSync(stalePaperState),
  );
  check(
    "L1: reset progress marker recorded the completed reset",
    existsSync(join(L1, "reset-progress.json")),
  );

  const botReset = await post("/control/bots/trendia/reset");
  check(
    "L1: bot-scoped reset route is refused (404)",
    botReset.status === 404,
    `got ${botReset.status}`,
  );

  // Resume → trading restarts from clean books.
  await post("/control/fleet/resume");
  const resumed = await waitFor(
    "post-resume trading",
    async () => (await getHistory()).events.length >= 6,
    45000,
  );
  check("L1: resume works and trading resumes", resumed);
  const ctlAfter = await getControl();
  check("L1: team no longer halted after resume", ctlAfter.allHalted === false);

  // First close per bot after the reset must show equity == 10000+pnl.
  await waitFor(
    "first post-reset closes",
    async () => {
      const h = await getHistory();
      return h.events.some((e) => e.type === "close");
    },
    60000,
  );
  const after = await getHistory();
  const firstCloseByBot = new Map<string, HistEvent>();
  for (const e of [...after.events].reverse()) {
    if (e.type === "close" && !firstCloseByBot.has(e.bot)) {
      firstCloseByBot.set(e.bot, e);
    }
  }
  let equityChecks = 0;
  let equityOk = true;
  for (const [bot, e] of firstCloseByBot) {
    const m = /sim equity \$([0-9,]+\.\d{2})/.exec(e.reason);
    if (!m || e.pnl === null) continue;
    const shown = Number(m[1]!.replace(/,/g, ""));
    equityChecks += 1;
    if (Math.abs(shown - (10000 + e.pnl)) > 0.51) {
      equityOk = false;
      console.log(
        `  equity mismatch for ${bot}: reason shows ${shown}, expected ${10000 + e.pnl}`,
      );
    }
  }
  check(
    "L1: first post-reset close per bot shows sim equity == $10,000 + pnl (clean books)",
    equityChecks >= 1 && equityOk,
    `${equityChecks} bot(s) verified`,
  );
  check(
    "L1: DATA_RESET (seq 1) precedes every post-reset event",
    after.events.every((e) => e.type === "data_reset" || e.seq > 1),
  );

  kill(engine.proc);
}

// =====================================================================
// LEG 2 — PAPER runners in-process (Trendia + Snapback)
// =====================================================================
class FakeBroker implements AlpacaClientLike {
  positions: AlpacaPosition[] = [];
  latestPrices = new Map<string, number>();
  cancelledIds: string[] = [];
  private orders = new Map<string, AlpacaOrder>();
  async getAccount() {
    return { status: "ACTIVE", equity: 50000, cash: 50000 };
  }
  async getClock() {
    return {
      isOpen: true,
      timestamp: new Date().toISOString(),
      nextOpen: "",
      nextClose: "",
    };
  }
  async getPositions() {
    return this.positions.map((p) => ({ ...p }));
  }
  async getOpenOrders() {
    return [...this.orders.values()].filter((o) => o.status === "new");
  }
  async getOrder(id: string) {
    const o = this.orders.get(id);
    if (!o) throw new Error(`order ${id} not found`);
    return { ...o };
  }
  async createOrder(o: {
    symbol: string;
    qty: number;
    side: "buy" | "sell";
    type: "market" | "limit";
    timeInForce: "day" | "opg";
    limitPrice?: number;
  }) {
    const ord: AlpacaOrder = {
      id: `ord-${this.orders.size + 1}`,
      symbol: o.symbol,
      side: o.side,
      qty: o.qty,
      filledQty: 0,
      filledAvgPrice: null,
      status: "new",
      type: o.type,
      timeInForce: o.timeInForce,
    };
    this.orders.set(ord.id, ord);
    return { ...ord };
  }
  async cancelOrder(id: string) {
    this.cancelledIds.push(id);
    const o = this.orders.get(id);
    if (o) o.status = "canceled";
  }
  async closePosition(symbol: string) {
    const pos = this.positions.find((p) => p.symbol === symbol);
    const ord: AlpacaOrder = {
      id: `ord-close-${symbol}`,
      symbol,
      side: "sell",
      qty: pos?.qty ?? 0,
      filledQty: pos?.qty ?? 0,
      filledAvgPrice: pos?.currentPrice ?? 0,
      status: "filled",
      type: "market",
      timeInForce: "day",
    };
    return ord;
  }
  async getDailyBars() {
    return [];
  }
  async getHourlyBars() {
    return [];
  }
  async getLatestPrice(symbol: string) {
    return this.latestPrices.get(symbol) ?? 100;
  }
  async getOptionContracts() {
    return [];
  }
  async getOptionSnapshots() {
    return new Map();
  }
}

class ResetControl implements PaperControl {
  reset: PendingReset | null = null;
  notes: { id: string; codename: string }[] = [];
  isHalted = (): boolean => false;
  drainLiquidations = (): never[] => [];
  reportLiquidation = async (): Promise<void> => {};
  pendingReset = (): PendingReset | null => this.reset;
  noteResetApplied = (id: string, codename: string): void => {
    this.notes.push({ id, codename });
  };
}

const trendiaBot: BotConfig = {
  name: "Trendia",
  codename: "trendia",
  enabled: true,
  mode: "paper",
  market: "us_stocks",
  broker: "alpaca",
  strategy: "momentum",
  viz: { color: "#f59e0b", form: "avatar_disc", avatar_accessory: "none" },
  universe: ["SPY", "QQQ", "AAPL"],
  rules: {},
  risk: {
    max_position_pct: 20,
    max_positions: 5,
    stop_loss_pct: 7,
    max_daily_loss_pct: 1.5,
  },
  philosophy: "",
  sourcePath: "bots/trendia.md",
  raw: {},
};
const snapbackBot: BotConfig = {
  name: "Snapback",
  codename: "snapback",
  enabled: true,
  mode: "paper",
  market: "us_stocks",
  broker: "alpaca",
  strategy: "mean_reversion",
  viz: { color: "#38bdf8", form: "avatar_disc", avatar_accessory: "cap" },
  universe: ["SPY", "QQQ"],
  rules: {},
  risk: {
    max_position_pct: 20,
    max_positions: 6,
    stop_loss_pct: 5,
    max_daily_loss_pct: 1.5,
  },
  philosophy: "",
  sourcePath: "bots/snapback.md",
  raw: {},
};

const { startPaperTrader } = await import("../packages/engine/src/paper.js");
const { startSnapbackTrader } = await import(
  "../packages/engine/src/snapback.js"
);

const trendiaStatePath = join(LEG2, "paper-trendia-state.json");
const snapbackStatePath = join(LEG2, "paper-snapback-state.json");
writeFileSync(
  trendiaStatePath,
  JSON.stringify({
    startCapital: 10000,
    realizedTotal: -250.25,
    realizedByDay: { "2026-11-04": -250.25 },
    entries: {
      SPY: { qty: 3, entryPrice: 100, peak: 101, decisionId: "trendia-7" },
    },
    pendingEntries: [],
    pendingExits: [],
    lastEvalDate: "2026-11-04",
    decisionCounter: 7,
  }),
);
writeFileSync(
  snapbackStatePath,
  JSON.stringify({
    startCapital: 10000,
    realizedTotal: 123.45,
    realizedByDay: { "2026-11-04": 123.45 },
    entries: {
      SPY: {
        qty: 2,
        entryPrice: 700,
        entryDate: "2026-11-04",
        decisionId: "snapback-3",
        entryMean: 710,
        entryBelowMean: true,
      },
    },
    pendingEntries: [],
    pendingExits: [],
    lastExitBySymbol: {},
    lastEvalHour: "2026-11-04T10",
    decisionCounter: 3,
  }),
);

const control2 = new ResetControl();
const trendiaBroker = new FakeBroker();
trendiaBroker.positions = [
  { symbol: "SPY", qty: 3, avgEntryPrice: 100, currentPrice: 100, marketValue: 300 },
];
trendiaBroker.latestPrices.set("SPY", 100);
const snapbackBroker = new FakeBroker();
snapbackBroker.positions = [
  { symbol: "SPY", qty: 2, avgEntryPrice: 700, currentPrice: 700, marketValue: 1400 },
];
snapbackBroker.latestPrices.set("SPY", 700);
const post2 = async (_e: FleetEvent): Promise<void> => {};

startPaperTrader(trendiaBot, trendiaBroker, post2, control2);
startSnapbackTrader(snapbackBot, snapbackBroker, post2, control2, {
  statePath: snapbackStatePath,
  tickMs: 25,
});
await sleep(400);

const readState = (p: string): Record<string, unknown> =>
  JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
const isFresh = (p: string): boolean => {
  try {
    const s = readState(p);
    return (
      s.startCapital === 10000 &&
      s.realizedTotal === 0 &&
      Object.keys(s.entries as object).length === 0 &&
      s.decisionCounter === 0
    );
  } catch {
    return false;
  }
};
check(
  "L2: books are dirty before the reset (sanity)",
  !isFresh(trendiaStatePath) && !isFresh(snapbackStatePath),
);

control2.reset = {
  id: "reset-leg2-1",
  auditId: "audit-leg2-1",
  requestedAt: new Date().toISOString(),
};
const applied = await waitFor(
  "both paper runners apply the reset",
  () => isFresh(trendiaStatePath) && isFresh(snapbackStatePath),
  15000,
);
check("L2: Trendia + Snapback state files are fresh after the reset", applied);
check(
  "L2: each runner noted application exactly once",
  control2.notes.filter((n) => n.codename === "trendia").length === 1 &&
    control2.notes.filter((n) => n.codename === "snapback").length === 1,
  JSON.stringify(control2.notes),
);

const bytesT = readFileSync(trendiaStatePath, "utf8");
const bytesS = readFileSync(snapbackStatePath, "utf8");
await sleep(500);
check(
  "L2: re-offering the SAME reset id is a no-op (files unchanged, no new notes)",
  readFileSync(trendiaStatePath, "utf8") === bytesT &&
    readFileSync(snapbackStatePath, "utf8") === bytesS &&
    control2.notes.length === 2,
);

// A NEW id must apply again (per-id idempotency, not a one-shot latch).
writeFileSync(
  snapbackStatePath,
  JSON.stringify({ ...readState(snapbackStatePath), realizedTotal: 42 }),
);
control2.reset = {
  id: "reset-leg2-2",
  auditId: "audit-leg2-2",
  requestedAt: new Date().toISOString(),
};
const reapplied = await waitFor(
  "second reset id applies",
  () => isFresh(snapbackStatePath) && control2.notes.length === 4,
  15000,
);
check("L2: a second reset (new id) applies again", reapplied);

for (const c of children) kill(c);
await sleep(300);
for (const c of children) {
  try {
    c.kill("SIGKILL");
  } catch {
    /* already gone */
  }
}
console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
