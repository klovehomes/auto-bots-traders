import { useEffect, useMemo, useRef, useState } from "react";
import type { BotConfig, FleetEvent } from "@fleet/shared/types";
import {
  Landscape,
  type EffectEvent,
  type InspectAnchor,
  type InspectControl,
} from "./Landscape.js";
import { Leaderboard } from "./Leaderboard.js";
import { BotAvatar } from "./avatars.js";
import {
  START_EQUITY,
  computeTotals,
  fmtMoney,
  fmtTime,
  fmtTimeFull,
  type BotStats,
} from "./fleetState.js";

/**
 * Phase 8 — the public READ-ONLY showcase.
 *
 * This component tree is a separate entry from the private dashboard
 * (src/App.tsx is never imported here): there is no WebSocket, no
 * kill switch, no mode switch, and no code path that can reach a
 * control endpoint. All state comes from ONE published snapshot file
 * (tools/publish-snapshot.mjs writes it from the private API's
 * read-only endpoints; the sanitization rules live there). The page
 * fetches the snapshot on load and re-polls it every 60 seconds, so
 * the public view is minutes-stale by design — that delay is the
 * security model, not a bug.
 *
 * Presentational components are shared with the private dashboard
 * (Landscape, Leaderboard, avatars, fleetState formatters); the data
 * adapter below maps the snapshot schema onto the shapes they
 * already consume.
 */

// --- Snapshot schema (mirrors tools/publish-snapshot.mjs) --------------

export interface SnapshotPosition {
  symbol: string;
  qty: number | null;
  side: "buy" | "sell" | null;
  avgEntry: number | null;
  currentPrice?: number | null;
  unrealizedPnL?: number | null;
}

export interface SnapshotBot {
  codename: string;
  displayName: string;
  color: string;
  mode: string;
  balance: number;
  dayPnL: number;
  positions: SnapshotPosition[];
}

export interface SnapshotEvent {
  bot: string;
  type: string;
  decision_id: string | null;
  symbol: string | null;
  side: "buy" | "sell" | null;
  qty: number | null;
  price: number | null;
  pnl: number | null;
  reason: string;
  ts: string;
}

export interface ShowcaseSnapshot {
  version: number;
  generatedAt: string;
  fleetMode: string;
  bots: SnapshotBot[];
  recentTrades: SnapshotEvent[];
  recentDecisions: SnapshotEvent[];
  totals: { equity: number; dayPnL: number };
}

// --- Snapshot location + polling ---------------------------------------

const SNAPSHOT_URL =
  (import.meta.env.VITE_SNAPSHOT_URL ?? "").trim() || "snapshot.json";
const POLL_MS = 60_000;

// --- Adapters: snapshot → the shapes the shared components consume -----

const SHOWCASE_PHILOSOPHY =
  "This bot trades autonomously under the TraderBot Risk Gate. This " +
  "public page is a read-only snapshot of the private dashboard — the " +
  "full bot file lives with the fleet, not on the public site.";

export function botConfigFor(sb: SnapshotBot): BotConfig {
  return {
    name: sb.displayName,
    codename: sb.codename,
    enabled: true,
    mode: sb.mode,
    market: "",
    broker: "",
    strategy: "",
    viz: { color: sb.color, form: "", avatar_accessory: "" },
    rules: {},
    risk: {},
    philosophy: SHOWCASE_PHILOSOPHY,
    sourcePath: "",
    raw: {},
  };
}

function toFleetEvent(e: SnapshotEvent): FleetEvent {
  return {
    bot: e.bot,
    type: e.type as FleetEvent["type"],
    decision_id: e.decision_id,
    symbol: e.symbol,
    side: e.side,
    qty: e.qty,
    price: e.price,
    pnl: e.pnl,
    reason: e.reason,
    ts: e.ts,
  };
}

