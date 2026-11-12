import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type {
  SleeveToggles,
  UserSelection,
} from "@fleet/shared/types";

/**
 * Phase PM3 — the shared-pool allocation ledger.
 *
 * ONE pool of total available funds sits under both halves of the
 * split screen (Keith, 2026-11-08 — "Shared pool"):
 *   remaining = totalFunds − botAllocation − Σ open user selections
 * The Bot Trades section gets a carved-out portion (botAllocation);
 * the left scan panel books per-market user selections. Every
 * allocation on either side reduces what the other side can use, and
 * the same dollar is never allocated twice — the API routes enforce
 * that on every write (an over-pool batch is rejected whole, never
 * partially booked).
 *
 * This store owns the ledger only (numbers + toggles + selections);
 * totalFunds itself is derived by the API from PolyCrypt9000's book
 * equity (see index.ts). Persistence follows the Risk Gate control
 * store's pattern exactly: a versioned JSON file, written atomically
 * (tmp + rename), on the same durable data volume — in Docker,
 * /data/allocations.json next to control-state.json.
 */

export interface AllocationLedger {
  botAllocation: number;
  sleeveToggles: SleeveToggles;
  userSelections: UserSelection[];
}

interface PersistedLedger {
  version: 1;
  botAllocation: number;
  sleeveToggles: SleeveToggles;
  userSelections: UserSelection[];
}

export const DEFAULT_SLEEVE_TOGGLES: SleeveToggles = {
  crypto: true,
  kalshi: true,
  polymarket: true,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class AllocationStore {
  private readonly path: string;
  private botAllocation = 0;
  private sleeveToggles: SleeveToggles = { ...DEFAULT_SLEEVE_TOGGLES };
  private userSelections: UserSelection[] = [];

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedLedger;
      if (parsed.version !== 1) return;
      if (typeof parsed.botAllocation === "number" && parsed.botAllocation >= 0) {
        this.botAllocation = parsed.botAllocation;
      }
      if (parsed.sleeveToggles) {
        this.sleeveToggles = {
          crypto: parsed.sleeveToggles.crypto !== false,
          kalshi: parsed.sleeveToggles.kalshi !== false,
          polymarket: parsed.sleeveToggles.polymarket !== false,
        };
      }
      this.userSelections = Array.isArray(parsed.userSelections)
        ? parsed.userSelections
        : [];
    } catch (err) {
      // Same posture as the control store: a corrupt ledger must never
      // wedge the dashboard — start empty and say so loudly.
      console.error(
        `[allocations] could not load ${this.path} — starting empty:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  private save(): void {
    const data: PersistedLedger = {
      version: 1,
      botAllocation: this.botAllocation,
      sleeveToggles: this.sleeveToggles,
      userSelections: this.userSelections,
    };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data, null, 2));
      renameSync(tmp, this.path);
    } catch (err) {
      console.error(
        `[allocations] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  get ledger(): AllocationLedger {
    return {
      botAllocation: this.botAllocation,
      sleeveToggles: { ...this.sleeveToggles },
      userSelections: this.userSelections.map((s) => ({ ...s })),
    };
  }

  /** Σ amounts of open user selections — the left panel's pool draw. */
  openSelectionsTotal(): number {
    return round2(
      this.userSelections
        .filter((s) => s.status === "Open")
        .reduce((sum, s) => sum + s.amount, 0),
    );
  }

  setBotAllocation(amount: number): void {
    this.botAllocation = round2(amount);
    this.save();
  }

  setSleeveToggles(partial: Partial<SleeveToggles>): SleeveToggles {
    this.sleeveToggles = { ...this.sleeveToggles, ...partial };
    this.save();
    return { ...this.sleeveToggles };
  }

  addSelections(selections: UserSelection[]): UserSelection[] {
    this.userSelections.push(...selections);
    this.save();
    return selections;
  }

  /**
   * Reset All Data (PM8): return the shared-pool ledger to its
   * fresh-install state — bot allocation $0, all three sleeve
   * toggles on, no booked user selections — and persist it. A reset
   * that left booked selections against a $10,000 book would be
   * incoherent, so the ledger is wiped with the books. Called by
   * the API's runReset() the moment a reset is accepted.
   */
  reset(): void {
    this.botAllocation = 0;
    this.sleeveToggles = { ...DEFAULT_SLEEVE_TOGGLES };
    this.userSelections = [];
    this.save();
  }
}
