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
import type { PaperControl } from "./paper.js";
import { rsiWilder, sma, stdDev, type DailyBar } from "./indicators.js";
import { tradingDaysBetween } from "./vega.js";

/**
 * PHASE 4 — Snapback on the Alpaca PAPER account with real market data.
 *
 * Snapback's .md rules, translated literally:
 *
 * - Universe (8): SPY, QQQ, IWM, AAPL, MSFT, AMD, NFLX, TSLA. Daily
 *   bars; signal evaluation runs HOURLY during market hours (her .md
 *   schedule), exits are watched on the fast (30 s) tick.
 * - Trend filter: she only buys when the latest price is above the
 *   200DMA of completed daily closes — "rising rivers" only.
 * - Entry (OR): the stretch, measured LIVE against the last 20
 *   completed daily closes — z-score = (latest price − 20-day mean) /
 *   (population SD of those closes) below −2.0, OR RSI(2) below 10.
 *   RSI(2) is the codebase's Wilder RSI at period 2 over the completed
 *   daily closes with the latest trade price appended as today's
 *   in-progress close, so both legs move intraday as the stretch
 *   changes (the same live-measurement convention Vega uses when he
 *   screens the live price against completed-bar ATR).
 * - Exits (checked every tick in market hours, in this order): stop
 *   loss at entry × (1 − 5%); the 5-trading-day max hold (the Vega
 *   time-stop convention: Mon–Fri days strictly after the entry date);
 *   +4% gain at entry × 1.04; reversion complete when the latest price
 *   reaches the current 20-day mean of completed closes.
 *
 * PHASE 6 AMENDMENT (Keith, 2026-11-04 — "we are not trying to build
 * a day trading bot here"): live evidence on 2026-11-04 showed the
 * mean-reversion exit misfiring — she entered TSLA twice on the
 * RSI(2) leg while price was ABOVE the 20-day mean ($389.03/$388.54
 * vs mean $382.84), so "price ≥ mean" was already true at entry and
 * the 30 s tick closed both positions within minutes (−$1.12,
 * −$1.80). Two changes:
 * - The mean-reversion exit now applies ONLY to positions entered
 *   BELOW the 20-day mean (the dip she actually bought). The entry
 *   records the mean at entry and which side of it the fill was on;
 *   a position entered at/above the mean exits only on the +4%
 *   target, the −5% stop, or the 5-day max hold.
 * - Same-day re-entry cooldown: after any exit of a symbol, she does
 *   not re-enter that symbol again on the same ET trading day (the
 *   last-exit date per symbol persists in state; skips are counted
 *   in the hourly evaluation summary as "cooldown-skips").
 * - Risk Gate before every entry, with her .md numbers: max position
 *   20% of her virtual book, max 6 positions, 1.5% daily loss cap.
 *   Quantity = floor(20% of book equity / latest price); zero shares
 *   is a logged skip, never a fractional or oversized order.
 * - Kill switch: a halt cancels HER open orders; kill+liquidate closes
 *   ONLY her tracked positions.
 *
 * SHARED-ACCOUNT DISCIPLINE (the Phase 4 overlap rule): Snapback is
 * the second live equity bot on the one Alpaca paper account, and her
 * universe overlaps Trendia's (SPY, QQQ, AAPL, MSFT, AMD). She is
 * STATE-ONLY: boot reconcile manages positions recorded in her own
 * state, syncs quantities the broker reports for those symbols, and
 * IGNORES (logs as foreign) any untracked broker position — she never
 * adopts another bot's shares. Her entries also refuse a symbol that
 * carries a foreign broker position, so the two bots never co-hold a
 * symbol; and all her exits are quantity-sized market SELL orders for
 * exactly her tracked quantity — never closePosition(symbol), which
 * would liquidate the whole account position in that symbol,
 * including Trendia's shares.
 *
 * Money: a virtual $10,000 book (the decided paper allocation, doubled
 * fleet-wide by Keith on 2026-11-03) inside the shared paper account.
 * Durable state persists to SNAPBACK_STATE_PATH so restarts reconcile
 * against her own ledger instead of forgetting open positions.
 */

/**
 * Declared starting capital for Snapback's virtual book (Keith,
 * 2026-11-03: fleet-wide doubling, $5,000 → $10,000). Persisted in
 * state as startCapital; see the boot re-seed below.
 */
const STARTING_CAPITAL = 10000;
/** The only starting capital before 2026-11-03 — reads legacy state files. */
const LEGACY_STARTING_CAPITAL = 5000;
/** Tick cadence; overridable for tests (SNAPBACK_TICK_MS). */
const TICK_MS =
  Number(process.env.SNAPBACK_TICK_MS ?? process.env.PAPER_TICK_MS ?? 30_000) ||
  30_000;