/** Trades + decisions merged into one newest-first FleetEvent list. */
export function snapshotEvents(snap: ShowcaseSnapshot): FleetEvent[] {
  const seen = new Set<string>();
  const out: FleetEvent[] = [];
  for (const e of [...snap.recentTrades, ...snap.recentDecisions]) {
    const key = `${e.bot}|${e.ts}|${e.type}|${e.symbol ?? ""}|${e.decision_id ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toFleetEvent(e));
  }
  out.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
  return out;
}

/**
 * BotStats for one bot, built directly from the snapshot (the
 * publisher already did the authoritative balance math; the curve is
 * reconstructed from the bot's closes visible in this snapshot).
 */
export function statsForBot(
  sb: SnapshotBot,
  events: FleetEvent[],
  generatedAt: string,
): BotStats {
  const mine = events.filter((e) => e.bot === sb.displayName);
  const closes = mine.filter((e) => e.type === "close");
  const curve: number[] = [START_EQUITY];
  let acc = 0;
  for (const c of [...closes].reverse()) {
    acc += c.pnl ?? 0;
    curve.push(START_EQUITY + acc);
  }
  if (curve[curve.length - 1] !== sb.balance) curve.push(sb.balance);
  let peak = -Infinity;
  let maxDrawdown = 0;
  for (const point of curve) {
    if (point > peak) peak = point;
    if (peak - point > maxDrawdown) maxDrawdown = peak - point;
  }
  return {
    name: sb.displayName,
    equity: sb.balance,
    realized: Math.round((sb.balance - START_EQUITY) * 100) / 100,
    wins: closes.filter((c) => (c.pnl ?? 0) > 0).length,
    losses: closes.filter((c) => (c.pnl ?? 0) < 0).length,
    closes: closes.length,
    opens: mine.filter((e) => e.type === "open").length,
    trades: mine.filter((e) => e.type === "open" || e.type === "close").length,
    curve,
    maxDrawdown,
    openPositions: sb.positions.map((p) => ({
      key: `${sb.displayName}|${p.symbol}|showcase`,
      symbol: p.symbol,
      side: p.side,
      qty: p.qty,
      price: p.avgEntry,
      ts: generatedAt,
    })),
    recentCloses: closes.map((c) => ({
      ts: Date.parse(c.ts),
      pnl: c.pnl ?? 0,
    })),
  };
}

// --- The showcase app ----------------------------------------------------

type MainTab = "landscape" | "leaderboard";
type FeedTab = "trades" | "decisions";

export function ShowcaseApp() {
  const [snapshot, setSnapshot] = useState<ShowcaseSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<MainTab>("landscape");
  const [feedOpen, setFeedOpen] = useState(true);
  const [feedTab, setFeedTab] = useState<FeedTab>("trades");
  const [botFilter, setBotFilter] = useState<string>("all");
  const [textFilter, setTextFilter] = useState<string>("");
  const [selected, setSelected] = useState<FleetEvent | null>(null);
  const [inspectName, setInspectName] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  /** Phase 9: snapshot answered 401 — the email gate wants this
   *  visitor to register first (only happens behind Cloudflare). */
  const [authRequired, setAuthRequired] = useState(false);

  const effectsRef = useRef<EffectEvent[]>([]);
  const statsRef = useRef<Map<string, BotStats>>(new Map());
  const inspectAnchorRef = useRef<InspectAnchor | null>(null);
  const inspectControlRef = useRef<InspectControl | null>(null);
  /** Landscape asks for halted bots; the showcase never shows halts. */
  const haltedRef = useRef<Set<string>>(new Set());
  /** Trade-event keys already turned into landscape beam effects. */
  const seenFxRef = useRef<Set<string>>(new Set());
  const fxPrimedRef = useRef(false);

  // Poll the snapshot. The first load only primes the effect tracker
  // (no beam replay for old trades); later polls fire beams for
  // genuinely new, recent opens/closes so the city still feels alive.
  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const sep = SNAPSHOT_URL.includes("?") ? "&" : "?";
        const res = await fetch(`${SNAPSHOT_URL}${sep}t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          // Phase 9 — the email gate (Cloudflare middleware) requires
          // a session before it will serve the snapshot. Send the
          // visitor to the gate page; registration sets the cookie.
          if (!cancelled) {
            setAuthRequired(true);
            window.location.assign("/gate.html");
          }
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ShowcaseSnapshot;
        if (cancelled) return;
        setSnapshot(data);
        setLoadError(null);
        const primed = fxPrimedRef.current;
        for (const t of data.recentTrades) {
          const key = `${t.bot}|${t.ts}|${t.type}|${t.symbol ?? ""}|${t.decision_id ?? ""}`;
          if (seenFxRef.current.has(key)) continue;
          seenFxRef.current.add(key);
          if (!primed) continue;
          if (Date.now() - Date.parse(t.ts) > 10 * 60_000) continue;
          if (t.type === "close" && t.pnl !== null && t.pnl !== 0) {
            effectsRef.current.push({
              bot: t.bot,
              kind: t.pnl > 0 ? "win" : "loss",
              ts: Date.now(),
            });
          } else if (t.type === "open") {
            effectsRef.current.push({ bot: t.bot, kind: "open", ts: Date.now() });
          }
        }
        fxPrimedRef.current = true;
      } catch (err: unknown) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      }
    };
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const bots = useMemo<BotConfig[]>(
    () => (snapshot ? snapshot.bots.map(botConfigFor) : []),
    [snapshot],
  );
  const events = useMemo<FleetEvent[]>(
    () => (snapshot ? snapshotEvents(snapshot) : []),
    [snapshot],
  );
  const stats = useMemo<Map<string, BotStats>>(() => {
    const map = new Map<string, BotStats>();
    if (snapshot) {
      for (const sb of snapshot.bots) {
        map.set(sb.displayName, statsForBot(sb, events, snapshot.generatedAt));
      }
    }
    return map;
  }, [snapshot, events]);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const totals = useMemo(() => computeTotals(events), [events]);
  const botByName = useMemo(() => new Map(bots.map((b) => [b.name, b])), [bots]);
  const snapBotByName = useMemo(
    () =>
      new Map((snapshot?.bots ?? []).map((b) => [b.displayName, b])),
    [snapshot],
  );

  const textQuery = textFilter.trim().toLowerCase();
  const filteredEvents = events.filter((e) => {
    if (botFilter !== "all" && e.bot !== botFilter) return false;
    if (textQuery === "") return true;
    return [e.bot, e.symbol ?? "", e.type, e.reason ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(textQuery);
  });
  const tradeEvents = filteredEvents.filter(
    (e) => e.type === "open" || e.type === "close",
  );
  const latest = events[0];
  const fleetMode = snapshot?.fleetMode ?? null;

  const inspectBot = inspectName ? botByName.get(inspectName) : undefined;
  const inspectSnap = inspectName ? snapBotByName.get(inspectName) : undefined;
  const inspectStats = inspectName ? stats.get(inspectName) : undefined;

  return (
    <main className="page">
      <div className="showcase-banner" role="note">
        <strong>READ-ONLY SHOWCASE — PAPER TRADING</strong>
        <span>
          This public page has no controls. It refreshes from a published
          snapshot about every minute, so what you see is a few minutes
          behind the fleet.
        </span>
      </div>

      <header className="header">
        <div>
          <h1>Trader Bot Landscape</h1>
          <p className="subtitle">
            Five bots, one valley — watch the TraderBot team trade on
            paper, live-ish and in public.
          </p>
        </div>
        <div className="header-badges">
          <div className="header-badges-row">
            <span className="snapshot-pill">
              <span className="dot" />{" "}
              {snapshot
                ? `Snapshot · ${fmtTime(snapshot.generatedAt)}`
                : "Loading snapshot…"}
            </span>
            {fleetMode && (
              <span
                className={`mode-badge mode-${fleetMode === "paper" ? "paper" : "sim"}`}
                role="status"
              >
                {fleetMode === "paper" ? "PAPER TRADING" : "SIMULATED DATA"}
              </span>
            )}
          </div>
        </div>
      </header>

      {!snapshot && authRequired && (
        <p className="error">
          This showcase is for registered viewers — taking you to the
          gate…
        </p>
      )}
      {!snapshot && !authRequired && loadError && (
        <p className="error">
          The latest snapshot could not be loaded ({loadError}). The page
          keeps retrying every minute.
        </p>
      )}
      {snapshot && loadError && (
        <p className="hint">
          Snapshot refresh failed ({loadError}) — showing the last good
          snapshot from {fmtTimeFull(snapshot.generatedAt)}.
        </p>
      )}

      <section className="totals-bar" aria-label="Showcase totals">
        <div className="total">
          <span className="total-label">Team equity (paper)</span>
          <span className="total-value">
            {snapshot ? fmtMoney(snapshot.totals.equity) : "—"}
          </span>
        </div>
        <div className="total">
          <span className="total-label">Day PnL</span>
          <span
            className={`total-value ${
              snapshot && snapshot.totals.dayPnL >= 0 ? "pnl-pos" : "pnl-neg"
            }`}
          >
            {snapshot ? fmtMoney(snapshot.totals.dayPnL, true) : "—"}
          </span>
        </div>
        <div className="total">
          <span className="total-label">Net realized (stream)</span>
          <span
            className={`total-value ${totals.net >= 0 ? "pnl-pos" : "pnl-neg"}`}
          >
            {fmtMoney(totals.net, true)}
          </span>
        </div>
        <div className="total total-meta">
          <span className="total-label">Bots on the team</span>
          <span className="total-value">{bots.length || "—"}</span>
        </div>
      </section>

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
                The 3D landscape needs WebGL, which this browser/device
                could not provide. The totals, leaderboard, and trade
                stream below carry the same snapshot data.
              </p>
            </div>
          ) : bots.length === 0 ? (
            <div className="landscape-fallback">
              <p>Loading the latest snapshot…</p>
            </div>
          ) : (
            <Landscape
              bots={bots}
              statsRef={statsRef}
              effectsRef={effectsRef}
              haltedRef={haltedRef}
              onUnavailable={() => setWebglFailed(true)}
              onInspect={(name) => setInspectName(name)}
              inspectAnchorRef={inspectAnchorRef}
              inspectControlRef={inspectControlRef}
            />
          )}
        </section>
      ) : (
        <Leaderboard bots={bots} stats={stats} haltedNames={haltedRef.current} />
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
            {latest
              ? `${latest.bot} ${latest.type === "close" ? "closed" : latest.type} ${latest.symbol ? `“${latest.symbol}”` : ""} · ${fmtTime(latest.ts)}`
              : "Waiting for the first snapshot…"}
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
              <div className="feed-filter-group">
                <input
                  className="feed-search"
                  type="text"
                  placeholder="Filter… e.g. QQQ"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.target.value)}
                  aria-label="Filter the stream by text"
                />
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
            </div>

            {feedTab === "trades" ? (
              <>
                {tradeEvents.length === 0 && (
                  <p className="empty">
                    {textQuery
                      ? `No trades match “${textFilter.trim()}”.`
                      : "No trades in this snapshot yet."}
                  </p>
                )}
                <ul className="feed-list">
                  {tradeEvents.map((event, i) => {
                    const bot = botByName.get(event.bot);
                    const verb =
                      event.side === "sell"
                        ? "sold"
                        : event.side === "buy"
                          ? "bought"
                          : event.type;
                    return (
                      <li key={`${event.ts}-${event.decision_id ?? ""}-${i}`} className="event">
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
                          onClick={() => setSelected(event)}
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
                  <p className="empty">
                    {textQuery
                      ? `No decisions match “${textFilter.trim()}”.`
                      : "No decisions in this snapshot yet."}
                  </p>
                )}
                <ul className="feed-list">
                  {filteredEvents.map((event, i) => {
                    const executed = event.type === "open" || event.type === "close";
                    return (
                      <li
                        key={`d-${event.ts}-${event.decision_id ?? ""}-${i}`}
                        className={`event decision-row${executed ? "" : " vetoed"}`}
                        onClick={() => setSelected(event)}
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
                  decision id. Rows come from the published snapshot — the
                  private decision log stays private.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {tab === "landscape" && inspectBot && inspectSnap && inspectStats && (
        <ReadOnlyInspect
          bot={inspectBot}
          snapBot={inspectSnap}
          stats={inspectStats}
          trades={events
            .filter(
              (e) =>
                e.bot === inspectBot.name &&
                (e.type === "open" || e.type === "close"),
            )
            .slice(0, 40)}
          anchorRef={inspectAnchorRef}
          controlRef={inspectControlRef}
          onClose={() => setInspectName(null)}
        />
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
                <BotAvatar bot={botByName.get(selected.bot)} name={selected.bot} />
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
              <dt>Bot equity (snapshot)</dt>
              <dd>
                {stats.get(selected.bot)
                  ? fmtMoney(stats.get(selected.bot)!.equity)
                  : "—"}
              </dd>
            </dl>
            <p className="hint">
              Read-only record from the published snapshot. The full
              decision log — indicator values, params snapshot and the
              Risk-Gate verdict — lives on the private dashboard.
            </p>
          </div>
        </div>
      )}

      <footer className="showcase-footer">
        <p className="showcase-disclaimer">
          Paper trading with simulated funds. Not investment advice.
        </p>
        <p className="showcase-foot-meta">
          {snapshot
            ? `Snapshot generated ${fmtTimeFull(snapshot.generatedAt)} · refreshed every minute`
            : "Waiting for the first snapshot…"}{" "}
          · Trader Bot Landscape — public showcase
        </p>
      </footer>
    </main>
  );
}

// --- Read-only building inspect -----------------------------------------

interface ReadOnlyInspectProps {
  bot: BotConfig;
  snapBot: SnapshotBot;
  stats: BotStats;
  trades: FleetEvent[];
  anchorRef: { current: InspectAnchor | null };
  controlRef: { current: InspectControl | null };
  onClose: () => void;
}

/**
 * The private dashboard's building dialog, minus every control: same
 * anchor-following placement, but it only ever displays — holdings
 * from the snapshot (with live marks when the publisher has them) and
 * the bot's recent trades. There are no buttons here but Close.
 */
function ReadOnlyInspect({
  bot,
  snapBot,
  stats,
  trades,
  anchorRef,
  controlRef,
  onClose,
}: ReadOnlyInspectProps) {
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
        if (performance.now() - startedAt > 600 && el.style.opacity !== "1") {
          el.style.transform = `translate(${Math.round(window.innerWidth / 2 - el.offsetWidth / 2)}px, 84px)`;
          el.style.opacity = "1";
        }
        return;
      }
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let x = a.x - w / 2;
      let y = a.y + 42;
      if (y + h > window.innerHeight - 8) y = a.y - 42 - h;
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
      aria-label={`${bot.name} — holdings and recent trades (read-only)`}
      onMouseEnter={() => controlRef.current?.holdOpen()}
      onMouseLeave={() => controlRef.current?.releaseHold()}
    >
      <div className="modal-head">
        <div className="modal-title">
          <BotAvatar bot={bot} name={bot.name} />
          <h3>{bot.name}</h3>
          <span className="snapshot-pill">read-only</span>
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
          Day{" "}
          <strong className={snapBot.dayPnL >= 0 ? "pnl-pos" : "pnl-neg"}>
            {fmtMoney(snapBot.dayPnL, true)}
          </strong>
        </span>
        <span>
          Open <strong>{snapBot.positions.length}</strong>
        </span>
      </div>

      <h4 className="ro-heading">Current holdings</h4>
      {snapBot.positions.length === 0 ? (
        <p className="hint">No open positions in this snapshot.</p>
      ) : (
        <ul className="inspect-list">
          {snapBot.positions.map((p) => (
            <li key={`${p.symbol}`} className="ro-holding">
              <span className="event-main">
                <strong>{p.symbol}</strong>
                {p.qty !== null ? ` · ${p.qty}` : ""}
                {p.side ? ` · ${p.side}` : ""}
                {p.avgEntry !== null ? ` · avg ${fmtMoney(p.avgEntry)}` : ""}
                {p.currentPrice != null ? ` · now ${fmtMoney(p.currentPrice)}` : ""}
              </span>
              {p.unrealizedPnL != null && (
                <span className={p.unrealizedPnL >= 0 ? "pnl-pos" : "pnl-neg"}>
                  {fmtMoney(p.unrealizedPnL, true)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <h4 className="ro-heading">Recent trades</h4>
      {trades.length === 0 ? (
        <p className="hint">No trades in this snapshot yet.</p>
      ) : (
        <ul className="inspect-list">
          {trades.slice(0, 10).map((t, i) => (
            <li key={`${t.ts}-${i}`} className="event">
              <span className="event-main">
                {t.type === "close" ? "closed" : "opened"}{" "}
                {t.symbol ? `“${t.symbol}”` : ""} · {fmtTime(t.ts)}
              </span>
              {t.type === "close" && t.pnl !== null && (
                <span className={t.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                  {fmtMoney(t.pnl, true)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
