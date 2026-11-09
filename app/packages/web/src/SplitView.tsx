import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AllocationState,
  FleetMode,
  ScanDefinition,
  ScanResultsResponse,
  SleeveAvailability,
  SleeveToggles,
  UserSelectionValuation,
  UserSelectionsResponse,
} from "@fleet/shared/types";
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
 * pool, the three sleeve toggles, the animated landscape (Phase
 * PM4), and PolyCrypt9000's open positions below it, rendered from
 * the same event-stream stats the landscape uses.
 *
 * ONE shared pool under both sides (Keith, 2026-11-08):
 * remaining = totalFunds − botAllocation − Σ open user selections.
 * Both panels read the same GET /allocations state.
 *
 * Phase PM5: when NO scan is selected, the left panel's results area
 * is the home for the user's current selections/holdings (the same
 * re-priced book the “Your Selections” tab below shows). Selecting a
 * scan swaps the area to that scan; clicking the active scan chip
 * again deselects it and returns to the holdings view.
 *
 * Phase PM6: the Bot Trades panel renders the API-computed sleeve
 * availability that rides along on GET /allocations — a sleeve that
 * can't really trade in the current run mode is greyed, its toggle
 * disabled, and its reason shown. The stored toggle preferences are
 * rendered as-is underneath the greying; availability never edits
 * them. App passes the desired run mode down so a mode flip
 * re-fetches this state (availability is never stale).
 */

const SLEEVES: { key: keyof SleeveToggles; label: string; hint: string }[] = [
  { key: "crypto", label: "Crypto", hint: "BTC / ETH / SOL breakout sleeve" },
  { key: "kalshi", label: "Kalshi", hint: "Kalshi prediction-markets sleeve" },
  { key: "polymarket", label: "Polymarket", hint: "Polymarket shadow sleeve" },
];

/** Phase PM6: one sleeve's server-computed availability from the
 *  allocations state (undefined until the state loads — the panel
 *  then renders exactly as it did before PM6). */
