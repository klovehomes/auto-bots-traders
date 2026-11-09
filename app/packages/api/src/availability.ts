import type {
  FleetMode,
  SleeveAvailability,
  SleeveToggles,
} from "@fleet/shared/types";

/**
 * Phase PM6 — truthful Bot Trades availability, computed server-side.
 *
 * Keith (2026-11-09, reviewing the app on his VM): "when it is set to
 * paper trading or live cash mode and it is really not possible
 * because of no api key or not available, grey out that section and
 * add a description of why it is not available, like 'not setup' or
 * something like 'not available on polymarket'."
 *
 * This module is the single source of truth for that greying. It is
 * a pure function of (a) the fleet's stored run mode — the API-owned
 * desired mode, the same source the dashboard mode switch uses —
 * and (b) broker configuration PRESENCE (booleans only; key values
 * never reach this code). GET /allocations carries the result, and
 * the Bot Trades panel renders exactly what it says.
 *
 * The truths encoded here, as of this build:
 * - sim: the simulator runs every sleeve. Nothing is greyed.
 * - paper: NO sleeve can really trade yet. Polymarket has no paper
 *   or testnet mode at all, so its sleeve is unavailable in paper on
 *   principle. PolyCrypt9000's Alpaca paper runner (crypto sleeve)
 *   and the Kalshi demo runner are NOT built — PolyCrypt runs on the
 *   simulator in paper mode — so those sleeves are unavailable
 *   regardless of configuration; the reason names the FIRST blocker
 *   (missing keys first, then the missing runner).
 * - connected (live cash): live trading is not enabled in this build
 *   at all (guardrail stub; the dashboard switch refuses to store
 *   "connected" and the dropdown lists it as not enabled yet). If a
 *   stored/env mode of connected is ever in force, every sleeve is
 *   unavailable with the same reason.
 *
 * Availability NEVER touches the stored sleeve toggles: a greyed
 * sleeve keeps its saved on/off preference in the ledger; it simply
 * can't be changed, and can't take effect, while unavailable. And
 * nothing here gates the engine's order flow — this phase is
 * truthful display + disabled controls only.
 */

export interface BrokerConfigPresence {
  /** ALPACA_API_KEY and ALPACA_API_SECRET both non-empty. */
  alpacaKeysPresent: boolean;
  /** Kalshi demo credentials detected (see index.ts for the env
   *  names checked). */
  kalshiCredsPresent: boolean;
}

export interface AvailabilityResult {
  /** Per-sleeve availability, in UI order: crypto, kalshi, polymarket. */
  sleeves: SleeveAvailability[];
  /** False when no sleeve can trade in this mode — the Bot
   *  Allocation field + Save button grey out alongside the sleeves. */
  botAllocationAvailable: boolean;
  /** One-line explanation for the allocation greying; null when
   *  the allocation control is available. */
  botAllocationReason: string | null;
}

export const REASON_POLYMARKET_NO_PAPER =
  "Not available on Polymarket — Polymarket has no paper mode";
export const REASON_CRYPTO_NO_KEYS =
  "Not set up — no Alpaca paper API keys configured";
export const REASON_CRYPTO_NO_RUNNER =
  "Not set up — the Alpaca paper runner isn't built yet";
export const REASON_KALSHI_NOT_CONNECTED =
  "Not set up — Kalshi demo isn't connected (no API keys configured)";
export const REASON_KALSHI_NO_RUNNER =
  "Not set up — the Kalshi demo runner isn't built yet";
export const REASON_LIVE_NOT_ENABLED = "Live cash mode is not enabled yet";
export const REASON_PAPER_BOT_BLOCKED =
  "The bot can't trade in Paper trading yet — Polymarket has no paper mode, " +
  "and the Crypto and Kalshi paper sleeves aren't set up in this build.";

const SLEEVE_ORDER: readonly (keyof SleeveToggles)[] = [
  "crypto",
  "kalshi",
  "polymarket",
];

export function computeAvailability(
  mode: FleetMode,
  config: BrokerConfigPresence,
): AvailabilityResult {
  if (mode === "sim") {
    return {
      sleeves: SLEEVE_ORDER.map((sleeve) => ({
        sleeve,
        available: true,
        reason: null,
      })),
      botAllocationAvailable: true,
      botAllocationReason: null,
    };
  }

  if (mode === "connected") {
    return {
      sleeves: SLEEVE_ORDER.map((sleeve) => ({
        sleeve,
        available: false,
        reason: REASON_LIVE_NOT_ENABLED,
      })),
      botAllocationAvailable: false,
      botAllocationReason: REASON_LIVE_NOT_ENABLED,
    };
  }

  // paper — first-blocker reasons, per sleeve.
  const bySleeve: Record<keyof SleeveToggles, SleeveAvailability> = {
    crypto: {
      sleeve: "crypto",
      available: false,
      reason: config.alpacaKeysPresent
        ? REASON_CRYPTO_NO_RUNNER
        : REASON_CRYPTO_NO_KEYS,
    },
    kalshi: {
      sleeve: "kalshi",
      available: false,
      reason: config.kalshiCredsPresent
        ? REASON_KALSHI_NO_RUNNER
        : REASON_KALSHI_NOT_CONNECTED,
    },
    polymarket: {
      sleeve: "polymarket",
      available: false,
      reason: REASON_POLYMARKET_NO_PAPER,
    },
  };
  const sleeves = SLEEVE_ORDER.map((sleeve) => bySleeve[sleeve]);
  const anyAvailable = sleeves.some((s) => s.available);
  return {
    sleeves,
    botAllocationAvailable: anyAvailable,
    botAllocationReason: anyAvailable ? null : REASON_PAPER_BOT_BLOCKED,
  };
}
