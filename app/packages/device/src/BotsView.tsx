import { useEffect, useMemo, useState } from "react";
import type { FleetEvent } from "@fleet/shared/types";
import { errorText, native, selections, type StrategySelection, type VaultStatus } from "./api";
import { CATALOG, missingKeys } from "./catalog";
import * as runtime from "./runtime";

const SESSION_HOURS = [1, 4, 8, 12, 24];

function fmtLeft(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.ceil((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function money(n: number): string {
  return `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`;
}

export function BotsView({ status, onStatus, onGoToStrategies }: {
  status: VaultStatus;
  onStatus: (s: VaultStatus) => void;
  onGoToStrategies: () => void;
}) {
  const [rt, setRt] = useState<runtime.RuntimeSnapshot | null>(null);
  const [sels, setSels] = useState<StrategySelection[]>([]);
  const [hours, setHours] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => runtime.subscribe(setRt), []);
  useEffect(() => {
    selections.load().then(setSels).catch((e) => setError(errorText(e)));
  }, []);

  const ready = useMemo(
    () =>
      sels.filter((s) => {
        const def = CATALOG.find((d) => d.codename === s.codename);
        return s.enabled && def && missingKeys(def, s).length === 0;
      }),
    [sels],
  );

  const pnlByBot = useMemo(() => {
    const out: Record<string, number> = {};
    for (const e of rt?.events ?? []) {
      if (e.type === "close" && typeof e.pnl === "number") out[e.bot] = (out[e.bot] ?? 0) + e.pnl;
    }
    return out;
  }, [rt?.events]);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      onStatus(await native.armBots(hours));
      const started = runtime.startBots(ready);
      if (started.length === 0) setError("Nothing new to start.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function stopAll() {
    if (!window.confirm("Stop every bot and end the bot session? Open positions stay open.")) return;
    await runtime.stopAll();
    onStatus(await native.disarmBots());
  }

  if (!rt?.ready) return <p className="muted">Loading bot state…</p>;
  const sessionLive = status.botSessionSecondsLeft > 0;
  const shown = CATALOG.filter((d) => ready.some((s) => s.codename === d.codename) || rt.running.includes(d.codename));

  return (
    <section>
      <div className="section-head">
        <h2>Bots</h2>
        {sessionLive && (
          <span className="pill ok">Bot session · {fmtLeft(status.botSessionSecondsLeft)} left</span>
        )}
      </div>
      <p className="muted small">
        Bots run inside this app and trade your <strong>paper / demo</strong> accounts directly. Keep the app open —
        if it quits or the computer sleeps, bots pause until you start them again.
      </p>
      {rt.notice && <p className="error">{rt.notice}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        {ready.length === 0 && rt.running.length === 0 ? (
          <p>
            No strategies are ready to run.{" "}
            <button className="link" onClick={onGoToStrategies}>
              Pick strategies and assign keys →
            </button>
          </p>
        ) : (
          <div className="row">
            <span>
              {rt.running.length} running · {ready.length} selected
            </span>
            <div className="row">
              <label className="small">
                Session length
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  {SESSION_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary" disabled={busy || ready.length === 0} onClick={start}>
                {sessionLive ? "Start / extend" : "Start bots"}
              </button>
              <button className="danger" disabled={rt.running.length === 0 && !sessionLive} onClick={stopAll}>
                Stop all
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        {shown.map((def) => {
          const isRunning = rt.running.includes(def.codename);
          const isHalted = rt.halted.includes(def.codename);
          const pnl = pnlByBot[def.codename];
          return (
            <article key={def.codename} className="card strategy" style={{ borderLeftColor: def.color }}>
              <div className="row">
                <strong>{def.name}</strong>
                <span className={`pill ${isHalted ? "warn" : isRunning ? "ok" : ""}`}>
                  {isHalted ? "Halted" : isRunning ? "Running" : "Stopped"}
                </span>
              </div>
              <p className="muted small">
                {def.codename === "vega" ? "Shadow mode — decisions only, no orders" : def.category}
                {pnl !== undefined && <> · realized {money(pnl)}</>}
              </p>
              <div className="row actions">
                {isRunning && (
                  <button className="ghost" onClick={() => runtime.stopBot(def.codename)}>
                    Stop
                  </button>
                )}
                {isHalted ? (
                  <button onClick={() => runtime.resume(def.codename)}>Resume</button>
                ) : (
                  <button onClick={() => runtime.halt(def.codename)}>Halt</button>
                )}
                <button
                  className="danger ghost"
                  onClick={() => {
                    if (window.confirm(`Halt ${def.name} and close all of its positions at market?`))
                      runtime.haltAndLiquidate(def.codename);
                  }}
                >
                  Halt + liquidate
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <h3 className="cat">Activity</h3>
      <EventFeed events={rt.events} />
    </section>
  );
}

function EventFeed({ events }: { events: FleetEvent[] }) {
  if (events.length === 0) return <p className="muted small">No activity yet.</p>;
  return (
    <ol className="feed">
      {events.slice(0, 150).map((e, i) => (
        <li key={`${e.ts}-${i}`} className={`feed-${e.type}`}>
          <span className="muted">{new Date(e.ts).toLocaleTimeString()}</span>
          <strong>{e.bot}</strong>
          <span className="tag">{e.type}</span>
          {e.symbol && (
            <span>
              {e.side ?? ""} {e.qty ?? ""} {e.symbol}
              {e.price !== null && <> @ {e.price}</>}
            </span>
          )}
          {e.pnl !== null && <span className={e.pnl >= 0 ? "ok-text" : "error"}>{money(e.pnl)}</span>}
          <span className="reason">{e.reason}</span>
        </li>
      ))}
    </ol>
  );
}
