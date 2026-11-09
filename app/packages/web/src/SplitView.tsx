import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AllocationState,
  ScanDefinition,
  ScanResultsResponse,
  SleeveToggles,
  UserSelectionsResponse,
} from "@fleet/shared/types";
import type { FleetEvent } from "@fleet/shared/types";
import { fmtMoney, fmtTime, type BotStats } from "./fleetState.js";

/**
 * Phase PM3 — the split screen that replaces the landscape view.
 *
 * LEFT: one of Keith's three Polymarket scans (live Gamma data via
 * the API). The user checks results, enters a dollar amount per
 * checked result, and presses Submit to book the batch. Checking or
 * typing alone executes nothing.
 *
 * RIGHT: "Bot Trades" — the bot's carved-out portion of the shared
 * pool, the three sleeve toggles, and PolyCrypt9000's trading
 * activity (open positions + recent trades) rendered from the same
 * event-stream stats the landscape used.
 *
 * ONE shared pool under both sides (Keith, 2026-11-08):
 * remaining = totalFunds − botAllocation − Σ open user selections.
 * Both panels read the same GET /allocations state.
 */

const SLEEVES: { key: keyof SleeveToggles; label: string; hint: string }[] = [
  { key: "crypto", label: "Crypto", hint: "BTC / ETH / SOL breakout sleeve" },
  { key: "kalshi", label: "Kalshi", hint: "Kalshi prediction-markets sleeve" },
  { key: "polymarket", label: "Polymarket", hint: "Polymarket shadow sleeve" },
];

function fmtCents(price: number): string {
  return `${(price * 100).toFixed(1)}¢`;
}

function fmtVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/** The pool line both panels show — one set of numbers, one source. */
function PoolLine({ alloc }: { alloc: AllocationState }) {
  return (
    <p className="pool-line">
      Pool: <strong>{fmtMoney(alloc.totalFunds)}</strong> total ·{" "}
      <strong>{fmtMoney(alloc.botAllocation)}</strong> to Bot Trades ·{" "}
      <strong>{fmtMoney(alloc.userSelectionsTotal)}</strong> your selections ·{" "}
      <strong className={alloc.remainingAvailable < 0 ? "pnl-neg" : "pnl-pos"}>
        {fmtMoney(alloc.remainingAvailable)} remaining
      </strong>
    </p>
  );
}

// ---------------------------------------------------------------- scans ---

interface ScanPanelProps {
  apiBase: string;
  alloc: AllocationState | null;
  onBooked: () => void;
}

