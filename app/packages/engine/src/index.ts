import {
  describeKeysStatus,
  getPaperKeys,
  loadBots,
  resolveBotsDir,
  type BotConfig,
  type FleetEvent,
} from "@fleet/shared";
import { checkAlpacaPaperConnection, createAlpacaClient } from "./alpaca.js";
import { createControlClient } from "./control.js";
import { createKalshiClient } from "./kalshi.js";
import { createModeSupervisor, resolveBootMode } from "./mode.js";
import { createControlRouter, startPaperTrader } from "./paper.js";
import { startPolyCryptTrader } from "./polycrypt.js";
import { startSimulator } from "./sim.js";
import { startSnapbackTrader } from "./snapback.js";
import { startVegaTrader } from "./vega.js";
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

  if (mode === "sim") {
    // Local fake-data mode: no broker, no keys, no real market data.
    console.log("[engine] MODE=sim — synthetic market data, no broker connected.");
    startSimulator(active, postEvent, control);
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
      startSimulator(others, postEvent, router.forOthers(running));
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
    startSimulator(active, postEvent, control);
  }
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
