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
import { addDays, parseOccSymbol } from "./vega.js";

/**
 * PHASE 12 (v21) — Wesley on the Alpaca PAPER account: the income wheel.
 *
 * Wesley simulated only until now. This runner follows Vega's Phase 3
 * architecture (same Risk Gate verdicts in every decision record, same
 * state-only reconcile discipline, same limit-at-mid order handling)
 * and implements bots/wesley.md literally:
 *
 * - Universe: the .md's watchlist examples (the file screens weekly by
 *   rules and carries no fixed list), underlyings priced $5–$55.
 * - Cash-secured puts: strike 5–10% out of the money, delta 0.20–0.30,
 *   only on names worth owning at the strike. Covered calls: once
 *   shares are assigned, calls 5–10% OTM against them until called
 *   away — then the wheel turns back to puts.
 * - Cycles: weekly expiries (~7 days) or monthly (30–45 days),
 *   whichever pays the better premium for the risk. Premium floor:
 *   skip any contract paying less than 1% of the cash secured (puts)
 *   or share value (calls) for the cycle.
 * - Liquidity: weekly options required (both cycles above have them),
 *   open interest ≥ 500, bid/ask within 8% of mid — checked on the
 *   candidate strikes, best-passing strike wins, chain never walked
 *   past a failed gate into a different rule set.
 * - Risk: max 4 positions, one position may use up to 100% of the
 *   book, 6% daily loss cap. Every put is fully cash-secured — the
 *   reservation is tracked in state and the cash ledger is explicit:
 *   premium lands in cash at fill, assignment converts reserved cash
 *   into shares at the strike, called-away converts shares back to
 *   cash at the strike. Nothing naked, ever.
 * - Early exit: buy back at 50% of the premium collected and redeploy.
 *   Defense: buy back at 2× the premium collected (the .md's "or roll
 *   it out" alternative is not implemented — the buy-back leg is).
 * - Expiry settlement: at/after expiry the broker is the source of
 *   truth — shares present means assigned (puts) / called away
 *   (calls); no shares and price on the safe side means the option
 *   expired worthless and the premium is realized. A put expiring in
 *   the money with shares not yet posted is booked as assigned at the
 *   strike (Alpaca posts assignment after expiry processing) and the
 *   decision record says so.
 * - Kill switch: halt cancels his open orders; kill+liquidate buys
 *   back every short option and sells his tracked shares with
 *   quantity-sized orders (never closePosition on a shared symbol).
 *
 * SHARED-ACCOUNT DISCIPLINE: state-only reconcile, exactly like
 * Snapback — untracked broker positions are logged as foreign and
 * ignored; he never adopts and never liquidates another bot's shares.
 *
 * Money: the same virtual $10,000 book as every bot (doubled fleet-
 * wide 2026-11-03), state at WESLEY_STATE_PATH.
 */

const STARTING_CAPITAL = 10000;
const LEGACY_STARTING_CAPITAL = 5000;
const TICK_MS =
  Number(process.env.WESLEY_TICK_MS ?? process.env.PAPER_TICK_MS ?? 30_000) ||
  30_000;

const OTM_MIN_PCT = 5;
const OTM_MAX_PCT = 10;
const DELTA_MIN = 0.2;
const DELTA_MAX = 0.3;
const OI_MIN = 500;
const SPREAD_MAX_PCT = 8;
const PREMIUM_FLOOR_PCT = 1; // of cash secured (puts) / share value (calls)
const WEEKLY_MIN_DAYS = 4;
const WEEKLY_MAX_DAYS = 12;
const MONTHLY_MIN_DAYS = 28;
const MONTHLY_MAX_DAYS = 45;
const EARLY_EXIT_FRACTION = 0.5;
const DEFENSE_MULTIPLE = 2;
const REPRICE_AFTER_MS = 60_000;
const DAILY_BARS_LOOKBACK_DAYS = 60;

export interface WesleyDeps {
  now?: () => Date;
  statePath?: string;
  tickMs?: number;
}

interface ShortOption {
  kind: "put" | "call";
  underlying: string;
  strike: number;
  expiry: string;
  qty: number;
  /** Premium collected per share (×100×qty = dollars received). */
  entryPremium: number;
  entryDate: string;
  decisionId: string;
}

interface ShareBlock {
  underlying: string;
  qty: number;
  /** Per-share cost basis (the put strike he was assigned at). */
  costBasis: number;
  acquiredDate: string;
  decisionId: string;
}

interface PendingWesleyOrder {
  orderId: string;
  contractSymbol: string;
  underlying: string;
  kind: "open-short" | "close-short";
  optionKind: "put" | "call";
  strike: number;
  expiry: string;
  qty: number;
  limitPrice: number | null;
  decisionId: string;
  submittedAtMs: number;
  repriced: boolean;
  /** Why a close was submitted (early exit / defense / liquidation). */
  trigger: string | null;
  /** Entry premium of the position a close-short targets. */
  entryPremium: number | null;
}

interface WesleyState {
  startCapital: number;
  /** Explicit cash ledger (see header): premiums in, assignments and buy-backs out. */
  cash: number;
  realizedTotal: number;
  realizedByDay: Record<string, number>;
  shorts: Record<string, ShortOption>;
  shares: Record<string, ShareBlock>;
  pending: PendingWesleyOrder[];
  lastEvalDate: string | null;
  decisionCounter: number;
}

