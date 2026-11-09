import {
  loadBots,
  resolveBotsDir,
  type BotConfig,
  type FleetEvent,
} from "@fleet/shared";
import { checkAlpacaPaperConnection } from "./alpaca.js";
import { createControlClient } from "./control.js";
import { createModeSupervisor, resolveBootMode } from "./mode.js";
import { startSimulator } from "./sim.js";

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
 * Polymarket-only variant (branch pplymarket-only): the only bot is
 * PolyCrypt9000. It has no real/shadow runner yet — its Polymarket
 * shadow sleeve and its Alpaca crypto sleeve are not built yet, so
 * in every mode it runs on the simulator exactly as it did in the
 * original app, until its own runner phase lands.
 */

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

  // Run mode: sim | paper | connected. Resolution order
  // (Phase 5): the mode stored by the dashboard switch on the shared
  // data volume → the MODE env → "sim". The env is only the initial
  // default; once Keith flips the dashboard switch, the stored choice
  // wins on every later boot. The MODE is the ceiling — the bot's
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
  // every mode. The simulator enforces halts against its own book.
  const control = createControlClient({
    apiBaseUrl: API_BASE_URL,
    token: INTERNAL_EVENT_TOKEN,
    onHaltChange: (codename, halted) => {
      console.log(
        `[engine] ⛔ control: ${codename} ${halted ? "HALTED (kill switch)" : "resumed"}`,
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

  // ---- MODE=paper ------------------------------------------------------
  // PolyCrypt9000's Polymarket shadow runner and Alpaca crypto sleeve
  // are not built yet. Polymarket has no paper/testnet (real USDC on
  // Polygon only), so its Polymarket sleeve is shadow-by-design; the
  // crypto sleeve will trade BTC/ETH/SOL on the Alpaca paper account
  // once its runner lands. Until then, PolyCrypt9000 runs on the
  // simulator (labelled SIM in its reasons) exactly as it did before.
  console.log(
    "[engine] MODE=paper — PolyCrypt9000's Polymarket shadow runner and Alpaca crypto sleeve are not built yet, " +
      "so PolyCrypt9000 runs on the simulator (labelled SIM) until its runners land.",
  );
  await checkAlpacaPaperConnection();
  startSimulator(active, postEvent, control);
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
