import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { BotConfig, FleetEvent } from "@fleet/shared";
import type {
  AlpacaClientLike,
  AlpacaOrder,
  AlpacaPosition,
} from "./alpaca.js";
import type { ControlClient, PendingLiquidation } from "./control.js";
import { priorHigh, rsiWilder, sma, type DailyBar } from "./indicators.js";

/**
 * PHASE 1 — Trendia on the Alpaca PAPER account with real market data.
 *
 * Scope (per PLAN.md Phase 1): exactly one strategy plugin —
 * `momentum_trend` (Trendia) — runs end-to-end on real data:
 *
 * - Daily bars from Alpaca → Trendia's .md rules, computed exactly as
 *   written: trend filter (price > 200DMA, 50DMA > 200DMA), entry on a
 *   20-day high breakout with RSI(14) in 55–80, exits on a 7% stop loss,
 *   an 8% trailing stop, or a close below the 50DMA. SPY losing its own
 *   uptrend blocks new entries ("cash is a position" — her philosophy).
 * - Every entry/exit decision is written as a full decision record on the
 *   event stream: trigger text, indicator values at signal time, a
 *   snapshot of the params in force, and the Risk Gate verdict. Gate-
 *   rejected entries are logged as decisions with no trade. Routine
 *   no-signal symbols are counted in the engine log, not logged.
 * - The Risk Gate enforces the .md risk block BEFORE any order: max
 *   position %, max positions, the daily loss cap, and the kill switch
 *   (halted = no order flow; pending orders cancelled; kill+liquidate
 *   closes this bot's positions and reports honestly).
 * - Money: Trendia trades a virtual $10,000 book (the decided paper
 *   allocation — $5,000 originally, doubled fleet-wide by Keith on
 *   2026-11-03) inside the shared paper account. Sizing and the loss
 *   cap are computed against the book, never the account's $100k.
 * - Schedule per the .md: evaluate on completed daily bars, entries fill
 *   at the next market open (time_in_force "opg").
 *
 * Durable state (peaks, entries, pending orders, realized PnL, decision
 * counter) persists to PAPER_STATE_PATH so restarts reconcile against
 * the broker instead of forgetting open positions.
 */

/**
 * Declared starting capital for Trendia's virtual book (Keith,
 * 2026-11-03: fleet-wide doubling, $5,000 → $10,000). Persisted in
 * state as startCapital; see the boot re-seed below.
 */
const STARTING_CAPITAL = 10000;
/** The only starting capital before 2026-11-03 — reads pre-doubling state files. */
const LEGACY_STARTING_CAPITAL = 5000;
const TRAILING_STOP_PCT = 8; // rules.exit prose in trendia.md
/** Tick cadence; overridable for tests (PAPER_TICK_MS). */
const TICK_MS = Number(process.env.PAPER_TICK_MS ?? 30_000) || 30_000;
const BARS_LOOKBACK_DAYS = 420;

export interface PaperControl {
  isHalted: (codename: string) => boolean;
  drainLiquidations: () => PendingLiquidation[];
  reportLiquidation: ControlClient["reportLiquidation"];
  /**
   * Reset All Data (v22). Optional so control doubles written before
   * v22 (older harnesses) still satisfy the interface; production
   * wiring (createControlRouter below) always provides both. A runner
   * peeks pendingReset() each tick and, on a new id, cancels its own
   * open orders, swaps in a fresh boot state, and notes application.
   */
  pendingReset?: ControlClient["pendingReset"];
  noteResetApplied?: ControlClient["noteResetApplied"];
}

interface TrackedEntry {
  qty: number;
  entryPrice: number;
  peak: number;
  decisionId: string;
}

interface PendingEntry {
  orderId: string;
  symbol: string;
  qty: number;
  estCost: number;
  decisionId: string;
  reason: string;
}

interface PendingExit {
  orderId: string;
  symbol: string;
  qty: number;
  entryPrice: number;
  decisionId: string;
  trigger: string;
}

interface PaperState {
  /** Declared starting capital this book was seeded with (re-seed rule). */
  startCapital: number;
  realizedTotal: number;
  realizedByDay: Record<string, number>;
  entries: Record<string, TrackedEntry>;
  pendingEntries: PendingEntry[];
  pendingExits: PendingExit[];
  lastEvalDate: string | null;
  decisionCounter: number;
}

