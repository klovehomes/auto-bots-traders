import { existsSync, readFileSync } from "node:fs";
import {
  fleetModeSchema,
  parseFleetMode,
  type FleetEvent,
  type FleetMode,
} from "@fleet/shared";

/**
 * Engine-side fleet mode — the dashboard mode switch (Phase 5).
 *
 * Boot resolution (resolveBootMode): the mode the API persisted from
 * the dashboard switch (MODE_STATE_PATH on the shared data volume —
 * see api/src/mode.ts, the file's single writer) beats the MODE env
 * var, which is only the initial default when nothing is stored.
 * Corrupt or unrecognized stored content is ignored with a loud
 * warning and the env resolution applies — a bad mode file must never
 * wedge the boot.
 *
 * Runtime switching (createModeSupervisor): the API serves the desired
 * mode on the internal control poll the engine already runs every
 * second. When the desired mode differs from the mode this process
 * booted into, the supervisor posts one switch event to the stream,
 * then exits the process cleanly — Docker's `restart: unless-stopped`
 * brings the engine back, boot resolution reads the stored mode, and
 * the fleet is in the new mode. The supervisor also reports the
 * running mode back to the API (boot + 30 s heartbeat) so the
 * dashboard can tell "restarting…" from "running".
 *
 * Live note: this module only ever moves the fleet between the modes
 * the API will store — and the API refuses to store "connected" from
 * the dashboard switch (see api/src/mode.ts). A stored "connected"
 * can therefore only arrive via env-era config, where the existing
 * connected guardrail applies unchanged.
 */

export type BootModeSource = "dashboard switch" | "env" | "default";

export interface BootModeResolution {
  mode: FleetMode;
  source: BootModeSource;
  /** Loud-warning text for the caller to log, or null when clean. */
  warning: string | null;
}

export type StoredModeRead =
  | { status: "ok"; mode: FleetMode }
  | { status: "absent" }
  | { status: "invalid"; warning: string };

/** Read the API-owned stored mode file. Never throws. */
export function readStoredMode(path: string): StoredModeRead {
  if (!existsSync(path)) return { status: "absent" };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as {
      version?: unknown;
      mode?: unknown;
    };
    if (parsed.version !== 1) {
      return {
        status: "invalid",
        warning:
          `stored mode file ${path} has unsupported version ` +
          `${JSON.stringify(parsed.version)} — ignoring it`,
      };
    }
    if (parsed.mode === null || parsed.mode === undefined) {
      // File exists but records no choice (e.g. pre-created): the env
      // default applies, exactly as if the file were absent.
      return { status: "absent" };
    }
    const mode = fleetModeSchema.safeParse(parsed.mode);
    if (!mode.success) {
      return {
        status: "invalid",
        warning:
          `stored mode file ${path} holds an unrecognized mode ` +
          `${JSON.stringify(parsed.mode)} — ignoring it`,
      };
    }
    return { status: "ok", mode: mode.data };
  } catch (err) {
    return {
      status: "invalid",
      warning:
        `stored mode file ${path} is unreadable/corrupt ` +
        `(${err instanceof Error ? err.message : String(err)}) — ignoring it`,
    };
  }
}

/**
 * Resolve the boot mode: stored dashboard choice → MODE env → "sim".
 * The env fallthrough preserves the pre-Phase-5 semantics exactly
 * (unrecognized env values fall back to "sim", with a warning).
 */
export function resolveBootMode(opts: {
  storedPath: string;
  envRaw: string | undefined;
}): BootModeResolution {
  const stored = readStoredMode(opts.storedPath);
  if (stored.status === "ok") {
    return { mode: stored.mode, source: "dashboard switch", warning: null };
  }
  const warnings: string[] = [];
  if (stored.status === "invalid") warnings.push(stored.warning);

  const envRaw = opts.envRaw;
  if (envRaw !== undefined && envRaw.trim() !== "") {
    const mode = parseFleetMode(envRaw);
    if (envRaw.trim().toLowerCase() !== mode) {
      warnings.push(`unrecognized MODE="${envRaw}" — falling back to "sim"`);
    }
    return {
      mode,
      source: "env",
      warning: warnings.length > 0 ? warnings.join("; ") : null,
    };
  }
  return {
    mode: "sim",
    source: "default",
    warning: warnings.length > 0 ? warnings.join("; ") : null,
  };
}