const BARS_LOOKBACK_DAYS = 420;
const MEAN_PERIOD = 20;
const TREND_PERIOD = 200;
const Z_ENTRY = -2.0;
const RSI_PERIOD = 2;
const RSI_ENTRY = 10;
const TAKE_PROFIT_PCT = 4; // rules.exit prose in snapback.md ("+4%")

export interface SnapbackDeps {
  now?: () => Date;
  statePath?: string;
  tickMs?: number;
}

interface TrackedEntry {
  qty: number;
  entryPrice: number;
  /** ET date (YYYY-MM-DD) the position was opened. */
  entryDate: string;
  decisionId: string;
  /**
   * The 20-day mean (of completed closes) at entry (Phase 6).
   * Optional: positions tracked before Phase 6 lack it — it is
   * derived on boot / first exit-check tick and persisted.
   */
  entryMean?: number;
  /**
   * True when the fill was BELOW the entry mean — only then does the
   * mean-reversion exit apply (Phase 6; see the header amendment).
   */
  entryBelowMean?: boolean;
}

interface PendingEntry {
  orderId: string;
  symbol: string;
  qty: number;
  estCost: number;
  decisionId: string;
  reason: string;
  /** The 20-day mean at signal time (Phase 6); null on legacy pendings. */
  meanAtSignal?: number | null;
}

interface PendingExit {
  orderId: string;
  symbol: string;
  qty: number;
  entryPrice: number;
  decisionId: string;
  trigger: string;
}

interface SnapbackState {
  /** Declared starting capital this book was seeded with (re-seed rule). */
  startCapital: number;
  realizedTotal: number;
  realizedByDay: Record<string, number>;
  entries: Record<string, TrackedEntry>;
  pendingEntries: PendingEntry[];
  pendingExits: PendingExit[];
  /** ET date (YYYY-MM-DD) of each symbol's most recent exit fill —
   *  the same-day re-entry cooldown (Phase 6). */
  lastExitBySymbol: Record<string, string>;
  lastEvalHour: string | null;
  decisionCounter: number;
}

interface SnapbackParams {
  maxPositionPct: number;
  maxPositions: number;
  stopLossPct: number;
  maxDailyLossPct: number;
  universe: string[];
}