function ScanPanel({ apiBase, alloc, onBooked }: ScanPanelProps) {
  const [scans, setScans] = useState<ScanDefinition[]>([]);
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [data, setData] = useState<ScanResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** marketId → amount text, for CHECKED rows only. */
  const [checked, setChecked] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitNote, setSubmitNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/scans`)
      .then((res) => res.json() as Promise<ScanDefinition[]>)
      .then((defs) => {
        if (!cancelled) setScans(defs);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load the scan list.");
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const loadScan = useCallback(
    (scanId: string) => {
      setActiveScan(scanId);
      setData(null);
      setChecked({});
      setSubmitError(null);
      setSubmitNote(null);
      setLoading(true);
      setLoadError(null);
      fetch(`${apiBase}/scans/${scanId}/results`)
        .then(async (res) => {
          const body = (await res.json()) as ScanResultsResponse & {
            error?: string;
          };
          if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
          setData(body);
        })
        .catch((err: unknown) => {
          setLoadError(
            err instanceof Error ? err.message : "Scan request failed.",
          );
        })
        .finally(() => setLoading(false));
    },
    [apiBase],
  );

  function toggleRow(marketId: string, on: boolean): void {
    setChecked((prev) => {
      const next = { ...prev };
      if (on) next[marketId] = next[marketId] ?? "";
      else delete next[marketId];
      return next;
    });
    setSubmitNote(null);
  }

  async function submit(): Promise<void> {
    if (!data) return;
    const items = Object.entries(checked)
      .map(([marketId, amountText]) => {
        const result = data.results.find((r) => r.marketId === marketId);
        const amount = Number(amountText);
        if (!result || !Number.isFinite(amount) || amount <= 0) return null;
        return {
          scanId: data.scanId,
          marketId,
          outcome: result.outcome,
          amount,
          price: result.price,
          question: result.question,
        };
      })
      .filter((i) => i !== null);
    if (items.length === 0) {
      setSubmitError(
        "Check at least one market and enter a dollar amount above 0 for it first.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${apiBase}/user-selections`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const body = (await res.json()) as {
        booked?: unknown[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setChecked({});
      setSubmitNote(
        `Booked ${body.booked?.length ?? items.length} selection${items.length === 1 ? "" : "s"} — track them in the “Your Selections” tab below.`,
      );
      onBooked();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const checkedTotal = Object.values(checked).reduce(
    (sum, v) => sum + (Number.isFinite(Number(v)) ? Number(v) : 0),
    0,
  );

  return (
    <div className="split-panel">
      <h2 className="split-title">Market Scans</h2>
      <div className="scan-buttons" role="tablist" aria-label="Polymarket scans">
        {scans.map((s, i) => (
          <button
            key={s.id}
            className={activeScan === s.id ? "tab small active" : "tab small"}
            onClick={() => loadScan(s.id)}
            title={s.description}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {loadError && <p className="error">{loadError}</p>}
      {!activeScan && !loadError && (
        <p className="empty">
          Select a scan — its markets pull up here, live from Polymarket.
          Check the ones you want, enter an amount for each, then Submit.
        </p>
      )}
      {loading && <p className="empty">Running the scan against Polymarket…</p>}

      {data && (
        <>
          <p className="scan-meta">
            {data.count === null
              ? "Total in-band count still computing in the background — top 20 by volume below."
              : `${data.count} market${data.count === 1 ? "" : "s"} ${data.scanId === "4" ? "under 25¢ ending within 10 days" : "in the 82–90¢ band"} · showing ${data.results.length}`}
            {" · "}fetched {fmtTime(data.fetchedAt)}
            <button
              className="info-btn"
              onClick={() => loadScan(data.scanId)}
              title="Re-run this scan"
              aria-label="Re-run this scan"
            >
              ↻
            </button>
          </p>
          <ul className="scan-list">
            {data.results.map((r) => {
              const isChecked = r.marketId in checked;
              return (
                <li key={r.marketId} className="scan-row">
                  <label className="scan-check">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => toggleRow(r.marketId, e.target.checked)}
                    />
                  </label>
                  <span className="scan-main">
                    <strong>{r.question}</strong>
                    <span className="scan-sub">
                      {r.outcome} · {fmtCents(r.price)} · vol {fmtVolume(r.volume)}
                      {r.endDate ? ` · ends ${fmtTime(r.endDate)}` : ""}
                    </span>
                  </span>
                  <span className="scan-amount">
                    $
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="0"
                      aria-label={`Dollar amount for ${r.question}`}
                      value={checked[r.marketId] ?? ""}
                      disabled={!isChecked}
                      onChange={(e) =>
                        setChecked((prev) => ({
                          ...prev,
                          [r.marketId]: e.target.value,
                        }))
                      }
                    />
                  </span>
                </li>
              );
            })}
          </ul>
          {data.results.length === 0 && (
            <p className="empty">
              {data.scanId === "4"
                ? "No long shots match right now."
                : "No markets in the 82–90¢ band right now."}
            </p>
          )}
          <div className="scan-submit-row">
            <span className="scan-checked-total">
              {Object.keys(checked).length} checked · {fmtMoney(checkedTotal)}
            </span>
            <button
              className="btn mode-switch-btn"
              onClick={() => void submit()}
              disabled={submitting || Object.keys(checked).length === 0}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
          {submitError && <p className="error">{submitError}</p>}
          {submitNote && <p className="submit-note">{submitNote}</p>}
        </>
      )}
      {alloc && <PoolLine alloc={alloc} />}
    </div>
  );
}

// ------------------------------------------------------------ bot trades ---

interface BotTradesProps {
  apiBase: string;
  alloc: AllocationState | null;
  refreshAlloc: () => void;
  stats: BotStats | undefined;
  trades: FleetEvent[];
}

function BotTradesPanel({
  apiBase,
  alloc,
  refreshAlloc,
  stats,
  trades,
}: BotTradesProps) {
  const [amountText, setAmountText] = useState("");
  const [amountDirty, setAmountDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Seed the allocation input from the server value until the user
  // starts typing in it.
  useEffect(() => {
    if (alloc && !amountDirty) setAmountText(String(alloc.botAllocation));
  }, [alloc, amountDirty]);

  async function saveAllocation(): Promise<void> {
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a dollar amount of 0 or more.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/allocations/bot`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setNote(`Bot Trades allocation set to ${fmtMoney(amount)}.`);
      setAmountDirty(false);
      refreshAlloc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function flipSleeve(key: keyof SleeveToggles, on: boolean): Promise<void> {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/allocations/sleeves`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [key]: on }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      refreshAlloc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the toggle.");
    }
  }

  const recent = trades.slice(0, 12);

  return (
    <div className="split-panel">
      <h2 className="split-title">Bot Trades</h2>

      <div className="bot-alloc-row">
        <label htmlFor="bot-alloc-input">Bot allocation</label>
        <span className="scan-amount">
          $
          <input
            id="bot-alloc-input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={amountText}
            onChange={(e) => {
              setAmountText(e.target.value);
              setAmountDirty(true);
              setNote(null);
            }}
          />
        </span>
        <button
          className="btn"
          onClick={() => void saveAllocation()}
          disabled={busy || !alloc}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="hint">
        The portion of the shared pool the bot trades with, carved out
        of your total available funds. The bot trades only inside it.
      </p>

      <div className="sleeve-rows">
        {SLEEVES.map(({ key, label, hint }) => {
          const on = alloc?.sleeveToggles[key] ?? true;
          return (
            <div key={key} className="sleeve-row">
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${label} sleeve`}
                className={`arm-switch${on ? " on sleeve-on" : ""}`}
                onClick={() => void flipSleeve(key, !on)}
              >
                <span className="arm-knob" />
              </button>
              <span className="sleeve-label">
                <strong>{label}</strong>
                <span className="scan-sub">{hint}</span>
              </span>
              <span className={on ? "sleeve-state on" : "sleeve-state"}>
                {on ? "ON" : "OFF"}
              </span>
            </div>
          );
        })}
      </div>

      {stats && (
        <p className="scan-meta">
          PolyCrypt9000 · equity <strong>{fmtMoney(stats.equity)}</strong> ·
          realized{" "}
          <strong className={stats.realized >= 0 ? "pnl-pos" : "pnl-neg"}>
            {fmtMoney(stats.realized, true)}
          </strong>{" "}
          · {stats.openPositions.length} open · {stats.closes} closed
        </p>
      )}

      {stats && stats.openPositions.length > 0 && (
        <>
          <h3 className="split-subtitle">Open positions</h3>
          <ul className="scan-list">
            {stats.openPositions.map((p) => (
              <li key={p.key} className="scan-row">
                <span className="scan-main">
                  <strong>{p.symbol}</strong>
                  <span className="scan-sub">
                    {p.side ?? ""} {p.qty ?? ""} @{" "}
                    {p.price !== null ? fmtMoney(p.price) : "—"} ·{" "}
                    {fmtTime(p.ts)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="split-subtitle">Recent bot trades</h3>
      {recent.length === 0 && (
        <p className="empty">No bot trades yet — the bot is live.</p>
      )}
      <ul className="scan-list">
        {recent.map((e, i) => (
          <li key={`${e.ts}-${i}`} className="scan-row">
            <span className="scan-main">
              <strong>
                {e.type === "close" ? "closed" : "opened"} {e.symbol ?? ""}
              </strong>
              <span className="scan-sub">{fmtTime(e.ts)}</span>
            </span>
            {e.type === "close" && e.pnl !== null && (
              <span className={e.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                {fmtMoney(e.pnl, true)}
              </span>
            )}
          </li>
        ))}
      </ul>

      {error && <p className="error">{error}</p>}
      {note && <p className="submit-note">{note}</p>}
      {alloc && <PoolLine alloc={alloc} />}
    </div>
  );
}

// -------------------------------------------------------------- split view ---

export interface SplitViewProps {
  apiBase: string;
  stats: BotStats | undefined;
  /** PolyCrypt9000's open/close events, newest first. */
  trades: FleetEvent[];
  /** Called after a batch books, so the Your Selections tab reloads. */
  onBooked: () => void;
}

export function SplitView({ apiBase, stats, trades, onBooked }: SplitViewProps) {
  const [alloc, setAlloc] = useState<AllocationState | null>(null);
  const refreshAlloc = useCallback(() => {
    fetch(`${apiBase}/allocations`)
      .then((res) => res.json() as Promise<AllocationState>)
      .then(setAlloc)
      .catch(() => {
        // Pool line is best-effort; panels still render and the next
        // interaction re-fetches.
      });
  }, [apiBase]);

  useEffect(() => {
    refreshAlloc();
  }, [refreshAlloc]);

  return (
    <div className="split-view">
      <ScanPanel
        apiBase={apiBase}
        alloc={alloc}
        onBooked={() => {
          refreshAlloc();
          onBooked();
        }}
      />
      <BotTradesPanel
        apiBase={apiBase}
        alloc={alloc}
        refreshAlloc={refreshAlloc}
        stats={stats}
        trades={trades}
      />
    </div>
  );
}

// ------------------------------------------------------- your selections ---

export function YourSelectionsTab({
  apiBase,
  refreshKey,
}: {
  apiBase: string;
  refreshKey: number;
}) {
  const [data, setData] = useState<UserSelectionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reloadCount = useRef(0);

  const load = useCallback(() => {
    fetch(`${apiBase}/user-selections`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<UserSelectionsResponse>;
      })
      .then((body) => {
        setData(body);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load.");
      });
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (error) return <p className="error">Could not load your selections: {error}</p>;
  if (!data) return <p className="empty">Loading your selections…</p>;
  if (data.selections.length === 0) {
    return (
      <p className="empty">
        No user selections yet — pick a scan above, check the markets
        you want, enter an amount for each, and press Submit. They'll
        be tracked here, next to the bot's trades, so you can compare.
      </p>
    );
  }

  return (
    <>
      <ul className="feed-list selections-list">
        {data.selections.map((s) => (
          <li key={s.id} className="event selection-row">
            <span className="event-main">
              <strong>{s.question}</strong>
              <span className="scan-sub">
                {s.outcome} · via {s.scanLabel} · {fmtMoney(s.amount)} @{" "}
                {fmtCents(s.priceAtSelection)} → now {fmtCents(s.currentPrice)}{" "}
                · {s.status}
              </span>
            </span>
            <span className="selection-value">
              {fmtMoney(s.currentValue)}{" "}
              <span className={s.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
                ({fmtMoney(s.pnl, true)})
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="scan-meta selections-totals">
        Totals: allocated <strong>{fmtMoney(data.totals.totalAllocated)}</strong>{" "}
        · current value <strong>{fmtMoney(data.totals.totalCurrentValue)}</strong>{" "}
        · P&amp;L{" "}
        <strong className={data.totals.totalPnl >= 0 ? "pnl-pos" : "pnl-neg"}>
          {fmtMoney(data.totals.totalPnl, true)}
        </strong>
        <button
          className="info-btn"
          onClick={() => {
            reloadCount.current += 1;
            load();
          }}
          title="Re-price from Polymarket"
          aria-label="Re-price selections from Polymarket"
        >
          ↻
        </button>
      </p>
      <p className="hint">
        Selections book inside the app in this cut — external paper
        execution (Kalshi demo / Alpaca) arrives with the next phase.
        Prices re-fetch from Polymarket when this tab loads.
      </p>
    </>
  );
}
