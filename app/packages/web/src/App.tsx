import { useEffect, useMemo, useRef, useState } from "react";
import type { BotConfig, FleetEvent, FleetMode } from "@fleet/shared/types";
import {
  Landscape,
  type EffectEvent,
  type InspectAnchor,
  type InspectControl,
} from "./Landscape.js";
import { Leaderboard } from "./Leaderboard.js";
import { BotAvatar } from "./avatars.js";
import {
  computeStats,
  computeTotals,
  fmtMoney,
  fmtTime,
  fmtTimeFull,
  type BotStats,
} from "./fleetState.js";

type WsStatus = "connecting" | "connected" | "disconnected";
type MainTab = "landscape" | "leaderboard";
type FeedTab = "trades" | "decisions";

// --- Kill switch (Risk Gate control state, owned by the API) -----------
export interface LiquidationReport {
  status: "pending" | "complete";
  closed: {
    codename: string;
    symbol: string;
    qty: number | null;
    price: number | null;
    pnl: number | null;
  }[];
  failed: { codename: string; symbol: string; reason: string }[];
}

export interface AuditEntry {
  id: string;
  ts: string;
  scope: "bot" | "fleet";
  /** Bot codename for scope="bot"; null for fleet actions. */
  target: string | null;
  action: "kill" | "kill-liquidate" | "resume";
  source: string;
  changed: string[];
  liquidation?: LiquidationReport;
}

export interface ControlState {
  bots: Record<
    string,
    { halted: boolean; haltedAt: string | null; pendingLiquidate: boolean }
  >;
  anyHalted: boolean;
  allHalted: boolean;
  audit: AuditEntry[];
}

interface ControlMessage {
  kind: "control";
  ts: string;
  state: ControlState;
  entry: AuditEntry | null;
}

/** Human one-liner for a control action, used by the trade-stream
 *  system rows and the feed-bar preview. */
export function describeControl(
  entry: AuditEntry,
  nameFor: (codename: string) => string,
): string {
  const liq = entry.liquidation;
  const liqText =
    entry.action !== "kill-liquidate"
      ? ""
      : !liq || liq.status === "pending"
        ? " — liquidating…"
        : ` — ${liq.closed.length} position${liq.closed.length === 1 ? "" : "s"} closed` +
          (liq.failed.length > 0
            ? ` · ${liq.failed.length} could not be closed`
            : "");
  if (entry.scope === "fleet") {
    if (entry.action === "kill") return "⛔⛔ TEAM KILL — all bots halted";
    if (entry.action === "resume") return "▶▶ TEAM RESUMED — all bots trading";
    return `⛔⛔ TEAM KILL + LIQUIDATE${liqText}`;
  }
  const name = entry.target ? nameFor(entry.target) : "Bot";
  if (entry.action === "kill") return `⛔ ${name} KILLED — trading halted`;
  if (entry.action === "resume") return `▶ ${name} resumed`;
  return `⛔ ${name} KILL + LIQUIDATE${liqText}`;
}

const API_BASE = `http://${window.location.hostname}:8080`;
const EVENTS_URL = `ws://${window.location.hostname}:8080/events`;
const MAX_EVENTS = 400;

const params = new URLSearchParams(window.location.search);