interface WesleyParams {
  universe: string[];
  priceMin: number;
  priceMax: number;
  maxPositions: number;
  maxPositionPct: number;
  maxDailyLossPct: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const round4 = (n: number): number => Math.round(n * 10000) / 10000;
const money = (n: number): string =>
  `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

export interface WheelCandidate {
  contract: OptionContract;
  snapshot: OptionSnapshot;
  /** Premium as % of the floor base (strike for puts, spot for calls). */
  premiumPct: number;
  cycle: "weekly" | "monthly";
}

/**
 * Pick Wesley's contract, pure for harness testing. Candidates are
 * pre-fetched contracts + snapshots for ONE underlying and direction.
 * Rules, straight from the .md: strike inside the 5–10% OTM band,
 * delta inside 0.20–0.30, OI ≥ 500, spread ≤ 8% of mid, premium at or
 * above the 1% floor — then the weekly-vs-monthly cycle that pays the
 * better premium for the risk (highest premium % of the floor base)
 * wins. Returns the best passer, or the reason none passed.
 */
export function pickWheelContract(
  candidates: { contract: OptionContract; snapshot: OptionSnapshot }[],
  today: string,
  direction: "put" | "call",
  spot: number,
): { ok: true; candidate: WheelCandidate } | { ok: false; reason: string } {
  const bandLo =
    direction === "put"
      ? spot * (1 - OTM_MAX_PCT / 100)
      : spot * (1 + OTM_MIN_PCT / 100);
  const bandHi =
    direction === "put"
      ? spot * (1 - OTM_MIN_PCT / 100)
      : spot * (1 + OTM_MAX_PCT / 100);
  let sawInBand = false;
  let best: WheelCandidate | null = null;
  for (const c of candidates) {
    const { contract, snapshot } = c;
    if (contract.type !== direction) continue;
    const calendarDays = Math.round(
      (Date.parse(`${contract.expiry}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) /
        86_400_000,
    );
    const cycle =
      calendarDays >= WEEKLY_MIN_DAYS && calendarDays <= WEEKLY_MAX_DAYS
        ? ("weekly" as const)
        : calendarDays >= MONTHLY_MIN_DAYS && calendarDays <= MONTHLY_MAX_DAYS
          ? ("monthly" as const)
          : null;
    if (cycle === null) continue;
    if (contract.strike < bandLo - 1e-9 || contract.strike > bandHi + 1e-9) {
      continue;
    }
    sawInBand = true;
    if (contract.openInterest < OI_MIN) continue;
    if (snapshot.mid === null || snapshot.bid <= 0 || snapshot.ask <= 0) continue;
    const spreadPct = ((snapshot.ask - snapshot.bid) / snapshot.mid) * 100;
    if (spreadPct > SPREAD_MAX_PCT + 1e-9) continue;
    const delta = snapshot.delta === null ? null : Math.abs(snapshot.delta);
    if (delta === null || delta < DELTA_MIN - 1e-9 || delta > DELTA_MAX + 1e-9) {
      continue;
    }
    const floorBase = direction === "put" ? contract.strike : spot;
    const premiumPct = (snapshot.mid / floorBase) * 100;
    if (premiumPct < PREMIUM_FLOOR_PCT - 1e-9) continue;
    const cand: WheelCandidate = { ...c, premiumPct, cycle };
    if (best === null || cand.premiumPct > best.premiumPct) best = cand;
  }
  if (best !== null) return { ok: true, candidate: best };
  return {
    ok: false,
    reason: sawInBand
      ? `no ${direction} in the ${OTM_MIN_PCT}–${OTM_MAX_PCT}% OTM band passed every gate (OI ≥ ${OI_MIN}, spread ≤ ${SPREAD_MAX_PCT}% of mid, delta ${DELTA_MIN}–${DELTA_MAX}, premium ≥ ${PREMIUM_FLOOR_PCT}% floor) in the weekly or monthly cycle`
      : `no ${direction} strikes listed inside the ${OTM_MIN_PCT}–${OTM_MAX_PCT}% OTM band (${money(bandLo)}–${money(bandHi)} on spot ${money(spot)}) for the weekly/monthly cycles`,
  };
}

