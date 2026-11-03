import { useEffect, useRef, useState } from "react";
import type { BotConfig } from "@fleet/shared/types";
import { START_EQUITY, fmtMoney, type BotStats } from "./fleetState.js";
import { AvatarPicker, BotAvatar } from "./avatars.js";

interface LeaderboardProps {
  bots: BotConfig[];
  stats: Map<string, BotStats>;
  /** Names of bots whose kill switch is currently engaged. */
  haltedNames?: Set<string>;
}

function Sparkline({ curve, color }: { curve: number[]; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const w = canvas.width;
    const h = canvas.height;
    g.clearRect(0, 0, w, h);
    if (curve.length < 2) {
      g.strokeStyle = "rgba(139,152,169,0.5)";
      g.beginPath();
      g.moveTo(0, h / 2);
      g.lineTo(w, h / 2);
      g.stroke();
      return;
    }
    const min = Math.min(...curve);
    const max = Math.max(...curve);
    const range = max - min || 1;
    g.strokeStyle = color;
    g.lineWidth = 1.6;
    g.beginPath();
    curve.forEach((v, i) => {
      const x = (i / (curve.length - 1)) * (w - 4) + 2;
      const y = h - 3 - ((v - min) / range) * (h - 6);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
  }, [curve, color]);
  return <canvas ref={ref} width={110} height={30} className="sparkline" />;
}

/**
 * Leaderboard tab: every bot ranked by net PnL % against the equal
 * $10,000 starting allocation. Clicking a row expands the bot's .md
 * philosophy and its currently open positions.
 */
export function Leaderboard({ bots, stats, haltedNames }: LeaderboardProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pickerBot, setPickerBot] = useState<BotConfig | null>(null);
  const botByName = new Map(bots.map((b) => [b.name, b]));

  const rows = [...stats.values()]
    .map((s) => ({
      stats: s,
      bot: botByName.get(s.name),
      netPct: ((s.equity - START_EQUITY) / START_EQUITY) * 100,
      winRate: s.closes > 0 ? (s.wins / s.closes) * 100 : null,
      ddPct: (s.maxDrawdown / START_EQUITY) * 100,
    }))
    .sort((a, b) => b.netPct - a.netPct);

  if (rows.length === 0) {
    return <p className="empty">Waiting for bot data…</p>;
  }

  return (
    <div className="leaderboard">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Bot</th>
            <th>Net PnL</th>
            <th>Net %</th>
            <th>Win rate</th>
            <th>Trades</th>
            <th>Equity</th>
            <th>Max DD</th>
            <th>Equity curve</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const s = row.stats;
            const color = row.bot?.viz.color ?? "#8b98a9";
            const isOpen = expanded === s.name;
            return [
              <tr
                key={s.name}
                className="lb-row"
                onClick={() => setExpanded(isOpen ? null : s.name)}
                title="Click for philosophy + open positions"
              >
                <td className="lb-rank">{i + 1}</td>
                <td>
                  <span className="lb-bot">
                    <BotAvatar
                      bot={row.bot}
                      name={s.name}
                      onEdit={
                        row.bot ? () => setPickerBot(row.bot!) : undefined
                      }
                    />
                    <span>
                      {s.name}
                      {haltedNames?.has(s.name) && (
                        <span className="halted-badge">⛔ HALTED</span>
                      )}
                      <span className="lb-accessory">
                        {row.bot?.viz.avatar_accessory ?? ""}
                      </span>
                    </span>
                  </span>
                </td>
                <td className={s.realized >= 0 ? "pnl-pos" : "pnl-neg"}>
                  {fmtMoney(s.realized, true)}
                </td>
                <td className={row.netPct >= 0 ? "pnl-pos" : "pnl-neg"}>
                  {row.netPct >= 0 ? "+" : ""}
                  {row.netPct.toFixed(2)}%
                </td>
                <td>{row.winRate === null ? "—" : `${row.winRate.toFixed(0)}%`}</td>
                <td>{s.trades}</td>
                <td>
                  {fmtMoney(s.equity)}
                  <span className="lb-sub">of {fmtMoney(START_EQUITY)}</span>
                </td>
                <td>
                  {fmtMoney(-s.maxDrawdown)}
                  <span className="lb-sub">-{row.ddPct.toFixed(2)}%</span>
                </td>
                <td>
                  <Sparkline curve={s.curve} color={color} />
                </td>
              </tr>,
              isOpen && (
                <tr key={`${s.name}-detail`} className="lb-detail">
                  <td colSpan={9}>
                    <div className="lb-detail-head">
                      <BotAvatar
                        bot={row.bot}
                        name={s.name}
                        onEdit={
                          row.bot ? () => setPickerBot(row.bot!) : undefined
                        }
                      />
                      <strong>{s.name}</strong>
                      <span className="lb-accessory">
                        {row.bot?.viz.avatar_accessory ?? ""}
                      </span>
                      <span className="hint">
                        Click the avatar (or its ✎) to change it.
                      </span>
                    </div>
                    <div className="lb-detail-grid">
                      <div>
                        <h4>Philosophy</h4>
                        <p className="philosophy">
                          {row.bot?.philosophy?.trim()
                            ? row.bot.philosophy.trim()
                            : "No philosophy text in this bot's .md file."}
                        </p>
                      </div>
                      <div>
                        <h4>Open positions ({s.openPositions.length})</h4>
                        {s.openPositions.length === 0 ? (
                          <p className="empty">None open right now.</p>
                        ) : (
                          <ul className="open-list">
                            {s.openPositions.map((p) => (
                              <li key={p.key}>
                                “{p.symbol}” — {p.side ?? ""} {p.qty ?? ""} @{" "}
                                {p.price !== null ? fmtMoney(p.price) : "?"}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="lb-meta">
                          Strategy: {row.bot?.strategy ?? "—"} · Market:{" "}
                          {row.bot?.market ?? "—"} · Mode: {row.bot?.mode ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ),
            ];
          })}
        </tbody>
      </table>
      <p className="hint">
        Ranked by net PnL % — fair because every bot starts with the same{" "}
        {fmtMoney(START_EQUITY)}. Click a bot for its philosophy and open
        positions. Figures accumulate from when this page connected (no
        history API yet).
      </p>
      {pickerBot && (
        <AvatarPicker bot={pickerBot} onClose={() => setPickerBot(null)} />
      )}
    </div>
  );
}
