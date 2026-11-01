import { useEffect, useState } from "react";
import type { BotConfig, FleetEvent, FleetMode } from "@fleet/shared/types";

type WsStatus = "connecting" | "connected" | "disconnected";

const API_BASE = `http://${window.location.hostname}:8080`;
const EVENTS_URL = `ws://${window.location.hostname}:8080/events`;
const MAX_EVENTS = 50;

export function App() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [botsError, setBotsError] = useState<string | null>(null);
  const [mode, setMode] = useState<FleetMode | null>(null);
  const [status, setStatus] = useState<WsStatus>("connecting");
  const [events, setEvents] = useState<FleetEvent[]>([]);

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
    const ws = new WebSocket(EVENTS_URL);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");
    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(String(message.data)) as FleetEvent;
        setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
      } catch {
        // Ignore malformed frames; the stream is internal and typed.
      }
    };
    return () => ws.close();
  }, []);

  return (
    <main className="page">
      <header className="header">
        <h1>Fleet Landscape</h1>
        <p className="subtitle">
          Phase 0 placeholder — the Three.js landscape arrives in Phase 2.
        </p>
        <p className={`ws-status ws-${status}`}>
          <span className="dot" /> WebSocket: {status}
        </p>
        {mode && (
          <p className={`mode-badge mode-${mode}`} role="status">
            {mode === "sim"
              ? "SIMULATED DATA — fake market data for local testing"
              : mode === "paper"
                ? "PAPER TRADING — Alpaca paper account"
                : "LIVE — CONNECTED ACCOUNTS"}
          </p>
        )}
      </header>

      <section className="bots" aria-label="Bots">
        {botsError && <p className="error">Could not load bots: {botsError}</p>}
        {bots.map((bot) => (
          <div className="bot" key={bot.codename}>
            <div
              className="disc"
              style={{ backgroundColor: bot.viz.color }}
              title={bot.viz.avatar_accessory}
            >
              {bot.name.charAt(0)}
            </div>
            <div className="bot-name">{bot.name}</div>
            <div className="bot-accessory">{bot.viz.avatar_accessory}</div>
            <div className="bot-meta">
              {bot.market} · {bot.mode}
            </div>
          </div>
        ))}
      </section>

      <section className="feed" aria-label="Live events">
        <h2>Live events</h2>
        {events.length === 0 && (
          <p className="empty">Waiting for events from the engine…</p>
        )}
        <ul>
          {events.map((event, i) => (
            <li key={`${event.ts}-${i}`} className="event">
              <span className="event-bot">{event.bot}</span>
              <span className="event-type">{event.type}</span>
              {event.symbol && (
                <span className="event-symbol">“{event.symbol}”</span>
              )}
              <span className="event-reason">{event.reason}</span>
              {event.pnl !== null && (
                <span className={event.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                  {event.pnl >= 0 ? "+" : ""}
                  {event.pnl.toFixed(2)}
                </span>
              )}
              <time className="event-ts">
                {new Date(event.ts).toLocaleTimeString()}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