export function App() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [botsError, setBotsError] = useState<string | null>(null);
  const [mode, setMode] = useState<FleetMode | null>(null);
  const [status, setStatus] = useState<WsStatus>("connecting");
  const [events, setEvents] = useState<FleetEvent[]>([]);
  const [tab, setTab] = useState<MainTab>(
    params.get("tab") === "leaderboard" ? "leaderboard" : "landscape",
  );
  const [feedOpen, setFeedOpen] = useState(params.get("feed") === "open");
  const [feedTab, setFeedTab] = useState<FeedTab>("trades");
  const [botFilter, setBotFilter] = useState<string>("all");
  const [selected, setSelected] = useState<FleetEvent | null>(null);
  const [highlightDecision, setHighlightDecision] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  // Building inspect dialog (hover/tap a building in the landscape):
  // which bot is open and whether it was pinned open by a tap/click.
  const [inspect, setInspect] = useState<{ name: string; pinned: boolean } | null>(
    null,
  );
  // Kill switch: the API-owned control state (halts + audit tail) and
  // the audit entries rendered as system rows in the trade stream.
  const [control, setControl] = useState<ControlState | null>(null);
  const [controlLog, setControlLog] = useState<AuditEntry[]>([]);
  const [controlBusy, setControlBusy] = useState(false);
  // Arm switch (Keith, 2026-11-01): a client-side safety interlock in
  // the kill bar. While DISARMED (the default, and never persisted),
  // every Kill / Kill + liquidate button — kill bar and per-bot
  // dialog — is inactive. Arming is deliberate, and the switch drops
  // back to disarmed after any kill action fires. Resume is never
  // gated: restarting a halted bot is a recovery action, not a hazard.
  const [killArmed, setKillArmed] = useState(false);
  // Liquidate confirmation (any scope) — set when a liquidate is
  // requested, cleared on cancel/confirm.
  const [confirmLiquidate, setConfirmLiquidate] = useState<{
    scope: "bot" | "fleet";
    codename?: string;
    label: string;
    positions: number;
  } | null>(null);

  const effectsRef = useRef<EffectEvent[]>([]);
  const statsRef = useRef(computeStats([], []));
  const inspectAnchorRef = useRef<InspectAnchor | null>(null);
  const inspectControlRef = useRef<InspectControl | null>(null);
  /** Bot NAMES currently halted — the landscape reads this every frame. */
  const haltedRef = useRef<Set<string>>(new Set());

  function dismissInspect(): void {
    inspectControlRef.current?.dismiss();
    setInspect(null);
  }

  // Escape closes the inspect dialog.
  useEffect(() => {
    if (!inspect) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") dismissInspect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspect]);

  const botByName = useMemo(() => new Map(bots.map((b) => [b.name, b])), [bots]);
  const botByCodename = useMemo(
    () => new Map(bots.map((b) => [b.codename, b])),
    [bots],
  );
  const stats = useMemo(() => computeStats(bots, events), [bots, events]);
  const totals = useMemo(() => computeTotals(events), [events]);
  const nameForCodename = (codename: string): string =>
    botByCodename.get(codename)?.name ?? codename;
  /** Names of bots whose kill switch is engaged right now. */
  const haltedNames = useMemo(() => {
    const set = new Set<string>();
    if (control) {
      for (const [codename, b] of Object.entries(control.bots)) {
        if (b.halted) {
          const bot = botByCodename.get(codename);
          if (bot) set.add(bot.name);
        }
      }
    }
    return set;
  }, [control, botByCodename]);

  useEffect(() => {
    haltedRef.current = haltedNames;
  }, [haltedNames]);

  /** Merge an audit entry into the stream's control log (insert new,
   *  or replace in place when a liquidation report completes it). */
  function mergeAuditEntry(entry: AuditEntry): void {
    setControlLog((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [entry, ...prev].slice(0, 100);
    });
  }

  /** Fire one control action at the API; the response carries the fresh
   *  state (and, for liquidations, the report), and the same change is
   *  broadcast over the WebSocket to every other open dashboard. */
  async function postControl(path: string): Promise<void> {
    setControlBusy(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
      const data = (await res.json()) as {
        state?: ControlState;
        entry?: AuditEntry | null;
      };
      if (data.state) setControl(data.state);
      if (data.entry) mergeAuditEntry(data.entry);
    } catch {
      // The WebSocket broadcast / next /control fetch reconciles state;
      // a failed POST simply leaves the previous state on screen.
    } finally {
      setControlBusy(false);
    }
  }

  // Kill actions are gated by the arm switch (defense in depth: the
  // buttons are disabled while disarmed, and the handlers refuse too).
  // Each fired kill action consumes the arm — the switch must be
  // flipped again for the next one.
  const killBot = (codename: string): void => {
    if (!killArmed) return;
    setKillArmed(false);
    void postControl(`/control/bots/${codename}/kill`);
  };
  const resumeBot = (codename: string): void =>
    void postControl(`/control/bots/${codename}/resume`);
  const killFleet = (): void => {
    if (!killArmed) return;
    setKillArmed(false);
    void postControl(`/control/fleet/kill`);
  };
  const resumeFleet = (): void => void postControl(`/control/fleet/resume`);

  /** Liquidate always goes through the confirmation modal first. */
  function askLiquidateBot(bot: BotConfig): void {
    if (!killArmed) return;
    const s = stats.get(bot.name);
    setConfirmLiquidate({
      scope: "bot",
      codename: bot.codename,
      label: bot.name,
      positions: s ? s.openPositions.length : 0,
    });
  }
  function askLiquidateFleet(): void {
    if (!killArmed) return;
    let positions = 0;
    for (const s of stats.values()) positions += s.openPositions.length;
    setConfirmLiquidate({
      scope: "fleet",
      label: "ALL BOTS",
      positions,
    });
  }
  function confirmLiquidateNow(): void {
    const c = confirmLiquidate;
    if (!c || !killArmed) return;
    setConfirmLiquidate(null);
    setKillArmed(false);
    void postControl(
      c.scope === "fleet"
        ? `/control/fleet/kill-liquidate`
        : `/control/bots/${c.codename}/kill-liquidate`,
    );
  }
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/health`)
      .then((res) => res.json() as Promise<{ ok: boolean; mode?: FleetMode }>)
      .then((data) => {
        if (!cancelled) setMode(data.mode ?? null);
      })
      .catch(() => {
        // Health badge is best-effort; the bots fetch below reports errors.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/bots`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<BotConfig[]>;
      })
      .then((data) => {
        if (!cancelled) setBots(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBotsError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/control`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ControlState>;
      })
      .then((data) => {
        if (cancelled) return;
        setControl(data);
        // The audit tail seeds the trade stream's system rows.
        setControlLog([...data.audit].slice(0, 100));
      })
      .catch(() => {
        // Kill-switch state is best-effort on load; the WS broadcast
        // delivers it live as soon as any action happens.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(EVENTS_URL);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");
    ws.onmessage = (message) => {
      try {
        const parsed = JSON.parse(String(message.data)) as
          | FleetEvent
          | ControlMessage;
        if ((parsed as ControlMessage).kind === "control") {
          const msg = parsed as ControlMessage;
          setControl(msg.state);
          if (msg.entry) mergeAuditEntry(msg.entry);
          return;
        }
        const event = parsed as FleetEvent;
        if (event.type === "close" && event.pnl !== null && event.pnl !== 0) {
          effectsRef.current.push({
            bot: event.bot,
            kind: event.pnl > 0 ? "win" : "loss",
            ts: Date.now(),
          });
        } else if (event.type === "open") {
          effectsRef.current.push({ bot: event.bot, kind: "open", ts: Date.now() });
        }
        setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
      } catch {
        // Ignore malformed frames; the stream is internal and typed.
      }
    };
    return () => ws.close();
  }, []);

  const filteredEvents =
    botFilter === "all" ? events : events.filter((e) => e.bot === botFilter);
  const tradeEvents = filteredEvents.filter(
    (e) => e.type === "open" || e.type === "close",
  );
  const latest = events[0];

  // Kill-switch actions render as system rows interleaved into the
  // trade list by timestamp. They live in their own state array and are
  // merged only at render time — they never enter the PnL math in
  // fleetState (computeStats/computeTotals see trade events only).
  const visibleControl = controlLog.filter(
    (e) =>
      botFilter === "all" ||
      e.scope === "fleet" ||
      nameForCodename(e.target ?? "") === botFilter,
  );
  type FeedRow =
    | { kind: "trade"; ts: string; event: FleetEvent }
    | { kind: "control"; ts: string; entry: AuditEntry };
  const feedRows: FeedRow[] = [
    ...tradeEvents.map(
      (event): FeedRow => ({ kind: "trade", ts: event.ts, event }),
    ),
    ...visibleControl.map(
      (entry): FeedRow => ({ kind: "control", ts: entry.ts, entry }),
    ),
  ].sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));

  const latestControl = controlLog[0];
  const latestIsControl =
    latestControl && (!latest || latestControl.ts >= latest.ts);

  function openDecision(event: FleetEvent): void {
    setSelected(event);
    setHighlightDecision(event.decision_id);
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Trader Bot Landscape</h1>
          <p className="subtitle">
            Five bots, one valley — live paper-trading visualization.
          </p>
        </div>
        <div className="header-badges">
          <span className={`ws-status ws-${status}`}>
            <span className="dot" /> WebSocket: {status}
          </span>
          {mode && (
            <span className={`mode-badge mode-${mode}`} role="status">
              {mode === "sim"
                ? "SIMULATED DATA"
                : mode === "paper"
                  ? "PAPER TRADING"
                  : "LIVE — CONNECTED ACCOUNTS"}
            </span>
          )}
        </div>
      </header>

      {botsError && <p className="error">Could not load bots: {botsError}</p>}

      <section className="totals-bar" aria-label="Trader bot realized totals">
        <div className="total">
          <span className="total-label">Realized profits</span>
          <span className="total-value pnl-pos">{fmtMoney(totals.profits)}</span>
        </div>
        <div className="total">
          <span className="total-label">Realized losses</span>
          <span className="total-value pnl-neg">{fmtMoney(-totals.losses)}</span>
        </div>
        <div className="total">
          <span className="total-label">Net realized</span>
          <span className={`total-value ${totals.net >= 0 ? "pnl-pos" : "pnl-neg"}`}>
            {fmtMoney(totals.net, true)}
          </span>
        </div>
        <div className="total total-meta">
          <span className="total-label">Closed trades seen</span>
          <span className="total-value">{totals.closes}</span>
        </div>
      </section>

      <section
        className={`control-bar${killArmed ? " armed" : ""}`}
        aria-label="Kill switch controls"
      >
        <div className="control-status">
          <span className="control-title">⛔ Kill switch</span>
          <span className="control-state">
            {control === null
              ? "state unavailable"
              : control.allHalted
                ? "ALL BOTS HALTED"
                : control.anyHalted
                  ? `${haltedNames.size} of ${bots.length} bots halted`
                  : "all bots active"}
          </span>
        </div>
        <div className="control-arm">
          <button
            type="button"
            role="switch"
            aria-checked={killArmed}
            aria-label="Arm the kill buttons"
            className={`arm-switch${killArmed ? " on" : ""}`}
            onClick={() => setKillArmed((v) => !v)}
          >
            <span className="arm-knob" />
          </button>
          <span className="arm-label">
            {killArmed
              ? "Kill buttons ARMED — one action, then they lock again"
              : "Kill buttons locked — flip the switch to arm"}
          </span>
        </div>
        <div className="control-actions">
          {control?.anyHalted && (
            <button
              className="btn resume"
              onClick={resumeFleet}
              disabled={controlBusy}
            >
              ▶ Resume all
            </button>
          )}
          <button
            className="btn kill"
            onClick={killFleet}
            disabled={controlBusy || !control || control.allHalted || !killArmed}
          >
            ⛔ Kill all
          </button>
          <button
            className="btn kill-liq"
            onClick={askLiquidateFleet}
            disabled={controlBusy || !control || !killArmed}
          >
            ⛔ Kill + liquidate all
          </button>
        </div>
      </section>

      {control?.anyHalted && (
        <div className="halt-banner" role="alert">
          ⛔{" "}
          {control.allHalted
            ? "ALL BOTS HALTED — no bot is trading."
            : `Halted: ${[...haltedNames].join(", ")}.`}{" "}
          Halts persist across restarts until deliberately resumed.
        </div>
      )}

      <nav className="tabs" aria-label="Views">
        <button
          className={tab === "landscape" ? "tab active" : "tab"}
          onClick={() => setTab("landscape")}
        >
          Landscape
        </button>
        <button
          className={tab === "leaderboard" ? "tab active" : "tab"}
          onClick={() => setTab("leaderboard")}
        >
          Leaderboard
        </button>
      </nav>

      {tab === "landscape" ? (
        <section className="landscape-wrap" aria-label="Landscape">
          {webglFailed ? (
            <div className="landscape-fallback">
              <p>
                The 3D landscape needs WebGL, which this browser/device could
                not provide. The totals, leaderboard, and trade stream below
                are fully live without it.
              </p>
            </div>
          ) : bots.length === 0 ? (
            <div className="landscape-fallback">
              <p>Loading bots…</p>
            </div>
          ) : (
            <Landscape
              bots={bots}
              statsRef={statsRef}
              effectsRef={effectsRef}
              haltedRef={haltedRef}
              onUnavailable={() => setWebglFailed(true)}
              onInspect={(name, pinned) =>
                setInspect(name ? { name, pinned } : null)
              }
              inspectAnchorRef={inspectAnchorRef}
              inspectControlRef={inspectControlRef}
            />
          )}
        </section>
      ) : (
        <Leaderboard bots={bots} stats={stats} haltedNames={haltedNames} />
      )}

      <section className="feed" aria-label="Trade stream">
        <button
          className="feed-bar"
          onClick={() => setFeedOpen((v) => !v)}
          aria-expanded={feedOpen}
        >
          <span className="feed-bar-title">
            Trade Stream <span className="feed-count">{tradeEvents.length}</span>
          </span>
          <span className="feed-latest">
            {latestIsControl
              ? `${describeControl(latestControl, nameForCodename)} · ${fmtTime(latestControl.ts)}`
              : latest
                ? `${latest.bot} ${latest.type === "close" ? "closed" : latest.type} ${latest.symbol ? `“${latest.symbol}”` : ""} · ${fmtTime(latest.ts)}`
                : "Waiting for events…"}
          </span>
          <span className="feed-chevron">{feedOpen ? "▾" : "▸"}</span>
        </button>

        {feedOpen && (
          <div className="feed-body">
            <div className="feed-controls">
              <div className="feed-tabs">
                <button
                  className={feedTab === "trades" ? "tab small active" : "tab small"}
                  onClick={() => setFeedTab("trades")}
                >
                  Trades
                </button>
                <button
                  className={feedTab === "decisions" ? "tab small active" : "tab small"}
                  onClick={() => setFeedTab("decisions")}
                >
                  Decisions
                </button>
              </div>
              <label className="feed-filter">
                Bot{" "}
                <select
                  value={botFilter}
                  onChange={(e) => setBotFilter(e.target.value)}
                >
                  <option value="all">All bots</option>
                  {bots.map((b) => (
                    <option key={b.codename} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {feedTab === "trades" ? (
              <>
                {feedRows.length === 0 && (
                  <p className="empty">No trades yet — the stream is live.</p>
                )}
                <ul className="feed-list">
                  {feedRows.map((row, i) => {
                    if (row.kind === "control") {
                      const entry = row.entry;
                      const entryBot = entry.target
                        ? botByCodename.get(entry.target)
                        : undefined;
                      return (
                        <li
                          key={`ctl-${entry.id}`}
                          className={`event system-row${entry.action === "resume" ? " resumed" : ""}`}
                        >
                          {entryBot ? (
                            <BotAvatar bot={entryBot} name={entryBot.name} />
                          ) : (
                            <span className="system-icon" aria-hidden="true">
                              {entry.action === "resume" ? "▶" : "⛔"}
                            </span>
                          )}
                          <span className="event-main">
                            {describeControl(entry, nameForCodename)} ·{" "}
                            {fmtTime(entry.ts)}
                          </span>
                          {entry.liquidation &&
                            entry.liquidation.failed.length > 0 && (
                              <span className="pnl-neg">
                                {entry.liquidation.failed.length} unclosable
                              </span>
                            )}
                        </li>
                      );
                    }
                    const event = row.event;
                    const bot = botByName.get(event.bot);
                    const verb =
                      event.side === "sell"
                        ? "sold"
                        : event.side === "buy"
                          ? "bought"
                          : event.type;
                    const highlighted =
                      highlightDecision !== null &&
                      event.decision_id === highlightDecision;
                    return (
                      <li
                        key={`${event.ts}-${event.decision_id ?? ""}-${i}`}
                        className={`event${highlighted ? " highlighted" : ""}`}
                      >
                        <BotAvatar bot={bot} name={event.bot} />
                        <span className="event-main">
                          <strong>{event.bot}</strong> {verb}{" "}
                          {event.symbol && <>“{event.symbol}”</>} ·{" "}
                          {fmtTime(event.ts)}
                        </span>
                        {event.type === "close" && event.pnl !== null && (
                          <span className={event.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                            {fmtMoney(event.pnl, true)}
                          </span>
                        )}
                        <button
                          className="info-btn"
                          onClick={() => openDecision(event)}
                          title="Decision detail"
                          aria-label={`Decision detail for ${event.bot} ${event.symbol ?? ""}`}
                        >
                          ⓘ
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                {filteredEvents.length === 0 && (
                  <p className="empty">No decisions recorded yet.</p>
                )}
                <ul className="feed-list">
                  {filteredEvents.map((event, i) => {
                    const executed = event.type === "open" || event.type === "close";
                    return (
                      <li
                        key={`d-${event.ts}-${event.decision_id ?? ""}-${i}`}
                        className={`event decision-row${executed ? "" : " vetoed"}`}
                        onClick={() => openDecision(event)}
                        title="Open decision detail"
                      >
                        <span className="decision-id">
                          #{event.decision_id ?? "—"}
                        </span>
                        <span className="event-main">
                          <strong>{event.bot}</strong> — {event.reason}
                        </span>
                        {!executed && (
                          <span className="veto-tag">{event.type}</span>
                        )}
                        <time className="event-ts">{fmtTime(event.ts)}</time>
                      </li>
                    );
                  })}
                </ul>
                <p className="hint">
                  Every signal becomes a decision row; trades link back by
                  decision id. Risk-Gate vetoes appear here greyed out —
                  Trendia's Phase 1 paper decisions emit them live.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {tab === "landscape" &&
        inspect &&
        botByName.get(inspect.name) &&
        stats.get(inspect.name) && (
          <BuildingInspect
            bot={botByName.get(inspect.name)!}
            stats={stats.get(inspect.name)!}
            trades={events
              .filter(
                (e) =>
                  e.bot === inspect.name &&
                  (e.type === "open" || e.type === "close"),
              )
              .slice(0, 40)}
            anchorRef={inspectAnchorRef}
            controlRef={inspectControlRef}
            onClose={dismissInspect}
            halted={haltedNames.has(inspect.name)}
            controlBusy={controlBusy}
            killArmed={killArmed}
            onKill={() => killBot(botByName.get(inspect.name)!.codename)}
            onResume={() => resumeBot(botByName.get(inspect.name)!.codename)}
            onKillLiquidate={() =>
              askLiquidateBot(botByName.get(inspect.name)!)
            }
          />
        )}

      {confirmLiquidate && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmLiquidate(null)}
        >
          <div
            className="modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm kill and liquidate"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h3>⛔ Kill + liquidate {confirmLiquidate.label}?</h3>
              <button
                className="modal-close"
                onClick={() => setConfirmLiquidate(null)}
              >
                ✕
              </button>
            </div>
            <p className="confirm-text">
              This halts{" "}
              {confirmLiquidate.scope === "fleet"
                ? "every bot on the team"
                : confirmLiquidate.label}{" "}
              and immediately closes{" "}
              <strong>
                {confirmLiquidate.positions} open position
                {confirmLiquidate.positions === 1 ? "" : "s"}
              </strong>{" "}
              at market prices. Closed positions cannot be reopened, and the
              halt persists across restarts until deliberately resumed. Any
              position that cannot be closed will be reported, not dropped.
            </p>
            <div className="confirm-actions">
              <button
                className="btn"
                onClick={() => setConfirmLiquidate(null)}
              >
                Cancel
              </button>
              <button
                className="btn kill-liq"
                onClick={confirmLiquidateNow}
                disabled={controlBusy}
              >
                {controlBusy
                  ? "Liquidating…"
                  : "Yes — kill + liquidate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Decision detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div className="modal-title">
                <BotAvatar
                  bot={botByName.get(selected.bot)}
                  name={selected.bot}
                />
                <h3>
                  Decision #{selected.decision_id ?? "—"} — {selected.bot}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>
            <dl className="decision-grid">
              <dt>Trigger / reason</dt>
              <dd>{selected.reason}</dd>
              <dt>Action</dt>
              <dd>
                {selected.type}
                {selected.side ? ` · ${selected.side}` : ""}
              </dd>
              <dt>Instrument</dt>
              <dd>{selected.symbol ?? "—"}</dd>
              <dt>Quantity</dt>
              <dd>{selected.qty ?? "—"}</dd>
              <dt>Price</dt>
              <dd>{selected.price !== null ? fmtMoney(selected.price) : "—"}</dd>
              <dt>Realized PnL</dt>
              <dd
                className={
                  selected.pnl === null
                    ? ""
                    : selected.pnl >= 0
                      ? "pnl-pos"
                      : "pnl-neg"
                }
              >
                {selected.pnl !== null ? fmtMoney(selected.pnl, true) : "— (open)"}
              </dd>
              <dt>Timestamp</dt>
              <dd>{fmtTimeFull(selected.ts)}</dd>
              <dt>Bot equity after</dt>
              <dd>
                {stats.get(selected.bot)
                  ? fmtMoney(stats.get(selected.bot)!.equity)
                  : "—"}
              </dd>
            </dl>
            <p className="hint">
              Phase 1 + 3: Trendia's and Vega's decisions carry the full
              record — trigger, indicator values, params snapshot and the
              Risk-Gate verdict — in the reason text above (Vega's are
              labelled SHADOW · while her soak runs). The other bots
              still run the simulator (SIM ·) until their strategy
              plugins land.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

interface BuildingInspectProps {
  bot: BotConfig;
  stats: BotStats;
  /** This bot's trade events (opens + closes), newest first. */
  trades: FleetEvent[];
  anchorRef: { current: InspectAnchor | null };
  controlRef: { current: InspectControl | null };
  onClose: () => void;
  /** Kill-switch state for this bot + its control actions. The buttons
   *  are deliberate clicks inside the dialog — hover only opens it. */
  halted: boolean;
  controlBusy: boolean;
  /** Arm-switch state from the kill bar: kill buttons in this dialog
   *  are inactive while the switch is disarmed. */
  killArmed: boolean;
  onKill: () => void;
  onResume: () => void;
  onKillLiquidate: () => void;
}

/**
 * Building inspect dialog: opened by hovering (desktop) or tapping
 * (phone) a building in the landscape. Shows the bot's picker-resolved
 * avatar, equity and realized PnL, its CURRENT HOLDINGS (open positions
 * from the client team state) and, below them, TODAY'S TRADES — all
 * live: the App re-renders on every event, so an open dialog updates in
 * place. (Data caveat: the client state accumulates from page load —
 * there is no history API yet — so "today" is this session's stream.)
 *
 * Position: the scene publishes the building's name-plate anchor every
 * frame; this dialog re-reads it on its own rAF and pins itself under
 * the plate (flipping above it near the viewport bottom), clamped to
 * the viewport. No React state is involved in the tracking, so the
 * camera drift costs no re-renders.
 */
function BuildingInspect({
  bot,
  stats,
  trades,
  anchorRef,
  controlRef,
  onClose,
  halted,
  controlBusy,
  killArmed,
  onKill,
  onResume,
  onKillLiquidate,
}: BuildingInspectProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;
    const tick = (): void => {
      raf = requestAnimationFrame(tick);
      const el = rootRef.current;
      if (!el) return;
      const a = anchorRef.current;
      if (!a || a.name !== bot.name || !a.visible) {
        // Fallback if the scene stops publishing anchors: reveal the
        // dialog centered near the top instead of leaving it hidden.
        if (performance.now() - startedAt > 600 && el.style.opacity !== "1") {
          el.style.transform = `translate(${Math.round(window.innerWidth / 2 - el.offsetWidth / 2)}px, 84px)`;
          el.style.opacity = "1";
        }
        return;
      }
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let x = a.x - w / 2;
      let y = a.y + 42; // under the name plate
      if (y + h > window.innerHeight - 8) y = a.y - 42 - h; // flip above
      x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
      y = Math.max(8, Math.min(y, Math.max(8, window.innerHeight - h - 8)));
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      el.style.opacity = "1";
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anchorRef, bot.name]);

  return (
    <div
      ref={rootRef}
      className="inspect-dialog"
      role="dialog"
      aria-label={`${bot.name} — holdings and today's trades`}
      onMouseEnter={() => controlRef.current?.holdOpen()}
      onMouseLeave={() => controlRef.current?.releaseHold()}
    >
      <div className="modal-head">
        <div className="modal-title">
          <BotAvatar bot={bot} name={bot.name} />
          <h3>{bot.name}</h3>
          {halted && <span className="halted-badge">⛔ HALTED</span>}
        </div>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={`Close ${bot.name} details`}
        >
          ✕
        </button>
      </div>

      <div className="inspect-stats">
        <span>
          Equity <strong>{fmtMoney(stats.equity)}</strong>
        </span>
        <span>
          Realized{" "}
          <strong className={stats.realized >= 0 ? "pnl-pos" : "pnl-neg"}>
            {fmtMoney(stats.realized, true)}
          </strong>
        </span>
        <span>
          Open <strong>{stats.openPositions.length}</strong>
        </span>
      </div>

      <div className="inspect-controls">
        {halted ? (
          <>
            <span className="inspect-halted-note">
              Kill switch engaged — this bot is not trading.
            </span>
            <div className="control-actions">
              <button
                className="btn resume small"
                onClick={onResume}
                disabled={controlBusy}
              >
                ▶ Resume
              </button>
              <button
                className="btn kill-liq small"
                onClick={onKillLiquidate}
                disabled={controlBusy || !killArmed}
              >
                ⛔ Kill + liquidate
              </button>
            </div>
            {!killArmed && (
              <span className="inspect-lock-note">
                🔒 Liquidate is locked — arm the kill switch in the bar
                above to enable it.
              </span>
            )}
          </>
        ) : (
          <>
            <div className="control-actions">
              <button
                className="btn kill small"
                onClick={onKill}
                disabled={controlBusy || !killArmed}
              >
                ⛔ Kill
              </button>
              <button
                className="btn kill-liq small"
                onClick={onKillLiquidate}
                disabled={controlBusy || !killArmed}
              >
                ⛔ Kill + liquidate
              </button>
            </div>
            {!killArmed && (
              <span className="inspect-lock-note">
                🔒 Kill buttons are locked — arm the kill switch in the
                bar above to enable them.
              </span>
            )}
          </>
        )}
      </div>

      <h4 className="picker-group">Current holdings</h4>
      {stats.openPositions.length === 0 ? (
        <p className="empty">No open positions right now.</p>
      ) : (
        <ul className="inspect-list">
          {stats.openPositions.map((p) => (
            <li key={p.key}>
              <span className="inspect-item">
                <strong>“{p.symbol}”</strong>
                {(p.qty !== null || p.price !== null) && (
                  <>
                    {" "}
                    — {p.side ?? ""} {p.qty ?? ""}
                    {p.price !== null ? ` @ ${fmtMoney(p.price)}` : ""}
                  </>
                )}
              </span>
              <span className="event-ts">opened {fmtTime(p.ts)}</span>
            </li>
          ))}
        </ul>
      )}

      <h4 className="picker-group">Today's trades</h4>
      {trades.length === 0 ? (
        <p className="empty">No trades yet today.</p>
      ) : (
        <ul className="inspect-list">
          {trades.map((event, i) => {
            const verb =
              event.side === "sell"
                ? "sold"
                : event.side === "buy"
                  ? "bought"
                  : event.type;
            return (
              <li key={`${event.ts}-${event.decision_id ?? ""}-${i}`}>
                <span className="inspect-item">
                  {verb} {event.symbol && <>“{event.symbol}”</>} ·{" "}
                  {fmtTime(event.ts)}
                </span>
                {event.type === "close" && event.pnl !== null && (
                  <span className={event.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                    {fmtMoney(event.pnl, true)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
