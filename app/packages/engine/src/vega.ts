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
  OptionContract,
  OptionSnapshot,
} from "./alpaca.js";
import type { PaperControl } from "./paper.js";
import {
  createNasdaqEarningsCalendar,
  type EarningsCalendarLike,
} from "./earnings.js";
import {
  atrMean,
  priorHighTimed,
  priorLowTimed,
  type DailyBar,
  type TimedBar,
} from "./indicators.js";

/**
 * PHASE 3 — Vega on the Alpaca PAPER account with real options data.
 *
 * Scope: PHASE3-VEGA-SCOPE.md (decisions §6, all made by Keith
 * 2026-11-03). Vega's `.md` rules, translated literally:
 *
 * - Hourly during market hours she screens a 30-symbol candidate pool:
 *   price $5–$200, 20-day ATR ≥ 3.5% of price (the IV-percentile leg of
 *   her OR-screen activates once ~60 days of self-recorded IV history
 *   exist — daily IV is recorded in state from day one).
 * - Signal (D2): an hourly close beyond the prior 20-hour high (long
 *   calls) or low (long puts).
 * - Earnings guard (D4): no new entries within 5 days of earnings, from
 *   the Nasdaq calendar, refreshed once per ET date. FAIL-CLOSED: when
 *   the calendar is unavailable, entries pause and the pause is logged
 *   as a decision — never a silent pass.
 * - Contract pick: expiry 2–4 weeks out, |delta| closest to 0.45 inside
 *   her 0.35–0.55 band, open interest ≥ 1,000, bid/ask spread ≤ 10% of
 *   mid. A failed pick is a logged no-trade decision, before the Gate.
 * - Risk Gate: premium ≤ 6% of her virtual $5,000 book per position,
 *   max 6 positions, 3% daily loss cap. Contracts = floor(cap ÷
 *   (ask × 100)); one contract over the cap is a gate rejection.
 * - Orders (D5): limit at mid, one reprice after 60 s at the fresh mid,
 *   then cancel and log. Exits use close-at-market (stops must fill),
 *   triggered off live mids on the 30 s tick: +50% take profit, −35%
 *   stop, 5-trading-day time stop, and a hard force-exit 2 trading
 *   days before expiry.
 * - SHADOW MODE (D6): with VEGA_SHADOW=true (the delivered default)
 *   the full pipeline runs — screen, picks, gate verdicts — and emits
 *   decision / order-intent events labelled SHADOW, tracking a shadow
 *   book for exits, but places NO broker orders. VEGA_SHADOW=false is
 *   the only step to live paper orders. Shadow and live books and
 *   realized PnL are kept strictly separate in state.
 * - Kill switch: halts cancel her open option orders; kill+liquidate
 *   closes her tracked contracts and reports honestly. In shadow mode
 *   liquidation settles the shadow book at current mids.
 *
 * Milestone 3 (shares ballast / 75-25 mix) is intentionally NOT here
 * (D3): she runs options-only until the mix lands.
 */

const ALLOCATION = 5000;
/** Tick cadence; overridable for tests (VEGA_TICK_MS). */
const TICK_MS =
  Number(process.env.VEGA_TICK_MS ?? process.env.PAPER_TICK_MS ?? 30_000) ||
  30_000;

// Contract-selection constants, from the prose of vega.md (rules.contracts
// / rules.options_liquidity) and scope §4 — the .md carries them as text.
const DELTA_MIN = 0.35;
const DELTA_MAX = 0.55;
const DELTA_TARGET = 0.45;
const EXPIRY_MIN_DAYS = 14;
const EXPIRY_MAX_DAYS = 28;
const OI_MIN = 1000;
const SPREAD_MAX_PCT = 10;
const ATR_PERIOD = 20;
const ATR_MIN_PCT = 3.5;
const EARNINGS_GUARD_DAYS = 5;
const EARNINGS_LOOKAHEAD_DAYS = 7;
const REPRICE_AFTER_MS = 60_000;
const DAILY_BARS_LOOKBACK_DAYS = 90;
const HOURLY_BARS_LOOKBACK_DAYS = 12;

export interface VegaDeps {
  earnings?: EarningsCalendarLike;
  now?: () => Date;
  statePath?: string;
  tickMs?: number;
  shadow?: boolean;
}

interface TrackedContract {
  underlying: string;
  optionType: "call" | "put";
  qty: number;
  /** Premium paid per contract (per share; ×100×qty = dollars). */
  entryPremium: number;
  /** ET date (YYYY-MM-DD) the position was opened/adopted. */
  entryDate: string;
  expiry: string;
  decisionId: string;
}

interface PendingVegaEntry {
  orderId: string;
  contractSymbol: string;
  underlying: string;
  optionType: "call" | "put";
  qty: number;
  limitPrice: number;
  decisionId: string;
  submittedAtMs: number;
  repriced: boolean;
}

interface PendingVegaExit {
  orderId: string;
  contractSymbol: string;
  qty: number;
  entryPremium: number;
  decisionId: string;
  trigger: string;
}

interface EarningsState {
  /** ET date the current map was fetched for. */
  fetchedFor: string | null;
  available: boolean;
  bySymbol: Record<string, string>;
  lastAttemptKey: string | null;
}

interface VegaState {
  realizedTotal: number;
  realizedByDay: Record<string, number>;
  shadowRealizedTotal: number;
  shadowRealizedByDay: Record<string, number>;
  contracts: Record<string, TrackedContract>;
  shadowContracts: Record<string, TrackedContract>;
  pendingEntries: PendingVegaEntry[];
  pendingExits: PendingVegaExit[];
  lastEvalHour: string | null;
  earnings: EarningsState;
  ivByUnderlying: Record<string, Record<string, number>>;
  decisionCounter: number;
}

