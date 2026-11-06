import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

/**
 * Risk Gate control state — the single source of truth for "this bot is
 * killed" (PLAN.md, "Kill switch and emergency controls").
 *
 * The API owns this state; every surface (web UI today, the bot-control
 * MCP later) reads and mutates it through the API, never around it.
 *
 * Semantics:
 * - kill:            the bot halts NOW — no new evaluations or orders.
 *                    Positions stay open. The halt PERSISTS across
 *                    restarts (this file) until a deliberate resume.
 * - kill-liquidate:  the same halt PLUS the engine closes every tracked
 *                    open position for the affected bot(s). The engine
 *                    owns the position book, so liquidation is a
 *                    handshake: the API records a pending request here,
 *                    the engine consumes it, performs the forced closes
 *                    (normal close events with a "KILL + LIQUIDATE · "
 *                    reason prefix) and posts a report back. Positions
 *                    that cannot be closed are named in the report —
 *                    never silently dropped.
 * - resume:          deliberate re-enable.
 *
 * Every action that changes state is appended to the audit log (also
 * persisted) and broadcast to dashboards over the WebSocket.
 */

export type ControlAction = "kill" | "kill-liquidate" | "resume";
export type ControlScope = "bot" | "fleet";

export interface LiquidationClose {
  /** Bot codename the position belonged to (matters for fleet reports). */
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

export interface LiquidationReport {
  status: "pending" | "complete";
  closed: LiquidationClose[];
  failed: LiquidationFailure[];
}

export interface AuditEntry {
  id: string;
  /** ISO-8601 timestamp. */
  ts: string;
  scope: ControlScope;
  /** Bot codename for scope="bot"; null for fleet actions. */
  target: string | null;
  action: ControlAction;
  /** Who triggered it: "web-ui" (this build), later "mcp", "breaker"… */
  source: string;
  /** Codenames this action actually affected (halt set/cleared, or a
   *  liquidation was requested for them). Empty = no-op repeat. */
  changed: string[];
  /** Present on kill-liquidate entries; filled in when the engine's
   *  liquidation report lands. */
  liquidation?: LiquidationReport;
}

export interface BotControl {
  halted: boolean;
  haltedAt: string | null;
}

export interface PendingLiquidation {
  id: string;
  codename: string;
  /** Audit entry this liquidation belongs to (bot or fleet entry). */
  auditId: string;
  requestedAt: string;
}

export interface ControlPublicState {
  bots: Record<string, BotControl & { pendingLiquidate: boolean }>;
  anyHalted: boolean;
  allHalted: boolean;
  /** Newest-first, capped. */
  audit: AuditEntry[];
}

/** Full state for the engine (internal endpoint only). */
export interface ControlInternalState {
  bots: Record<string, BotControl>;
  pending: PendingLiquidation[];
}

interface PersistedState {
  version: 1;
  bots: Record<string, BotControl>;
  pending: PendingLiquidation[];
  audit: AuditEntry[];
}

const AUDIT_CAP = 200;
const AUDIT_PUBLIC = 50;

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.floor(
    Math.random() * 1e6,
  ).toString(36)}`;
}

export class ControlStore {
  private readonly path: string;
  private readonly codenames: string[];
  private bots: Record<string, BotControl> = {};
  private pending: PendingLiquidation[] = [];
  private audit: AuditEntry[] = [];
  private waiters = new Map<string, Set<() => void>>();

  constructor(path: string, codenames: string[]) {
    this.path = path;
    this.codenames = codenames;
    for (const codename of codenames) {
      this.bots[codename] = { halted: false, haltedAt: null };
    }
    this.load();
  }

  hasBot(codename: string): boolean {
    return codename in this.bots;
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedState;
      if (parsed.version !== 1) return;
      for (const codename of this.codenames) {
        const saved = parsed.bots?.[codename];
        if (saved) {
          this.bots[codename] = {
            halted: Boolean(saved.halted),
            haltedAt: saved.haltedAt ?? null,
          };
        }
      }
      this.pending = Array.isArray(parsed.pending) ? parsed.pending : [];
      this.audit = Array.isArray(parsed.audit) ? parsed.audit : [];
    } catch (err) {
      // A corrupt state file must never wedge the fleet: fall back to
      // all-active and say so loudly. (Halts are safety state; the
      // operator re-issues them from the dashboard if this ever fires.)
      console.error(
        `[control] could not load ${this.path} — starting all-active:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  private save(): void {
    const data: PersistedState = {
      version: 1,
      bots: this.bots,
      pending: this.pending,
      audit: this.audit.slice(-AUDIT_CAP),
    };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data, null, 2));
      renameSync(tmp, this.path);
    } catch (err) {
      console.error(
        `[control] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  publicState(): ControlPublicState {
    const bots: ControlPublicState["bots"] = {};
    let haltedCount = 0;
    for (const codename of this.codenames) {
      const b = this.bots[codename]!;
      if (b.halted) haltedCount += 1;
      bots[codename] = {
        ...b,
        pendingLiquidate: this.pending.some((p) => p.codename === codename),
      };
    }
    return {
      bots,
      anyHalted: haltedCount > 0,
      allHalted: this.codenames.length > 0 && haltedCount === this.codenames.length,
      audit: [...this.audit].slice(-AUDIT_PUBLIC).reverse(),
    };
  }

  internalState(): ControlInternalState {
    return {
      bots: Object.fromEntries(
        Object.entries(this.bots).map(([k, v]) => [k, { ...v }]),
      ),
      pending: this.pending.map((p) => ({ ...p })),
    };
  }

  private appendAudit(entry: AuditEntry): AuditEntry {
    this.audit.push(entry);
    if (this.audit.length > AUDIT_CAP) {
      this.audit = this.audit.slice(-AUDIT_CAP);
    }
    this.save();
    return entry;
  }

  private setHalted(codename: string, halted: boolean): boolean {
    const b = this.bots[codename];
    if (!b || b.halted === halted) return false;
    b.halted = halted;
    b.haltedAt = halted ? new Date().toISOString() : null;
    return true;
  }

  /**
   * Apply one action. Returns the audit entry, or null when the action
   * was a no-op repeat (e.g. killing an already-halted bot without a
   * liquidation) — no-ops are not audit-logged.
   */
  applyBotAction(
    codename: string,
    action: ControlAction,
    source: string,
  ): AuditEntry | null {
    if (!this.hasBot(codename)) return null;
    const now = new Date().toISOString();

    if (action === "resume") {
      // Resuming also cancels a not-yet-executed liquidation request for
      // the bot: resume means "trade again", unambiguously.
      const hadPending = this.pending.some((p) => p.codename === codename);
      this.pending = this.pending.filter((p) => p.codename !== codename);
      if (!this.setHalted(codename, false) && !hadPending) return null;
      return this.appendAudit({
        id: newId("audit"),
        ts: now,
        scope: "bot",
        target: codename,
        action,
        source,
        changed: [codename],
      });
    }

    // kill / kill-liquidate
    const changedHalt = this.setHalted(codename, true);
    let liquidation: LiquidationReport | undefined;
    if (action === "kill-liquidate") {
      const auditId = newId("audit");
      this.pending.push({
        id: newId("liq"),
        codename,
        auditId,
        requestedAt: now,
      });
      liquidation = { status: "pending", closed: [], failed: [] };
      return this.appendAudit({
        id: auditId,
        ts: now,
        scope: "bot",
        target: codename,
        action,
        source,
        changed: [codename],
        liquidation,
      });
    }
    if (!changedHalt) return null;
    return this.appendAudit({
      id: newId("audit"),
      ts: now,
      scope: "bot",
      target: codename,
      action,
      source,
      changed: [codename],
    });
  }

  /** Fleet-wide action: applies to every bot; one audit entry. */
  applyFleetAction(
    action: ControlAction,
    source: string,
  ): AuditEntry | null {
    const now = new Date().toISOString();

    if (action === "resume") {
      const hadPending = this.pending.length > 0;
      this.pending = [];
      const changed = this.codenames.filter((c) => this.setHalted(c, false));
      if (changed.length === 0 && !hadPending) return null;
      return this.appendAudit({
        id: newId("audit"),
        ts: now,
        scope: "fleet",
        target: null,
        action,
        source,
        changed: changed.length > 0 ? changed : [...this.codenames],
      });
    }

    if (action === "kill-liquidate") {
      const auditId = newId("audit");
      for (const codename of this.codenames) {
        this.setHalted(codename, true);
        this.pending.push({
          id: newId("liq"),
          codename,
          auditId,
          requestedAt: now,
        });
      }
      return this.appendAudit({
        id: auditId,
        ts: now,
        scope: "fleet",
        target: null,
        action,
        source,
        changed: [...this.codenames],
        liquidation: { status: "pending", closed: [], failed: [] },
      });
    }

    // fleet kill
    const changed = this.codenames.filter((c) => this.setHalted(c, true));
    if (changed.length === 0) return null;
    return this.appendAudit({
      id: newId("audit"),
      ts: now,
      scope: "fleet",
      target: null,
      action,
      source,
      changed,
    });
  }

  /**
   * The engine reports back the result of one pending liquidation.
   * Results accumulate into the owning audit entry (a fleet entry can
   * collect up to one report per bot); the entry completes when its
   * last pending request is reported. Returns the updated entry.
   */
  completeLiquidation(
    pendingId: string,
    closed: LiquidationClose[],
    failed: LiquidationFailure[],
  ): AuditEntry | null {
    const idx = this.pending.findIndex((p) => p.id === pendingId);
    if (idx < 0) return null;
    const [req] = this.pending.splice(idx, 1);
    const entry = this.audit.find((e) => e.id === req!.auditId);
    if (!entry || !entry.liquidation) {
      this.save();
      return null;
    }
    entry.liquidation.closed.push(...closed);
    entry.liquidation.failed.push(...failed);
    if (!this.pending.some((p) => p.auditId === entry.id)) {
      entry.liquidation.status = "complete";
    }
    this.save();
    const waiters = this.waiters.get(entry.id);
    if (waiters && entry.liquidation.status === "complete") {
      this.waiters.delete(entry.id);
      for (const wake of waiters) wake();
    }
    return entry;
  }

  /**
   * Resolve once the given audit entry's liquidation completes, or
   * after `timeoutMs` (whichever first). Used so a kill-liquidate POST
   * can answer with the actual liquidation report in the common case
   * (the engine polls every second in sim mode).
   */
  async waitForLiquidation(
    auditId: string,
    timeoutMs: number,
  ): Promise<AuditEntry | null> {
    const entry = this.audit.find((e) => e.id === auditId);
    if (!entry) return null;
    if (!entry.liquidation || entry.liquidation.status === "complete") {
      return entry;
    }
    await new Promise<void>((resolve) => {
      const set = this.waiters.get(auditId) ?? new Set<() => void>();
      const wake = (): void => {
        clearTimeout(timer);
        set.delete(wake);
        resolve();
      };
      const timer = setTimeout(() => {
        set.delete(wake);
        resolve();
      }, timeoutMs);
      set.add(wake);
      this.waiters.set(auditId, set);
    });
    return this.audit.find((e) => e.id === auditId) ?? null;
  }
}
