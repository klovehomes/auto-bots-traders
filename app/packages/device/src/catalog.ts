import type { BotConfig } from "@fleet/shared/types";
import raw from "./catalog.generated.json";
import type { Provider, StrategySelection } from "./api";

export interface StrategyDef {
  codename: string;
  name: string;
  category: string;
  market: string;
  broker: string;
  strategy: string;
  timeframe: string | null;
  schedule: string | null;
  universe: string[];
  universeNote: string | null;
  rules: Record<string, unknown>;
  risk: Record<string, unknown>;
  caps: {
    maxPositionPct: number | null;
    maxDailyLossPct: number | null;
    maxPositions: number | null;
  };
  color: string;
  requires: Provider[];
  optional: Provider[];
  summary: string;
  /** The full bot config the core runners take, straight from bots/<name>.md. */
  bot: BotConfig;
}

export const CATALOG = raw as unknown as StrategyDef[];

/**
 * The bot config a runner is started with: the .md file's config with the
 * user's symbol list and (tightened-only) risk limits applied.
 */
export function botForSelection(def: StrategyDef, sel: StrategySelection): BotConfig {
  const bot: BotConfig = { ...def.bot, risk: { ...def.bot.risk }, rules: { ...def.bot.rules } };
  if (sel.universe.length > 0) {
    if (Array.isArray(def.bot.universe)) bot.universe = [...sel.universe];
    else if (def.bot.candidate_pool) bot.candidate_pool = [...sel.universe];
  }
  const pos = clampToCap(sel.maxPositionPct, def.caps.maxPositionPct);
  const loss = clampToCap(sel.maxDailyLossPct, def.caps.maxDailyLossPct);
  if (pos !== null) bot.risk.max_position_pct = pos;
  if (loss !== null) bot.risk.max_daily_loss_pct = loss;
  return bot;
}

export function defaultSelection(def: StrategyDef): StrategySelection {
  return {
    codename: def.codename,
    enabled: false,
    credentials: {},
    universe: [...def.universe],
    maxPositionPct: def.caps.maxPositionPct,
    maxDailyLossPct: def.caps.maxDailyLossPct,
  };
}

/**
 * A user may tighten a strategy's risk limits, never loosen them —
 * the same rule the fleet's Risk Gate applies to bot files.
 */
export function clampToCap(value: number | null, cap: number | null): number | null {
  if (cap === null) return null;
  if (value === null || !Number.isFinite(value)) return cap;
  return Math.min(Math.max(value, 0.1), cap);
}

export function normalizeUniverse(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => /^[A-Z0-9./-]{1,12}$/.test(s)),
    ),
  );
}

/** Missing required keys for a selection, or [] if it's ready to run. */
export function missingKeys(def: StrategyDef, sel: StrategySelection): Provider[] {
  return def.requires.filter((p) => !sel.credentials[p]);
}