interface VegaParams {
  pool: string[];
  priceMin: number;
  priceMax: number;
  maxPositionPct: number;
  maxPositions: number;
  stopLossPct: number;
  takeProfitPct: number;
  timeStopDays: number;
  maxDailyLossPct: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const money = (n: number): string =>
  `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Bot .md risk fields carry prose ("6 (premium paid...)") — take the number. */
function leadingNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const m = value.match(/\d+(?:\.\d+)?/);
    if (m) return Number(m[0]);
  }
  return fallback;
}

function etDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(d);
}

function etMinutes(d: Date): number {
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

function etHourKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  return `${etDate(d)}T${h}`;
}

/** YYYY-MM-DD plus `days` calendar days (UTC math on the date string). */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Weekdays (Mon–Fri, exchange holidays ignored) strictly after
 * `fromStr`, up to and including `toStr`. Negative when to < from.
 */
export function tradingDaysBetween(fromStr: string, toStr: string): number {
  if (fromStr === toStr) return 0;
  const sign = fromStr < toStr ? 1 : -1;
  const [lo, hi] = sign === 1 ? [fromStr, toStr] : [toStr, fromStr];
  let count = 0;
  let cur = lo;
  while (cur < hi) {
    cur = addDays(cur, 1);
    const dow = new Date(`${cur}T12:00:00Z`).getUTCDay();
    if (dow >= 1 && dow <= 5) count += 1;
  }
  return sign * count;
}

const OCC_RE = /^([A-Z]{1,6})(\d{2})(\d{2})(\d{2})([CP])\d{8}$/;

/** Parse an OCC option symbol into underlying / expiry / type. */
export function parseOccSymbol(
  symbol: string,
): { underlying: string; expiry: string; optionType: "call" | "put" } | null {
  const m = OCC_RE.exec(symbol);
  if (!m) return null;
  return {
    underlying: m[1]!,
    expiry: `20${m[2]}-${m[3]}-${m[4]}`,
    optionType: m[5] === "C" ? "call" : "put",
  };
}

export interface ChainCandidate {
  contract: OptionContract;
  snapshot: OptionSnapshot;
}

export type PickResult =
  | { ok: true; candidate: ChainCandidate }
  | { ok: false; reason: string };

function liquidityFailure(c: ChainCandidate): string | null {
  const { contract, snapshot } = c;
  if (contract.openInterest < OI_MIN) {
    return `open interest ${contract.openInterest.toLocaleString("en-US")} < ${OI_MIN.toLocaleString("en-US")} on ${contract.symbol}`;
  }
  if (snapshot.mid === null || snapshot.bid <= 0 || snapshot.ask <= 0) {
    return `no two-sided quote on ${contract.symbol}`;
  }
  const spreadPct = ((snapshot.ask - snapshot.bid) / snapshot.mid) * 100;
  // "Within 10% of mid" is inclusive — the epsilon keeps an exactly-10%
  // spread from failing on floating-point dust (e.g. 2.10 − 1.90).
  if (spreadPct > SPREAD_MAX_PCT + 1e-9) {
    return `bid/ask spread ${spreadPct.toFixed(1)}% of mid exceeds ${SPREAD_MAX_PCT}% on ${contract.symbol} (bid ${snapshot.bid.toFixed(2)} / ask ${snapshot.ask.toFixed(2)})`;
  }
  return null;
}

/**
 * The contract pick (scope §4 step 3), pure for harness testing:
 * expiry inside the 2–4 week window, |delta| in the 0.35–0.55 band,
 * closest |delta| to 0.45 wins, liquidity gates applied in that order.
 */
export function pickContract(
  candidates: ChainCandidate[],
  today: string,
): PickResult {
  const gte = addDays(today, EXPIRY_MIN_DAYS);
  const lte = addDays(today, EXPIRY_MAX_DAYS);
  const inWindow = candidates.filter(
    (c) => c.contract.expiry >= gte && c.contract.expiry <= lte,
  );
  if (inWindow.length === 0) {
    return {
      ok: false,
      reason: `no contracts inside the 2–4 week expiry window (${gte} → ${lte})`,
    };
  }
  const inBand = inWindow.filter(
    (c) =>
      c.snapshot.delta !== null &&
      Math.abs(c.snapshot.delta) >= DELTA_MIN &&
      Math.abs(c.snapshot.delta) <= DELTA_MAX,
  );
  if (inBand.length === 0) {
    return {
      ok: false,
      reason: `no contract with |delta| in the ${DELTA_MIN}–${DELTA_MAX} band inside the expiry window`,
    };
  }
  const sorted = [...inBand].sort(
    (a, b) =>
      Math.abs(Math.abs(a.snapshot.delta!) - DELTA_TARGET) -
      Math.abs(Math.abs(b.snapshot.delta!) - DELTA_TARGET),
  );
  let firstFailure: string | null = null;
  for (const cand of sorted) {
    const fail = liquidityFailure(cand);
    if (fail === null) return { ok: true, candidate: cand };
    if (firstFailure === null) firstFailure = fail;
  }
  return {
    ok: false,
    reason: firstFailure ?? "no liquid contract in the delta band",
  };
}

/**
 * Position sizing (scope §4 step 4): whole contracts whose total
 * premium at the ask fits the dollar cap. 0 means one contract alone
 * already exceeds the cap — a Risk Gate rejection.
 */
export function sizeContracts(ask: number, capDollars: number): number {
  const perContract = ask * 100;
  if (!(perContract > 0) || !(capDollars > 0)) return 0;
  return Math.floor(capDollars / perContract);
}

export function startVegaTrader(
  bot: BotConfig,
  client: AlpacaClientLike,
  post: (event: FleetEvent) => Promise<void>,
  control: PaperControl,
  deps: VegaDeps = {},
): void {
  const now = deps.now ?? (() => new Date());
  const earnings = deps.earnings ?? createNasdaqEarningsCalendar();
  const shadow =
    deps.shadow ??
    (process.env.VEGA_SHADOW ?? "true").trim().toLowerCase() !== "false";
  const tag = shadow ? "SHADOW" : "PAPER";

  const params: VegaParams = {
    pool: (bot.candidate_pool ?? bot.watchlist_examples ?? []).filter(
      (v): v is string => typeof v === "string",
    ),
    priceMin: leadingNumber(bot.rules.underlying_price_min, 5),
    priceMax: leadingNumber(bot.rules.underlying_price_max, 200),
    maxPositionPct: leadingNumber(bot.risk.max_position_pct, 6),
    maxPositions: leadingNumber(bot.risk.max_positions, 6),
    stopLossPct: leadingNumber(bot.risk.stop_loss_pct, 35),
    takeProfitPct: leadingNumber(bot.risk.take_profit_pct, 50),
    timeStopDays: leadingNumber(bot.risk.time_stop, 5),
    maxDailyLossPct: leadingNumber(bot.risk.max_daily_loss_pct, 3),
  };
  const statePath =
    deps.statePath ??
    process.env.VEGA_STATE_PATH ??
    "data/paper-vega-state.json";
  const tickMs = deps.tickMs ?? TICK_MS;

  const freshState = (): VegaState => ({
    realizedTotal: 0,
    realizedByDay: {},
    shadowRealizedTotal: 0,
    shadowRealizedByDay: {},
    contracts: {},
    shadowContracts: {},
    pendingEntries: [],
    pendingExits: [],
    lastEvalHour: null,
    earnings: {
      fetchedFor: null,
      available: false,
      bySymbol: {},
      lastAttemptKey: null,
    },
    ivByUnderlying: {},
    decisionCounter: 0,
  });

  let state: VegaState = freshState();
  try {
    if (existsSync(statePath)) {
      state = {
        ...freshState(),
        ...(JSON.parse(readFileSync(statePath, "utf8")) as VegaState),
      };
      console.log(`[vega] ${bot.name}: restored state from ${statePath}`);
    }
  } catch (err) {
    console.warn(
      `[vega] ${bot.name}: state file unreadable, starting fresh:`,
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
        `[vega] ${bot.name}: state save failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  };

  const book = (): Record<string, TrackedContract> =>
    shadow ? state.shadowContracts : state.contracts;
  const bookEquity = (): number =>
    ALLOCATION + (shadow ? state.shadowRealizedTotal : state.realizedTotal);
  const realizedToday = (): number =>
    (shadow ? state.shadowRealizedByDay : state.realizedByDay)[etDate(now())] ??
    0;
  const addRealized = (pnl: number): void => {
    const day = etDate(now());
    if (shadow) {
      state.shadowRealizedTotal = round2(state.shadowRealizedTotal + pnl);
      state.shadowRealizedByDay[day] = round2(
        (state.shadowRealizedByDay[day] ?? 0) + pnl,
      );
    } else {
      state.realizedTotal = round2(state.realizedTotal + pnl);
      state.realizedByDay[day] = round2(
        (state.realizedByDay[day] ?? 0) + pnl,
      );
    }
  };

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
      `[vega] ${event.bot} ${event.type} ${event.symbol ?? ""} ${event.side ?? ""} ` +
        `qty=${event.qty ?? "-"} @ ${event.price ?? "-"} ` +
        `${event.pnl !== null ? `pnl=${event.pnl.toFixed(2)} ` : ""}— ${event.reason}`,
    );
    void post(event);
    return id;
  };

  const paramsSnapshot = (): string =>
    `params snapshot: pool ${params.pool.length} symbols, price band ${money(params.priceMin)}–${money(params.priceMax)}, ` +
    `ATR(${ATR_PERIOD}) ≥ ${ATR_MIN_PCT}% of price, delta band ${DELTA_MIN}–${DELTA_MAX}, expiry ${EXPIRY_MIN_DAYS}–${EXPIRY_MAX_DAYS} days, ` +
    `OI ≥ ${OI_MIN.toLocaleString("en-US")}, spread ≤ ${SPREAD_MAX_PCT}% of mid, premium cap ${params.maxPositionPct}% of book, ` +
    `max_positions ${params.maxPositions}, stop ${params.stopLossPct}%, take_profit ${params.takeProfitPct}%, ` +
    `time_stop ${params.timeStopDays} trading days, daily_loss_cap ${params.maxDailyLossPct}%, earnings guard ${EARNINGS_GUARD_DAYS} days`;

  let haltCancelHandled = false;
  let booted = false;
  let tickBusy = false;

  const isHers = (symbol: string): boolean => {
    const occ = parseOccSymbol(symbol);
    return occ !== null && params.pool.includes(occ.underlying);
  };

  /** Daily bars whose session is complete (drop today's before 16:05 ET). */
  function completedDailyBars(bars: DailyBar[]): DailyBar[] {
    const today = etDate(now());
    const afterClose = etMinutes(now()) >= 16 * 60 + 5;
    return bars.filter(
      (b) => b.date < today || (b.date === today && afterClose),
    );
  }

  /** Hourly bars whose hour has fully elapsed. */
  function completedHourlyBars(bars: TimedBar[]): TimedBar[] {
    const t = now().getTime();
    return bars.filter(
      (b) => new Date(b.timestamp).getTime() + 3_600_000 <= t,
    );
  }

  /** Refresh the earnings map once per ET date (hourly retry on failure). */
  async function refreshEarningsIfStale(): Promise<void> {
    const today = etDate(now());
    if (state.earnings.fetchedFor === today && state.earnings.available) {
      return;
    }
    const attemptKey = etHourKey(now());
    if (state.earnings.lastAttemptKey === attemptKey) return;
    state.earnings.lastAttemptKey = attemptKey;
    const map = await earnings.getEarningsWindow(
      today,
      EARNINGS_LOOKAHEAD_DAYS,
    );
    if (map) {
      state.earnings = {
        fetchedFor: today,
        available: true,
        bySymbol: Object.fromEntries(map),
        lastAttemptKey: attemptKey,
      };
      console.log(
        `[vega] ${bot.name}: earnings calendar refreshed — ${map.size} reporters in the next ${EARNINGS_LOOKAHEAD_DAYS} days`,
      );
    } else {
      // Fail-closed: an unreadable calendar blocks new entries (§5).
      state.earnings.available = false;
      state.earnings.bySymbol = {};
      console.warn(
        `[vega] ${bot.name}: earnings calendar UNAVAILABLE — new entries are blocked until it reads again (fail-closed)`,
      );
    }
    save();
  }

  /** Earnings date inside the guard window for `symbol`, or null. */
  function earningsBlock(symbol: string): string | null {
    const date = state.earnings.bySymbol[symbol];
    if (!date) return null;
    const today = etDate(now());
    if (date >= today && date <= addDays(today, EARNINGS_GUARD_DAYS)) {
      return date;
    }
    return null;
  }

  /** Record one IV observation per underlying per ET date (§5). */
  function recordIv(underlying: string, candidates: ChainCandidate[]): void {
    const today = etDate(now());
    const days = (state.ivByUnderlying[underlying] ??= {});
    if (days[today] !== undefined) return;
    const withIv = candidates
      .filter((c) => c.snapshot.iv !== null && c.snapshot.delta !== null)
      .sort(
        (a, b) =>
          Math.abs(Math.abs(a.snapshot.delta!) - DELTA_TARGET) -
          Math.abs(Math.abs(b.snapshot.delta!) - DELTA_TARGET),
      );
    const iv = withIv[0]?.snapshot.iv;
    if (iv === null || iv === undefined) return;
    days[today] = iv;
    // Bound the history (~a year of trading days is plenty).
    const keys = Object.keys(days).sort();
    while (keys.length > 260) {
      const oldest = keys.shift()!;
      delete days[oldest];
    }
  }

  /** Cancel Vega's open broker orders (hers = her OCC symbols / tracked ids). */
  async function cancelOpenOrders(): Promise<void> {
    if (shadow) return;
    const trackedIds = new Set([
      ...state.pendingEntries.map((p) => p.orderId),
      ...state.pendingExits.map((p) => p.orderId),
    ]);
    const open = await client.getOpenOrders();
    for (const o of open) {
      if (trackedIds.has(o.id) || isHers(o.symbol)) {
        await client.cancelOrder(o.id);
        console.log(
          `[vega] ${bot.name}: cancelled open order ${o.id} (${o.symbol})`,
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
        const occ = parseOccSymbol(p.contractSymbol);
        state.contracts[p.contractSymbol] = {
          underlying: p.underlying,
          optionType: p.optionType,
          qty: order.filledQty,
          entryPremium: order.filledAvgPrice,
          entryDate: etDate(now()),
          expiry: occ?.expiry ?? "",
          decisionId: p.decisionId,
        };
        state.pendingEntries = state.pendingEntries.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "open",
            symbol: p.contractSymbol,
            side: "buy",
            qty: order.filledQty,
            price: round2(order.filledAvgPrice),
            pnl: null,
            reason:
              `PAPER · entry filled @ ${money(order.filledAvgPrice)}/contract — ${p.qty} contract(s) of ${p.contractSymbol} ` +
              `(${p.underlying} ${p.optionType}) opened`,
          },
          p.decisionId,
        );
        save();
        continue;
      }
      if (terminal) {
        state.pendingEntries = state.pendingEntries.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "signal",
            symbol: p.contractSymbol,
            side: "buy",
            qty: p.qty,
            price: null,
            pnl: null,
            reason: `PAPER · entry order ${order.status} before filling — no position taken (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
        continue;
      }
      // D5: one reprice at the fresh mid after 60 s, then cancel + log.
      if (now().getTime() - p.submittedAtMs >= REPRICE_AFTER_MS) {
        if (!p.repriced) {
          await client.cancelOrder(p.orderId);
          // The cancel can race a fill — re-read before resubmitting.
          const after = await client.getOrder(p.orderId).catch(() => null);
          if (after && after.filledQty > 0 && after.filledAvgPrice !== null) {
            continue; // next tick's poll records the fill on the old id
          }
          const snap = (
            await client.getOptionSnapshots([p.contractSymbol])
          ).get(p.contractSymbol);
          if (!snap || snap.mid === null) {
            state.pendingEntries = state.pendingEntries.filter(
              (x) => x.orderId !== p.orderId,
            );
            emit(
              {
                type: "signal",
                symbol: p.contractSymbol,
                side: "buy",
                qty: p.qty,
                price: null,
                pnl: null,
                reason: `PAPER · entry abandoned at reprice — no fresh two-sided quote for ${p.contractSymbol} (decision #${p.decisionId})`,
              },
              p.decisionId,
            );
            save();
            continue;
          }
          const newLimit = round2(snap.mid);
          const replacement: AlpacaOrder = await client.createOrder({
            symbol: p.contractSymbol,
            qty: p.qty,
            side: "buy",
            type: "limit",
            timeInForce: "day",
            limitPrice: newLimit,
          });
          p.orderId = replacement.id;
          p.limitPrice = newLimit;
          p.submittedAtMs = now().getTime();
          p.repriced = true;
          emit(
            {
              type: "signal",
              symbol: p.contractSymbol,
              side: "buy",
              qty: p.qty,
              price: newLimit,
              pnl: null,
              reason: `PAPER · entry repriced at fresh mid ${money(newLimit)} after 60 s unfilled (decision #${p.decisionId})`,
            },
            p.decisionId,
          );
          save();
        } else {
          await client.cancelOrder(p.orderId);
          state.pendingEntries = state.pendingEntries.filter(
            (x) => x.orderId !== p.orderId,
          );
          emit(
            {
              type: "signal",
              symbol: p.contractSymbol,
              side: "buy",
              qty: p.qty,
              price: null,
              pnl: null,
              reason: `PAPER · entry abandoned — still unfilled 60 s after the reprice, cancelled per the limit-at-mid rule (decision #${p.decisionId})`,
            },
            p.decisionId,
          );
          save();
        }
      }
    }
    for (const p of [...state.pendingExits]) {
      let order: AlpacaOrder;
      try {
        order = await client.getOrder(p.orderId);
      } catch {
        continue;
      }
      if (order.status === "filled" && order.filledAvgPrice !== null) {
        const pnl = round2(
          (order.filledAvgPrice - p.entryPremium) * p.qty * 100,
        );
        addRealized(pnl);
        delete state.contracts[p.contractSymbol];
        state.pendingExits = state.pendingExits.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "close",
            symbol: p.contractSymbol,
            side: "sell",
            qty: p.qty,
            price: round2(order.filledAvgPrice),
            pnl,
            reason: `PAPER · exit filled @ ${money(order.filledAvgPrice)}/contract — ${p.trigger}`,
          },
          p.decisionId,
        );
        save();
      } else if (
        ["canceled", "cancelled", "expired", "rejected"].includes(order.status)
      ) {
        state.pendingExits = state.pendingExits.filter(
          (x) => x.orderId !== p.orderId,
        );
        console.warn(
          `[vega] ${bot.name}: exit order for ${p.contractSymbol} ended ${order.status}; position remains open and will re-trigger`,
        );
        save();
      }
    }
  }

  /** Submit (or, in shadow, settle) an exit for a tracked contract. */
  async function submitExit(
    contractSymbol: string,
    trigger: string,
    decisionReason: string,
    currentMid: number,
  ): Promise<void> {
    const pos = book()[contractSymbol];
    if (!pos) return;
    if (shadow) {
      const decisionId = emit({
        type: "signal",
        symbol: contractSymbol,
        side: "sell",
        qty: pos.qty,
        price: round2(currentMid),
        pnl: null,
        reason: decisionReason,
      });
      const pnl = round2((currentMid - pos.entryPremium) * pos.qty * 100);
      addRealized(pnl);
      delete state.shadowContracts[contractSymbol];
      emit(
        {
          type: "close",
          symbol: contractSymbol,
          side: "sell",
          qty: pos.qty,
          price: round2(currentMid),
          pnl,
          reason: `SHADOW · would-be exit filled at mid ${money(currentMid)}/contract — ${trigger}`,
        },
        decisionId,
      );
      save();
      return;
    }
    const decisionId = emit({
      type: "signal",
      symbol: contractSymbol,
      side: "sell",
      qty: pos.qty,
      price: round2(currentMid),
      pnl: null,
      reason: decisionReason,
    });
    const order = await client.closePosition(contractSymbol);
    state.pendingExits.push({
      orderId: order.id,
      contractSymbol,
      qty: pos.qty,
      entryPremium: pos.entryPremium,
      decisionId,
      trigger,
    });
    save();
  }

  /** Premium/time/expiry exit checks against live mids (market hours). */
  async function managePositions(): Promise<void> {
    const positions = book();
    const symbols = Object.keys(positions);
    if (symbols.length === 0) return;
    let snapshots: Map<string, OptionSnapshot>;
    try {
      snapshots = await client.getOptionSnapshots(symbols);
    } catch (err) {
      console.warn(
        `[vega] ${bot.name}: snapshot fetch for exit checks failed:`,
        err instanceof Error ? err.message : err,
      );
      return;
    }
    const today = etDate(now());
    for (const [symbol, pos] of Object.entries(positions)) {
      if (
        !shadow &&
        state.pendingExits.some((p) => p.contractSymbol === symbol)
      ) {
        continue;
      }
      const snap = snapshots.get(symbol);
      if (!snap || snap.mid === null || pos.entryPremium <= 0) continue;
      const mid = snap.mid;
      const gainPct = ((mid - pos.entryPremium) / pos.entryPremium) * 100;
      const daysHeld = tradingDaysBetween(pos.entryDate, today);
      const daysToExpiry = tradingDaysBetween(today, pos.expiry);
      let trigger: string | null = null;
      let why = "";
      if (mid >= pos.entryPremium * (1 + params.takeProfitPct / 100)) {
        trigger = `take profit (+${params.takeProfitPct}% of premium)`;
        why =
          `mid ${money(mid)} is +${gainPct.toFixed(1)}% over entry premium ${money(pos.entryPremium)} ` +
          `(target ${money(pos.entryPremium * (1 + params.takeProfitPct / 100))})`;
      } else if (mid <= pos.entryPremium * (1 - params.stopLossPct / 100)) {
        trigger = `stop loss (−${params.stopLossPct}% of premium)`;
        why =
          `mid ${money(mid)} is ${gainPct.toFixed(1)}% under entry premium ${money(pos.entryPremium)} ` +
          `(limit ${money(pos.entryPremium * (1 - params.stopLossPct / 100))})`;
      } else if (daysHeld >= params.timeStopDays) {
        trigger = `time stop (${params.timeStopDays} trading days)`;
        why = `held ${daysHeld} trading days since ${pos.entryDate} at mid ${money(mid)} (${gainPct.toFixed(1)}% vs entry ${money(pos.entryPremium)}) — neither target hit`;
      } else if (daysToExpiry <= 2) {
        trigger = "expiry guardrail (2 trading days before expiry)";
        why = `${symbol} expires ${pos.expiry} — ${daysToExpiry} trading day(s) left; force-exit so nothing rides into expiration`;
      }
      if (trigger !== null) {
        await submitExit(
          symbol,
          trigger,
          `${tag} · EXIT — ${trigger}: ${why} · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
          mid,
        );
      }
    }
  }

  /** The hourly screen → signal → pick → gate → order pipeline. */
  async function evaluate(): Promise<void> {
    const today = etDate(now());
    const dailyStart = new Date(
      now().getTime() - DAILY_BARS_LOOKBACK_DAYS * 86_400_000,
    ).toISOString();
    const hourlyStart = new Date(
      now().getTime() - HOURLY_BARS_LOOKBACK_DAYS * 86_400_000,
    ).toISOString();
    let screenedIn = 0;
    let signals = 0;
    let entries = 0;
    let rejected = 0;
    let guardBlocked = 0;

    for (const symbol of params.pool) {
      // ---- Screen (daily data): price band + ATR --------------------
      let daily: DailyBar[];
      try {
        daily = completedDailyBars(
          await client.getDailyBars(symbol, dailyStart),
        );
      } catch {
        continue;
      }
      if (daily.length < ATR_PERIOD + 1) continue;
      const atr = atrMean(daily, ATR_PERIOD);
      let price = daily[daily.length - 1]!.close;
      try {
        const latest = await client.getLatestPrice(symbol);
        if (Number.isFinite(latest) && latest > 0) price = latest;
      } catch {
        /* screen on the last close */
      }
      if (atr === null) continue;
      const atrPct = (atr / price) * 100;
      if (price < params.priceMin || price > params.priceMax) continue;
      if (atrPct < ATR_MIN_PCT) continue;
      screenedIn += 1;

      // ---- Signal (hourly bars): 20-hour breakout / breakdown -------
      let hourly: TimedBar[];
      try {
        hourly = completedHourlyBars(
          await client.getHourlyBars(symbol, hourlyStart),
        );
      } catch {
        continue;
      }
      if (hourly.length < 21) continue;
      const lastBar = hourly[hourly.length - 1]!;
      const priorHi = priorHighTimed(hourly, 20);
      const priorLo = priorLowTimed(hourly, 20);
      let direction: "call" | "put" | null = null;
      let level = 0;
      if (priorHi !== null && lastBar.close > priorHi) {
        direction = "call";
        level = priorHi;
      } else if (priorLo !== null && lastBar.close < priorLo) {
        direction = "put";
        level = priorLo;
      }
      if (direction === null) continue;
      signals += 1;

      const signalText =
        direction === "call"
          ? `hourly breakout: last completed hour closed ${money(lastBar.close)}, above the prior 20-hour high ${money(level)}`
          : `hourly breakdown: last completed hour closed ${money(lastBar.close)}, below the prior 20-hour low ${money(level)}`;
      const screenText =
        `${signalText}; ATR(${ATR_PERIOD}) ${atrPct.toFixed(1)}% of price ${money(price)} (min ${ATR_MIN_PCT}%); ` +
        `price inside the ${money(params.priceMin)}–${money(params.priceMax)} band`;

      // One options position per underlying at a time (diversification
      // across the pool; her file caps positions, not per-name stacks).
      const heldHere =
        Object.values(book()).some((p) => p.underlying === symbol) ||
        state.pendingEntries.some((p) => p.underlying === symbol);
      if (heldHere) {
        rejected += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · Risk Gate: REJECTED — already holding a position on ${symbol} · ${paramsSnapshot()}`,
        });
        continue;
      }

      // ---- Earnings guard (fail-closed) ------------------------------
      if (!state.earnings.available) {
        guardBlocked += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · Earnings guard: earnings calendar unavailable — entry blocked (fail-closed, never a silent pass) · ${paramsSnapshot()}`,
        });
        continue;
      }
      const earningsDate = earningsBlock(symbol);
      if (earningsDate !== null) {
        guardBlocked += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · Earnings guard: ${symbol} reports ${earningsDate}, inside the ${EARNINGS_GUARD_DAYS}-day guard window — no entry · ${paramsSnapshot()}`,
        });
        continue;
      }

      // ---- Contract pick ----------------------------------------------
      const gte = addDays(today, EXPIRY_MIN_DAYS);
      const lte = addDays(today, EXPIRY_MAX_DAYS);
      let contracts: OptionContract[];
      try {
        contracts = await client.getOptionContracts(symbol, direction, gte, lte);
      } catch (err) {
        console.warn(
          `[vega] ${bot.name}: chain fetch for ${symbol} failed:`,
          err instanceof Error ? err.message : err,
        );
        continue;
      }
      if (contracts.length === 0) {
        rejected += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · Contract pick: NO TRADE — no ${direction}s listed inside the 2–4 week expiry window (${gte} → ${lte}) · ${paramsSnapshot()}`,
        });
        continue;
      }
      let snapshots: Map<string, OptionSnapshot>;
      try {
        snapshots = await client.getOptionSnapshots(
          contracts.map((c) => c.symbol),
        );
      } catch (err) {
        console.warn(
          `[vega] ${bot.name}: snapshot fetch for ${symbol} chain failed:`,
          err instanceof Error ? err.message : err,
        );
        continue;
      }
      const candidates: ChainCandidate[] = contracts
        .filter((c) => snapshots.has(c.symbol))
        .map((c) => ({ contract: c, snapshot: snapshots.get(c.symbol)! }));
      recordIv(symbol, candidates);
      const pick = pickContract(candidates, today);
      if (!pick.ok) {
        rejected += 1;
        emit({
          type: "signal",
          symbol,
          side: "buy",
          qty: null,
          price: round2(price),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · Contract pick: NO TRADE — ${pick.reason} · ${paramsSnapshot()}`,
        });
        continue;
      }
      const { contract, snapshot } = pick.candidate;
      const contractText =
        `contract ${contract.symbol}: ${symbol} ${contract.strike} ${direction}, exp ${contract.expiry}, ` +
        `delta ${snapshot.delta!.toFixed(2)}, IV ${snapshot.iv !== null ? `${(snapshot.iv * 100).toFixed(0)}%` : "n/a"}, ` +
        `OI ${contract.openInterest.toLocaleString("en-US")}, bid ${snapshot.bid.toFixed(2)} / ask ${snapshot.ask.toFixed(2)} / mid ${snapshot.mid!.toFixed(2)}`;

      // ---- Risk Gate ---------------------------------------------------
      const openCount =
        Object.keys(book()).length + (shadow ? 0 : state.pendingEntries.length);
      const capDollars = bookEquity() * (params.maxPositionPct / 100);
      const qty = sizeContracts(snapshot.ask, capDollars);
      const committed = Object.values(book()).reduce(
        (sum, p) => sum + p.entryPremium * p.qty * 100,
        0,
      );
      const estPremium = qty * snapshot.ask * 100;
      const dailyCapHit =
        realizedToday() <= -((params.maxDailyLossPct / 100) * ALLOCATION);

      let verdict: string | null = null;
      if (dailyCapHit) {
        verdict = `daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((params.maxDailyLossPct / 100) * ALLOCATION))}`;
      } else if (openCount >= params.maxPositions) {
        verdict = `max positions reached (${openCount}/${params.maxPositions})`;
      } else if (qty < 1) {
        verdict = `one contract at the ask (${money(snapshot.ask * 100)}) exceeds the ${params.maxPositionPct}% premium cap (${money(capDollars)})`;
      } else if (committed + estPremium > bookEquity()) {
        verdict = `the $5,000 book is fully committed (${money(committed)} open premium + ${money(estPremium)} new > ${money(bookEquity())})`;
      }

      if (verdict !== null) {
        rejected += 1;
        emit({
          type: "signal",
          symbol: contract.symbol,
          side: "buy",
          qty,
          price: round2(snapshot.ask),
          pnl: null,
          reason: `${tag} · ENTRY signal — ${screenText} · ${contractText} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
        });
        continue;
      }

      const mid = snapshot.mid!;
      const decisionId = emit({
        type: "signal",
        symbol: contract.symbol,
        side: "buy",
        qty,
        price: round2(mid),
        pnl: null,
        reason:
          `${tag} · ENTRY signal — ${screenText} · ${contractText} · Risk Gate: APPROVED — ` +
          `${qty} contract(s) ≈ ${money(qty * mid * 100)} premium at mid (cap ${money(capDollars)} = ${params.maxPositionPct}% of the ${money(bookEquity())} book); ` +
          `positions ${openCount}/${params.maxPositions}; earnings clear · ${paramsSnapshot()} · ` +
          (shadow
            ? "order intent ONLY — shadow mode places no broker orders"
            : `order: limit buy at mid ${money(mid)}, one reprice after 60 s, then cancel`),
      });

      if (shadow) {
        state.shadowContracts[contract.symbol] = {
          underlying: symbol,
          optionType: direction,
          qty,
          entryPremium: mid,
          entryDate: today,
          expiry: contract.expiry,
          decisionId,
        };
        emit(
          {
            type: "open",
            symbol: contract.symbol,
            side: "buy",
            qty,
            price: round2(mid),
            pnl: null,
            reason: `SHADOW · would-be entry filled at mid ${money(mid)}/contract — ${contract.symbol} tracked in the shadow book for exit checks`,
          },
          decisionId,
        );
      } else {
        const order = await client.createOrder({
          symbol: contract.symbol,
          qty,
          side: "buy",
          type: "limit",
          timeInForce: "day",
          limitPrice: round2(mid),
        });
        state.pendingEntries.push({
          orderId: order.id,
          contractSymbol: contract.symbol,
          underlying: symbol,
          optionType: direction,
          qty,
          limitPrice: round2(mid),
          decisionId,
          submittedAtMs: now().getTime(),
          repriced: false,
        });
      }
      entries += 1;
      save();
    }

    console.log(
      `[vega] ${bot.name}: hourly evaluation complete (${tag}) — ${screenedIn} screened in, ${signals} signals, ` +
        `${entries} entries ${shadow ? "intended" : "submitted"}, ${rejected} rejected/no-trade, ${guardBlocked} earnings-blocked; ` +
        `book equity ${money(bookEquity())}`,
    );
  }

  /** Kill + liquidate: cancel her orders, close her contracts, report. */
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
        if (shadow) {
          const symbols = Object.keys(state.shadowContracts);
          let snapshots = new Map<string, OptionSnapshot>();
          try {
            snapshots = await client.getOptionSnapshots(symbols);
          } catch {
            /* settle at entry premium when no quote is available */
          }
          for (const symbol of symbols) {
            const pos = state.shadowContracts[symbol]!;
            const mid = snapshots.get(symbol)?.mid ?? pos.entryPremium;
            const pnl = round2((mid - pos.entryPremium) * pos.qty * 100);
            addRealized(pnl);
            closed.push({
              codename: bot.codename,
              symbol,
              qty: pos.qty,
              price: round2(mid),
              pnl,
            });
            delete state.shadowContracts[symbol];
          }
          save();
        } else {
          await cancelOpenOrders();
          state.pendingEntries = [];
          const positions = await client.getPositions();
          for (const pos of positions) {
            if (!isHers(pos.symbol)) continue;
            const tracked = state.contracts[pos.symbol];
            try {
              const order = await client.closePosition(pos.symbol);
              state.pendingExits.push({
                orderId: order.id,
                contractSymbol: pos.symbol,
                qty: pos.qty,
                entryPremium: tracked?.entryPremium ?? pos.avgEntryPrice,
                decisionId: tracked?.decisionId ?? "liquidation",
                trigger: "KILL + LIQUIDATE",
              });
              closed.push({
                codename: bot.codename,
                symbol: pos.symbol,
                qty: pos.qty,
                price: round2(pos.currentPrice),
                pnl: tracked
                  ? round2(
                      (pos.currentPrice - tracked.entryPremium) *
                        pos.qty *
                        100,
                    )
                  : null,
              });
            } catch (err) {
              failed.push({
                codename: bot.codename,
                symbol: pos.symbol,
                reason: `close order failed: ${err instanceof Error ? err.message : String(err)}`,
              });
            }
          }
          save();
        }
      } catch (err) {
        failed.push({
          codename: bot.codename,
          symbol: "(all)",
          reason: `liquidation failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      await control.reportLiquidation(req.id, bot.codename, closed, failed);
      console.log(
        `[vega] ${bot.name}: KILL + LIQUIDATE executed (${tag}) — ${closed.length} close orders submitted, ${failed.length} failures`,
      );
    }
  }

  /** Adopt her broker contract positions at boot (live mode only). */
  async function reconcile(): Promise<void> {
    const positions = await client.getPositions();
    for (const pos of positions) {
      if (!isHers(pos.symbol)) continue;
      if (
        !state.contracts[pos.symbol] &&
        !state.pendingExits.some((p) => p.contractSymbol === pos.symbol)
      ) {
        const occ = parseOccSymbol(pos.symbol)!;
        state.contracts[pos.symbol] = {
          underlying: occ.underlying,
          optionType: occ.optionType,
          qty: pos.qty,
          entryPremium: pos.avgEntryPrice,
          // Entry date unknown for adopted positions: the time stop
          // counts from adoption (logged, never hidden).
          entryDate: etDate(now()),
          expiry: occ.expiry,
          decisionId: "reconciled",
        };
        emit({
          type: "open",
          symbol: pos.symbol,
          side: "buy",
          qty: pos.qty,
          price: round2(pos.avgEntryPrice),
          pnl: null,
          reason: `PAPER · contract position reconciled at engine start — ${pos.qty} contract(s) held @ avg entry ${money(pos.avgEntryPrice)} (opened before this engine session; time stop counts from today)`,
        });
      }
    }
    for (const symbol of Object.keys(state.contracts)) {
      if (
        !positions.some((p) => p.symbol === symbol) &&
        !state.pendingExits.some((p) => p.contractSymbol === symbol)
      ) {
        console.log(
          `[vega] ${bot.name}: ${symbol} in state but not at broker — dropping from tracking (closed, expired or exercised outside the engine)`,
        );
        delete state.contracts[symbol];
      }
    }
    save();
  }

  async function onHalt(): Promise<void> {
    if (!shadow) {
      await cancelOpenOrders();
      for (const p of state.pendingEntries) {
        emit(
          {
            type: "signal",
            symbol: p.contractSymbol,
            side: "buy",
            qty: p.qty,
            price: null,
            pnl: null,
            reason: `PAPER · entry order cancelled by the kill switch (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
      }
      state.pendingEntries = [];
      save();
    }
    console.log(
      `[vega] ${bot.name}: HALTED — ${shadow ? "shadow pipeline gated" : "open orders cancelled"}, no order flow until resumed`,
    );
  }

  async function tick(): Promise<void> {
    // Vega's hourly evaluation is heavier than one 30 s tick in the
    // worst case; never let ticks overlap (Trendia's daily eval can
    // afford the race, an hourly options screen cannot).
    if (tickBusy) return;
    tickBusy = true;
    try {
      await refreshEarningsIfStale();
      await handleLiquidations();
      if (!shadow) await pollPending();

      if (control.isHalted(bot.codename)) {
        if (!haltCancelHandled) {
          haltCancelHandled = true;
          await onHalt();
        }
        return;
      }
      haltCancelHandled = false;

      if (!booted) {
        booted = true;
        if (!shadow) {
          await reconcile();
        } else {
          console.log(
            `[vega] ${bot.name}: shadow book restored — ${Object.keys(state.shadowContracts).length} shadow contract(s) tracked; broker reconcile skipped in shadow mode`,
          );
        }
      }

      const clock = await client.getClock();
      if (clock.isOpen) {
        await managePositions();
        const key = etHourKey(now());
        if (state.lastEvalHour !== key) {
          await evaluate();
          state.lastEvalHour = key;
          save();
        }
      }
    } catch (err) {
      console.error(
        `[vega] ${bot.name}: tick failed (will retry):`,
        err instanceof Error ? err.message : err,
      );
    } finally {
      tickBusy = false;
    }
  }

  console.log(
    `[vega] ${bot.name}: Phase 3 ${shadow ? "SHADOW" : "live-paper"} runner started — pool ${params.pool.join("/")}, ` +
      `book ${money(ALLOCATION)}, hourly screen + breakout evaluation in market hours` +
      (shadow
        ? "; VEGA_SHADOW is on — full pipeline, decision/order-intent events only, NO broker orders"
        : "; entries limit-at-mid with one reprice"),
  );
  void tick();
  setInterval(() => void tick(), tickMs);
}
