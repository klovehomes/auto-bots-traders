import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { FleetEvent } from "@fleet/shared";

/**
 * Event history — the API's durable record of the fleet event stream
 * (Phase 6, the "truth patch"; retention fixed in Phase 11 / v19).
 *
 * Why this exists: until Phase 6 the API was a pure relay — it
 * validated an ingested event, broadcast it to whichever dashboard
 * tabs were connected at that second, and discarded it. A dashboard
 * opened in the evening therefore showed an empty Decisions tab even
 * though the bots had decided (and traded) all day: their sparse
 * records had streamed past while no tab was open, while the
 * simulator bots looked "alive" because they chatter constantly into
 * any open tab. The stream now has a memory.
 *
 * How it works:
 * - Every event the engine posts to /internal/events is appended
 *   here FIRST (this store is the ingest path, not a side log). The
 *   store stamps a monotonically increasing sequence number onto the
 *   event; the stamped event is what gets persisted AND what gets
 *   broadcast over the WebSocket, so a dashboard can merge history
 *   and live frames by seq with no duplicates.
 * - Persistence follows the fleet-store discipline (ModeStore /
 *   ControlStore): one JSON file on the shared data volume
 *   (EVENT_HISTORY_PATH, /data/event-history.json in Docker), atomic
 *   tmp+rename writes, and a corrupt file is ignored loudly at boot
 *   rather than wedging the API — history restarts empty and the
 *   sequence restarts at 1 (clients reseed from scratch on load, so
 *   a reset is self-healing).
 * - Writes are batched: appends mark the store dirty and a periodic
 *   flusher persists at most once per FLUSH_INTERVAL_MS, EXCEPT
 *   decision records, which flush immediately — they are rare (tens
 *   per day) and they are exactly the records this store exists to
 *   never lose. A flush also runs on graceful shutdown (onClose).
 *
 * Retention (THREE classes — Phase 11 split the decision class):
 * - PROTECTED decisions: decision events produced by a real-data
 *   runner (paper today; connected later). Kept up to the most
 *   recent PROTECTED_DECISION_CAP (5,000). At the paper fleet's real
 *   rate (tens of decisions a day) that is effectively "every paper
 *   decision for many months".
 * - SIM decisions: decision events produced by the simulator. Kept
 *   up to the most recent SIM_DECISION_CAP (1,000) — plenty for the
 *   sim bots' live tail and inspect views, and small enough that
 *   simulator volume can never again crowd out the paper record.
 * - Everything else (decision_id null: evaluation summaries, engine
 *   and mode events) is a ring of the most recent RECENT_CAP
 *   (1,000). The simulator cannot flood this class — every simulator
 *   event carries a decision_id, so sim traffic lands in the sim
 *   decision ring above, never here.
 *
 * Why Phase 11 exists (the v14 premise that failed): Phase 6 split
 * decisions from non-decisions on the assumption that "simulator
 * chatter carries no decision_id". It does — the simulator mints a
 * decision id for every event it emits, so the 5,000-deep decision
 * pool filled with simulator output (a live census found ≈2,498
 * Wesley + ≈2,496 PolyCrypt9000 mentions — the whole window) and
 * real paper decisions were evicted within about a day. The split
 * has to happen INSIDE the decision class, by which kind of runner
 * produced the decision.
 *
 * Classification follows the producing runner — i.e. the bot's mode
 * at decision time — never a bot-name list. The signal is the
 * decision_id itself, which the emitting runner mints at decision
 * time and which is therefore already present, identically, in live
 * events and in every stored record (including pre-v19 files, which
 * is what makes the boot migration below possible):
 * - Real-data runners (engine paper.ts / snapback.ts / vega.ts) mint
 *   `<codename>-<counter>` (e.g. "snapback-17").
 * - The simulator (engine sim.ts) mints a bare counter ("4815").
 * A codename-prefixed id classifies PROTECTED; a bare counter — or
 * any unrecognized shape — classifies SIM (the expendable class is
 * the safe default). Because the class is stamped by the runner at
 * mint time, a bot's decisions change class automatically the day
 * its runner changes: when Wesley someday trades through a real
 * runner, his decisions arrive codename-prefixed and are protected
 * with no code change here. Stored events are never reclassified
 * after the fact — except by the one-time v1→v2 boot migration,
 * which applies this same rule to the stored ids.
 */
export const PROTECTED_DECISION_CAP = 5000;
export const SIM_DECISION_CAP = 1000;
export const RECENT_CAP = 1000;
/** How often the dirty flag is flushed to disk in the background. */
export const FLUSH_INTERVAL_MS = 2000;

export type StoredEvent = FleetEvent & { seq: number };

