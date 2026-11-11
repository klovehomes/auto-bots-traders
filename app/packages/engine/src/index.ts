import {
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import {
  describeKeysStatus,
  getPaperKeys,
  loadBots,
  resolveBotsDir,
  type BotConfig,
  type FleetEvent,
} from "@fleet/shared";
import { checkAlpacaPaperConnection, createAlpacaClient } from "./alpaca.js";
import { createControlClient, type ControlClient } from "./control.js";
import { createKalshiClient } from "./kalshi.js";
import { createModeSupervisor, resolveBootMode } from "./mode.js";
import { createControlRouter, startPaperTrader } from "./paper.js";
import { startPolyCryptTrader } from "./polycrypt.js";
import { startSimulator, type SimSpyProbe } from "./sim.js";
import { startSnapbackTrader } from "./snapback.js";
import { startVegaTrader } from "./vega.js";
import { startWeatherService } from "./weather.js";
import { startWesleyTrader } from "./wesley.js";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
/**
 * The dashboard mode switch's stored choice (Phase 5), written by the
 * API on the shared data volume. Read at boot: stored beats MODE env.
 */
const MODE_STATE_PATH =
  process.env.MODE_STATE_PATH ?? "data/mode-state.json";
const EVENT_INTERVAL_MS = 5000;
const FIRST_EVENT_DELAY_MS = 1000;
/**
 * Reset All Data (v22): where the coordinator persists its per-reset
 * progress (which reset id it owns, whether the DATA_RESET audit
 * event has been emitted). On the shared data volume in Docker, like
 * every other fleet state file — a restart mid-reset reads it back
 * and finishes the job instead of double-applying or double-emitting.
 */
const RESET_PROGRESS_PATH =
  process.env.RESET_PROGRESS_PATH ?? "data/reset-progress.json";
/**
 * The five paper runners' state files (same env names and defaults
 * the runners themselves use). The coordinator deletes them when a
 * reset starts: in paper mode each runner rewrites its own file
 * fresh when it applies the reset, and in sim/connected mode the
 * deletion stops a stale paper book from resurrecting if the fleet
 * later boots in paper mode.
 */
const PAPER_STATE_PATHS: readonly string[] = [
  process.env.PAPER_STATE_PATH ?? "data/paper-trendia-state.json",
  process.env.SNAPBACK_STATE_PATH ?? "data/paper-snapback-state.json",
  process.env.VEGA_STATE_PATH ?? "data/paper-vega-state.json",
  process.env.WESLEY_STATE_PATH ?? "data/paper-wesley-state.json",
  process.env.POLYCRYPT_STATE_PATH ?? "data/paper-polycrypt-state.json",
];

/**
 * Runner registry — as of Phase 12 (v21) every bot has a real paper
 * runner: Trendia (Phase 1, daily bars), Vega (Phase 3, options; he
 * starts in shadow mode per the Phase 3 scope, see vega.ts), Snapback
 * (Phase 4, hourly mean reversion), Wesley (Phase 12, income wheel on
 * Alpaca paper) and PolyCrypt9000 (Phase 12, Alpaca paper crypto +
 * Kalshi demo; her Polymarket sleeve stays shadow — no paper venue
 * exists for it).
 */
const TRENDIA_CODENAME = "trendia";
const VEGA_CODENAME = "vega";
const SNAPBACK_CODENAME = "snapback";
const WESLEY_CODENAME = "wesley";
const POLYCRYPT_CODENAME = "polycrypt9000";
const PAPER_RUNNER_CODENAMES: readonly string[] = [
  TRENDIA_CODENAME,
  VEGA_CODENAME,
  SNAPBACK_CODENAME,
  WESLEY_CODENAME,
  POLYCRYPT_CODENAME,
];

/** Publish one event to the API service, which fans it out over WebSocket. */
async function postEvent(event: FleetEvent): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/internal/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": INTERNAL_EVENT_TOKEN,
      },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      console.warn(`[engine] event POST failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(
      "[engine] event POST failed (is the API running?):",
      err instanceof Error ? err.message : err,
    );
  }
}

async function main(): Promise<void> {
  const botsDir = resolveBotsDir();
  const bots: BotConfig[] = loadBots(botsDir);

  console.log(`[engine] loaded ${bots.length} bots from ${botsDir}:`);
  for (const bot of bots) {
    console.log(
      `  - ${bot.name} (${bot.codename}) — strategy=${bot.strategy} ` +
        `market=${bot.market} mode=${bot.mode} enabled=${bot.enabled}`,
    );
  }

  // Fleet run mode: sim | paper | connected. Resolution order
  // (Phase 5): the mode stored by the dashboard switch on the shared
  // data volume → the MODE env → "sim". The env is only the initial
  // default; once Keith flips the dashboard switch, the stored choice
  // wins on every later boot. The fleet MODE is the ceiling — a bot's
  // own mode can sit below it, never above it.
  const bootMode = resolveBootMode({
    storedPath: MODE_STATE_PATH,
    envRaw: process.env.MODE,
  });
  if (bootMode.warning) {
    console.warn(`[engine] ⚠ ${bootMode.warning}`);
  }
  const mode = bootMode.mode;
  console.log(`[engine] MODE=${mode} (source: ${bootMode.source})`);

  const rotation = bots.filter((b) => b.enabled);
  const active = rotation.length > 0 ? rotation : bots;

  // Market weather (v24): whichever simulator ends up running fills
  // this probe with its live SPY price; the weather service judges
  // the day from it when no Alpaca client exists. Started exactly
  // once per boot, by whichever branch knows its data source first.
  const simSpyProbe: SimSpyProbe = { current: null };
  let weatherStarted = false;
  const startWeather = (
    client: Parameters<typeof startWeatherService>[0]["client"],
  ): void => {
    if (weatherStarted) return;
    weatherStarted = true;
    startWeatherService({
      client,
      simSpy: simSpyProbe,
      apiBaseUrl: API_BASE_URL,
      token: INTERNAL_EVENT_TOKEN,
    });
  };

  // Mode supervisor (Phase 5): watches the control poll for the
  // dashboard switch's desired mode and restarts this process into a
  // changed mode (Docker's restart policy does the relaunch); also
  // reports the running mode back to the API for the dashboard.
  const modeSupervisor = createModeSupervisor({
    runningMode: mode,
    bootSource: bootMode.source,
    apiBaseUrl: API_BASE_URL,
    token: INTERNAL_EVENT_TOKEN,
    postEvent,
    exit: (code) => process.exit(code),
  });

  // Risk Gate control channel: poll the API-owned kill-switch state in
  // every mode. The simulator enforces halts against its own book; the
  // paper trader enforces them against real (paper) order flow.
  const control = createControlClient({
    apiBaseUrl: API_BASE_URL,
    token: INTERNAL_EVENT_TOKEN,
    onHaltChange: (codename, halted) => {
      console.log(
        `[engine] ⛔ control: ${codename} ${halted ? "HALTED (kill switch)" : "resumed"}` +
          (mode === "paper" && PAPER_RUNNER_CODENAMES.includes(codename)
            ? " — paper order flow is gated by this state"
            : ""),
      );
    },
    onControlState: (state) =>
      modeSupervisor.observeDesiredMode(state.desiredMode),
  });
  control.start();
  modeSupervisor.startReporting();

  // Reset All Data coordinator (v22): watches the control poll for a
  // pending reset, deletes the on-disk paper state files, waits until
  // every book-owning runner (or the simulator) has applied the wipe,
  // then posts the single DATA_RESET audit event and reports
  // completion to the API. Runs in every mode — in "connected" mode
  // there are no books to wipe, so it finalizes immediately (the
  // state-file deletion still applies). See startResetCoordinator.
  startResetCoordinator({
    control,
    expected: mode === "connected" ? [] : active.map((b) => b.codename),
  });

  if (mode === "sim") {
    // Local fake-data mode: no broker, no keys, no real market data.
    console.log("[engine] MODE=sim — synthetic market data, no broker connected.");
    startSimulator(active, postEvent, control, simSpyProbe);
    startWeather(null);
    return;
  }

  if (mode === "connected") {
    // GUARDRAIL: live trading is NOT implemented in this build. Connected
    // mode exists as config shape only — it runs the paper connection
    // check and the harmless test emitter, and can never place or
    // simulate a live order.
    console.log(
      "[engine] MODE=connected — live trading not enabled in this build; " +
        "running in paper-check behavior only",
    );
    await checkAlpacaPaperConnection();
    // Weather still reads the paper feed (display only, no orders).
    startWeather(createAlpacaClient());
    startTestEmitter(active);
    return;
  }

  // ---- MODE=paper (Phases 1 + 3 + 4 + 12) ------------------------------
  // All five bots have real paper runners (Phase 12 completed the
  // set): Trendia, Vega (shadow until VEGA_SHADOW=false) and Snapback
  // on the Alpaca paper account; Wesley's income wheel on Alpaca
  // paper; PolyCrypt9000 on Alpaca paper crypto + the Kalshi demo
  // venue, her Polymarket sleeve staying shadow by design. Keys come
  // from the shared key-file loader (~/traderbot-keys.txt by default).
  const vegaShadow =
    (process.env.VEGA_SHADOW ?? "true").trim().toLowerCase() !== "false";
  const keys = getPaperKeys();
  console.log(`[engine] paper keys — ${describeKeysStatus(keys.status)}`);
  console.log(
    "[engine] MODE=paper — Trendia, Snapback and Wesley trade the Alpaca paper account on real market data; " +
      `Vega runs his Phase 3 options pipeline (${vegaShadow ? "SHADOW mode — no orders" : "live paper orders"}); ` +
      "PolyCrypt9000 trades Alpaca paper crypto + Kalshi demo (Polymarket sleeve shadow)",
  );
  await checkAlpacaPaperConnection();

  const byCodename = (codename: string): BotConfig | undefined =>
    active.find((b) => b.codename === codename);
  const alpacaClient = createAlpacaClient();
  const kalshiClient = createKalshiClient();

  // Market weather (v24): real SPY through the paper client when one
  // exists. If there is no Alpaca client (Kalshi-only keys), the
  // simulator-fallback branch below starts the sim-sourced service.
  if (alpacaClient) startWeather(alpacaClient);

  /**
   * Paper was requested but this bot has no venue: leave ONE clear
   * NO-TRADE decision in its record saying exactly why, per Phase 12 —
   * silence in the Decisions tab reads as a bug, not a missing key.
   */
  const notePaperUnavailable = (bot: BotConfig, why: string): void => {
    void postEvent({
      bot: bot.name,
      type: "signal",
      decision_id: null,
      symbol: null,
      side: null,
      qty: null,
      price: null,
      pnl: null,
      reason: `PAPER · NO TRADE — ${why} · This bot is running on the simulator until its paper venue is available.`,
      ts: new Date().toISOString(),
    });
  };

  if (alpacaClient || kalshiClient) {
    const router = createControlRouter(control);
    const running: string[] = [];
    const alpacaBots: [string, (bot: BotConfig) => void][] = [
      [
        TRENDIA_CODENAME,
        (bot) => startPaperTrader(bot, alpacaClient!, postEvent, router.forBots([TRENDIA_CODENAME])),
      ],
      [
        VEGA_CODENAME,
        (bot) => startVegaTrader(bot, alpacaClient!, postEvent, router.forBots([VEGA_CODENAME])),
      ],
      [
        SNAPBACK_CODENAME,
        (bot) => startSnapbackTrader(bot, alpacaClient!, postEvent, router.forBots([SNAPBACK_CODENAME])),
      ],
      [
        WESLEY_CODENAME,
        (bot) => startWesleyTrader(bot, alpacaClient!, postEvent, router.forBots([WESLEY_CODENAME])),
      ],
    ];
    for (const [codename, start] of alpacaBots) {
      const bot = byCodename(codename);
      if (!bot) continue;
      if (alpacaClient) {
        start(bot);
        running.push(codename);
      } else {
        notePaperUnavailable(
          bot,
          "Alpaca paper keys not loaded (no ALPACA_API_KEY_ID/ALPACA_API_SECRET_KEY in the keys file or environment), so this bot cannot place paper orders.",
        );
      }
    }
    const polycrypt = byCodename(POLYCRYPT_CODENAME);
    if (polycrypt) {
      // She starts with whichever venues exist; a missing venue
      // surfaces inside her runner as sleeve-level NO-TRADE records.
      startPolyCryptTrader(
        polycrypt,
        { alpaca: alpacaClient, kalshi: kalshiClient },
        postEvent,
        router.forBots([POLYCRYPT_CODENAME]),
      );
      running.push(POLYCRYPT_CODENAME);
    }
    const others = active.filter((b) => !running.includes(b.codename));
    if (others.length > 0) {
      startSimulator(others, postEvent, router.forOthers(running), simSpyProbe);
      // Kalshi-only keys: no Alpaca client, so the dome's weather
      // comes from the simulator's SPY walk (v24).
      if (!alpacaClient) startWeather(null);
    }
  } else {
    // No keys at all: never fabricate a broker connection. Every bot
    // gets its NO-TRADE record, then the full simulator runs so the
    // dashboard still works — exactly the pre-v21 fallback, now with
    // the reason on the record.
    console.warn(
      "[engine] MODE=paper but no paper keys are loaded (keys file or environment) — " +
        "NO bot can trade paper. Running the simulator for every bot instead.",
    );
    for (const bot of active) {
      notePaperUnavailable(
        bot,
        "paper keys not loaded — no Alpaca paper keys and no Kalshi demo keys were found in the keys file or environment.",
      );
    }
    startSimulator(active, postEvent, control, simSpyProbe);
    startWeather(null);
  }
}

/**
 * Reset All Data coordinator (v22).
 *
 * The API owns the reset request (a durable pending flag in the
 * control state, set when the user confirms in the dashboard); this
 * coordinator is the engine half of the handshake:
 *
 * 1. On first sight of a new pending reset id: delete the five paper
 *    state files from disk (see PAPER_STATE_PATHS above) and record
 *    ownership in the progress marker. Runners rewrite their files
 *    fresh when they apply; the marker makes a mid-reset engine
 *    restart resume ownership instead of re-deleting files a runner
 *    has already rewritten.
 * 2. Each book owner — a paper runner's tick, or the simulator —
 *    applies the wipe itself (fresh boot state, own orders cancelled)
 *    and notes application on the control client. A runner applies a
 *    given id at most once (its own lastResetId guard), and the sim
 *    likewise, so application is idempotent end to end.
 * 3. Once every expected codename has noted application, post the
 *    ONE audit event (type "data_reset", bot "system", decision_id
 *    null) — the API's history was cleared when the reset was
 *    accepted, so this becomes seq 1, the sole first entry of the
 *    fresh history — then report completion. The marker records
 *    eventEmitted BEFORE the report attempt, so a crash between the
 *    two can never double-emit; the report itself retries on later
 *    ticks until the API accepts it (its pending flag persists until
 *    then, so nothing is lost).
 *
 * Broker caveat: nothing here closes positions at Alpaca or Kalshi.
 * The wipe is app data only; open broker paper positions become
 * untracked ("foreign") and are ignored by state-only reconcile.
 */
function startResetCoordinator(deps: {
  control: ControlClient;
  /** Codenames whose book owners must apply the reset (empty in
   *  connected mode — no books exist there). */
  expected: readonly string[];
}): void {
  let handledId: string | null = null;
  let eventEmitted = false;
  try {
    const raw = JSON.parse(readFileSync(RESET_PROGRESS_PATH, "utf8")) as {
      id?: unknown;
      eventEmitted?: unknown;
    };
    if (typeof raw.id === "string") {
      handledId = raw.id;
      eventEmitted = raw.eventEmitted === true;
    }
  } catch {
    // No marker yet (first boot, or an unreadable file): start clean.
  }

  const persistMarker = (): void => {
    try {
      mkdirSync(dirname(RESET_PROGRESS_PATH), { recursive: true });
      const tmp = `${RESET_PROGRESS_PATH}.tmp`;
      writeFileSync(tmp, JSON.stringify({ id: handledId, eventEmitted }));
      renameSync(tmp, RESET_PROGRESS_PATH);
    } catch (err) {
      console.warn(
        "[engine] could not persist the reset progress marker:",
        err instanceof Error ? err.message : err,
      );
    }
  };

  const tick = async (): Promise<void> => {
    const pending = deps.control.pendingReset();
    if (!pending) return;

    if (pending.id !== handledId) {
      handledId = pending.id;
      eventEmitted = false;
      persistMarker();
      for (const p of PAPER_STATE_PATHS) {
        try {
          unlinkSync(p);
          console.log(`[engine] DATA RESET ${pending.id}: removed paper state file ${p}`);
        } catch {
          // Absent is the common case — nothing to remove.
        }
      }
      console.log(
        `[engine] DATA RESET ${pending.id}: in progress — waiting for ${deps.expected.length} book(s) to apply the wipe`,
      );
    }

    const applied = new Set(deps.control.resetAppliedBy(pending.id));
    if (!deps.expected.every((c) => applied.has(c))) return;

    if (!eventEmitted) {
      await postEvent({
        bot: "system",
        type: "data_reset",
        decision_id: null,
        symbol: null,
        side: null,
        qty: null,
        price: null,
        pnl: null,
        reason:
          "DATA_RESET · Reset All Data executed — trade history wiped; every book restored to its $10,000 initial allocation; per-bot state reinitialized. Broker-side paper positions were NOT closed and are now untracked. The team stays halted until resumed.",
        ts: new Date().toISOString(),
      });
      eventEmitted = true;
      persistMarker();
    }

    if (await deps.control.reportReset(pending.id)) {
      console.log(
        `[engine] DATA RESET ${pending.id}: complete — books wiped, team remains HALTED until resumed`,
      );
    }
  };

  setInterval(() => void tick(), 1000);
  void tick();
}

/** Phase 0 test emitter, retained for MODE=connected guardrail runs. */
function startTestEmitter(active: BotConfig[]): void {
  let index = 0;
  const emitTestEvent = (): void => {
    const bot = active[index % active.length];
    index += 1;
    if (!bot) return;
    const event: FleetEvent = {
      bot: bot.name,
      type: "signal",
      decision_id: null,
      symbol: null,
      side: null,
      qty: null,
      price: null,
      pnl: null,
      reason: "phase0 test event",
      ts: new Date().toISOString(),
    };
    void postEvent(event);
  };
  setTimeout(emitTestEvent, FIRST_EVENT_DELAY_MS);
  setInterval(emitTestEvent, EVENT_INTERVAL_MS);
  console.log(
    `[engine] phase 0 scaffold running — emitting a test event every ${EVENT_INTERVAL_MS / 1000}s`,
  );
}

main().catch((err: unknown) => {
  console.error("[engine] fatal:", err);
  process.exit(1);
});