// ---------------------------------------------------------------------

export interface ModeSupervisorOptions {
  /** The mode this engine process booted into. */
  runningMode: FleetMode;
  /** Where runningMode came from at boot (reported back to the API). */
  bootSource: BootModeSource;
  apiBaseUrl: string;
  token: string;
  /** The engine's normal event publisher (switch event goes to the stream). */
  postEvent: (event: FleetEvent) => Promise<void>;
  /**
   * Injected exit hook: production passes process.exit; the harness
   * records the call instead of dying. Called exactly once per switch,
   * with code 0, after the switch event has been posted (best effort).
   */
  exit: (code: number) => void;
  /** Running-mode heartbeat interval (default 30 s). */
  reportIntervalMs?: number;
}

const REPORT_INTERVAL_MS = 30_000;
/** The switch event is best-effort: never let a hung API stall the exit. */
const SWITCH_EVENT_TIMEOUT_MS = 3_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export interface ModeSupervisor {
  /**
   * Feed every internal control-poll result here. A desired mode that
   * differs from the running mode triggers the restart path exactly
   * once; `undefined` (an older API that doesn't serve it) is ignored.
   */
  observeDesiredMode: (desired: FleetMode | undefined) => void;
  /** Report the running mode now, then on the heartbeat interval. */
  startReporting: () => void;
  stopReporting: () => void;
  readonly switchTriggered: boolean;
}

export function createModeSupervisor(opts: ModeSupervisorOptions): ModeSupervisor {
  let switchTriggered = false;
  let reportTimer: ReturnType<typeof setInterval> | null = null;

  async function reportRunning(attempts: number): Promise<void> {
    const body = JSON.stringify({
      mode: opts.runningMode,
      source: opts.bootSource,
    });
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await fetch(
          `${opts.apiBaseUrl}/internal/control/mode-report`,
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
      } catch {
        // The API may still be coming up; the heartbeat retries.
      }
      if (attempt < attempts) await sleep(500 * attempt);
    }
  }

  function observeDesiredMode(desired: FleetMode | undefined): void {
    if (desired === undefined || desired === opts.runningMode || switchTriggered) {
      return;
    }
    switchTriggered = true;
    const from = opts.runningMode;
    console.log(
      `[engine] 🔀 mode switch: dashboard set the fleet mode to "${desired}" ` +
        `(this process is running "${from}") — posting the switch event and ` +
        `exiting so Docker restarts the engine into "${desired}"`,
    );
    const event: FleetEvent = {
      bot: "Engine",
      type: "signal",
      decision_id: null,
      symbol: null,
      side: null,
      qty: null,
      price: null,
      pnl: null,
      reason:
        `MODE SWITCH · fleet mode ${from} → ${desired} (dashboard switch) — ` +
        `engine restarting into ${desired}`,
      ts: new Date().toISOString(),
    };
    void (async () => {
      try {
        await Promise.race([
          opts.postEvent(event),
          sleep(SWITCH_EVENT_TIMEOUT_MS),
        ]);
      } catch {
        // Best effort only — the restart matters, not the receipt.
      }
      opts.exit(0);
    })();
  }

  return {
    observeDesiredMode,

    startReporting: () => {
      void reportRunning(3);
      if (!reportTimer) {
        reportTimer = setInterval(
          () => void reportRunning(1),
          opts.reportIntervalMs ?? REPORT_INTERVAL_MS,
        );
        reportTimer.unref?.();
      }
    },

    stopReporting: () => {
      if (reportTimer) {
        clearInterval(reportTimer);
        reportTimer = null;
      }
    },

    get switchTriggered() {
      return switchTriggered;
    },
  };
}
