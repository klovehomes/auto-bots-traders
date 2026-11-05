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
 * (Phase 6, the "truth patch").
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
 * Retention (two classes, deliberately NOT one flat ring):
 * - Decision events (decision_id non-null — every paper bot's
 *   signals, gate verdicts and the trades linked to them) are kept
 *   up to the most recent DECISION_CAP (5,000). At the fleet's real
 *   rate (tens of decisions a day) that is effectively "every
 *   decision for many months".
 * - Everything else (overwhelmingly simulator chatter, which carries
 *   no decision_id) is a ring of the most recent RECENT_CAP (1,000)
 *   — plenty for the live activity tail and the inspect views.
 * A single flat 5,000-event ring would let one busy simulator day
 * evict the whole day's paper decisions; the two-class split makes
 * that impossible while keeping total storage bounded (≤ 6,000
 * records, a couple of MB of JSON).
 */
export const DECISION_CAP = 5000;
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

interface PersistedHistory {
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
  private decisions: StoredEvent[] = [];
  private recent: StoredEvent[] = [];
  private nextSeq = 1;
  private dirty = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(path: string) {
    this.path = path;
    this.load();
    this.flushTimer = setInterval(() => {
      if (this.dirty) this.flush();
    }, FLUSH_INTERVAL_MS);
    // The API process owns this timer; never let it hold the event
    // loop open on its own (test harnesses and one-shot runs exit).
    this.flushTimer.unref();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedHistory;
      if (parsed.version !== 1) {
        throw new Error(`unsupported version ${String(parsed.version)}`);
      }
      if (!Array.isArray(parsed.decisions) || !Array.isArray(parsed.recent)) {
        throw new Error("history buckets are not arrays");
      }
      const decisions = parsed.decisions.filter(isStoredEvent);
      const recent = parsed.recent.filter(isStoredEvent);
      // Never trust the file's caps — re-apply retention on load.
      this.decisions = decisions.slice(-DECISION_CAP);
      this.recent = recent.slice(-RECENT_CAP);
      const maxStored = Math.max(
        0,
        ...this.decisions.map((e) => e.seq),
        ...this.recent.map((e) => e.seq),
      );
      // The sequence must stay monotonic across restarts: continue
      // from the persisted counter, but never below a stored seq.
      this.nextSeq = Math.max(
        typeof parsed.nextSeq === "number" && parsed.nextSeq > 0
          ? parsed.nextSeq
          : 1,
        maxStored + 1,
      );
    } catch (err) {
      // A corrupt history file must never wedge the API: start with
      // an empty history and say so loudly (same rule as ModeStore).
      console.error(
        `[history] could not load ${this.path} — starting with an empty event history:`,
        err instanceof Error ? err.message : err,
      );
      this.decisions = [];
      this.recent = [];
      this.nextSeq = 1;
    }
  }

  /** Persist now if anything changed since the last write. */
  flush(): void {
    if (!this.dirty) return;
    const data: PersistedHistory = {
      version: 1,
      nextSeq: this.nextSeq,
      decisions: this.decisions,
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
   * it under the two-class policy, and return the stamped event (the
   * exact object the caller broadcasts and history serves).
   */
  append(event: FleetEvent): StoredEvent {
    const stored: StoredEvent = { ...event, seq: this.nextSeq };
    this.nextSeq += 1;
    if (stored.decision_id !== null) {
      this.decisions.push(stored);
      if (this.decisions.length > DECISION_CAP) {
        this.decisions.splice(0, this.decisions.length - DECISION_CAP);
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

  /** Retained size, for boot logs and diagnostics. */
  get size(): number {
    return this.decisions.length + this.recent.length;
  }

  /** All retained events merged by sequence, newest first. */
  snapshot(): EventHistorySnapshot {
    const events = [...this.decisions, ...this.recent].sort(
      (a, b) => b.seq - a.seq,
    );
    return { latestSeq: this.latestSeq(), events };
  }

  /** Stop the background flusher (tests / graceful shutdown). */
  close(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    this.flush();
  }
}
