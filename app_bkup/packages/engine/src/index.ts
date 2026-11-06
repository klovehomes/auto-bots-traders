import {
  loadBots,
  parseFleetMode,
  resolveBotsDir,
  type BotConfig,
  type FleetEvent,
} from "@fleet/shared";
import { checkAlpacaPaperConnection, createAlpacaClient } from "./alpaca.js";
import { createControlClient } from "./control.js";
import { createControlRouter, startPaperTrader } from "./paper.js";
import { startSimulator } from "./sim.js";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
const EVENT_INTERVAL_MS = 5000;
const FIRST_EVENT_DELAY_MS = 1000;

/** The one bot with a real strategy plugin in Phase 1. */
const PAPER_BOT_CODENAME = "trendia";

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

  // Fleet run mode (MODE env): sim | paper | connected. The fleet MODE
  // is the ceiling — a bot's own mode can sit below it, never above it.
  const rawMode = process.env.MODE;
  const mode = parseFleetMode(rawMode);
  if (rawMode && rawMode.trim().toLowerCase() !== mode) {
    console.warn(
      `[engine] unrecognized MODE="${rawMode}" — falling back to "sim"`,
    );
  }

  const rotation = bots.filter((b) => b.enabled);
  const active = rotation.length > 0 ? rotation : bots;

  // Risk Gate control channel: poll the API-owned kill-switch state in
  // every mode. The simulator enforces halts against its own book; the
  // paper trader enforces them against real (paper) order flow.
  const control = createControlClient({
    apiBaseUrl: API_BASE_URL,
    token: INTERNAL_EVENT_TOKEN,
    onHaltChange: (codename, halted) => {
      console.log(
        `[engine] ⛔ control: ${codename} ${halted ? "HALTED (kill switch)" : "resumed"}` +
          (mode === "paper" && codename === PAPER_BOT_CODENAME
            ? " — paper order flow is gated by this state"
            : ""),
      );
    },
  });
  control.start();

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

  // ---- MODE=paper (Phase 1) -------------------------------------------
  // Trendia runs on the real Alpaca paper account (real market data,
  // simulated money) via the Phase 1 runner. The other bots have no
  // strategy plugin yet (Phase 3), so they keep running the simulator —
  // clearly labelled SIM in their reason strings — until their turn.
  console.log(
    "[engine] MODE=paper — Trendia trades the Alpaca paper account on real market data; " +
      "the rest of the team stays on the simulator until Phase 3",
  );
  await checkAlpacaPaperConnection();

  const trendia = active.find((b) => b.codename === PAPER_BOT_CODENAME);
  const others = active.filter((b) => b.codename !== PAPER_BOT_CODENAME);
  const client = createAlpacaClient();

  if (trendia && client) {
    const router = createControlRouter(control);
    startPaperTrader(trendia, client, postEvent, router.forBot(PAPER_BOT_CODENAME));
    if (others.length > 0) {
      startSimulator(others, postEvent, router.forOthers(PAPER_BOT_CODENAME));
    }
  } else {
    // No keys (or no Trendia): never fabricate a broker connection.
    // Fall back to the full simulator so the dashboard still runs, and
    // say so loudly in the log.
    console.warn(
      "[engine] MODE=paper but " +
        (!client
          ? "Alpaca keys are not configured — Trendia CANNOT trade paper. Running the simulator for every bot instead."
          : "Trendia is not among the enabled bots — running the simulator for every bot."),
    );
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