export function startWesleyTrader(
  bot: BotConfig,
  client: AlpacaClientLike,
  post: (event: FleetEvent) => Promise<void>,
  control: PaperControl,
  deps: WesleyDeps = {},
): void {
  const now = deps.now ?? (() => new Date());
  const params: WesleyParams = {
    universe: (bot.watchlist_examples ?? []).filter(
      (v): v is string => typeof v === "string",
    ),
    priceMin: leadingNumber(bot.rules.underlying_price_min, 5),
    priceMax: leadingNumber(bot.rules.underlying_price_max, 55),
    maxPositions: leadingNumber(bot.risk.max_positions, 4),
    maxPositionPct: leadingNumber(bot.risk.max_position_pct, 100),
    maxDailyLossPct: leadingNumber(bot.risk.max_daily_loss_pct, 6),
  };
  const statePath =
    deps.statePath ??
    process.env.WESLEY_STATE_PATH ??
    "data/paper-wesley-state.json";
  const tickMs = deps.tickMs ?? TICK_MS;

  const freshState = (): WesleyState => ({
    startCapital: STARTING_CAPITAL,
    cash: STARTING_CAPITAL,
    realizedTotal: 0,
    realizedByDay: {},
    shorts: {},
    shares: {},
    pending: [],
    lastEvalDate: null,
    decisionCounter: 0,
  });

  let state: WesleyState = freshState();
  let persistedRaw: Partial<WesleyState> | null = null;
  try {
    if (existsSync(statePath)) {
      persistedRaw = JSON.parse(readFileSync(statePath, "utf8")) as WesleyState;
      state = { ...freshState(), ...persistedRaw };
      if (typeof persistedRaw.startCapital !== "number") {
        state.startCapital = LEGACY_STARTING_CAPITAL;
        state.cash = LEGACY_STARTING_CAPITAL;
      }
      console.log(`[wesley] ${bot.name}: restored state from ${statePath}`);
    }
  } catch (err) {
    console.warn(
      `[wesley] ${bot.name}: state file unreadable, starting fresh:`,
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
        `[wesley] ${bot.name}: state save failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  };

  // Boot re-seed, same rule as the other runners: an untouched book
  // seeded at the legacy $5,000 follows the fleet-wide doubling; a
  // touched book keeps its start (see paper.ts / vega.ts).
  if (persistedRaw !== null && state.startCapital !== STARTING_CAPITAL) {
    const untouched =
      state.realizedTotal === 0 &&
      Object.values(state.realizedByDay).every((v) => v === 0) &&
      Object.keys(state.shorts).length === 0 &&
      Object.keys(state.shares).length === 0 &&
      state.pending.length === 0;
    if (untouched) {
      state.startCapital = STARTING_CAPITAL;
      state.cash = STARTING_CAPITAL;
      console.log(
        `[wesley] ${bot.name}: book re-seeded ${money(LEGACY_STARTING_CAPITAL)} → ${money(STARTING_CAPITAL)} (starting capital changed; book was untouched)`,
      );
    } else {
      console.log(
        `[wesley] ${bot.name}: starting capital changed but the book is not untouched — resize skipped, book keeps its ${money(state.startCapital)} start`,
      );
    }
    save();
  }

  const bookEquity = (): number => state.startCapital + state.realizedTotal;
  /** Cash locked behind open cash-secured puts. */
  const reservedCash = (): number =>
    Object.values(state.shorts)
      .filter((s) => s.kind === "put")
      .reduce((sum, s) => sum + s.strike * 100 * s.qty, 0);
  const spendableCash = (): number => round2(state.cash - reservedCash());
  const realizedToday = (): number => state.realizedByDay[etDate(now())] ?? 0;
  const addRealized = (pnl: number): void => {
    const day = etDate(now());
    state.realizedTotal = round2(state.realizedTotal + pnl);
    state.realizedByDay[day] = round2((state.realizedByDay[day] ?? 0) + pnl);
  };
  const positionCount = (): number =>
    Object.keys(state.shorts).length + Object.keys(state.shares).length;

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
      `[wesley] ${event.bot} ${event.type} ${event.symbol ?? ""} ${event.side ?? ""} ` +
        `qty=${event.qty ?? "-"} @ ${event.price ?? "-"} ` +
        `${event.pnl !== null ? `pnl=${event.pnl.toFixed(2)} ` : ""}— ${event.reason}`,
    );
    void post(event);
    return id;
  };

  const paramsSnapshot = (): string =>
    `params snapshot: underlyings $${params.priceMin}–$${params.priceMax}, strikes ${OTM_MIN_PCT}–${OTM_MAX_PCT}% OTM, ` +
    `delta ${DELTA_MIN}–${DELTA_MAX}, OI ≥ ${OI_MIN}, spread ≤ ${SPREAD_MAX_PCT}% of mid, premium floor ${PREMIUM_FLOOR_PCT}%, ` +
    `weekly ${WEEKLY_MIN_DAYS}–${WEEKLY_MAX_DAYS}d / monthly ${MONTHLY_MIN_DAYS}–${MONTHLY_MAX_DAYS}d cycles, ` +
    `early exit at ${EARLY_EXIT_FRACTION * 100}% of premium, defense at ${DEFENSE_MULTIPLE}× premium, ` +
    `max_positions ${params.maxPositions}, max_position ${params.maxPositionPct}%, daily_loss_cap ${params.maxDailyLossPct}%`;

  let haltCancelHandled = false;
  let booted = false;
  let tickBusy = false;

  /** Cancel only HIS tracked pending orders (shared-account discipline). */
  async function cancelPendingOrders(): Promise<void> {
    const open = await client.getOpenOrders().catch(() => [] as AlpacaOrder[]);
    for (const p of [...state.pending]) {
      if (open.some((o) => o.id === p.orderId)) {
        try {
          await client.cancelOrder(p.orderId);
          console.log(
            `[wesley] ${bot.name}: cancelled open order ${p.orderId} (${p.contractSymbol})`,
          );
        } catch (err) {
          console.warn(
            `[wesley] ${bot.name}: cancel of order ${p.orderId} failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }
    state.pending = [];
  }

  /** Turn a filled sell-to-open into a tracked short; premium lands in cash. */
  function recordOpenFill(p: PendingWesleyOrder, order: AlpacaOrder): void {
    const filledQty = order.filledQty;
    const premium = order.filledAvgPrice ?? p.limitPrice ?? 0;
    state.shorts[p.contractSymbol] = {
      kind: p.optionKind,
      underlying: p.underlying,
      strike: p.strike,
      expiry: p.expiry,
      qty: filledQty,
      entryPremium: premium,
      entryDate: etDate(now()),
      decisionId: p.decisionId,
    };
    state.cash = round2(state.cash + premium * 100 * filledQty);
    emit(
      {
        type: "open",
        symbol: p.contractSymbol,
        side: "sell",
        qty: filledQty,
        price: round2(premium),
        pnl: null,
        reason:
          `PAPER · sold to open ${filledQty} × ${p.contractSymbol} @ ${money(premium)} — collected ${money(premium * 100 * filledQty)} premium` +
          (p.optionKind === "put"
            ? `; ${money(p.strike * 100 * filledQty)} cash secured against assignment`
            : ` against ${filledQty * 100} held shares`),
      },
      p.decisionId,
    );
  }

  /** Turn a filled buy-to-close into realized PnL; premium math settles. */
  function recordCloseFill(p: PendingWesleyOrder, order: AlpacaOrder): void {
    const pos = state.shorts[p.contractSymbol];
    const paid = order.filledAvgPrice ?? 0;
    const entryPremium = p.entryPremium ?? pos?.entryPremium ?? 0;
    const qty = order.filledQty || p.qty;
    const pnl = round2((entryPremium - paid) * qty * 100);
    state.cash = round2(state.cash - paid * 100 * qty);
    addRealized(pnl);
    if (pos && qty >= pos.qty) delete state.shorts[p.contractSymbol];
    else if (pos) pos.qty -= qty;
    emit(
      {
        type: "close",
        symbol: p.contractSymbol,
        side: "buy",
        qty,
        price: round2(paid),
        pnl,
        reason: `PAPER · bought back ${qty} × ${p.contractSymbol} @ ${money(paid)} — ${p.trigger ?? "exit"}; collected ${money(entryPremium)} at open, realized ${money(pnl)}`,
      },
      p.decisionId,
    );
  }

  async function pollPending(): Promise<void> {
    for (const p of [...state.pending]) {
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
        state.pending = state.pending.filter((x) => x.orderId !== p.orderId);
        if (p.kind === "open-short") recordOpenFill(p, order);
        else recordCloseFill(p, order);
        save();
        continue;
      }
      if (terminal) {
        state.pending = state.pending.filter((x) => x.orderId !== p.orderId);
        emit(
          {
            type: "signal",
            symbol: p.contractSymbol,
            side: p.kind === "open-short" ? "sell" : "buy",
            qty: p.qty,
            price: null,
            pnl: null,
            reason: `PAPER · ${p.kind === "open-short" ? "sell-to-open" : "buy-to-close"} order ${order.status} before filling — no position change (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
        continue;
      }
      // Limit-at-mid discipline (Vega's D5 pattern): one reprice at the
      // fresh mid after 60 s, then cancel and log.
      if (
        p.kind === "open-short" &&
        now().getTime() - p.submittedAtMs >= REPRICE_AFTER_MS
      ) {
        if (!p.repriced) {
          await client.cancelOrder(p.orderId);
          const after = await client.getOrder(p.orderId).catch(() => null);
          if (after && after.filledQty > 0 && after.filledAvgPrice !== null) {
            continue; // next tick records the fill on the old id
          }
          const snap = (await client.getOptionSnapshots([p.contractSymbol])).get(
            p.contractSymbol,
          );
          if (!snap || snap.mid === null) {
            state.pending = state.pending.filter((x) => x.orderId !== p.orderId);
            emit(
              {
                type: "signal",
                symbol: p.contractSymbol,
                side: "sell",
                qty: p.qty,
                price: null,
                pnl: null,
                reason: `PAPER · sell-to-open abandoned at reprice — no fresh two-sided quote for ${p.contractSymbol} (decision #${p.decisionId})`,
              },
              p.decisionId,
            );
            save();
            continue;
          }
          const replacement = await client.createOrder({
            symbol: p.contractSymbol,
            qty: p.qty,
            side: "sell",
            type: "limit",
            timeInForce: "day",
            limitPrice: round2(snap.mid),
          });
          p.orderId = replacement.id;
          p.limitPrice = round2(snap.mid);
          p.submittedAtMs = now().getTime();
          p.repriced = true;
          save();
        } else {
          await client.cancelOrder(p.orderId);
          state.pending = state.pending.filter((x) => x.orderId !== p.orderId);
          emit(
            {
              type: "signal",
              symbol: p.contractSymbol,
              side: "sell",
              qty: p.qty,
              price: null,
              pnl: null,
              reason: `PAPER · sell-to-open abandoned — still unfilled 60 s after the reprice, cancelled per the limit-at-mid rule (decision #${p.decisionId})`,
            },
            p.decisionId,
          );
          save();
        }
      }
    }
  }

  /** Submit a buy-to-close for a tracked short (early exit / defense / liquidation). */
  async function submitBuyBack(
    contractSymbol: string,
    trigger: string,
    market: boolean,
    currentMid: number,
  ): Promise<void> {
    const pos = state.shorts[contractSymbol];
    if (!pos) return;
    if (state.pending.some((p) => p.contractSymbol === contractSymbol)) return;
    const decisionId = emit({
      type: "signal",
      symbol: contractSymbol,
      side: "buy",
      qty: pos.qty,
      price: round2(currentMid),
      pnl: null,
      reason:
        `PAPER · EXIT — ${trigger}: bought back at ${market ? "market" : `limit mid ${money(currentMid)}`}; ` +
        `collected ${money(pos.entryPremium)} at open · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
    });
    const order = await client.createOrder({
      symbol: contractSymbol,
      qty: pos.qty,
      side: "buy",
      type: market ? "market" : "limit",
      timeInForce: "day",
      ...(market ? {} : { limitPrice: round2(currentMid) }),
    });
    state.pending.push({
      orderId: order.id,
      contractSymbol,
      underlying: pos.underlying,
      kind: "close-short",
      optionKind: pos.kind,
      strike: pos.strike,
      expiry: pos.expiry,
      qty: pos.qty,
      limitPrice: market ? null : round2(currentMid),
      decisionId,
      submittedAtMs: now().getTime(),
      repriced: true, // closes don't get the reprice dance; defense must fill
      trigger,
      entryPremium: pos.entryPremium,
    });
    save();
  }

  /** Settle an expired short option against the broker + tape (see header). */
  async function settleExpired(contractSymbol: string): Promise<void> {
    const pos = state.shorts[contractSymbol];
    if (!pos) return;
    const today = etDate(now());
    if (pos.expiry >= today) return;
    let spot: number;
    try {
      spot = await client.getLatestPrice(pos.underlying);
    } catch {
      return; // no tape, no settlement this tick — never guess
    }
    const positions = await client.getPositions().catch(() => []);
    const brokerShares =
      positions.find((p) => p.symbol === pos.underlying)?.qty ?? 0;
    const heldShares = state.shares[pos.underlying]?.qty ?? 0;

    if (pos.kind === "put") {
      const assigned =
        brokerShares >= heldShares + pos.qty * 100 || spot < pos.strike;
      delete state.shorts[contractSymbol];
      if (assigned) {
        const cost = pos.strike * 100 * pos.qty;
        state.cash = round2(state.cash - cost);
        const existing = state.shares[pos.underlying];
        const totalQty = (existing?.qty ?? 0) + pos.qty * 100;
        state.shares[pos.underlying] = {
          underlying: pos.underlying,
          qty: totalQty,
          costBasis: existing
            ? round4(
                (existing.costBasis * existing.qty + pos.strike * pos.qty * 100) /
                  totalQty,
              )
            : pos.strike,
          acquiredDate: today,
          decisionId: pos.decisionId,
        };
        emit(
          {
            type: "open",
            symbol: pos.underlying,
            side: "buy",
            qty: pos.qty * 100,
            price: pos.strike,
            pnl: null,
            reason:
              `PAPER · ASSIGNED — ${contractSymbol} expired with ${pos.underlying} @ ${money(spot)} vs strike ${money(pos.strike)}: ` +
              `took ${pos.qty * 100} shares at the strike (${money(cost)} of secured cash converted to shares)` +
              (brokerShares >= heldShares + pos.qty * 100
                ? " — shares confirmed at the broker"
                : " — shares post at the broker after expiry processing; booked at the strike now") +
              `; premium ${money(pos.entryPremium * 100 * pos.qty)} already collected stays in cash. The wheel turns: covered calls next.`,
          },
          pos.decisionId,
        );
      } else {
        const pnl = round2(pos.entryPremium * 100 * pos.qty);
        addRealized(pnl);
        emit(
          {
            type: "close",
            symbol: contractSymbol,
            side: "buy",
            qty: pos.qty,
            price: 0,
            pnl,
            reason: `PAPER · put expired worthless — ${pos.underlying} @ ${money(spot)} stayed above the ${money(pos.strike)} strike; kept the full ${money(pnl)} premium and the secured cash is released`,
          },
          pos.decisionId,
        );
      }
      save();
      return;
    }

    // Covered call expiry.
    const shares = state.shares[pos.underlying];
    const calledAway =
      shares !== undefined &&
      (brokerShares < shares.qty || spot >= pos.strike);
    delete state.shorts[contractSymbol];
    if (calledAway && shares) {
      const soldQty = Math.min(shares.qty, pos.qty * 100);
      const proceeds = pos.strike * soldQty;
      const sharePnl = round2((pos.strike - shares.costBasis) * soldQty);
      const premiumPnl = round2(pos.entryPremium * 100 * pos.qty);
      state.cash = round2(state.cash + proceeds);
      addRealized(round2(sharePnl + premiumPnl));
      shares.qty -= soldQty;
      if (shares.qty <= 0) delete state.shares[pos.underlying];
      emit(
        {
          type: "close",
          symbol: pos.underlying,
          side: "sell",
          qty: soldQty,
          price: pos.strike,
          pnl: round2(sharePnl + premiumPnl),
          reason:
            `PAPER · CALLED AWAY — ${contractSymbol} expired with ${pos.underlying} @ ${money(spot)} vs strike ${money(pos.strike)}: ` +
            `${soldQty} shares sold at the strike for ${money(proceeds)} (share PnL ${money(sharePnl)} + call premium ${money(premiumPnl)}). ` +
            `The wheel turns: back to cash-secured puts.`,
        },
        pos.decisionId,
      );
    } else {
      const pnl = round2(pos.entryPremium * 100 * pos.qty);
      addRealized(pnl);
      emit(
        {
          type: "close",
          symbol: contractSymbol,
          side: "buy",
          qty: pos.qty,
          price: 0,
          pnl,
          reason: `PAPER · covered call expired worthless — ${pos.underlying} @ ${money(spot)} stayed below the ${money(pos.strike)} strike; kept the full ${money(pnl)} premium and the shares stay rented out next cycle`,
        },
        pos.decisionId,
      );
    }
    save();
  }

  /** Early-exit (50%) and defense (2×) checks against live mids. */
  async function managePositions(): Promise<void> {
    const symbols = Object.keys(state.shorts);
    if (symbols.length === 0) return;
    let snapshots: Map<string, OptionSnapshot>;
    try {
      snapshots = await client.getOptionSnapshots(symbols);
    } catch (err) {
      console.warn(
        `[wesley] ${bot.name}: snapshot fetch for exit checks failed:`,
        err instanceof Error ? err.message : err,
      );
      return;
    }
    const today = etDate(now());
    for (const [symbol, pos] of Object.entries(state.shorts)) {
      if (pos.expiry < today) {
        await settleExpired(symbol);
        continue;
      }
      if (state.pending.some((p) => p.contractSymbol === symbol)) continue;
      const snap = snapshots.get(symbol);
      if (!snap || snap.mid === null || pos.entryPremium <= 0) continue;
      const mid = snap.mid;
      if (mid <= pos.entryPremium * EARLY_EXIT_FRACTION) {
        await submitBuyBack(
          symbol,
          `early exit — mid ${money(mid)} is at or below 50% of the ${money(pos.entryPremium)} premium collected; bank the rent and redeploy`,
          false,
          mid,
        );
      } else if (mid >= pos.entryPremium * DEFENSE_MULTIPLE) {
        await submitBuyBack(
          symbol,
          `defense — mid ${money(mid)} reached 2× the ${money(pos.entryPremium)} premium collected; buy back before it costs more`,
          true,
          mid,
        );
      }
    }
  }

  /** Sell one new short option (put on cash / call on shares) through the gate. */
  async function openShort(
    direction: "put" | "call",
    underlying: string,
    spot: number,
  ): Promise<"entered" | "rejected" | "notrade"> {
    const today = etDate(now());
    const gte = addDays(today, WEEKLY_MIN_DAYS);
    const lte = addDays(today, MONTHLY_MAX_DAYS);
    let contracts: OptionContract[];
    try {
      contracts = await client.getOptionContracts(underlying, direction, gte, lte);
    } catch (err) {
      emit({
        type: "signal",
        symbol: underlying,
        side: "sell",
        qty: null,
        price: round2(spot),
        pnl: null,
        reason: `PAPER · ${direction === "put" ? "CSP" : "covered call"} scan — NO TRADE — chain fetch failed for ${underlying} ${direction}s (${gte} → ${lte}): ${err instanceof Error ? err.message : String(err)} · ${paramsSnapshot()}`,
      });
      return "notrade";
    }
    if (contracts.length === 0) {
      emit({
        type: "signal",
        symbol: underlying,
        side: "sell",
        qty: null,
        price: round2(spot),
        pnl: null,
        reason: `PAPER · ${direction === "put" ? "CSP" : "covered call"} scan — NO TRADE — no ${direction}s listed in the weekly/monthly window (${gte} → ${lte}) · ${paramsSnapshot()}`,
      });
      return "notrade";
    }
    let snapshots: Map<string, OptionSnapshot>;
    try {
      snapshots = await client.getOptionSnapshots(contracts.map((c) => c.symbol));
    } catch (err) {
      emit({
        type: "signal",
        symbol: underlying,
        side: "sell",
        qty: null,
        price: round2(spot),
        pnl: null,
        reason: `PAPER · ${direction === "put" ? "CSP" : "covered call"} scan — NO TRADE — snapshot fetch failed for the ${underlying} chain: ${err instanceof Error ? err.message : String(err)} · ${paramsSnapshot()}`,
      });
      return "notrade";
    }
    const candidates = contracts
      .filter((c) => snapshots.has(c.symbol))
      .map((c) => ({ contract: c, snapshot: snapshots.get(c.symbol)! }));
    const pick = pickWheelContract(candidates, today, direction, spot);
    if (!pick.ok) {
      emit({
        type: "signal",
        symbol: underlying,
        side: "sell",
        qty: null,
        price: round2(spot),
        pnl: null,
        reason: `PAPER · ${direction === "put" ? "CSP" : "covered call"} scan — NO TRADE — ${pick.reason} · ${paramsSnapshot()}`,
      });
      return "notrade";
    }
    const { contract, snapshot, premiumPct, cycle } = pick.candidate;
    const mid = snapshot.mid!;

    // ---- Sizing (100-share blocks, fully secured / fully covered) --
    let qty: number;
    if (direction === "put") {
      const perContract = contract.strike * 100;
      const bookCap = Math.floor((bookEquity() * (params.maxPositionPct / 100)) / perContract);
      const cashCap = Math.floor(spendableCash() / perContract);
      qty = Math.max(0, Math.min(bookCap, cashCap));
    } else {
      const shares = state.shares[underlying]?.qty ?? 0;
      qty = Math.floor(shares / 100);
    }

    // ---- Risk Gate --------------------------------------------------
    const dailyCapHit =
      realizedToday() <= -((params.maxDailyLossPct / 100) * state.startCapital);
    // A covered call rents out a share block that is ALREADY a
    // position — it must not count itself against the max-positions cap.
    const effectivePositions =
      direction === "call" ? positionCount() - 1 : positionCount();
    let verdict: string | null = null;
    if (dailyCapHit) {
      verdict = `daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((params.maxDailyLossPct / 100) * state.startCapital))}`;
    } else if (effectivePositions >= params.maxPositions) {
      verdict = `max positions reached (${positionCount()}/${params.maxPositions})`;
    } else if (qty < 1) {
      verdict =
        direction === "put"
          ? `not enough unsecured cash for one 100-share block at strike ${money(contract.strike)} (needs ${money(contract.strike * 100)}, spendable ${money(spendableCash())})`
          : `fewer than 100 shares of ${underlying} held — nothing to cover a call with`;
    }
    if (verdict !== null) {
      emit({
        type: "signal",
        symbol: contract.symbol,
        side: "sell",
        qty: Math.max(qty, 0),
        price: round2(mid),
        pnl: null,
        reason:
          `PAPER · ${direction === "put" ? "CSP" : "COVERED CALL"} signal — ${contract.symbol}: strike ${money(contract.strike)} (${(((direction === "put" ? spot - contract.strike : contract.strike - spot) / spot) * 100).toFixed(1)}% OTM), ` +
          `${cycle} cycle exp ${contract.expiry}, delta ${snapshot.delta?.toFixed(2) ?? "n/a"}, mid ${money(mid)} = ${premiumPct.toFixed(2)}% of ${direction === "put" ? "cash secured" : "share value"} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
      });
      return "rejected";
    }

    const decisionId = emit({
      type: "signal",
      symbol: contract.symbol,
      side: "sell",
      qty,
      price: round2(mid),
      pnl: null,
      reason:
        `PAPER · ${direction === "put" ? "CSP" : "COVERED CALL"} signal — ${contract.symbol}: strike ${money(contract.strike)}, ${cycle} cycle exp ${contract.expiry}, ` +
        `delta ${snapshot.delta?.toFixed(2) ?? "n/a"}, OI ${contract.openInterest.toLocaleString("en-US")}, bid ${snapshot.bid.toFixed(2)} / ask ${snapshot.ask.toFixed(2)} / mid ${mid.toFixed(2)} ` +
        `(${premiumPct.toFixed(2)}% premium) · Risk Gate: APPROVED — sell ${qty} contract(s) ≈ ${money(mid * 100 * qty)} premium` +
        (direction === "put"
          ? `, securing ${money(contract.strike * 100 * qty)} cash`
          : ` against ${qty * 100} held shares`) +
        ` · ${paramsSnapshot()} · order: limit sell at mid ${money(mid)}, one reprice after 60 s, then cancel`,
    });
    const order = await client.createOrder({
      symbol: contract.symbol,
      qty,
      side: "sell",
      type: "limit",
      timeInForce: "day",
      limitPrice: round2(mid),
    });
    state.pending.push({
      orderId: order.id,
      contractSymbol: contract.symbol,
      underlying,
      kind: "open-short",
      optionKind: direction,
      strike: contract.strike,
      expiry: contract.expiry,
      qty,
      limitPrice: round2(mid),
      decisionId,
      submittedAtMs: now().getTime(),
      repriced: false,
      trigger: null,
      entryPremium: null,
    });
    save();
    return "entered";
  }

  /** Daily evaluation: puts on free names, calls on rented shares. */
  async function evaluate(): Promise<void> {
    let entered = 0;
    let rejected = 0;
    let noTrade = 0;
    for (const underlying of params.universe) {
      // One wheel position per underlying: shares (with or without a
      // call) or a short put — never stacked.
      const hasShares = state.shares[underlying] !== undefined;
      const hasShort = Object.values(state.shorts).some(
        (s) => s.underlying === underlying,
      );
      const hasPending = state.pending.some((p) => p.underlying === underlying);
      if (hasShort || hasPending) continue;

      let spot: number;
      try {
        spot = await client.getLatestPrice(underlying);
      } catch {
        continue;
      }
      if (!Number.isFinite(spot) || spot <= 0) continue;

      if (hasShares) {
        const shares = state.shares[underlying]!;
        if (shares.qty < 100) continue;
        const r = await openShort("call", underlying, spot);
        if (r === "entered") entered += 1;
        else if (r === "rejected") rejected += 1;
        else noTrade += 1;
        continue;
      }

      // Price band from the .md ($5–$55) before any put is considered.
      if (spot < params.priceMin || spot > params.priceMax) continue;
      if (positionCount() >= params.maxPositions) {
        // Still log the gate verdict once per evaluation for the first
        // qualifying name? No — a full book is the steady state, not a
        // signal. The summary line carries the count instead.
        break;
      }
      const r = await openShort("put", underlying, spot);
      if (r === "entered") entered += 1;
      else if (r === "rejected") rejected += 1;
      else noTrade += 1;
    }
    state.lastEvalDate = etDate(now());
    save();
    console.log(
      `[wesley] ${bot.name}: daily evaluation complete (PAPER) — ${entered} entries submitted, ` +
        `${rejected} gate-rejected, ${noTrade} no-trade; positions ${positionCount()}/${params.maxPositions}; ` +
        `cash ${money(state.cash)} (reserved ${money(reservedCash())}); book equity ${money(bookEquity())}`,
    );
  }

  /** Kill + liquidate: buy back shorts, sell tracked shares (qty-sized). */
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
        await cancelPendingOrders();
        let snapshots = new Map<string, OptionSnapshot>();
        try {
          snapshots = await client.getOptionSnapshots(Object.keys(state.shorts));
        } catch {
          /* settle at last known prices below */
        }
        for (const [symbol, pos] of Object.entries(state.shorts)) {
          const mid = snapshots.get(symbol)?.mid ?? pos.entryPremium;
          try {
            const order = await client.createOrder({
              symbol,
              qty: pos.qty,
              side: "buy",
              type: "market",
              timeInForce: "day",
            });
            state.pending.push({
              orderId: order.id,
              contractSymbol: symbol,
              underlying: pos.underlying,
              kind: "close-short",
              optionKind: pos.kind,
              strike: pos.strike,
              expiry: pos.expiry,
              qty: pos.qty,
              limitPrice: null,
              decisionId: pos.decisionId,
              submittedAtMs: now().getTime(),
              repriced: true,
              trigger: "KILL + LIQUIDATE",
              entryPremium: pos.entryPremium,
            });
            closed.push({
              codename: bot.codename,
              symbol,
              qty: pos.qty,
              price: round2(mid),
              pnl: round2((pos.entryPremium - mid) * pos.qty * 100),
            });
          } catch (err) {
            failed.push({
              codename: bot.codename,
              symbol,
              reason: `buy-back order failed: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
        }
        for (const [underlying, block] of Object.entries(state.shares)) {
          try {
            let price = block.costBasis;
            try {
              price = await client.getLatestPrice(underlying);
            } catch {
              /* report at cost basis */
            }
            await client.createOrder({
              symbol: underlying,
              qty: block.qty,
              side: "sell",
              type: "market",
              timeInForce: "day",
            });
            closed.push({
              codename: bot.codename,
              symbol: underlying,
              qty: block.qty,
              price: round2(price),
              pnl: round2((price - block.costBasis) * block.qty),
            });
            // The sale settles outside pending-order tracking; settle
            // the ledger now at the reported price.
            state.cash = round2(state.cash + price * block.qty);
            addRealized(round2((price - block.costBasis) * block.qty));
            delete state.shares[underlying];
          } catch (err) {
            failed.push({
              codename: bot.codename,
              symbol: underlying,
              reason: `share sale failed: ${err instanceof Error ? err.message : String(err)}`,
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
        `[wesley] ${bot.name}: KILL + LIQUIDATE executed — ${closed.length} close orders submitted, ${failed.length} failures`,
      );
    }
  }

  /**
   * Boot reconcile — STATE-ONLY (the Phase 4 rule): manage only what
   * his own state tracks; untracked broker positions are foreign and
   * ignored (logged, never adopted, never liquidated by him).
   */
  async function reconcile(): Promise<void> {
    const positions = await client.getPositions();
    for (const pos of positions) {
      const occ = parseOccSymbol(pos.symbol);
      if (occ) {
        if (!state.shorts[pos.symbol]) {
          console.log(
            `[wesley] ${bot.name}: foreign option position ignored at boot — ${pos.qty} × ${pos.symbol} is held on the shared account but is not in Wesley's state (state-only reconcile; never adopted)`,
          );
        }
        continue;
      }
      if (
        params.universe.includes(pos.symbol) &&
        !state.shares[pos.symbol] &&
        !Object.values(state.shorts).some((s) => s.underlying === pos.symbol)
      ) {
        console.log(
          `[wesley] ${bot.name}: foreign share position ignored at boot — ${pos.qty} × ${pos.symbol} is held on the shared account but is not in Wesley's state (state-only reconcile; never adopted)`,
        );
      }
    }
    // Sync quantities for what he does track; drop expired shorts via
    // the settlement path on the next manage tick instead of here.
    for (const [symbol, pos] of Object.entries(state.shorts)) {
      const brokerPos = positions.find((p) => p.symbol === symbol);
      if (brokerPos && Math.abs(brokerPos.qty) !== pos.qty) {
        console.log(
          `[wesley] ${bot.name}: ${symbol} qty sync — state ${pos.qty}, broker ${Math.abs(brokerPos.qty)}; adopting the broker quantity for his own tracked position`,
        );
        pos.qty = Math.abs(brokerPos.qty);
      }
    }
    save();
  }

  async function onHalt(): Promise<void> {
    await cancelPendingOrders();
    save();
    console.log(
      `[wesley] ${bot.name}: HALTED — open orders cancelled, no order flow until resumed`,
    );
  }

  async function tick(): Promise<void> {
    if (tickBusy) return;
    tickBusy = true;
    try {
      await handleLiquidations();
      await pollPending();

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
        await reconcile();
      }

      const clock = await client.getClock();
      if (clock.isOpen) {
        await managePositions();
        // Evaluate daily (his .md schedule), during market hours.
        if (state.lastEvalDate !== etDate(now())) {
          await evaluate();
        }
      } else {
        // Expiry settlement doesn't need an open clock — assignments
        // are weekend events as often as not.
        for (const symbol of Object.keys(state.shorts)) {
          if (state.shorts[symbol]!.expiry < etDate(now())) {
            await settleExpired(symbol);
          }
        }
      }
    } catch (err) {
      console.error(
        `[wesley] ${bot.name}: tick failed (will retry):`,
        err instanceof Error ? err.message : err,
      );
    } finally {
      tickBusy = false;
    }
  }

  console.log(
    `[wesley] ${bot.name}: Phase 12 live-paper wheel runner started — universe ${params.universe.join("/")}, ` +
      `book ${money(bookEquity())}, cash ${money(state.cash)} (reserved ${money(reservedCash())}), ` +
      `daily evaluation in market hours, early-exit ${EARLY_EXIT_FRACTION * 100}% / defense ${DEFENSE_MULTIPLE}× on the fast tick`,
  );
  void tick();
  setInterval(() => void tick(), tickMs);
}
