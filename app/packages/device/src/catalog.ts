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
}

export const CATALOG = raw as StrategyDef[];

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
