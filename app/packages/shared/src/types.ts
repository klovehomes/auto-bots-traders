/**
 * Shared types for the trading-bot fleet.
 *
 * This module is intentionally free of runtime imports so the web frontend
 * can import the types via `@fleet/shared/types` without pulling Node-only
 * code (fs, gray-matter) into the browser bundle.
 */

export interface VizConfig {
  /** Hex color, e.g. "#22d3ee" — the bot's landscape/avatar color. */
  color: string;
  /** Avatar form, e.g. "avatar_disc". */
  form: string;
  /** Avatar accessory label, e.g. "visor shades". */
  avatar_accessory: string;
}

export interface BotConfig {
  // --- Identity fields: strictly validated (see schema.ts) ---
  name: string;
  codename: string;
  enabled: boolean;
  mode: string;
  market: string;
  broker: string;
  strategy: string;
  viz: VizConfig;

  // --- Loose passthrough data ---
  // The bot .md files intentionally carry prose in these blocks
  // (e.g. risk.max_position_pct: "3 (per Polymarket position) / 15 (per
  // crypto position)"), so they are NOT forced into numeric shapes here.
  // Per-strategy plugins interpret them in later phases.
  universe?: unknown;
  watchlist_examples?: string[];
  /** Phase 3 (Vega): the screened candidate pool from the bot file. */
  candidate_pool?: string[];
  timeframe?: string;
  schedule?: string;
  rules: Record<string, unknown>;
  risk: Record<string, unknown>;

  /** The bot's trading philosophy: the Markdown body of the .md file. */
  philosophy: string;
  /** Absolute path of the .md file this config was loaded from. */
  sourcePath: string;
  /** The complete raw frontmatter, for fields the typed config doesn't model yet. */
  raw: Record<string, unknown>;
}

/** Event types in the engine → frontend stream (see PLAN.md).
 *  "data_reset" (Phase 13 / v22) is the engine's audit record of a
 *  Reset All Data wipe: it is the sole first entry of the fresh event
 *  history after a reset, carries bot "system" and a null decision_id
 *  (so it lands in the history store's recent class), and never enters
 *  any bot's PnL math. */
export type FleetEventType = "open" | "close" | "signal" | "halt" | "data_reset";

/**
 * Fleet-wide run mode, from the MODE env var. This is the production
 * design's permanent three-mode shape:
 * - "sim"       — synthetic data, no broker (local WSL/Docker runs)
 * - "paper"     — Alpaca paper account
 * - "connected" — live accounts (per-bot approval required to go live)
 * The fleet MODE is the ceiling: a bot file's own `mode` can hold that
 * bot below the fleet mode, but never above it.
 */
export type FleetMode = "sim" | "paper" | "connected";

export type OrderSide = "buy" | "sell";

/**
 * Market "weather" for the day (v24): the landscape's hub dome renders
 * one of two particle weathers — green sparklies on a breakout day,
 * a red meteor shower on a downturn day. Computed in the engine from
 * SPY (see shared/weather.ts for the rule) and delivered to dashboards
 * through the API (GET /weather + a "weather" WebSocket broadcast).
 */
export type WeatherKind = "breakout" | "downturn";

export interface MarketWeather {
  kind: WeatherKind;
  /** SPY's day change in percent, e.g. 0.82 for +0.82%, -1.15 for -1.15%. */
  spyChangePct: number;
  /** ISO-8601 timestamp of the engine computation that produced this. */
  asOf: string;
  /** Where the numbers came from: the Alpaca paper feed or the simulator. */
  source: "alpaca" | "sim";
}

/**
 * One event on the fleet event bus (WebSocket `/events`).
 * Matches the schema in PLAN.md:
 * `{bot, type, decision_id, symbol, side, qty, price, pnl, reason, ts}`
 * Fields that don't apply to an event (e.g. `pnl` on a signal) are null.
 */
export interface FleetEvent {
  bot: string;
  type: FleetEventType;
  /** Foreign key into the decision log; null until the decision log exists (Phase 1+). */
  decision_id: string | null;
  symbol: string | null;
  side: OrderSide | null;
  qty: number | null;
  price: number | null;
  pnl: number | null;
  reason: string;
  /** ISO-8601 timestamp. */
  ts: string;
  /**
   * Monotonic sequence number assigned by the API at ingest (Phase 6
   * event history). Engine payloads never carry it — the API stamps it
   * onto the stored record and the WebSocket broadcast so dashboards
   * can dedupe history vs live and merge without gaps or repeats.
   */
  seq?: number;
}
