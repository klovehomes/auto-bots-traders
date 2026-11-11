/**
 * Engine-side Risk Gate control client.
 *
 * Polls the API's internal control endpoint (the API owns the state;
 * see api/src/control.ts) and keeps a local last-known copy:
 *
 * - `isHalted(codename)` — consulted by the simulator before every bot
 *   action. FAIL SAFE = LAST-KNOWN: if the API is unreachable the engine
 *   keeps enforcing the last state it saw (a halt survives an API
 *   restart; the API persists state to disk and re-serves it). Before
 *   the first successful poll the default is all-active.
 * - Liquidations: the API records pending requests; the engine drains
 *   them here, executes the forced closes against its own position
 *   book, and posts the report back (closed positions + any that could
 *   not be closed, with reasons — never silently dropped).
 * - Fleet mode (Phase 5): the same poll carries the dashboard switch's
 *   desired mode; `onControlState` hands it to the mode supervisor
 *   (see mode.ts), which restarts the engine into a changed mode.
 */

import type { FleetMode } from "@fleet/shared";

export interface PendingLiquidation {
  id: string;
  codename: string;
  auditId: string;
  requestedAt: string;
}

/** A Reset All Data in flight (v22), fleet scope. See api/src/control.ts. */
export interface PendingReset {
  id: string;
  auditId: string;
  requestedAt: string;
}

export interface LiquidationClose {
  codename: string;
  symbol: string;
  qty: number | null;
  price: number | null;
  pnl: number | null;
}

export interface LiquidationFailure {
  codename: string;
  symbol: string;
  reason: string;
}

export interface ControlClient {
  isHalted: (codename: string) => boolean;
  /** Pending liquidation requests this process has not yet executed. */
  drainLiquidations: () => PendingLiquidation[];
  reportLiquidation: (
    id: string,
    codename: string,
    closed: LiquidationClose[],
    failed: LiquidationFailure[],
  ) => Promise<void>;
  /**
   * The in-flight Reset All Data (v22), or null. A non-consuming peek
   * (unlike drainLiquidations): several runners plus the coordinator
   * all need to observe the same pending reset.
   */
  pendingReset: () => PendingReset | null;
  /** Record that one bot's runner has applied the reset (idempotent
   *  per bot — the coordinator waits for every active bot). */
  noteResetApplied: (id: string, codename: string) => void;
  /** Codenames that have applied the given reset so far. */
  resetAppliedBy: (id: string) => string[];
  /**
   * Report the reset fully executed. Returns true once the API has
   * accepted the report — including a 404 ("unknown or already
   * reported"), which means a previous attempt landed and retries
   * should stop. False means: keep the pending reset and retry.
   */
  reportReset: (id: string) => Promise<boolean>;
  start: () => void;
}

const POLL_MS = 1000;

interface ControlClientOptions {
  apiBaseUrl: string;
  token: string;
  /** Called whenever a bot's halted flag flips (logging / surfaces). */
  onHaltChange?: (codename: string, halted: boolean) => void;
  /**
   * Called after every successful poll with the raw internal state.
   * Phase 5: carries the fleet's desired mode (dashboard switch) so
   * the engine can notice a mode change and restart into it. Absent
   * when the API predates Phase 5 — callers must tolerate undefined.
   */
  onControlState?: (state: { desiredMode?: FleetMode }) => void;
}

export function createControlClient(opts: ControlClientOptions): ControlClient {
  const halted = new Map<string, boolean>();
  let pending: PendingLiquidation[] = [];
  let currentReset: PendingReset | null = null;
  /** Reset id → codenames whose runners have applied it (v22). */
  const resetApplied = new Map<string, Set<string>>();
  const consumed = new Set<string>();
  let everPolled = false;
  let lastErrorLogAt = 0;

  async function poll(): Promise<void> {
    try {
      const res = await fetch(`${opts.apiBaseUrl}/internal/control`, {
        headers: { "x-internal-token": opts.token },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const state = (await res.json()) as {
        bots: Record<string, { halted: boolean }>;
        pending: PendingLiquidation[];
        pendingReset?: PendingReset | null;
        desiredMode?: FleetMode;
      };
      opts.onControlState?.(state);
      for (const [codename, b] of Object.entries(state.bots)) {
        const prev = halted.get(codename) ?? false;
        if (prev !== b.halted) {
          halted.set(codename, b.halted);
          opts.onHaltChange?.(codename, b.halted);
        }
      }
      pending = state.pending;
      // Tolerate an API that predates v22 (no pendingReset field).
      currentReset = state.pendingReset ?? null;
      if (!everPolled) {
        everPolled = true;
        const haltedList = [...halted.entries()]
          .filter(([, h]) => h)
          .map(([c]) => c);
        console.log(
          `[engine] control state synced from API` +
            (haltedList.length
              ? ` — HALTED at boot: ${haltedList.join(", ")} (persisted halts are in force)`
              : " — all bots active"),
        );
      }
    } catch (err) {
      // Keep enforcing last-known state; log at most every 30 s.
      const now = Date.now();
      if (now - lastErrorLogAt > 30_000) {
        lastErrorLogAt = now;
        console.warn(
          "[engine] control poll failed — enforcing last-known halt state:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  return {
    isHalted: (codename) => halted.get(codename) ?? false,

    drainLiquidations: () => {
      const fresh = pending.filter((p) => !consumed.has(p.id));
      for (const p of fresh) consumed.add(p.id);
      return fresh;
    },

    reportLiquidation: async (id, codename, closed, failed) => {
      const body = JSON.stringify({ id, codename, closed, failed });
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(
            `${opts.apiBaseUrl}/internal/control/liquidation-report`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-internal-token": opts.token,
              },
              body,
            },
          );
          if (res.ok) return;
          console.warn(
            `[engine] liquidation report for ${codename} rejected: HTTP ${res.status}`,
          );
        } catch (err) {
          console.warn(
            `[engine] liquidation report for ${codename} failed (attempt ${attempt}):`,
            err instanceof Error ? err.message : err,
          );
        }
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
      // Un-reportable: un-consume so the next poll re-executes the
      // request rather than losing it. (Positions are already closed in
      // the book, so a re-execution reports an empty book honestly.)
      consumed.delete(id);
    },

    pendingReset: () => currentReset,

    noteResetApplied: (id, codename) => {
      let set = resetApplied.get(id);
      if (!set) {
        set = new Set<string>();
        resetApplied.set(id, set);
      }
      set.add(codename);
    },

    resetAppliedBy: (id) => [...(resetApplied.get(id) ?? [])],

    reportReset: async (id) => {
      const body = JSON.stringify({ id });
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(
            `${opts.apiBaseUrl}/internal/control/reset-report`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-internal-token": opts.token,
              },
              body,
            },
          );
          if (res.ok) return true;
          // 404 = the API no longer knows this reset (already
          // reported by an earlier attempt, or its state was reset):
          // the report's job is done either way — stop retrying.
          if (res.status === 404) return true;
          console.warn(
            `[engine] reset report rejected: HTTP ${res.status}`,
          );
        } catch (err) {
          console.warn(
            `[engine] reset report failed (attempt ${attempt}):`,
            err instanceof Error ? err.message : err,
          );
        }
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
      return false;
    },

    start: () => {
      void poll();
      setInterval(() => void poll(), POLL_MS);
    },
  };
}
