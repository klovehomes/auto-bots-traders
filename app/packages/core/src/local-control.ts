/**
 * In-process Risk Gate control for hosts with no API server (devices).
 *
 * Same contract the VM's API-backed ControlClient gives the runners:
 * - a halt stops new evaluations/orders for that bot and PERSISTS until
 *   deliberately resumed (saved in the StateStore, so it survives an app
 *   restart);
 * - "kill + liquidate" queues a liquidation the bot's runner drains on its
 *   next tick, closing only its own tracked positions;
 * - liquidation results are reported back, never silently dropped.
 */
import type { LiquidationClose, LiquidationFailure, PendingLiquidation } from "./control.js";
import type { PaperControl } from "./paper.js";
import type { StateStore } from "./state.js";

const HALTS_KEY = "control/halted.json";

export interface LiquidationReport {
  id: string;
  codename: string;
  closed: LiquidationClose[];
  failed: LiquidationFailure[];
  at: string;
}

export interface LocalControl {
  /** The view a runner is started with (only that bot's liquidations). */
  forBot(codename: string): PaperControl;
  isHalted(codename: string): boolean;
  halted(): string[];
  halt(codename: string): void;
  resume(codename: string): void;
  /** Halt and queue a liquidation of the bot's own positions. */
  haltAndLiquidate(codename: string): string;
  onReport(listener: (r: LiquidationReport) => void): () => void;
}

export function createLocalControl(store: StateStore, now: () => Date = () => new Date()): LocalControl {
  let halted = new Set<string>();
  try {
    const saved = store.read(HALTS_KEY);
    if (saved) halted = new Set(JSON.parse(saved) as string[]);
  } catch {
    // Unreadable halt file: fail safe would be "everything halted", but we
    // can't know the bot list here. Start empty and let the host decide.
  }
  const persist = () => store.write(HALTS_KEY, JSON.stringify([...halted].sort()));
  let queue: PendingLiquidation[] = [];
  const listeners = new Set<(r: LiquidationReport) => void>();

  const control: LocalControl = {
    forBot(codename) {
      return {
        isHalted: (c) => halted.has(c),
        drainLiquidations: () => {
          const mine = queue.filter((p) => p.codename === codename);
          queue = queue.filter((p) => p.codename !== codename);
          return mine;
        },
        reportLiquidation: async (id, c, closed, failed) => {
          const report = { id, codename: c, closed, failed, at: now().toISOString() };
          for (const l of listeners) l(report);
        },
        // No fleet-wide Reset All Data on a device yet.
        pendingReset: () => null,
        noteResetApplied: () => undefined,
      };
    },
    isHalted: (c) => halted.has(c),
    halted: () => [...halted].sort(),
    halt(codename) {
      halted.add(codename);
      persist();
    },
    resume(codename) {
      halted.delete(codename);
      // A resume cancels any liquidation the runner hasn't picked up yet.
      queue = queue.filter((p) => p.codename !== codename);
      persist();
    },
    haltAndLiquidate(codename) {
      control.halt(codename);
      const id = globalThis.crypto.randomUUID();
      queue.push({ id, codename, auditId: id, requestedAt: now().toISOString() });
      return id;
    },
    onReport(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return control;
}