/** The stretch snapshot for one symbol, from completed daily bars. */
interface Stretch {
  mean20: number;
  sd20: number;
  sma200: number | null;
  z: number | null;
  rsi2: number | null;
  closes: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const money = (n: number): string =>
  `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function numericOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function startSnapbackTrader(
  bot: BotConfig,
  client: AlpacaClientLike,
  post: (event: FleetEvent) => Promise<void>,
  control: PaperControl,
  deps: SnapbackDeps = {},
): void {
  const now = deps.now ?? (() => new Date());

  const params: SnapbackParams = {
    maxPositionPct: numericOr(bot.risk.max_position_pct, 20),
    maxPositions: numericOr(bot.risk.max_positions, 6),
    stopLossPct: numericOr(bot.risk.stop_loss_pct, 5),
    maxDailyLossPct: numericOr(bot.risk.max_daily_loss_pct, 1.5),
    universe: Array.isArray(bot.universe)
      ? bot.universe.filter((v): v is string => typeof v === "string")
      : [],
  };
  const statePath =
    deps.statePath ??
    process.env.SNAPBACK_STATE_PATH ??
    "data/paper-snapback-state.json";
  const tickMs = deps.tickMs ?? TICK_MS;

  const etDate = (d: Date): string =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
    }).format(d);

  const etMinutes = (d: Date): number => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return h * 60 + m;
  };

  const etHourKey = (d: Date): string => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const h = parts.find((p) => p.type === "hour")?.value ?? "00";
    return `${etDate(d)}T${h}`;
  };

  /** Bars whose session is complete: drop today's bar before 16:05 ET. */
  function completedBars(bars: DailyBar[]): DailyBar[] {
    const today = etDate(now());
    const afterClose = etMinutes(now()) >= 16 * 60 + 5;
    return bars.filter(
      (b) => b.date < today || (b.date === today && afterClose),
    );
  }

  const freshState = (): SnapbackState => ({
    startCapital: STARTING_CAPITAL,
    realizedTotal: 0,
    realizedByDay: {},
    entries: {},
    pendingEntries: [],
    pendingExits: [],
    lastExitBySymbol: {},
    lastEvalHour: null,
    decisionCounter: 0,
  });

  let state: SnapbackState = freshState();
  let persistedRaw: Partial<SnapbackState> | null = null;
  try {
    if (existsSync(statePath)) {
      persistedRaw = JSON.parse(
        readFileSync(statePath, "utf8"),
      ) as SnapbackState;
      state = { ...freshState(), ...persistedRaw };
      // State files written before the startCapital field existed are
      // read at their persisted start — for Snapback that can only be
      // the legacy $5,000; say so explicitly rather than silently
      // dressing an old book in the new capital.
      if (typeof persistedRaw.startCapital !== "number") {
        state.startCapital = LEGACY_STARTING_CAPITAL;
      }
      console.log(`[snapback] ${bot.name}: restored state from ${statePath}`);
    }
  } catch (err) {
    console.warn(
      `[snapback] ${bot.name}: state file unreadable, starting fresh:`,
      err instanceof Error ? err.message : err,
    );
  }

  const save = (): void => {
    try {
      mkdirSync(dirname(statePath), { recursive: true });
      writeFileSync(`${statePath}.tmp`, JSON.stringify(state, null, 2));
      renameSync(`${statePath}.tmp`, statePath);
    } catch (err) {
      console.warn(
        `[snapback] ${bot.name}: state save failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  };

  // ---- Boot re-seed (same rule as paper.ts / vega.ts) -----------------
  // If the declared starting capital changed since this book was
  // seeded, an UNTOUCHED book (zero realized PnL, no filled positions
  // tracked, no pending exits) re-seeds to the new capital and logs
  // it. A touched book keeps its original start and logs the skip.
  // Pending unfilled entry orders do not block a re-seed.
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
        `[snapback] ${bot.name}: book re-seeded ${money(from)} → ${money(STARTING_CAPITAL)} (starting capital changed; book was untouched)`,
      );
    } else {
      console.log(
        `[snapback] ${bot.name}: starting capital changed ${money(state.startCapital)} → ${money(STARTING_CAPITAL)} but the book is not untouched (realized ${money(state.realizedTotal)}, ${Object.keys(state.entries).length} open position(s), ${state.pendingExits.length} pending exit(s)) — resize skipped, book keeps its ${money(state.startCapital)} start`,
      );
    }
    save();
  }

  const bookEquity = (): number => state.startCapital + state.realizedTotal;
  const realizedToday = (): number => state.realizedByDay[etDate(now())] ?? 0;

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
      ts: now().toISOString(),
    };
    console.log(
      `[snapback] ${event.bot} ${event.type} ${event.symbol ?? ""} ${event.side ?? ""} ` +
        `qty=${event.qty ?? "-"} @ ${event.price ?? "-"} ` +
        `${event.pnl !== null ? `pnl=${event.pnl.toFixed(2)} ` : ""}— ${event.reason}`,
    );
    void post(event);
    return id;
  };

  const paramsSnapshot = (): string =>
    `params snapshot: universe ${params.universe.length} symbols, trend filter price > ${TREND_PERIOD}DMA, ` +
    `entry z < ${Z_ENTRY} on the ${MEAN_PERIOD}-day mean (population SD) or RSI(${RSI_PERIOD}) < ${RSI_ENTRY}, ` +
    `exits at the ${MEAN_PERIOD}-day mean (only when entered below it) / +${TAKE_PROFIT_PCT}% / stop ${params.stopLossPct}% / 5 trading days max hold, no same-day re-entry after an exit, ` +
    `max_position_pct ${params.maxPositionPct}, max_positions ${params.maxPositions}, daily_loss_cap ${params.maxDailyLossPct}%`;

  let haltCancelHandled = false;
  let booted = false;
  let tickBusy = false;

  // The bar-derived parts of the stretch (mean, SD, 200DMA, closes)
  // are functions of completed bars only, so they are cached per ET
  // date. The z-score and RSI(2) are computed FRESH from the live
  // price on every call — the hourly evaluation must see the stretch
  // as it stands this hour, not as it stood at the first call.
  const barCache = new Map<
    string,
    {
      date: string;
      mean20: number;
      sd20: number;
      sma200: number | null;
      closes: number[];
    }
  >();

  /** Compute the stretch snapshot for one symbol at the live price. */
  async function stretchFor(
    symbol: string,
    price: number,
  ): Promise<Stretch | null> {
    const today = etDate(now());
    let base = barCache.get(symbol);
    if (!base || base.date !== today) {
      const startISO = new Date(
        now().getTime() - BARS_LOOKBACK_DAYS * 86_400_000,
      ).toISOString();
      const bars = completedBars(await client.getDailyBars(symbol, startISO));
      const closes = bars.map((b) => b.close);
      const mean20 = sma(closes, MEAN_PERIOD);
      const sd20 = stdDev(closes.slice(-MEAN_PERIOD));
      if (mean20 === null || sd20 === null) return null;
      base = {
        date: today,
        mean20,
        sd20,
        sma200: sma(closes, TREND_PERIOD),
        closes,
      };
      barCache.set(symbol, base);
    }
    return {
      mean20: base.mean20,
      sd20: base.sd20,
      sma200: base.sma200,
      z: base.sd20 > 0 ? (price - base.mean20) / base.sd20 : null,
      // Wilder RSI(2) over the completed closes with the live price
      // appended as today's in-progress close (documented choice).
      rsi2: rsiWilder([...base.closes, price], RSI_PERIOD),
      closes: base.closes.length,
    };
  }

  /**
   * Phase 6 legacy derivation: positions tracked before the
   * entryMean/entryBelowMean fields existed get them derived from
   * the entry price vs the CURRENT 20-day mean, then persisted.
   * Called at boot reconcile (with the broker's current price) and
   * again from the exit check if a position still lacks the fields
   * (e.g. a legacy pending filled after boot). Never throws.
   */
  async function deriveEntrySide(
    symbol: string,
    entry: TrackedEntry,
    price: number,
  ): Promise<void> {
    if (entry.entryBelowMean !== undefined) return;
    try {
      const stretch = await stretchFor(symbol, price);
      if (stretch === null) return;
      entry.entryMean = stretch.mean20;
      entry.entryBelowMean = entry.entryPrice < stretch.mean20;
      console.log(
        `[snapback] ${bot.name}: ${symbol} position predates Phase 6 — derived entry side from the current ${MEAN_PERIOD}-day mean: ` +
          `entry ${money(entry.entryPrice)} vs mean ${money(stretch.mean20)} → entered ${entry.entryBelowMean ? "BELOW" : "AT/ABOVE"} the mean ` +
          `(mean-reversion exit ${entry.entryBelowMean ? "applies" : "does not apply"})`,
      );
      save();
    } catch {
      // No bars available yet — the exit check retries next tick.
    }
  }

  /** Cancel this bot's own open orders (kill switch: pending orders die). */
  async function cancelTrackedOrders(): Promise<void> {
    const ids = [
      ...state.pendingEntries.map((p) => p.orderId),
      ...state.pendingExits.map((p) => p.orderId),
    ];
    const open = await client.getOpenOrders().catch(() => [] as AlpacaOrder[]);
    for (const id of ids) {
      if (!open.some((o) => o.id === id)) continue;
      try {
        await client.cancelOrder(id);
        console.log(`[snapback] ${bot.name}: cancelled open order ${id}`);
      } catch (err) {
        console.warn(
          `[snapback] ${bot.name}: cancel of order ${id} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  /** Poll pending entry/exit orders; turn fills into stream events. */
  async function pollPending(): Promise<void> {
    for (const p of [...state.pendingEntries]) {
      let order: AlpacaOrder;
      try {
        order = await client.getOrder(p.orderId);
      } catch {
        continue;
      }
      const terminal = ["canceled", "cancelled", "expired", "rejected"].includes(
        order.status,
      );
      if (
        order.filledQty > 0 &&
        order.filledAvgPrice !== null &&
        (order.status === "filled" || terminal)
      ) {
        // Full or partial fill — manage what the broker reports.
        // Phase 6: record the mean at entry and which side of it the
        // fill landed on — the mean-reversion exit reads entryBelowMean.
        // A legacy pending without a recorded mean leaves the fields
        // unset; boot/first-tick derivation fills them in.
        state.entries[p.symbol] = {
          qty: order.filledQty,
          entryPrice: order.filledAvgPrice,
          entryDate: etDate(now()),
          decisionId: p.decisionId,
          ...(typeof p.meanAtSignal === "number" &&
          Number.isFinite(p.meanAtSignal)
            ? {
                entryMean: p.meanAtSignal,
                entryBelowMean: order.filledAvgPrice < p.meanAtSignal,
              }
            : {}),
        };
        state.pendingEntries = state.pendingEntries.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "open",
            symbol: p.symbol,
            side: "buy",
            qty: order.filledQty,
            price: round2(order.filledAvgPrice),
            pnl: null,
            reason:
              `PAPER · entry filled @ ${money(order.filledAvgPrice)} — ${p.reason}` +
              (order.filledQty < p.qty
                ? ` (partial fill: ${order.filledQty} of ${p.qty} shares)`
                : ""),
          },
          p.decisionId,
        );
        save();
      } else if (terminal) {
        state.pendingEntries = state.pendingEntries.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "signal",
            symbol: p.symbol,
            side: "buy",
            qty: p.qty,
            price: null,
            pnl: null,
            reason: `PAPER · entry order ${order.status} before filling — no position taken (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
      }
    }
    for (const p of [...state.pendingExits]) {
      let order: AlpacaOrder;
      try {
        order = await client.getOrder(p.orderId);
      } catch {
        continue;
      }
      const terminal = ["canceled", "cancelled", "expired", "rejected"].includes(
        order.status,
      );
      if (
        order.filledQty > 0 &&
        order.filledAvgPrice !== null &&
        (order.status === "filled" || terminal)
      ) {
        const filledQty = Math.min(order.filledQty, p.qty);
        const pnl = round2((order.filledAvgPrice - p.entryPrice) * filledQty);
        state.realizedTotal = round2(state.realizedTotal + pnl);
        const day = etDate(now());
        state.realizedByDay[day] = round2(
          (state.realizedByDay[day] ?? 0) + pnl,
        );
        // Phase 6 cooldown: an exit fill today bars re-entry into
        // this symbol for the rest of the ET trading day.
        state.lastExitBySymbol[p.symbol] = day;
        const entry = state.entries[p.symbol];
        if (entry) {
          entry.qty -= filledQty;
          if (entry.qty <= 0) delete state.entries[p.symbol];
        }
        state.pendingExits = state.pendingExits.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "close",
            symbol: p.symbol,
            side: "sell",
            qty: filledQty,
            price: round2(order.filledAvgPrice),
            pnl,
            reason: `PAPER · exit filled @ ${money(order.filledAvgPrice)} — ${p.trigger}`,
          },
          p.decisionId,
        );
        save();
      } else if (terminal) {
        state.pendingExits = state.pendingExits.filter(
          (x) => x.orderId !== p.orderId,
        );
        console.warn(
          `[snapback] ${bot.name}: exit order for ${p.symbol} ended ${order.status} with no fill; position remains open and will re-trigger`,
        );
        save();
      }
    }
  }

  /**
   * Submit an exit for a held symbol and track it to its fill. The
   * sell is quantity-sized to HER tracked quantity — never
   * closePosition(symbol), which would liquidate the whole shared-
   * account position in the symbol (see the header: overlap rule).
   */
  async function submitExit(
    symbol: string,
    trigger: string,
    decisionReason: string,
    currentPrice: number,
  ): Promise<void> {
    const entry = state.entries[symbol];
    if (!entry) return;
    const decisionId = emit({
      type: "signal",
      symbol,
      side: "sell",
      qty: entry.qty,
      price: round2(currentPrice),
      pnl: null,
      reason: decisionReason,
    });
    const order = await client.createOrder({
      symbol,
      qty: entry.qty,
      side: "sell",
      type: "market",
      timeInForce: "day",
    });
    state.pendingExits.push({
      orderId: order.id,
      symbol,
      qty: entry.qty,
      entryPrice: entry.entryPrice,
      decisionId,
      trigger,
    });
    save();
  }

  /** Exit checks against live prices (market hours only, every tick). */
  async function checkExits(): Promise<void> {
    const today = etDate(now());
    for (const [symbol, entry] of Object.entries(state.entries)) {
      if (state.pendingExits.some((p) => p.symbol === symbol)) continue;
      let price: number;
      try {
        price = await client.getLatestPrice(symbol);
      } catch {
        continue;
      }
      if (!Number.isFinite(price) || price <= 0) continue;
      let stretch: Stretch | null = null;
      try {
        stretch = await stretchFor(symbol, price);
      } catch {
        stretch = null;
      }
      // Phase 6 backstop: a position that still lacks its entry side
      // (legacy state reconcile could not derive) gets it now, from
      // the stretch this tick already computed.
      if (entry.entryBelowMean === undefined && stretch !== null) {
        entry.entryMean = stretch.mean20;
        entry.entryBelowMean = entry.entryPrice < stretch.mean20;
        console.log(
          `[snapback] ${bot.name}: ${symbol} position predates Phase 6 — derived entry side from the current ${MEAN_PERIOD}-day mean: ` +
            `entry ${money(entry.entryPrice)} vs mean ${money(stretch.mean20)} → entered ${entry.entryBelowMean ? "BELOW" : "AT/ABOVE"} the mean ` +
            `(mean-reversion exit ${entry.entryBelowMean ? "applies" : "does not apply"})`,
        );
        save();
      }
      const daysHeld = tradingDaysBetween(entry.entryDate, today);
      const stopPrice = entry.entryPrice * (1 - params.stopLossPct / 100);
      const targetPrice = entry.entryPrice * (1 + TAKE_PROFIT_PCT / 100);
      let trigger: string | null = null;
      let why = "";
      if (price <= stopPrice) {
        trigger = `stop loss (${params.stopLossPct}%)`;
        why =
          `${symbol} @ ${money(price)} is ${(((entry.entryPrice - price) / entry.entryPrice) * 100).toFixed(1)}% below entry ${money(entry.entryPrice)} ` +
          `(limit ${money(stopPrice)}) after ${daysHeld} trading day(s)`;
      } else if (daysHeld >= 5) {
        trigger = "max hold (5 trading days)";
        why =
          `${symbol} entered ${entry.entryDate} @ ${money(entry.entryPrice)} has been held ${daysHeld} trading days — ` +
          `rented, never owned; current price ${money(price)} (${(((price - entry.entryPrice) / entry.entryPrice) * 100).toFixed(1)}% vs entry)`;
      } else if (price >= targetPrice) {
        trigger = `take profit (+${TAKE_PROFIT_PCT}%)`;
        why =
          `${symbol} @ ${money(price)} is +${(((price - entry.entryPrice) / entry.entryPrice) * 100).toFixed(1)}% over entry ${money(entry.entryPrice)} ` +
          `(target ${money(targetPrice)}) after ${daysHeld} trading day(s)`;
      } else if (
        stretch !== null &&
        entry.entryBelowMean === true &&
        price >= stretch.mean20
      ) {
        // Phase 6: the reversion exit exists to sell the recovery of
        // a dip bought BELOW the mean. A position entered at/above
        // the mean never takes this leg — price ≥ mean was already
        // true at its entry, which is what churned TSLA on 2026-11-04.
        trigger = `reversion to the ${MEAN_PERIOD}-day mean`;
        why =
          `${symbol} @ ${money(price)} has returned to its ${MEAN_PERIOD}-day mean ${money(stretch.mean20)} ` +
          `(entry ${money(entry.entryPrice)}, ${(((price - entry.entryPrice) / entry.entryPrice) * 100).toFixed(1)}% vs entry) after ${daysHeld} trading day(s)`;
      }
      if (trigger !== null) {
        await submitExit(
          symbol,
          trigger,
          `PAPER · EXIT — ${trigger}: ${why} · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
          price,
        );
      }
    }
  }

  /** The hourly entry evaluation during market hours. */
  async function evaluate(): Promise<void> {
    const today = etDate(now());
    const positions: AlpacaPosition[] = await client
      .getPositions()
      .catch(() => []);
    const brokerHeld = new Map(positions.map((p) => [p.symbol, p]));
    let noSignal = 0;
    let entriesSubmitted = 0;
    let rejected = 0;
    let trendBlocked = 0;
    let cooldownSkips = 0;

    for (const symbol of params.universe) {
      // One open position per underlying; no pyramiding.
      if (
        state.entries[symbol] ||
        state.pendingEntries.some((p) => p.symbol === symbol)
      ) {
        continue;
      }
      let price: number;
      try {
        price = await client.getLatestPrice(symbol);
      } catch {
        noSignal += 1;
        continue;
      }
      if (!Number.isFinite(price) || price <= 0) {
        noSignal += 1;
        continue;
      }
      let stretch: Stretch | null = null;
      try {
        stretch = await stretchFor(symbol, price);
      } catch {
        stretch = null;
      }
      if (
        stretch === null ||
        stretch.sma200 === null ||
        stretch.closes < TREND_PERIOD
      ) {
        noSignal += 1;
        continue;
      }

      const zFire = stretch.z !== null && stretch.z < Z_ENTRY;
      const rsiFire = stretch.rsi2 !== null && stretch.rsi2 < RSI_ENTRY;
      if (!zFire && !rsiFire) {
        noSignal += 1;
        continue;
      }

      // ---- Same-day re-entry cooldown (Phase 6) -------------------
      // A symbol she already exited today is done for the day, even
      // if the stretch fires again — no churn (see the header).
      // Counted separately in the summary so the skip is visible.
      if (state.lastExitBySymbol[symbol] === today) {
        cooldownSkips += 1;
        continue;
      }
      const legs = [
        zFire
          ? `z-score ${stretch.z!.toFixed(2)} < ${Z_ENTRY} (price ${money(price)} vs ${MEAN_PERIOD}-day mean ${money(stretch.mean20)}, SD ${money(stretch.sd20)})`
          : null,
        rsiFire
          ? `RSI(${RSI_PERIOD}) ${stretch.rsi2!.toFixed(1)} < ${RSI_ENTRY}`
          : null,
      ]
        .filter((s): s is string => s !== null)
        .join(" AND ");
      const indicators =
        `stretch: ${legs}; ${MEAN_PERIOD}-day mean ${money(stretch.mean20)}, ` +
        `z ${stretch.z !== null ? stretch.z.toFixed(2) : "n/a"}, RSI(${RSI_PERIOD}) ${stretch.rsi2 !== null ? stretch.rsi2.toFixed(1) : "n/a"}`;

      // ---- Trend filter (strategy rule, before the gate) ------------
      if (!(price > stretch.sma200)) {
        trendBlocked += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason:
            `PAPER · ENTRY signal — ${indicators} · Trend filter: BLOCKED — price ${money(price)} is not above the ` +
            `${TREND_PERIOD}DMA ${money(stretch.sma200)}; a dip below the 200-day average is a warning, not an invitation · ${paramsSnapshot()}`,
        });
        continue;
      }

      // ---- Foreign-position guard (shared account) ------------------
      if (brokerHeld.has(symbol)) {
        rejected += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason:
            `PAPER · ENTRY signal — ${indicators}; price above the ${TREND_PERIOD}DMA ${money(stretch.sma200)} · Risk Gate: REJECTED — ` +
            `the shared account already holds ${brokerHeld.get(symbol)!.qty} × ${symbol} that Snapback does not track (another bot's position); ` +
            `she never trades over a foreign position · ${paramsSnapshot()}`,
        });
        continue;
      }

      // ---- Risk Gate --------------------------------------------------
      const openCount =
        Object.keys(state.entries).length + state.pendingEntries.length;
      const dailyCapHit =
        realizedToday() <= -((params.maxDailyLossPct / 100) * state.startCapital);
      const committed =
        Object.values(state.entries).reduce(
          (sum, e) => sum + e.entryPrice * e.qty,
          0,
        ) + state.pendingEntries.reduce((sum, p) => sum + p.estCost, 0);
      const target = bookEquity() * (params.maxPositionPct / 100);
      const qty = Math.floor(target / price);
      const estCost = qty * price;

      let verdict: string | null = null;
      if (dailyCapHit) {
        verdict = `daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((params.maxDailyLossPct / 100) * state.startCapital))}`;
      } else if (openCount >= params.maxPositions) {
        verdict = `max positions reached (${openCount}/${params.maxPositions})`;
      } else if (qty < 1) {
        verdict = `position cap: one share (${money(price)}) exceeds the ${params.maxPositionPct}% position cap (${money(target)}) — no order placed`;
      } else if (committed + estCost > bookEquity()) {
        verdict = `the ${money(state.startCapital)} book is fully committed (${money(committed)} open + ${money(estCost)} new > ${money(bookEquity())})`;
      }

      if (verdict !== null) {
        rejected += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: Math.max(qty, 0),
          price: round2(price),
          pnl: null,
          reason: `PAPER · ENTRY signal — ${indicators}; price above the ${TREND_PERIOD}DMA ${money(stretch.sma200)} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
        });
        continue;
      }

      const decisionId = emit({
        type: "signal",
        symbol,
        side: "buy",
        qty,
        price: round2(price),
        pnl: null,
        reason:
          `PAPER · ENTRY signal — ${indicators}; price above the ${TREND_PERIOD}DMA ${money(stretch.sma200)} · Risk Gate: APPROVED — ` +
          `${params.maxPositionPct}% of the ${money(bookEquity())} book = ${money(target)} → ${qty} shares ≈ ${money(estCost)}; ` +
          `positions ${openCount}/${params.maxPositions} · ${paramsSnapshot()} · order: market, fills intraday`,
      });
      const order: AlpacaOrder = await client.createOrder({
        symbol,
        qty,
        side: "buy",
        type: "market",
        timeInForce: "day",
      });
      state.pendingEntries.push({
        orderId: order.id,
        symbol,
        qty,
        estCost,
        decisionId,
        reason: `mean-reversion entry — ${legs}`,
        meanAtSignal: stretch.mean20,
      });
      entriesSubmitted += 1;
      save();
    }

    console.log(
      `[snapback] ${bot.name}: hourly evaluation complete — ${entriesSubmitted} entries submitted, ` +
        `${rejected} gate rejections, ${trendBlocked} trend-filter blocks, ${cooldownSkips} cooldown-skips, ${noSignal} no-signal; book equity ${money(bookEquity())}`,
    );
  }

  /** Kill + liquidate for this bot: cancel her orders, close ONLY her positions. */
  async function handleLiquidations(): Promise<void> {
    for (const req of control.drainLiquidations()) {
      if (req.codename !== bot.codename) continue;
      const closed: {
        codename: string;
        symbol: string;
        qty: number | null;
        price: number | null;
        pnl: number | null;
      }[] = [];
      const failed: { codename: string; symbol: string; reason: string }[] = [];
      try {
        await cancelTrackedOrders();
        state.pendingEntries = [];
        const positions: AlpacaPosition[] = await client.getPositions();
        for (const symbol of Object.keys(state.entries)) {
          const entry = state.entries[symbol]!;
          const pos = positions.find((p) => p.symbol === symbol);
          if (!pos) {
            failed.push({
              codename: bot.codename,
              symbol,
              reason: "tracked in state but no broker position to close",
            });
            continue;
          }
          const qty = Math.min(entry.qty, pos.qty);
          try {
            const order = await client.createOrder({
              symbol,
              qty,
              side: "sell",
              type: "market",
              timeInForce: "day",
            });
            state.pendingExits.push({
              orderId: order.id,
              symbol,
              qty,
              entryPrice: entry.entryPrice,
              decisionId: entry.decisionId,
              trigger: "KILL + LIQUIDATE",
            });
            closed.push({
              codename: bot.codename,
              symbol,
              qty,
              price: round2(pos.currentPrice),
              pnl: round2((pos.currentPrice - entry.entryPrice) * qty),
            });
          } catch (err) {
            failed.push({
              codename: bot.codename,
              symbol,
              reason: `close order failed: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
        }
        save();
      } catch (err) {
        failed.push({
          codename: bot.codename,
          symbol: "(all)",
          reason: `liquidation failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      await control.reportLiquidation(req.id, bot.codename, closed, failed);
      console.log(
        `[snapback] ${bot.name}: KILL + LIQUIDATE executed — ${closed.length} close orders submitted, ${failed.length} failures`,
      );
    }
  }

  /**
   * Boot reconcile — STATE-ONLY. Her own tracked positions are kept
   * (quantities synced to what the broker reports); untracked broker
   * positions in her universe are foreign (another bot's shares on
   * the shared account) and are ignored, never adopted.
   */
  async function reconcile(): Promise<void> {
    const positions = await client.getPositions();
    for (const pos of positions) {
      if (!params.universe.includes(pos.symbol)) continue;
      const tracked = state.entries[pos.symbol];
      if (!tracked) {
        console.log(
          `[snapback] ${bot.name}: foreign position ignored at boot — ${pos.qty} × ${pos.symbol} @ avg ${money(pos.avgEntryPrice)} is held on the shared account but is not in Snapback's state (state-only reconcile; never adopted)`,
        );
        continue;
      }
      if (pos.qty !== tracked.qty) {
        console.log(
          `[snapback] ${bot.name}: ${pos.symbol} quantity synced to the broker — state had ${tracked.qty}, broker reports ${pos.qty} (partial fill or outside adjustment)`,
        );
        tracked.qty = pos.qty;
      }
      // Phase 6: positions tracked before the entry-side fields
      // existed get them derived here, at boot (see deriveEntrySide).
      await deriveEntrySide(pos.symbol, tracked, pos.currentPrice);
    }
    for (const symbol of Object.keys(state.entries)) {
      if (
        !positions.some((p) => p.symbol === symbol) &&
        !state.pendingExits.some((p) => p.symbol === symbol)
      ) {
        console.log(
          `[snapback] ${bot.name}: ${symbol} in state but not at broker — dropping from tracking (closed outside the engine)`,
        );
        delete state.entries[symbol];
      }
    }
    save();
  }

  async function tick(): Promise<void> {
    // The hourly evaluation is heavier than one 30 s tick in the worst
    // case; never let ticks overlap (same guard as Vega's runner).
    if (tickBusy) return;
    tickBusy = true;
    try {
      await handleLiquidations();
      await pollPending();

      const haltedNow = control.isHalted(bot.codename);
      if (haltedNow) {
        if (!haltCancelHandled) {
          haltCancelHandled = true;
          await cancelTrackedOrders();
          state.pendingEntries = [];
          save();
          console.log(
            `[snapback] ${bot.name}: HALTED — open orders cancelled, no order flow until resumed`,
          );
        }
        return;
      }
      haltCancelHandled = false;

      if (!booted) {
        booted = true;
        await reconcile();
      }

      const clock = await client.getClock();
      if (clock.isOpen) {
        await checkExits();
        const key = etHourKey(now());
        if (state.lastEvalHour !== key) {
          await evaluate();
          state.lastEvalHour = key;
          save();
        }
      }
    } catch (err) {
      console.error(
        `[snapback] ${bot.name}: tick failed (will retry):`,
        err instanceof Error ? err.message : err,
      );
    } finally {
      tickBusy = false;
    }
  }

  console.log(
    `[snapback] ${bot.name}: Phase 4 live-paper runner started — universe ${params.universe.join("/")}, ` +
      `book ${money(bookEquity())}, hourly stretch evaluation in market hours, exits on the fast tick`,
  );
  void tick();
  setInterval(() => void tick(), tickMs);
}