function sleeveAvailability(
  alloc: AllocationState | null,
  key: keyof SleeveToggles,
): SleeveAvailability | undefined {
  return alloc?.sleeveAvailability.find((a) => a.sleeve === key);
}

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
  /** Phase PM5: bumped to re-price the holdings view (the no-scan
   * state) after a Submit books new selections. */
  const [holdingsKey, setHoldingsKey] = useState(0);

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

  /** Phase PM5: clicking the active scan chip again deselects the
   * scan — the panel returns to the Your Selections holdings view,
   * re-priced on the way back in. */
  const deselectScan = useCallback(() => {
    setActiveScan(null);
    setData(null);
    setChecked({});
    setSubmitError(null);
    setSubmitNote(null);
    setLoadError(null);
    setLoading(false);
    setHoldingsKey((k) => k + 1);
  }, []);

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
      // The user stays on the scan results (PM5), but the holdings
      // view's data just changed — bump its key so it re-prices
      // fresh when they click back to it.
      setHoldingsKey((k) => k + 1);
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
      {/* Phase PM5 (Keith's addendum): the explicit way back to the
          holdings view — deselects any active scan. The chip-toggle
          (clicking the active scan again) does the same thing. */}
      <button
        type="button"
        className={activeScan === null ? "holdings-btn active" : "holdings-btn"}
        onClick={deselectScan}
        aria-pressed={activeScan === null}
      >
        Show current holdings
      </button>
      <div className="scan-buttons" role="tablist" aria-label="Polymarket scans">
        {scans.map((s, i) => (
          <button
            key={s.id}
            className={activeScan === s.id ? "tab small active" : "tab small"}
            onClick={() =>
              activeScan === s.id ? deselectScan() : loadScan(s.id)
            }
            title={
              activeScan === s.id
                ? `${s.description} — click again to return to your holdings`
                : s.description
            }
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {loadError && <p className="error">{loadError}</p>}
      {/* Phase PM5: no scan selected → the area is home to the user's
          current holdings (same re-priced book as the tab below). */}
      {!activeScan && (
        <SelectionsHoldings apiBase={apiBase} refreshKey={holdingsKey} />
      )}
      {loading && (
        <div className="scan-loading" role="status" aria-live="polite">
          <div className="scan-spinner" aria-hidden="true" />
          <p>Running the scan against Polymarket…</p>
          <div className="scan-skeleton" aria-hidden="true">
            <div className="scan-skeleton-row" />
            <div className="scan-skeleton-row" />
            <div className="scan-skeleton-row" />
          </div>
        </div>
      )}

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
  /** Phase PM4: the animated bot landscape, rendered by App (it owns
   * the live refs the Landscape component reads) and placed here,
   * above Open Positions. */
  landscape?: ReactNode;
}

function BotTradesPanel({
  apiBase,
  alloc,
  refreshAlloc,
  stats,
  landscape,
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
    // Phase PM6: a sleeve the API says can't trade in this run mode
    // can't be flipped either (its button is disabled as well — this
    // is defense in depth). Its stored preference stays untouched.
    if (sleeveAvailability(alloc, key)?.available === false) return;
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

  // Phase PM6: when NO sleeve can trade in the current run mode,
  // the API greys the allocation control too (botAllocationAvailable).
  const allocBlocked = alloc !== null && !alloc.botAllocationAvailable;

  return (
    <div className="split-panel">
      <h2 className="split-title">Bot Trades</h2>

      <div className={`bot-alloc-row${allocBlocked ? " unavailable" : ""}`}>
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
            disabled={allocBlocked}
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
          disabled={busy || !alloc || allocBlocked}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="hint">
        The portion of the shared pool the bot trades with, carved out
        of your total available funds. The bot trades only inside it.
      </p>
      {allocBlocked && alloc?.botAllocationReason && (
        <p className="panel-block-note" role="note">
          {alloc.botAllocationReason}
        </p>
      )}

      <div className="sleeve-rows">
        {SLEEVES.map(({ key, label, hint }) => {
          const on = alloc?.sleeveToggles[key] ?? true;
          const availability = sleeveAvailability(alloc, key);
          const unavailable = availability !== undefined && !availability.available;
          return (
            <div
              key={key}
              className={`sleeve-row${unavailable ? " unavailable" : ""}`}
            >
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${label} sleeve`}
                className={`arm-switch${on ? " on sleeve-on" : ""}`}
                disabled={unavailable}
                title={unavailable ? availability.reason ?? undefined : undefined}
                onClick={() => void flipSleeve(key, !on)}
              >
                <span className="arm-knob" />
              </button>
              <span className="sleeve-label">
                <strong>{label}</strong>
                <span className="scan-sub">{hint}</span>
                {unavailable && availability.reason && (
                  <span className="sleeve-reason">{availability.reason}</span>
                )}
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

      {/* Phase PM4: the landscape sits where Open Positions began;
          Open Positions move below it. The recent-trades list is
          gone — full history lives in the Trade Stream below. */}
      {landscape}

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
  /** Phase PM4: the animated bot landscape node (built by App, which
   * owns the live refs), rendered in the Bot Trades column. */
  landscape?: ReactNode;
  /** Called after a batch books, so the Your Selections tab reloads. */
  onBooked: () => void;
  /** Phase PM6: the API-owned desired run mode (from App's mode
   * state, kept live by the WebSocket mode broadcasts). Used ONLY as
   * a refresh trigger: when it changes, the allocations state —
   * which carries the server-computed sleeve availability for that
   * mode — is re-fetched, so the Bot Trades greying is never stale
   * after a mode switch. The availability itself always comes from
   * the API, never from this prop. */
  runMode: FleetMode | null;
}

export function SplitView({ apiBase, stats, landscape, onBooked, runMode }: SplitViewProps) {
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
  }, [refreshAlloc, runMode]);

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
        landscape={landscape}
      />
    </div>
  );
}

// ------------------------------------------------------- your selections ---

/**
 * The ONE data path for the user's selections book — shared by the
 * bottom “Your Selections” tab and (Phase PM5) the Market Scans
 * panel's no-scan holdings view. GET /user-selections returns each
 * booked selection re-priced live from Polymarket (currentPrice,
 * currentValue, pnl) plus totals; both surfaces render exactly that.
 */
function useUserSelections(apiBase: string, refreshKey: number) {
  const [data, setData] = useState<UserSelectionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return { data, error, load };
}

/** The per-holding detail line (outcome, entry → current, status). */
function SelectionSubLine({ s }: { s: UserSelectionValuation }) {
  return (
    <span className="scan-sub">
      {s.outcome} · via {s.scanLabel} · {fmtMoney(s.amount)} @{" "}
      {fmtCents(s.priceAtSelection)} → now {fmtCents(s.currentPrice)}{" "}
      · {s.status}
    </span>
  );
}

/** Current value + P&L badge for one holding. */
function SelectionValueBadge({ s }: { s: UserSelectionValuation }) {
  return (
    <span className="selection-value">
      {fmtMoney(s.currentValue)}{" "}
      <span className={s.pnl >= 0 ? "pnl-pos" : "pnl-neg"}>
        ({fmtMoney(s.pnl, true)})
      </span>
    </span>
  );
}

/** The shared totals line (allocated / current value / net P&L). */
function SelectionsTotalsText({ data }: { data: UserSelectionsResponse }) {
  return (
    <>
      Totals: allocated <strong>{fmtMoney(data.totals.totalAllocated)}</strong>{" "}
      · current value <strong>{fmtMoney(data.totals.totalCurrentValue)}</strong>{" "}
      · P&amp;L{" "}
      <strong className={data.totals.totalPnl >= 0 ? "pnl-pos" : "pnl-neg"}>
        {fmtMoney(data.totals.totalPnl, true)}
      </strong>
    </>
  );
}

/**
 * Phase PM5 — the Market Scans panel's default (no scan selected)
 * view: the user's current selections/holdings, at a glance, without
 * scrolling to the bottom tab. Same endpoint, same re-pricing, same
 * totals as YourSelectionsTab. It mounts (and therefore re-prices)
 * on panel load, on return via chip-deselect, and after a Submit
 * (the panel bumps refreshKey).
 */
function SelectionsHoldings({
  apiBase,
  refreshKey,
}: {
  apiBase: string;
  refreshKey: number;
}) {
  const { data, error } = useUserSelections(apiBase, refreshKey);

  return (
    <div className="holdings-view">
      <h3 className="split-subtitle">Your Selections — current holdings</h3>
      {error && (
        <p className="error">Could not load your selections: {error}</p>
      )}
      {!data && !error && <p className="empty">Loading your selections…</p>}
      {data && data.selections.length === 0 && (
        <p className="empty">
          No selections yet — pick a scan above, check some markets, and Submit.
        </p>
      )}
      {data && data.selections.length > 0 && (
        <>
          <ul className="scan-list">
            {data.selections.map((s) => (
              <li key={s.id} className="scan-row">
                <span className="scan-main">
                  <strong>{s.question}</strong>
                  <SelectionSubLine s={s} />
                </span>
                <SelectionValueBadge s={s} />
              </li>
            ))}
          </ul>
          <p className="scan-meta selections-totals">
            <SelectionsTotalsText data={data} />
          </p>
        </>
      )}
      <p className="hint">
        Your booked selections, re-priced live from Polymarket — the
        same book as the “Your Selections” tab below. Pick a scan
        above to browse markets; click the active scan again to come
        back here.
      </p>
    </div>
  );
}

export function YourSelectionsTab({
  apiBase,
  refreshKey,
}: {
  apiBase: string;
  refreshKey: number;
}) {
  const { data, error, load } = useUserSelections(apiBase, refreshKey);
  const reloadCount = useRef(0);

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
              <SelectionSubLine s={s} />
            </span>
            <SelectionValueBadge s={s} />
          </li>
        ))}
      </ul>
      <p className="scan-meta selections-totals">
        <SelectionsTotalsText data={data} />
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