export interface EventHistorySnapshot {
  /** Highest sequence number assigned so far (0 when empty). */
  latestSeq: number;
  /** All retained events, newest first. */
  events: StoredEvent[];
}

export interface EventHistoryCounts {
  protectedDecisions: number;
  simDecisions: number;
  other: number;
  total: number;
}

/** Which retention class a decision event belongs to. */
export type DecisionClass = "protected" | "sim";

const RUNNER_ID_PATTERN = /^(.+)-(\d+)$/;

/**
 * Classify one decision event by the runner that produced it, from
 * its decision_id (see the header comment). Anything unrecognized —
 * including a null id, which never reaches the decision classes —
 * defaults to the expendable SIM class.
 */
export function classifyDecisionEvent(event: {
  decision_id: string | null;
}): DecisionClass {
  const id = event.decision_id;
  if (id === null) return "sim";
  const match = RUNNER_ID_PATTERN.exec(id);
  if (match && !/^\d+$/.test(match[1]!)) return "protected";
  return "sim";
}

interface PersistedHistoryV2 {
  version: 2;
  nextSeq: number;
  protected: StoredEvent[];
  sim: StoredEvent[];
  recent: StoredEvent[];
}

/** The v1 (Phase 6–10) on-disk shape, read only for migration. */
interface PersistedHistoryV1 {
  version: 1;
  nextSeq: number;
  decisions: StoredEvent[];
  recent: StoredEvent[];
}

function isStoredEvent(value: unknown): value is StoredEvent {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Partial<StoredEvent>;
  return (
    typeof e.seq === "number" &&
    typeof e.bot === "string" &&
    typeof e.type === "string" &&
    typeof e.ts === "string" &&
    typeof e.reason === "string" &&
    (typeof e.decision_id === "string" || e.decision_id === null)
  );
}

export class EventHistoryStore {
  private readonly path: string;
  private protectedDecisions: StoredEvent[] = [];
  private simDecisions: StoredEvent[] = [];
  private recent: StoredEvent[] = [];
  private nextSeq = 1;
  private dirty = false;
  private flushTimer: NodeJS.Timeout | null = null;
  /**
   * One-line description of the v1→v2 boot migration, when this boot
   * performed one (also logged at load). Null on a normal v2 load.
   */
  readonly migrationReport: string | null;

  constructor(path: string) {
    this.path = path;
    this.migrationReport = this.load();
    this.flushTimer = setInterval(() => {
      if (this.dirty) this.flush();
    }, FLUSH_INTERVAL_MS);
    // The API process owns this timer; never let it hold the event
    // loop open on its own (test harnesses and one-shot runs exit).
    this.flushTimer.unref();
  }

  /** Returns the migration report line, or null when no migration ran. */
  private load(): string | null {
    try {
      if (!existsSync(this.path)) return null;
      const parsed = JSON.parse(readFileSync(this.path, "utf8")) as
        | PersistedHistoryV2
        | PersistedHistoryV1;

      if (parsed.version === 2) {
        if (
          !Array.isArray(parsed.protected) ||
          !Array.isArray(parsed.sim) ||
          !Array.isArray(parsed.recent)
        ) {
          throw new Error("history buckets are not arrays");
        }
        // Stored events keep the class they were ingested under —
        // never reclassified on load. Just re-apply the caps.
        this.protectedDecisions = parsed.protected
          .filter(isStoredEvent)
          .slice(-PROTECTED_DECISION_CAP);
        this.simDecisions = parsed.sim
          .filter(isStoredEvent)
          .slice(-SIM_DECISION_CAP);
        this.recent = parsed.recent.filter(isStoredEvent).slice(-RECENT_CAP);
        this.restoreNextSeq(parsed.nextSeq);
        return null;
      }

      if (parsed.version === 1) {
        if (!Array.isArray(parsed.decisions) || !Array.isArray(parsed.recent)) {
          throw new Error("history buckets are not arrays");
        }
        // Boot migration (Phase 11): the v1 file holds ONE shared
        // decision pool. Re-bucket every stored decision under the
        // classification rule (the ids carry their producing runner,
        // so this is exact, not a guess), applying the new caps per
        // class. On a live file this compacts ~5,000 simulator
        // decisions into the 1,000-deep sim ring; protected records
        // that fit their cap are all kept.
        const stored = parsed.decisions.filter(isStoredEvent);
        const protectedAll = stored.filter(
          (e) => classifyDecisionEvent(e) === "protected",
        );
        const simAll = stored.filter(
          (e) => classifyDecisionEvent(e) === "sim",
        );
        this.protectedDecisions = protectedAll.slice(-PROTECTED_DECISION_CAP);
        this.simDecisions = simAll.slice(-SIM_DECISION_CAP);
        this.recent = parsed.recent.filter(isStoredEvent).slice(-RECENT_CAP);
        this.restoreNextSeq(parsed.nextSeq);
        const dropped =
          stored.length -
          this.protectedDecisions.length -
          this.simDecisions.length;
        const report =
          `[history] migrated v1 event history at ${this.path}: ` +
          `${stored.length} stored decisions re-bucketed → ` +
          `${this.protectedDecisions.length} protected (cap ${PROTECTED_DECISION_CAP}) + ` +
          `${this.simDecisions.length} sim (cap ${SIM_DECISION_CAP}); ` +
          `${dropped} over-cap decisions dropped; ` +
          `${this.recent.length} other events retained; ` +
          `file upgrades to v2 on next flush`;
        console.log(report);
        // Rewrite the file in v2 shape promptly, even if no new
        // event arrives to trigger a decision flush.
        this.dirty = true;
        return report;
      }

      throw new Error(`unsupported version ${String(parsed.version)}`);
    } catch (err) {
      // A corrupt history file must never wedge the API: start with
      // an empty history and say so loudly (same rule as ModeStore).
      console.error(
        `[history] could not load ${this.path} — starting with an empty event history:`,
        err instanceof Error ? err.message : err,
      );
      this.protectedDecisions = [];
      this.simDecisions = [];
      this.recent = [];
      this.nextSeq = 1;
      return null;
    }
  }

