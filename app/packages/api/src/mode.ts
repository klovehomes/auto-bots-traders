import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { fleetModeSchema, type FleetMode } from "@fleet/shared";

/**
 * Fleet run-mode state — the dashboard mode switch (Phase 5).
 *
 * The API owns the fleet's DESIRED mode, exactly as it owns the Risk
 * Gate control state: every surface (the web dashboard today) changes
 * it through the API, never around it. The choice persists on the
 * shared data volume (MODE_STATE_PATH, /data/mode-state.json in
 * Docker) so it survives engine restarts and full stack restarts; the
 * MODE env var is only the initial default when nothing is stored.
 *
 * How a switch travels:
 * - The engine reads this same file at boot: stored mode beats env.
 * - While running, the engine learns a new desired mode from the
 *   internal control poll (`desiredMode` on GET /internal/control),
 *   posts a switch event, and exits cleanly; Docker's restart policy
 *   brings it back and it boots into the stored mode.
 * - The engine reports the mode it is actually running (POST
 *   /internal/control/mode-report) at boot and on a heartbeat, so the
 *   dashboard can show "restarting…" until the report matches the
 *   desired mode. The report is in-memory only — it is a fact about a
 *   live process, not durable state.
 *
 * HARD RULE — LIVE MODE IS LOCKED HERE: "connected" (live cash
 * account) can never be stored through this switch. Going live is a
 * per-bot, deliberate decision (Keith's standing rule), and a bare
 * dropdown flip must never be able to reach real money. When live
 * trading is built, it gets an arm-and-confirm step of its own (like
 * the kill switch's) and this refusal is revisited then. The engine's
 * MODE=connected guardrail behavior is untouched — it stays reachable
 * via env/config exactly as before, just not from this switch.
 */

/** Modes the dashboard switch may select. "connected" is deliberately absent. */
export const SWITCHABLE_MODES: readonly FleetMode[] = ["sim", "paper"];

export interface ModeRunningReport {
  mode: FleetMode;
  /** Where the engine's mode came from ("dashboard switch" | "env" | "default"). */
  source: string;
  /** ISO-8601 timestamp of the latest report. */
  reportedAt: string;
}

export interface ModePublicState {
  /** The mode the fleet should be running: the stored dashboard
   *  choice when one exists, otherwise this service's MODE env. */
  desired: FleetMode;
  desiredSource: "dashboard" | "env";
  /** The mode the engine last reported running; null until it reports. */
  running: ModeRunningReport | null;
  /** True while the engine's reported mode differs from the desired
   *  mode — a switch (engine restart) is in flight. */
  switching: boolean;
  /** Modes the switch may select (the UI locks everything else). */
  switchable: FleetMode[];
}

export type ModeSwitchResult =
  | { ok: true; mode: FleetMode; changed: boolean }
  | { ok: false; status: number; error: string };

interface PersistedModeState {
  version: 1;
  mode: FleetMode | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export class ModeStore {
  private readonly path: string;
  private readonly envDefault: FleetMode;
  private stored: FleetMode | null = null;
  private updatedAt: string | null = null;
  private lastUpdatedBy: string | null = null;
  private running: ModeRunningReport | null = null;

  constructor(path: string, envDefault: FleetMode) {
    this.path = path;
    this.envDefault = envDefault;
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedModeState;
      if (parsed.version !== 1) {
        throw new Error(`unsupported version ${String(parsed.version)}`);
      }
      if (parsed.mode !== null && !fleetModeSchema.safeParse(parsed.mode).success) {
        throw new Error(`unrecognized stored mode ${JSON.stringify(parsed.mode)}`);
      }
      this.stored = parsed.mode;
      this.updatedAt = parsed.updatedAt ?? null;
      this.lastUpdatedBy = parsed.updatedBy ?? null;
    } catch (err) {
      // A corrupt mode file must never wedge the fleet: ignore the
      // stored choice, fall back to the env default, and say so loudly.
      console.error(
        `[mode] could not load ${this.path} — ignoring the stored mode; ` +
          `the MODE env default ("${this.envDefault}") applies:`,
        err instanceof Error ? err.message : err,
      );
      this.stored = null;
    }
  }

  private save(): void {
    const data: PersistedModeState = {
      version: 1,
      mode: this.stored,
      updatedAt: this.stored ? this.updatedAt : null,
      updatedBy: this.stored ? this.lastUpdatedBy : null,
    };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data, null, 2));
      renameSync(tmp, this.path);
    } catch (err) {
      console.error(
        `[mode] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  /** The fleet's desired mode: stored dashboard choice, else env default. */
  desiredMode(): FleetMode {
    return this.stored ?? this.envDefault;
  }

  /**
   * Validate and record a switch request. This is the endpoint's
   * validation: unknown modes are a 400; "connected" is a 403 — the
   * live lock described in the header comment. Selecting the already-
   * desired mode is a successful no-op (changed: false).
   */
  requestMode(input: unknown, source: string): ModeSwitchResult {
    const parsed = fleetModeSchema.safeParse(
      typeof input === "string" ? input.trim().toLowerCase() : input,
    );
    if (!parsed.success) {
      return {
        ok: false,
        status: 400,
        error:
          `unknown mode: ${JSON.stringify(input) ?? String(input)} — ` +
          `expected "sim", "paper" or "connected"`,
      };
    }
    const mode = parsed.data;
    if (mode === "connected") {
      return {
        ok: false,
        status: 403,
        error:
          "live cash account mode is not enabled yet — going live is a " +
          "per-bot, deliberate step and is not wired to this switch",
      };
    }
    const changed = mode !== this.desiredMode();
    if (changed) {
      this.stored = mode;
      this.updatedAt = new Date().toISOString();
      this.lastUpdatedBy = source;
      this.save();
    }
    return { ok: true, mode, changed };
  }

  /** Record the engine's latest running-mode report (in-memory). */
  reportRunning(mode: FleetMode, source: string): void {
    this.running = { mode, source, reportedAt: new Date().toISOString() };
  }

  publicState(): ModePublicState {
    const desired = this.desiredMode();
    return {
      desired,
      desiredSource: this.stored !== null ? "dashboard" : "env",
      running: this.running,
      switching: this.running !== null && this.running.mode !== desired,
      switchable: [...SWITCHABLE_MODES],
    };
  }
}
