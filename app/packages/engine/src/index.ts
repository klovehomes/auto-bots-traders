import {
  loadBots,
  parseFleetMode,
  resolveBotsDir,
  type BotConfig,
  type FleetEvent,
} from "@fleet/shared";
import { checkAlpacaPaperConnection } from "./alpaca.js";
import { startSimulator } from "./sim.js";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
const EVENT_INTERVAL_MS = 5000;
const FIRST_EVENT_DELAY_MS = 1000;

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

  if (mode === "sim") {
    // Local fake-data mode: no broker, no keys, no real market data.
    // The bots "trade" against a seeded synthetic market (see sim.ts).
    console.log("[engine] MODE=sim — synthetic market data, no broker connected.");
  } else if (mode === "connected") {
    // GUARDRAIL: live trading is NOT implemented in this build. Connected
    // mode exists as config shape only — it runs the paper connection
    // check and the harmless Phase 0 signal emitter, and can never place
    // or simulate a live order.
    console.log(
      "[engine] MODE=connected — live trading not enabled in this build; " +
        "running in paper-check behavior only",
    );
    await checkAlpacaPaperConnection();
  } else {
    console.log(
      "[engine] MODE=paper — Alpaca paper account (Phase 0: connection check + test emitter)",
    );
    await checkAlpacaPaperConnection();
  }

  const rotation = bots.filter((b) => b.enabled);
  const active = rotation.length > 0 ? rotation : bots;

  if (mode === "sim") {
    startSimulator(active, postEvent);
    return;
  }

  // Phase 0 only: rotate synthetic test events across the enabled bots so
  // the whole pipeline (engine → API → WebSocket → landscape) is exercised.
  // Real strategy workers replace this in Phase 1+.
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