  /** The sequence must stay monotonic across restarts: continue from
   *  the persisted counter, but never below a stored seq. */
  private restoreNextSeq(persisted: unknown): void {
    const maxStored = Math.max(
      0,
      ...this.protectedDecisions.map((e) => e.seq),
      ...this.simDecisions.map((e) => e.seq),
      ...this.recent.map((e) => e.seq),
    );
    this.nextSeq = Math.max(
      typeof persisted === "number" && persisted > 0 ? persisted : 1,
      maxStored + 1,
    );
  }

  /** Persist now if anything changed since the last write. */
  flush(): void {
    if (!this.dirty) return;
    const data: PersistedHistoryV2 = {
      version: 2,
      nextSeq: this.nextSeq,
      protected: this.protectedDecisions,
      sim: this.simDecisions,
      recent: this.recent,
    };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data));
      renameSync(tmp, this.path);
      this.dirty = false;
    } catch (err) {
      // Keep the dirty flag set — the background flusher retries.
      console.error(
        `[history] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  /**
   * Ingest one engine event: stamp the next sequence number, retain
   * it under the three-class policy, and return the stamped event
   * (the exact object the caller broadcasts and history serves).
   */
  append(event: FleetEvent): StoredEvent {
    const stored: StoredEvent = { ...event, seq: this.nextSeq };
    this.nextSeq += 1;
    if (stored.decision_id !== null) {
      const bucket =
        classifyDecisionEvent(stored) === "protected"
          ? this.protectedDecisions
          : this.simDecisions;
      const cap =
        bucket === this.protectedDecisions
          ? PROTECTED_DECISION_CAP
          : SIM_DECISION_CAP;
      bucket.push(stored);
      if (bucket.length > cap) {
        bucket.splice(0, bucket.length - cap);
      }
      // Decision records are the point of this store: persist them
      // immediately rather than waiting for the background flusher.
      this.dirty = true;
      this.flush();
    } else {
      this.recent.push(stored);
      if (this.recent.length > RECENT_CAP) {
        this.recent.splice(0, this.recent.length - RECENT_CAP);
      }
      this.dirty = true;
    }
    return stored;
  }

  /** Highest sequence number assigned so far (0 when empty). */
  latestSeq(): number {
    return this.nextSeq - 1;
  }

  /** Per-class retained counts, for boot logs and diagnostics. */
  get counts(): EventHistoryCounts {
    const protectedDecisions = this.protectedDecisions.length;
    const simDecisions = this.simDecisions.length;
    const other = this.recent.length;
    return {
      protectedDecisions,
      simDecisions,
      other,
      total: protectedDecisions + simDecisions + other,
    };
  }

  /** Retained size, for boot logs and diagnostics. */
  get size(): number {
    return this.counts.total;
  }

  /** All retained events merged by sequence, newest first. */
  snapshot(): EventHistorySnapshot {
    const events = [
      ...this.protectedDecisions,
      ...this.simDecisions,
      ...this.recent,
    ].sort((a, b) => b.seq - a.seq);
    return { latestSeq: this.latestSeq(), events };
  }

  /** Stop the background flusher (tests / graceful shutdown). */
  close(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    this.flush();
  }
}
