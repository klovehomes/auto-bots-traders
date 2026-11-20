import type { BotConfig, FleetMode } from "@fleet/shared";

/**
 * Venue resolution (v37 — Schwab integration).
 *
 * This is the single gate every Schwab order path goes through: no
 * Schwab execution client is constructed, and no Schwab runner is
 * started, unless `resolveBotVenue` returns `ok: true` for that bot.
 * The Risk Gate (kill switch via the control router) is untouched
 * and still sits in front of the runners — venue approval decides
 * WHERE a bot may trade, the Risk Gate still decides WHETHER any
 * given order flow runs at all.
 *
 * Per-bot go-live is Keith's call, expressed through the bot file's
 * own fields: `broker` picks the venue and `mode` (capped by the
 * fleet MODE, which is the ceiling) decides whether a live venue
 * may serve the bot at all.
 */

export const MODE_RANK: Record<FleetMode, number> = {
  sim: 0,
  paper: 1,
  connected: 2,
};

const KNOWN_MODES: readonly FleetMode[] = ["sim", "paper", "connected"];

function parseBotMode(botMode: string): FleetMode {
  const normalized = botMode.trim().toLowerCase();
  return (KNOWN_MODES as readonly string[]).includes(normalized)
    ? (normalized as FleetMode)
    : "sim";
}

/**
 * The mode a bot actually runs at: the lower of the bot's own mode
 * and the fleet mode (the fleet MODE is the ceiling — a bot can sit
 * below it, never above it). An unrecognized bot mode string counts
 * as "sim", the safest mode.
 */
export function effectiveMode(botMode: string, fleetMode: FleetMode): FleetMode {
  const own = parseBotMode(botMode);
  return MODE_RANK[own] <= MODE_RANK[fleetMode] ? own : fleetMode;
}

export interface BotVenueResolution {
  venue: "alpaca" | "schwab";
  ok: boolean;
  reason: string | null;
}

export function resolveBotVenue(
  bot: BotConfig,
  fleetMode: FleetMode,
): BotVenueResolution {
  const rawBroker = typeof bot.broker === "string" ? bot.broker : "";
  const broker = rawBroker.trim().toLowerCase();

  // Missing/empty broker keeps the pre-v37 default: Alpaca.
  if (broker === "" || broker === "alpaca") {
    return { venue: "alpaca", ok: true, reason: null };
  }

  if (broker !== "schwab") {
    return {
      venue: "alpaca",
      ok: false,
      reason:
        `unknown broker venue "${rawBroker.trim()}" in ${bot.name}'s bot file — ` +
        `expected "alpaca" or "schwab".`,
    };
  }

  const codename = bot.codename.trim().toLowerCase();

  if (codename === "polycrypt9000") {
    return {
      venue: "schwab",
      ok: false,
      reason:
        "PolyCrypt9000 is excluded from Schwab entirely — Schwab offers " +
        "no crypto or prediction markets, so this bot cannot trade on Schwab.",
    };
  }

  if (codename === "vega" || codename === "wesley") {
    return {
      venue: "schwab",
      ok: false,
      reason:
        "Schwab options contract mapping is not yet verified for Vega/Wesley, " +
        `so Schwab assignment is refused for ${bot.name}.`,
    };
  }

  const effective = effectiveMode(bot.mode, fleetMode);
  if (effective !== "connected") {
    return {
      venue: "schwab",
      ok: false,
      reason:
        "Schwab is a LIVE venue — it requires the bot in CONNECTED mode " +
        "with the fleet MODE at CONNECTED (the fleet MODE is the ceiling), " +
        `but this bot's mode is "${bot.mode}" (effective mode "${effective}") ` +
        `and the fleet MODE is "${fleetMode}".`,
    };
  }

  return { venue: "schwab", ok: true, reason: null };
}