interface TrendiaParams {
  maxPositionPct: number;
  maxPositions: number;
  stopLossPct: number;
  maxDailyLossPct: number;
  universe: string[];
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const money = (n: number): string =>
  `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function numericOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function etDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(d);
}

function etMinutes(d: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Bars whose session is complete: drop today's bar before 16:05 ET. */
function completedBars(bars: DailyBar[]): DailyBar[] {
  const today = etDate();
  const afterClose = etMinutes() >= 16 * 60 + 5;
  return bars.filter((b) => b.date < today || (b.date === today && afterClose));
}

export function startPaperTrader(
  bot: BotConfig,
  client: AlpacaClientLike,
  post: (event: FleetEvent) => Promise<void>,
  control: PaperControl,
): void {
  const params: TrendiaParams = {
    maxPositionPct: numericOr(bot.risk.max_position_pct, 20),
    maxPositions: numericOr(bot.risk.max_positions, 5),
    stopLossPct: numericOr(bot.risk.stop_loss_pct, 7),
    maxDailyLossPct: numericOr(bot.risk.max_daily_loss_pct, 1.5),
    universe: Array.isArray(bot.universe)
      ? bot.universe.filter((v): v is string => typeof v === "string")
      : [],
  };
  const statePath =
    process.env.PAPER_STATE_PATH ?? "data/paper-trendia-state.json";

  const freshState = (): PaperState => ({
    startCapital: STARTING_CAPITAL,
    realizedTotal: 0,
    realizedByDay: {},
    entries: {},
    pendingEntries: [],
    pendingExits: [],
    lastEvalDate: null,
    decisionCounter: 0,
  });

  let state: PaperState = freshState();
  let persistedRaw: Partial<PaperState> | null = null;
  try {
    if (existsSync(statePath)) {
      persistedRaw = JSON.parse(readFileSync(statePath, "utf8")) as PaperState;
      state = { ...freshState(), ...persistedRaw };
      // State files written before the startCapital field existed were
      // seeded at the legacy $5,000 — say so explicitly, or the merge
      // above would silently dress an old book in the new capital.
      if (typeof persistedRaw.startCapital !== "number") {
        state.startCapital = LEGACY_STARTING_CAPITAL;
      }
      console.log(`[paper] ${bot.name}: restored state from ${statePath}`);
    }
  } catch (err) {
    console.warn(`[paper] ${bot.name}: state file unreadable, starting fresh:`, err instanceof Error ? err.message : err);
  }

  const save = (): void => {
    try {
      mkdirSync(dirname(statePath), { recursive: true });
      writeFileSync(`${statePath}.tmp`, JSON.stringify(state, null, 2));
      renameSync(`${statePath}.tmp`, statePath);
    } catch (err) {
      console.warn(`[paper] ${bot.name}: state save failed:`, err instanceof Error ? err.message : err);
    }
  };

  // ---- Boot re-seed (Keith, 2026-11-03) --------------------------------
  // If the declared starting capital changed since this book was
  // seeded, an UNTOUCHED book (equity exactly at the old start — i.e.
  // zero realized PnL — with no filled positions tracked and no
  // pending exits) re-seeds to the new capital and logs it. A touched
  // book keeps its original start and logs the skip: resizing a book
  // with a track record would rewrite its percentages. Pending
  // unfilled entry orders do not block a re-seed and are left alone.
  if (persistedRaw !== null && state.startCapital !== STARTING_CAPITAL) {
    const untouched =
      state.realizedTotal === 0 &&
      Object.values(state.realizedByDay).every((v) => v === 0) &&
      Object.keys(state.entries).length === 0 &&
      state.pendingExits.length === 0;
    if (untouched) {
      const from = state.startCapital;
      state.startCapital = STARTING_CAPITAL;
      console.log(
        `[paper] ${bot.name}: book re-seeded ${money(from)} → ${money(STARTING_CAPITAL)} (starting capital changed; book was untouched)`,
      );
    } else {
      console.log(
        `[paper] ${bot.name}: starting capital changed ${money(state.startCapital)} → ${money(STARTING_CAPITAL)} but the book is not untouched (realized ${money(state.realizedTotal)}, ${Object.keys(state.entries).length} open position(s), ${state.pendingExits.length} pending exit(s)) — resize skipped, book keeps its ${money(state.startCapital)} start`,
      );
    }
    save();
  }

  const bookEquity = (): number => state.startCapital + state.realizedTotal;
  const realizedToday = (): number => state.realizedByDay[etDate()] ?? 0;

  const emit = (
    partial: Omit<FleetEvent, "bot" | "decision_id" | "ts">,
    decisionId?: string,
  ): string => {
    let id = decisionId;
    if (!id) {
      state.decisionCounter += 1;
      id = `${bot.codename}-${state.decisionCounter}`;
    }
    const event: FleetEvent = {
      ...partial,
      bot: bot.name,
      decision_id: id,
      ts: new Date().toISOString(),
    };
    console.log(
      `[paper] ${event.bot} ${event.type} ${event.symbol ?? ""} ${event.side ?? ""} ` +
        `qty=${event.qty ?? "-"} @ ${event.price ?? "-"} ` +
        `${event.pnl !== null ? `pnl=${event.pnl.toFixed(2)} ` : ""}— ${event.reason}`,
    );
    void post(event);
    return id;
  };

  const paramsSnapshot = (): string =>
    `params snapshot: max_position_pct ${params.maxPositionPct}, max_positions ${params.maxPositions}, ` +
    `stop_loss ${params.stopLossPct}%, trailing_stop ${TRAILING_STOP_PCT}%, daily_loss_cap ${params.maxDailyLossPct}%`;

  let haltCancelHandled = false;
  let booted = false;
  /** The last Reset All Data id this runner applied (v22 idempotency). */
  let lastResetId: string | null = null;

  /**
   * Cancel this bot's OWN open broker orders (kill switch: pending
   * orders die). Phase 4 (2026-11-04): scoped to the order IDs in her
   * own state — the account is shared with Snapback now, and the old
   * cancel-by-universe sweep could have cancelled Snapback's resting
   * orders on the overlapping symbols (SPY/QQQ/AAPL/MSFT/AMD).
   */
  async function cancelOpenOrders(): Promise<void> {
    const ids = [
      ...state.pendingEntries.map((p) => p.orderId),
      ...state.pendingExits.map((p) => p.orderId),
    ];
    const open = await client.getOpenOrders().catch(() => [] as AlpacaOrder[]);
    for (const id of ids) {
      const order = open.find((o) => o.id === id);
      if (!order) continue;
      try {
        await client.cancelOrder(id);
        console.log(`[paper] ${bot.name}: cancelled open order ${id} (${order.symbol})`);
      } catch (err) {
        console.warn(
          `[paper] ${bot.name}: cancel of order ${id} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  /** Poll pending entry/exit orders; turn fills into stream events. */
  async function pollPending(): Promise<void> {
    for (const p of [...state.pendingEntries]) {
      const order = await client.getOrder(p.orderId);
      if (order.status === "filled" && order.filledAvgPrice !== null) {
        state.entries[p.symbol] = {
          qty: order.filledQty,
          entryPrice: order.filledAvgPrice,
          peak: order.filledAvgPrice,
          decisionId: p.decisionId,
        };
        state.pendingEntries = state.pendingEntries.filter((x) => x.orderId !== p.orderId);
        emit(
          {
            type: "open", symbol: p.symbol, side: "buy", qty: order.filledQty,
            price: round2(order.filledAvgPrice), pnl: null,
            reason: `PAPER · entry filled at market open @ ${money(order.filledAvgPrice)} — ${p.reason}`,
          },
          p.decisionId,
        );
        save();
      } else if (["canceled", "cancelled", "expired", "rejected"].includes(order.status)) {
        state.pendingEntries = state.pendingEntries.filter((x) => x.orderId !== p.orderId);
        emit(
          {
            type: "signal", symbol: p.symbol, side: "buy", qty: p.qty, price: null, pnl: null,
            reason: `PAPER · entry order ${order.status} before filling — no position taken (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
      }
    }
    for (const p of [...state.pendingExits]) {
      const order = await client.getOrder(p.orderId);
      if (order.status === "filled" && order.filledAvgPrice !== null) {
        const pnl = round2((order.filledAvgPrice - p.entryPrice) * p.qty);
        state.realizedTotal = round2(state.realizedTotal + pnl);
        const day = etDate();
        state.realizedByDay[day] = round2((state.realizedByDay[day] ?? 0) + pnl);
        delete state.entries[p.symbol];
        state.pendingExits = state.pendingExits.filter((x) => x.orderId !== p.orderId);
        emit(
          {
            type: "close", symbol: p.symbol, side: "sell", qty: p.qty,
            price: round2(order.filledAvgPrice), pnl,
            reason: `PAPER · exit filled @ ${money(order.filledAvgPrice)} — ${p.trigger}`,
          },
          p.decisionId,
        );
        save();
      } else if (["canceled", "cancelled", "expired", "rejected"].includes(order.status)) {
        state.pendingExits = state.pendingExits.filter((x) => x.orderId !== p.orderId);
        console.warn(`[paper] ${bot.name}: exit order for ${p.symbol} ended ${order.status}; position remains open and will re-trigger`);
        save();
      }
    }
  }

  /** Submit an exit for a held symbol and track it to its fill. */
  async function submitExit(
    symbol: string,
    trigger: string,
    decisionReason: string,
    currentPrice: number,
  ): Promise<string> {
    const entry = state.entries[symbol];
    if (!entry) return "";
    const decisionId = emit({
      type: "signal", symbol, side: "sell", qty: entry.qty,
      price: round2(currentPrice), pnl: null, reason: decisionReason,
    });
    const order = await client.closePosition(symbol);
    state.pendingExits.push({
      orderId: order.id, symbol, qty: entry.qty,
      entryPrice: entry.entryPrice, decisionId, trigger,
    });
    save();
    return decisionId;
  }

  /** Intraday stop checks against live prices (market hours only). */
  async function checkStops(): Promise<void> {
    for (const [symbol, entry] of Object.entries(state.entries)) {
      if (state.pendingExits.some((p) => p.symbol === symbol)) continue;
      const price = await client.getLatestPrice(symbol);
      if (!Number.isFinite(price) || price <= 0) continue;
      if (price > entry.peak) {
        entry.peak = price;
        save();
      }
      const stopPrice = entry.entryPrice * (1 - params.stopLossPct / 100);
      const trailPrice = entry.peak * (1 - TRAILING_STOP_PCT / 100);
      if (price <= stopPrice) {
        await submitExit(
          symbol,
          `stop loss (${params.stopLossPct}%)`,
          `PAPER · EXIT — stop loss: ${symbol} @ ${money(price)} is ${(((entry.entryPrice - price) / entry.entryPrice) * 100).toFixed(1)}% below entry ${money(entry.entryPrice)} (limit ${money(stopPrice)}) · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
          price,
        );
      } else if (price <= trailPrice) {
        await submitExit(
          symbol,
          `trailing stop (${TRAILING_STOP_PCT}% from peak ${money(entry.peak)})`,
          `PAPER · EXIT — trailing stop: ${symbol} @ ${money(price)} is ${(((entry.peak - price) / entry.peak) * 100).toFixed(1)}% below its peak ${money(entry.peak)} since entry ${money(entry.entryPrice)} (trail limit ${money(trailPrice)}) · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
          price,
        );
      }
    }
  }

  /** The daily signal evaluation on completed bars. */
  async function evaluate(): Promise<void> {
    const startISO = new Date(Date.now() - BARS_LOOKBACK_DAYS * 86_400_000).toISOString();
    const barsBySymbol = new Map<string, DailyBar[]>();
    for (const symbol of [...params.universe, "SPY"]) {
      barsBySymbol.set(symbol, completedBars(await client.getDailyBars(symbol, startISO)));
    }
    const spyBars = barsBySymbol.get("SPY") ?? [];
    const spyCloses = spyBars.map((b) => b.close);
    const spyLast = spyCloses[spyCloses.length - 1] ?? 0;
    const spy50 = sma(spyCloses, 50);
    const spy200 = sma(spyCloses, 200);
    const regimeOk = spy50 !== null && spy200 !== null && spyLast > spy200 && spy50 > spy200;

    const positions = await client.getPositions();
    const held = new Set(positions.map((p) => p.symbol));
    let noSignal = 0;
    let entriesSubmitted = 0;
    let rejected = 0;

    for (const symbol of params.universe) {
      const bars = barsBySymbol.get(symbol) ?? [];
      const closes = bars.map((b) => b.close);
      const last = bars[bars.length - 1];
      if (!last || closes.length < 201) {
        noSignal += 1;
        continue;
      }
      const sma50 = sma(closes, 50);
      const sma200 = sma(closes, 200);

      // Held? The only daily-bar exit: close below the 50DMA.
      if (held.has(symbol) && state.entries[symbol]) {
        if (sma50 !== null && last.close < sma50) {
          await submitExit(
            symbol,
            "close below the 50DMA (trend broken)",
            `PAPER · EXIT — ${symbol} closed @ ${money(last.close)}, below its 50DMA ${money(sma50)} — trend broken · entry ${money(state.entries[symbol]!.entryPrice)} · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
            last.close,
          );
        } else {
          noSignal += 1;
        }
        continue;
      }
      if (held.has(symbol) || state.pendingEntries.some((p) => p.symbol === symbol)) {
        continue; // held but untracked (adopted positions are tracked; safety net)
      }

      // Entry filters, exactly as trendia.md states them.
      const breakout = priorHigh(bars, 20);
      const rsi = rsiWilder(closes, 14);
      const trendOk = sma50 !== null && sma200 !== null && last.close > sma200 && sma50 > sma200;
      const breakoutOk = breakout !== null && last.close > breakout;
      const rsiOk = rsi !== null && rsi >= 55 && rsi <= 80;
      if (!trendOk || !breakoutOk || !rsiOk) {
        noSignal += 1;
        continue;
      }

      const indicators =
        `20-day breakout: close ${money(last.close)} above prior 20-day high ${money(breakout!)}; ` +
        `RSI(14) ${rsi!.toFixed(1)} (band 55–80); close above 200DMA ${money(sma200!)}; 50DMA ${money(sma50!)} above 200DMA`;

      // ---- Risk Gate -------------------------------------------------
      const openCount =
        Object.keys(state.entries).length + state.pendingEntries.length;
      const dailyCapHit =
        realizedToday() <= -((params.maxDailyLossPct / 100) * state.startCapital);
      const committed = Object.values(state.entries).reduce(
        (sum, e) => sum + e.entryPrice * e.qty,
        0,
      ) + state.pendingEntries.reduce((sum, p) => sum + p.estCost, 0);
      const target = bookEquity() * (params.maxPositionPct / 100);
      const qty = Math.floor(target / last.close);
      const estCost = qty * last.close;

      let verdict: string | null = null;
      if (!regimeOk) {
        verdict = `SPY is not in an uptrend (close ${money(spyLast)} vs 200DMA ${spy200 ? money(spy200) : "n/a"}) — cash is a position`;
      } else if (dailyCapHit) {
        verdict = `daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((params.maxDailyLossPct / 100) * state.startCapital))}`;
      } else if (openCount >= params.maxPositions) {
        verdict = `max positions reached (${openCount}/${params.maxPositions})`;
      } else if (qty < 1) {
        verdict = `one share (${money(last.close)}) exceeds the ${params.maxPositionPct}% position cap (${money(target)})`;
      } else if (committed + estCost > bookEquity()) {
        verdict = `the ${money(state.startCapital)} book is fully committed (${money(committed)} open + ${money(estCost)} new > ${money(bookEquity())})`;
      }

      if (verdict !== null) {
        rejected += 1;
        emit({
          type: "signal", symbol, side: "buy", qty, price: round2(last.close), pnl: null,
          reason: `PAPER · ENTRY signal — ${indicators} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
        });
        continue;
      }

      const decisionId = emit({
        type: "signal", symbol, side: "buy", qty, price: round2(last.close), pnl: null,
        reason:
          `PAPER · ENTRY signal — ${indicators} · Risk Gate: APPROVED — ${params.maxPositionPct}% of the ${money(bookEquity())} book = ${money(target)} → ${qty} shares ≈ ${money(estCost)}; ` +
          `positions ${openCount}/${params.maxPositions}; SPY uptrend intact · ${paramsSnapshot()} · order: market-on-open, fills at the next session open`,
      });
      const order: AlpacaOrder = await client.createOrder({
        symbol, qty, side: "buy", type: "market", timeInForce: "opg",
      });
      state.pendingEntries.push({
        orderId: order.id, symbol, qty, estCost,
        decisionId, reason: `20-day breakout, RSI(14) ${rsi!.toFixed(1)}`,
      });
      entriesSubmitted += 1;
      save();
    }

    state.lastEvalDate = etDate();
    save();
    console.log(
      `[paper] ${bot.name}: daily evaluation complete — ${entriesSubmitted} entries submitted, ` +
        `${rejected} gate rejections, ${noSignal} no-signal; SPY regime ${regimeOk ? "OK" : "OFF"}; book equity ${money(bookEquity())}`,
    );
  }

  /** Kill + liquidate for this bot: cancel orders, close positions, report. */
  async function handleLiquidations(): Promise<void> {
    for (const req of control.drainLiquidations()) {
      if (req.codename !== bot.codename) continue;
      const closed: { codename: string; symbol: string; qty: number | null; price: number | null; pnl: number | null }[] = [];
      const failed: { codename: string; symbol: string; reason: string }[] = [];
      try {
        await cancelOpenOrders();
        state.pendingEntries = [];
        const positions: AlpacaPosition[] = await client.getPositions();
        // Phase 4 (2026-11-04): close ONLY her tracked positions. The
        // old sweep closed every broker position in her universe —
        // with Snapback live on the same account, that would have
        // liquidated Snapback's shares in the overlapping symbols.
        for (const symbol of Object.keys(state.entries)) {
          const pos = positions.find((p) => p.symbol === symbol);
          if (!pos) {
            failed.push({
              codename: bot.codename, symbol,
              reason: "tracked in state but no broker position to close",
            });
            continue;
          }
          const entry = state.entries[pos.symbol];
          try {
            const order = await client.closePosition(pos.symbol);
            state.pendingExits.push({
              orderId: order.id, symbol: pos.symbol, qty: pos.qty,
              entryPrice: entry?.entryPrice ?? pos.avgEntryPrice,
              decisionId: entry?.decisionId ?? "liquidation",
              trigger: "KILL + LIQUIDATE",
            });
            closed.push({
              codename: bot.codename, symbol: pos.symbol, qty: pos.qty,
              price: round2(pos.currentPrice),
              pnl: entry ? round2((pos.currentPrice - entry.entryPrice) * pos.qty) : null,
            });
          } catch (err) {
            failed.push({
              codename: bot.codename, symbol: pos.symbol,
              reason: `close order failed: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
        }
        save();
      } catch (err) {
        failed.push({
          codename: bot.codename, symbol: "(all)",
          reason: `liquidation failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      await control.reportLiquidation(req.id, bot.codename, closed, failed);
      console.log(
        `[paper] ${bot.name}: KILL + LIQUIDATE executed — ${closed.length} close orders submitted, ${failed.length} failures`,
      );
    }
  }

  /**
   * Boot reconcile — STATE-ONLY (tightened in Phase 4, 2026-11-04).
   * Until now this ADOPTED any untracked broker position in her
   * universe (a safety net for state loss). With Snapback live on the
   * same paper account and an overlapping universe (SPY/QQQ/AAPL/
   * MSFT/AMD), adoption would have Trendia claiming Snapback's shares
   * as her own on her next boot. Untracked positions are now logged
   * as foreign and ignored; only positions in her own state (or with
   * a pending exit) are managed.
   */
  async function reconcile(): Promise<void> {
    const positions = await client.getPositions();
    for (const pos of positions) {
      if (!params.universe.includes(pos.symbol)) continue;
      if (!state.entries[pos.symbol] && !state.pendingExits.some((p) => p.symbol === pos.symbol)) {
        console.log(
          `[paper] ${bot.name}: foreign position ignored at boot — ${pos.qty} × ${pos.symbol} @ avg ${money(pos.avgEntryPrice)} is held on the shared account but is not in Trendia's state (state-only reconcile; never adopted)`,
        );
      }
    }
    for (const symbol of Object.keys(state.entries)) {
      if (!positions.some((p) => p.symbol === symbol) && !state.pendingExits.some((p) => p.symbol === symbol)) {
        console.log(`[paper] ${bot.name}: ${symbol} in state but not at broker — dropping from tracking`);
        delete state.entries[symbol];
      }
    }
    save();
  }

  async function tick(): Promise<void> {
    try {
      // Reset All Data (v22): checked first, before liquidations and
      // polls, so nothing from the old book can act or report into
      // the fresh history. Idempotent per reset id. Broker caveat:
      // this wipes the APP book only — positions open at the broker
      // are NOT closed; they become untracked ("foreign") and the
      // state-only reconcile ignores them from here on.
      const pendingReset = control.pendingReset?.();
      if (pendingReset && pendingReset.id !== lastResetId) {
        lastResetId = pendingReset.id;
        await cancelOpenOrders().catch(() => {});
        state = freshState();
        haltCancelHandled = false;
        booted = false;
        save();
        control.noteResetApplied?.(pendingReset.id, bot.codename);
        console.log(
          `[paper] ${bot.name}: DATA RESET applied — book wiped back to the $${STARTING_CAPITAL} start; app positions erased (broker-side positions untouched, now untracked)`,
        );
        return;
      }

      await handleLiquidations();
      await pollPending();

      const haltedNow = control.isHalted(bot.codename);
      if (haltedNow) {
        if (!haltCancelHandled) {
          haltCancelHandled = true;
          await cancelOpenOrders();
          state.pendingEntries = [];
          save();
          console.log(`[paper] ${bot.name}: HALTED — open orders cancelled, no order flow until resumed`);
        }
        return;
      }
      haltCancelHandled = false;

      if (!booted) {
        booted = true;
        await reconcile();
      }

      const clock = await client.getClock();
      if (clock.isOpen) await checkStops();

      // Daily evaluation: once per ET date — after the close, or as a
      // catch-up when the engine was down (older completed bars are
      // used; entries still fill at the next open, per the .md).
      const today = etDate();
      if (state.lastEvalDate !== today) {
        const yesterday = etDate(new Date(Date.now() - 86_400_000));
        const missedDays = state.lastEvalDate === null || state.lastEvalDate < yesterday;
        if (etMinutes() >= 16 * 60 + 5 || missedDays) {
          await evaluate();
        }
      }
    } catch (err) {
      console.error(
        `[paper] ${bot.name}: tick failed (will retry):`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log(
    `[paper] ${bot.name}: Phase 1 live-paper runner started — universe ${params.universe.join("/")}, ` +
      `book ${money(bookEquity())}, evaluating daily bars, entries at next open`,
  );
  void tick();
  setInterval(() => void tick(), TICK_MS);
}

/**
 * Split the engine's single control channel between the real paper
 * runners and the simulator: each consumer sees only its own bots'
 * liquidation requests. (The underlying client's drain marks requests
 * consumed, so exactly one router may drain it.)
 */
export function createControlRouter(control: ControlClient): {
  forBot: (codename: string) => PaperControl;
  /** Control view for a set of codenames (Phase 3 runner registry). */
  forBots: (codenames: readonly string[]) => PaperControl;
  forOthers: (excluded: string | readonly string[]) => PaperControl;
} {
  let queue: PendingLiquidation[] = [];
  const pump = (): void => {
    queue.push(...control.drainLiquidations());
  };
  const take = (pred: (p: PendingLiquidation) => boolean): PendingLiquidation[] => {
    pump();
    const mine = queue.filter(pred);
    queue = queue.filter((p) => !pred(p));
    return mine;
  };
  const view = (pred: (p: PendingLiquidation) => boolean): PaperControl => ({
    isHalted: control.isHalted,
    drainLiquidations: () => take(pred),
    reportLiquidation: control.reportLiquidation,
    // Reset is fleet-wide, not per-bot: every view sees the same
    // pending reset and notes application for its own codename(s).
    pendingReset: control.pendingReset,
    noteResetApplied: control.noteResetApplied,
  });
  return {
    forBot: (codename) => view((p) => p.codename === codename),
    forBots: (codenames) => view((p) => codenames.includes(p.codename)),
    forOthers: (excluded) => {
      const set = typeof excluded === "string" ? [excluded] : excluded;
      return view((p) => !set.includes(p.codename));
    },
  };
}
