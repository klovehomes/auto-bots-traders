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

/** Event types in the engine → frontend stream (see PLAN.md). */
export type FleetEventType = "open" | "close" | "signal" | "halt";

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

// ---------------------------------------------------------------------------
// Phase PM3 (Polymarket-only): split-screen scans, the shared-pool
// allocation ledger, and user selections. The API owns all of this
// state; the web dashboard only renders it.
// ---------------------------------------------------------------------------

/** One of the three Polymarket scans Keith defined (Nov 6 scans). */
export interface ScanDefinition {
  /** "1" | "2" | "3" — also the /scans/:id/results path segment. */
  id: string;
  label: string;
  description: string;
}

/** One in-band market from a scan's result list. */
export interface ScanResultItem {
  marketId: string;
  question: string;
  /** The outcome whose price sits in the 82–90¢ band (e.g. "No"). */
  outcome: string;
  /** That outcome's price, 0–1 (0.885 = 88.5¢). */
  price: number;
  /** Total market volume in dollars (Gamma volumeNum). */
  volume: number;
  /** ISO-8601 end date, or null when Gamma omits it. */
  endDate: string | null;
  slug: string;
}

export interface ScanResultsResponse {
  scanId: string;
  label: string;
  /** ISO-8601 time the API fetched (or cached) this data. */
  fetchedAt: string;
  /**
   * Total in-band markets in the scan's universe. Null only for the
   * Full Universe scan while its background full-pagination count is
   * still running — results are never blocked on it.
   */
  count: number | null;
  results: ScanResultItem[];
}

/** The three trading sleeves of the split screen — independently
 *  switchable. Stored server-side in the allocation ledger. */
export interface SleeveToggles {
  crypto: boolean;
  kalshi: boolean;
  polymarket: boolean;
}

/**
 * Phase PM6 — whether one sleeve can REALLY trade in the current run
 * mode. Computed server-side (the API is the single source of truth)
 * from the stored run mode and which broker configurations are
 * present — never from anything the browser claims. `reason` is a
 * short human explanation when the sleeve is unavailable; null when
 * it is available. An unavailable sleeve KEEPS its stored on/off
 * preference: availability only means the preference can't be
 * changed, and can't take effect, in this mode.
 */
export interface SleeveAvailability {
  sleeve: keyof SleeveToggles;
  available: boolean;
  reason: string | null;
}

/** One user selection booked from the left (scan) panel on Submit. */
export interface UserSelection {
  id: string;
  marketId: string;
  question: string;
  outcome: string;
  scanId: string;
  scanLabel: string;
  /** Dollars the user allocated to this market. */
  amount: number;
  /** Outcome price (0–1) at the moment of selection. */
  priceAtSelection: number;
  /** ISO-8601 timestamp. */
  ts: string;
  status: "Open";
}

/** A user selection enriched with a live re-price from Gamma. */
export interface UserSelectionValuation extends UserSelection {
  currentPrice: number;
  /** (amount / priceAtSelection) × currentPrice. */
  currentValue: number;
  /** currentValue − amount. */
  pnl: number;
}

export interface UserSelectionsResponse {
  selections: UserSelectionValuation[];
  totals: {
    totalAllocated: number;
    totalCurrentValue: number;
    totalPnl: number;
  };
}

/**
 * The shared-pool allocation state (GET /allocations). ONE pool under
 * both halves of the split screen:
 * remainingAvailable = totalFunds − botAllocation − Σ open selections.
 */
export interface AllocationState {
  /** PolyCrypt9000's current book equity (API-derived; 10000 fallback). */
  totalFunds: number;
  /** Portion of the pool carved out for the Bot Trades section. */
  botAllocation: number;
  /** Σ amounts of open user selections. */
  userSelectionsTotal: number;
  remainingAvailable: number;
  sleeveToggles: SleeveToggles;
  userSelections: UserSelection[];
  /** Phase PM6: the stored run mode the availability below was
   *  computed for (the API-owned desired mode). */
  runMode: FleetMode;
  /** Phase PM6: per-sleeve availability in `runMode`, in UI order
   *  (crypto, kalshi, polymarket). */
  sleeveAvailability: SleeveAvailability[];
  /** Phase PM6: false when NO sleeve can trade in `runMode` — the
   *  Bot Allocation control is greyed out too. */
  botAllocationAvailable: boolean;
  /** Phase PM6: why the Bot Allocation control is unavailable
   *  (one-line summary of the blockers); null when available. */
  botAllocationReason: string | null;
}
