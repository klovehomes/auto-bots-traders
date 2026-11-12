import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { BotConfig, FleetEvent } from "@fleet/shared";
import type { AlpacaClientLike, AlpacaOrder } from "./alpaca.js";
import type { KalshiClientLike, KalshiMarket } from "./kalshi.js";
import type { PaperControl } from "./paper.js";
import {
  atrTimed,
  priorHighTimed,
  type TimedBar,
} from "./indicators.js";

/**
 * PHASE 12 (v21) — PolyCrypt9000 paper trading, both sleeves.
 *
 * She ran the simulator until now. Her bot file (the law) splits her
 * $10,000 book 50/50 under ONE combined risk cap (2.5% daily loss):
 *
 * - CRYPTO SLEEVE (Alpaca PAPER): BTC/USD, ETH/USD, SOL/USD. 20-period
 *   Donchian breakout on hourly bars, confirmed by volume and ATR
 *   expansion; 2× ATR trailing stop; long or flat, never short. Real
 *   paper orders through the Risk Gate, state-only reconcile like the
 *   other runners (broker reports crypto as BTCUSD — both spellings
 *   are hers; anything else at the broker is foreign and ignored).
 *   Max 15% of the book per position, max 3 positions.
 *
 * - PREDICTION SLEEVE (Kalshi DEMO): Polymarket has no paper/testnet
 *   mode, so her mispricing sleeve practices on Kalshi's demo venue —
 *   real demo orders, RSA-PSS signed (see kalshi.ts). The Polymarket
 *   sleeve itself stays SHADOW bookkeeping exactly as designed: a
 *   shadow decision record per day states the sleeve placed no orders
 *   (there is no venue to place paper orders on), and nothing about it
 *   is faked — no shadow fills, no shadow PnL.
 *
 *   Mispricing model, adapted to Kalshi's data (documented honestly —
 *   her Polymarket model probability has no Kalshi equivalent field):
 *   the ANCHOR is the market's last traded YES price — the most recent
 *   consensus print. The edge is how far the executable offer sits
 *   below that anchor: buy YES when anchor − yesAsk ≥ 8 points, buy NO
 *   when (1 − anchor) − noAsk ≥ 8 points. She trades only when the
 *   offer is stale against consensus by her file's 8-point threshold.
 *   Skips: markets closing within 24h, no last trade, spread wider
 *   than 15 points (thin/ambiguous), volume under 100 contracts.
 *   Sizing: quarter-Kelly, halved until calibration is proven, exactly
 *   as her file says; hard caps 3% of the book per position, 5% per
 *   market, max 10 prediction positions. Exits: the edge closing
 *   (executable bid back within 1 point of the anchor), the market
 *   entering its final hour, or settlement (realized at the result).
 *
 * Kill switch: halt cancels her open orders on both venues;
 * kill+liquidate sells the crypto positions (quantity-sized, her
 * tracked qty only) and exits Kalshi positions at the best bid.
 *
 * State at POLYCRYPT_STATE_PATH. Sleeves keep separate sub-ledgers
 * (cryptoRealized / kalshiRealized) exactly as her file requires; the
 * daily loss cap reads the COMBINED realized-by-day ledger.
 */

const STARTING_CAPITAL = 10000;
const LEGACY_STARTING_CAPITAL = 5000;
const TICK_MS =
  Number(process.env.POLYCRYPT_TICK_MS ?? process.env.PAPER_TICK_MS ?? 30_000) ||
  30_000;
const CRYPTO_PAIRS = ["BTC/USD", "ETH/USD", "SOL/USD"] as const;
const DONCHIAN_PERIOD = 20;
const ATR_PERIOD = 14;
const TRAIL_ATR_MULTIPLE = 2;
const CRYPTO_MAX_POSITION_PCT = 15;
const CRYPTO_MAX_POSITIONS = 3;
const EDGE_MIN_POINTS = 8;
const PREDICTION_MAX_POSITION_PCT = 3;
const PREDICTION_MAX_MARKET_PCT = 5;
const PREDICTION_MAX_POSITIONS = 10;
const PREDICTION_MIN_VOLUME = 100;
const PREDICTION_MAX_SPREAD = 0.15;
const PREDICTION_MARKETS_FETCH = 200;
const KELLY_FRACTION = 0.25; // quarter-Kelly…
const KELLY_CALIBRATION_HAIRCUT = 0.5; // …halved until calibration is proven
const COMBINED_DAILY_LOSS_PCT = 2.5;
const CRYPTO_BARS_LOOKBACK_DAYS = 45;

export interface PolyCryptDeps {
  now?: () => Date;
  statePath?: string;
  tickMs?: number;
}

export interface PolyCryptClients {
  alpaca: AlpacaClientLike | null;
  kalshi: KalshiClientLike | null;
}

interface CryptoPosition {
  pair: string;
  qty: number;
  entryPrice: number;
  peak: number;
  /** ATR(14) at entry — the trailing stop rides 2× this. */
  entryAtr: number;
  entryDate: string;
  decisionId: string;
}

interface KalshiPosition {
  ticker: string;
  title: string;
  side: "yes" | "no";
  count: number;
  entryPrice: number;
  /** Last-traded anchor at entry (dollars, YES terms). */
  anchor: number;
  entryDate: string;
  closeTime: string;
  decisionId: string;
}

interface PendingCryptoOrder {
  orderId: string;
  pair: string;
  kind: "entry" | "exit";
  qty: number;
  decisionId: string;
  entryAtr: number;
  trigger: string | null;
  entryPrice: number | null;
}

interface PendingKalshiOrder {
  orderId: string;
  ticker: string;
  kind: "entry" | "exit";
  side: "yes" | "no";
  count: number;
  price: number;
  decisionId: string;
  title: string;
  anchor: number;
  closeTime: string;
  trigger: string | null;
  entryPrice: number | null;
}

interface PolyCryptState {
  startCapital: number;
  cryptoRealized: number;
  kalshiRealized: number;
  realizedByDay: Record<string, number>;
  crypto: Record<string, CryptoPosition>;
  kalshi: Record<string, KalshiPosition>;
  pendingCrypto: PendingCryptoOrder[];
  pendingKalshi: PendingKalshiOrder[];
  lastCryptoHour: string | null;
  lastKalshiScanKey: string | null;
  /** ET date of the last Polymarket SHADOW bookkeeping note (1/day). */
  shadowNoteDate: string | null;
  /** Set once the Kalshi-keys-missing NO-TRADE has been emitted this boot. */
  kalshiMissingNoted: boolean;
  decisionCounter: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const roundQty = (n: number): number => Math.round(n * 1e6) / 1e6;
const money = (n: number): string =>
  `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number): string => `${Math.round(n * 100)}%`;

function etDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(d);
}

function hourKey(d: Date): string {
  return d.toISOString().slice(0, 13);
}

/** 30-minute bucket key (her Polymarket scan cadence, applied to Kalshi). */
function scanKey(d: Date): string {
  const iso = d.toISOString();
  return `${iso.slice(0, 13)}:${d.getUTCMinutes() < 30 ? "00" : "30"}`;
}

/** Broker-side spelling of a crypto pair ("BTC/USD" → "BTCUSD"). */
export function brokerCryptoSymbol(pair: string): string {
  return pair.replace("/", "");
}

/**
 * The mispricing scan, pure for harness testing. Returns the tradable
 * candidates (best edge first) under her file's rules as adapted in
 * the header: 8-point edge vs the last-traded anchor, 24h+ to close,
 * spread ≤ 15 points, volume ≥ 100, two-sided quotes required.
 */
export function scanKalshiEdges(
  markets: KalshiMarket[],
  now: Date,
): {
  market: KalshiMarket;
  side: "yes" | "no";
  price: number;
  anchor: number;
  edge: number;
}[] {
  const out: {
    market: KalshiMarket;
    side: "yes" | "no";
    price: number;
    anchor: number;
    edge: number;
  }[] = [];
  const horizon = now.getTime() + 24 * 3_600_000;
  for (const m of markets) {
    if (m.lastPrice === null) continue;
    const closeMs = Date.parse(m.closeTime);
    if (!Number.isFinite(closeMs) || closeMs < horizon) continue;
    if (m.volume < PREDICTION_MIN_VOLUME) continue;
    const anchor = m.lastPrice;
    if (m.yesAsk > 0 && m.yesBid > 0 && m.yesAsk - m.yesBid <= PREDICTION_MAX_SPREAD) {
      const edge = anchor - m.yesAsk;
      if (edge >= EDGE_MIN_POINTS / 100) {
        out.push({ market: m, side: "yes", price: m.yesAsk, anchor, edge });
      }
    }
    if (m.noAsk > 0 && m.noBid > 0 && m.noAsk - m.noBid <= PREDICTION_MAX_SPREAD) {
      const edge = 1 - anchor - m.noAsk;
      if (edge >= EDGE_MIN_POINTS / 100) {
        out.push({ market: m, side: "no", price: m.noAsk, anchor, edge });
      }
    }
  }
  return out.sort((a, b) => b.edge - a.edge || b.market.volume - a.market.volume);
}

/** Quarter-Kelly (halved) contract count under the hard caps. */
export function kalshiOrderSize(
  edge: number,
  price: number,
  sleeveEquity: number,
  bookEquity: number,
): number {
  if (price <= 0 || price >= 1 || edge <= 0) return 0;
  const kelly = edge / (1 - price);
  const fraction = KELLY_FRACTION * KELLY_CALIBRATION_HAIRCUT * kelly;
  const kellyDollars = fraction * sleeveEquity;
  const capDollars = Math.min(
    (PREDICTION_MAX_POSITION_PCT / 100) * bookEquity,
    (PREDICTION_MAX_MARKET_PCT / 100) * bookEquity,
  );
  return Math.floor(Math.min(kellyDollars, capDollars) / price);
}

export function startPolyCryptTrader(
  bot: BotConfig,
  clients: PolyCryptClients,
  post: (event: FleetEvent) => Promise<void>,
  control: PaperControl,
  deps: PolyCryptDeps = {},
): void {
  const now = deps.now ?? (() => new Date());
  const { alpaca, kalshi } = clients;
  const statePath =
    deps.statePath ??
    process.env.POLYCRYPT_STATE_PATH ??
    "data/paper-polycrypt-state.json";
  const tickMs = deps.tickMs ?? TICK_MS;

  const freshState = (): PolyCryptState => ({
    startCapital: STARTING_CAPITAL,
    cryptoRealized: 0,
    kalshiRealized: 0,
    realizedByDay: {},
    crypto: {},
    kalshi: {},
    pendingCrypto: [],
    pendingKalshi: [],
    lastCryptoHour: null,
    lastKalshiScanKey: null,
    shadowNoteDate: null,
    kalshiMissingNoted: false,
    decisionCounter: 0,
  });

  let state: PolyCryptState = freshState();
  let persistedRaw: Partial<PolyCryptState> | null = null;
  try {
    if (existsSync(statePath)) {
      persistedRaw = JSON.parse(readFileSync(statePath, "utf8")) as PolyCryptState;
      state = { ...freshState(), ...persistedRaw };
      if (typeof persistedRaw.startCapital !== "number") {
        state.startCapital = LEGACY_STARTING_CAPITAL;
      }
      console.log(`[polycrypt] ${bot.name}: restored state from ${statePath}`);
    }
  } catch (err) {
    console.warn(
      `[polycrypt] ${bot.name}: state file unreadable, starting fresh:`,
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
        `[polycrypt] ${bot.name}: state save failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  };

  if (persistedRaw !== null && state.startCapital !== STARTING_CAPITAL) {
    const untouched =
      state.cryptoRealized === 0 &&
      state.kalshiRealized === 0 &&
      Object.keys(state.crypto).length === 0 &&
      Object.keys(state.kalshi).length === 0;
    if (untouched) {
      state.startCapital = STARTING_CAPITAL;
      console.log(
        `[polycrypt] ${bot.name}: book re-seeded ${money(LEGACY_STARTING_CAPITAL)} → ${money(STARTING_CAPITAL)} (starting capital changed; book was untouched)`,
      );
    } else {
      console.log(
        `[polycrypt] ${bot.name}: starting capital changed but the book is not untouched — resize skipped, book keeps its ${money(state.startCapital)} start`,
      );
    }
    save();
  }

  const bookEquity = (): number =>
    state.startCapital + state.cryptoRealized + state.kalshiRealized;
  const sleeveEquity = (sleeve: "crypto" | "kalshi"): number =>
    state.startCapital / 2 +
    (sleeve === "crypto" ? state.cryptoRealized : state.kalshiRealized);
  const realizedToday = (): number => state.realizedByDay[etDate(now())] ?? 0;
  const addRealized = (sleeve: "crypto" | "kalshi", pnl: number): void => {
    if (sleeve === "crypto") state.cryptoRealized = round2(state.cryptoRealized + pnl);
    else state.kalshiRealized = round2(state.kalshiRealized + pnl);
    const day = etDate(now());
    state.realizedByDay[day] = round2((state.realizedByDay[day] ?? 0) + pnl);
  };
  const dailyCapHit = (): boolean =>
    realizedToday() <= -((COMBINED_DAILY_LOSS_PCT / 100) * state.startCapital);

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
      `[polycrypt] ${event.bot} ${event.type} ${event.symbol ?? ""} ${event.side ?? ""} ` +
        `qty=${event.qty ?? "-"} @ ${event.price ?? "-"} ` +
        `${event.pnl !== null ? `pnl=${event.pnl.toFixed(2)} ` : ""}— ${event.reason}`,
    );
    void post(event);
    return id;
  };

  const paramsSnapshot = (): string =>
    `params snapshot: 50/50 sleeves under one cap — crypto: Donchian(${DONCHIAN_PERIOD}) hourly breakout + volume/ATR confirmation, ` +
    `${TRAIL_ATR_MULTIPLE}× ATR(${ATR_PERIOD}) trailing stop, max ${CRYPTO_MAX_POSITION_PCT}% per position, max ${CRYPTO_MAX_POSITIONS} positions; ` +
    `prediction (Kalshi demo): edge ≥ ${EDGE_MIN_POINTS}pts vs last-traded anchor, quarter-Kelly halved, max ${PREDICTION_MAX_POSITION_PCT}% per position / ` +
    `${PREDICTION_MAX_MARKET_PCT}% per market, max ${PREDICTION_MAX_POSITIONS} positions, skip <24h to close; Polymarket sleeve SHADOW (no paper venue); ` +
    `combined daily_loss_cap ${COMBINED_DAILY_LOSS_PCT}%`;

  let haltCancelHandled = false;
  let booted = false;
  /** The last Reset All Data id this runner applied (v22 idempotency). */
  let lastResetId: string | null = null;
  let tickBusy = false;

  function completedHourlyBars(bars: TimedBar[]): TimedBar[] {
    const t = now().getTime();
    return bars.filter((b) => new Date(b.timestamp).getTime() + 3_600_000 <= t);
  }

  // ---------------------------------------------------------------- crypto

  async function pollCryptoPending(): Promise<void> {
    if (!alpaca) return;
    for (const p of [...state.pendingCrypto]) {
      let order: AlpacaOrder;
      try {
        order = await alpaca.getOrder(p.orderId);
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
        state.pendingCrypto = state.pendingCrypto.filter(
          (x) => x.orderId !== p.orderId,
        );
        if (p.kind === "entry") {
          state.crypto[p.pair] = {
            pair: p.pair,
            qty: order.filledQty,
            entryPrice: order.filledAvgPrice,
            peak: order.filledAvgPrice,
            entryAtr: p.entryAtr,
            entryDate: etDate(now()),
            decisionId: p.decisionId,
          };
          emit(
            {
              type: "open",
              symbol: p.pair,
              side: "buy",
              qty: order.filledQty,
              price: round2(order.filledAvgPrice),
              pnl: null,
              reason: `PAPER · crypto entry filled @ ${money(order.filledAvgPrice)} — ${order.filledQty} × ${p.pair} on the Alpaca paper account; trailing stop armed at peak − ${TRAIL_ATR_MULTIPLE}× ATR ${money(p.entryAtr)}`,
            },
            p.decisionId,
          );
        } else {
          const pos = state.crypto[p.pair];
          const entryPrice = p.entryPrice ?? pos?.entryPrice ?? order.filledAvgPrice;
          const pnl = round2((order.filledAvgPrice - entryPrice) * order.filledQty);
          addRealized("crypto", pnl);
          if (pos && order.filledQty >= pos.qty) delete state.crypto[p.pair];
          else if (pos) pos.qty = roundQty(pos.qty - order.filledQty);
          emit(
            {
              type: "close",
              symbol: p.pair,
              side: "sell",
              qty: order.filledQty,
              price: round2(order.filledAvgPrice),
              pnl,
              reason: `PAPER · crypto exit filled @ ${money(order.filledAvgPrice)} — ${p.trigger ?? "exit"}`,
            },
            p.decisionId,
          );
        }
        save();
        continue;
      }
      if (terminal) {
        state.pendingCrypto = state.pendingCrypto.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "signal",
            symbol: p.pair,
            side: p.kind === "entry" ? "buy" : "sell",
            qty: p.qty,
            price: null,
            pnl: null,
            reason: `PAPER · crypto ${p.kind} order ${order.status} before filling — no position change (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
      }
    }
  }

  async function submitCryptoExit(
    pair: string,
    trigger: string,
    currentPrice: number,
  ): Promise<void> {
    if (!alpaca) return;
    const pos = state.crypto[pair];
    if (!pos) return;
    if (state.pendingCrypto.some((p) => p.pair === pair && p.kind === "exit")) return;
    const decisionId = emit({
      type: "signal",
      symbol: pair,
      side: "sell",
      qty: pos.qty,
      price: round2(currentPrice),
      pnl: null,
      reason: `PAPER · CRYPTO EXIT — ${trigger} · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
    });
    const order = await alpaca.createOrder({
      symbol: pair,
      qty: pos.qty,
      side: "sell",
      type: "market",
      timeInForce: "gtc",
    });
    state.pendingCrypto.push({
      orderId: order.id,
      pair,
      kind: "exit",
      qty: pos.qty,
      decisionId,
      entryAtr: pos.entryAtr,
      trigger,
      entryPrice: pos.entryPrice,
    });
    save();
  }

  /** Trailing-stop checks on every tick (crypto never sleeps). */
  async function manageCrypto(): Promise<void> {
    if (!alpaca) return;
    for (const [pair, pos] of Object.entries(state.crypto)) {
      let price: number;
      try {
        price = await alpaca.getCryptoLatestPrice(pair);
      } catch {
        continue;
      }
      if (!Number.isFinite(price) || price <= 0) continue;
      if (price > pos.peak) {
        pos.peak = price;
        save();
      }
      const stop = pos.peak - TRAIL_ATR_MULTIPLE * pos.entryAtr;
      if (price <= stop) {
        await submitCryptoExit(
          pair,
          `${TRAIL_ATR_MULTIPLE}× ATR trailing stop: ${pair} @ ${money(price)} is at/below the stop ${money(stop)} (peak ${money(pos.peak)} − ${TRAIL_ATR_MULTIPLE}× ATR ${money(pos.entryAtr)} since entry ${money(pos.entryPrice)})`,
          price,
        );
      }
    }
  }

  /** Hourly Donchian evaluation for the crypto sleeve. */
  async function evaluateCrypto(): Promise<void> {
    if (!alpaca) return;
    const startISO = new Date(
      now().getTime() - CRYPTO_BARS_LOOKBACK_DAYS * 86_400_000,
    ).toISOString();
    for (const pair of CRYPTO_PAIRS) {
      let bars: TimedBar[];
      try {
        bars = completedHourlyBars(await alpaca.getCryptoBars(pair, startISO));
      } catch (err) {
        emit({
          type: "signal",
          symbol: pair,
          side: "buy",
          qty: null,
          price: null,
          pnl: null,
          reason: `PAPER · CRYPTO — NO TRADE — hourly bars fetch failed for ${pair}: ${err instanceof Error ? err.message : String(err)} · ${paramsSnapshot()}`,
        });
        continue;
      }
      if (bars.length < DONCHIAN_PERIOD + ATR_PERIOD + 2) continue;
      if (state.crypto[pair] || state.pendingCrypto.some((p) => p.pair === pair)) {
        continue; // one position per pair, long or flat
      }
      const last = bars[bars.length - 1]!;
      const level = priorHighTimed(bars, DONCHIAN_PERIOD);
      if (level === null || last.close <= level) continue;
      const atrNow = atrTimed(bars, ATR_PERIOD);
      const atrPrev = atrTimed(bars.slice(0, -1), ATR_PERIOD);
      if (atrNow === null || atrPrev === null) continue;
      const priorVolumes = bars
        .slice(-(DONCHIAN_PERIOD + 1), -1)
        .map((b) => b.volume ?? 0);
      const avgVolume =
        priorVolumes.reduce((s, v) => s + v, 0) / Math.max(1, priorVolumes.length);
      const volumeOk = (last.volume ?? 0) > avgVolume && avgVolume > 0;
      const atrOk = atrNow > atrPrev;
      const signalText =
        `Donchian(${DONCHIAN_PERIOD}) breakout: last completed hour closed ${money(last.close)}, above the prior ${DONCHIAN_PERIOD}-hour high ${money(level)}; ` +
        `volume ${Math.round(last.volume ?? 0)} vs ${DONCHIAN_PERIOD}-bar avg ${Math.round(avgVolume)} (${volumeOk ? "confirmed" : "NOT confirmed"}); ` +
        `ATR(${ATR_PERIOD}) ${atrNow.toFixed(2)} vs prior ${atrPrev.toFixed(2)} (${atrOk ? "expanding" : "NOT expanding"})`;
      if (!volumeOk || !atrOk) {
        emit({
          type: "signal",
          symbol: pair,
          side: "buy",
          qty: null,
          price: round2(last.close),
          pnl: null,
          reason: `PAPER · CRYPTO signal — ${signalText} · NO TRADE — her rules require BOTH volume and ATR-expansion confirmation · ${paramsSnapshot()}`,
        });
        continue;
      }

      // ---- Risk Gate -------------------------------------------------
      const openCount =
        Object.keys(state.crypto).length +
        state.pendingCrypto.filter((p) => p.kind === "entry").length;
      let verdict: string | null = null;
      if (dailyCapHit()) {
        verdict = `combined daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((COMBINED_DAILY_LOSS_PCT / 100) * state.startCapital))} (both sleeves, one cap)`;
      } else if (openCount >= CRYPTO_MAX_POSITIONS) {
        verdict = `max crypto positions reached (${openCount}/${CRYPTO_MAX_POSITIONS})`;
      }
      const target = Math.min(
        (CRYPTO_MAX_POSITION_PCT / 100) * bookEquity(),
        sleeveEquity("crypto"),
      );
      const qty = roundQty(target / last.close);
      if (verdict === null && qty <= 0) {
        verdict = `position sizing rounds to zero at ${money(last.close)}`;
      }
      if (verdict !== null) {
        emit({
          type: "signal",
          symbol: pair,
          side: "buy",
          qty: null,
          price: round2(last.close),
          pnl: null,
          reason: `PAPER · CRYPTO signal — ${signalText} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
        });
        continue;
      }
      const decisionId = emit({
        type: "signal",
        symbol: pair,
        side: "buy",
        qty,
        price: round2(last.close),
        pnl: null,
        reason:
          `PAPER · CRYPTO signal — ${signalText} · Risk Gate: APPROVED — ${CRYPTO_MAX_POSITION_PCT}% of the ${money(bookEquity())} book capped by the crypto sleeve (${money(sleeveEquity("crypto"))}) → ${qty} × ${pair} ≈ ${money(qty * last.close)}; ` +
          `positions ${openCount}/${CRYPTO_MAX_POSITIONS} · ${paramsSnapshot()} · order: market buy (gtc, crypto)`,
      });
      const order = await alpaca.createOrder({
        symbol: pair,
        qty,
        side: "buy",
        type: "market",
        timeInForce: "gtc",
      });
      state.pendingCrypto.push({
        orderId: order.id,
        pair,
        kind: "entry",
        qty,
        decisionId,
        entryAtr: atrNow,
        trigger: null,
        entryPrice: null,
      });
      save();
    }
    console.log(
      `[polycrypt] ${bot.name}: hourly crypto evaluation complete (PAPER) — positions ${Object.keys(state.crypto).length}/${CRYPTO_MAX_POSITIONS}; crypto sleeve ${money(sleeveEquity("crypto"))}, book ${money(bookEquity())}`,
    );
  }

  // ---------------------------------------------------------------- kalshi

  async function pollKalshiPending(): Promise<void> {
    if (!kalshi) return;
    for (const p of [...state.pendingKalshi]) {
      let order;
      try {
        order = await kalshi.getOrder(p.orderId);
      } catch {
        continue;
      }
      const filled = order.filledCount > 0 && order.status !== "canceled";
      const terminal = ["canceled", "cancelled", "expired", "rejected"].includes(
        order.status,
      );
      if (filled && (order.status === "executed" || order.status === "filled" || terminal || order.filledCount >= p.count)) {
        state.pendingKalshi = state.pendingKalshi.filter(
          (x) => x.orderId !== p.orderId,
        );
        if (p.kind === "entry") {
          state.kalshi[p.ticker] = {
            ticker: p.ticker,
            title: p.title,
            side: p.side,
            count: order.filledCount,
            entryPrice: order.price ?? p.price,
            anchor: p.anchor,
            entryDate: etDate(now()),
            closeTime: p.closeTime,
            decisionId: p.decisionId,
          };
          emit(
            {
              type: "open",
              symbol: p.ticker,
              side: "buy",
              qty: order.filledCount,
              price: round2(order.price ?? p.price),
              pnl: null,
              reason: `PAPER (Kalshi demo) · entry filled — ${order.filledCount} × ${p.side.toUpperCase()} @ ${pct(order.price ?? p.price)} on "${p.title}" (anchor ${pct(p.anchor)})`,
            },
            p.decisionId,
          );
        } else {
          const pos = state.kalshi[p.ticker];
          const entryPrice = p.entryPrice ?? pos?.entryPrice ?? p.price;
          const exitPrice = order.price ?? p.price;
          const pnl = round2((exitPrice - entryPrice) * order.filledCount);
          addRealized("kalshi", pnl);
          if (pos && order.filledCount >= pos.count) delete state.kalshi[p.ticker];
          else if (pos) pos.count -= order.filledCount;
          emit(
            {
              type: "close",
              symbol: p.ticker,
              side: "sell",
              qty: order.filledCount,
              price: round2(exitPrice),
              pnl,
              reason: `PAPER (Kalshi demo) · exit filled @ ${pct(exitPrice)} — ${p.trigger ?? "exit"} on "${p.title}"`,
            },
            p.decisionId,
          );
        }
        save();
        continue;
      }
      if (terminal) {
        state.pendingKalshi = state.pendingKalshi.filter(
          (x) => x.orderId !== p.orderId,
        );
        emit(
          {
            type: "signal",
            symbol: p.ticker,
            side: p.kind === "entry" ? "buy" : "sell",
            qty: p.count,
            price: null,
            pnl: null,
            reason: `PAPER (Kalshi demo) · ${p.kind} order ${order.status} before filling — no position change (decision #${p.decisionId})`,
          },
          p.decisionId,
        );
        save();
      }
    }
  }

  /** Exit checks for open Kalshi positions: settlement, final hour, edge closed. */
  async function manageKalshi(): Promise<void> {
    if (!kalshi) return;
    for (const [ticker, pos] of Object.entries(state.kalshi)) {
      if (state.pendingKalshi.some((p) => p.ticker === ticker)) continue;
      const market = await kalshi.getMarket(ticker).catch(() => null);
      if (!market) continue;
      // Settlement: the venue finalized the market — book the result.
      if (market.result === "yes" || market.result === "no") {
        const payout = pos.side === market.result ? 1 : 0;
        const pnl = round2((payout - pos.entryPrice) * pos.count);
        addRealized("kalshi", pnl);
        delete state.kalshi[ticker];
        emit(
          {
            type: "close",
            symbol: ticker,
            side: "sell",
            qty: pos.count,
            price: payout,
            pnl,
            reason: `PAPER (Kalshi demo) · SETTLED ${market.result.toUpperCase()} — "${pos.title}" paid ${pct(payout)} on the ${pos.side.toUpperCase()} bought @ ${pct(pos.entryPrice)}; realized ${money(pnl)}`,
          },
          pos.decisionId,
        );
        save();
        continue;
      }
      const bid = pos.side === "yes" ? market.yesBid : market.noBid;
      if (bid <= 0) continue;
      const bidInAnchorTerms =
        pos.side === "yes" ? bid : 1 - bid;
      const anchorGap = Math.abs(bidInAnchorTerms - pos.anchor);
      const msToClose = Date.parse(market.closeTime) - now().getTime();
      let trigger: string | null = null;
      if (msToClose <= 3_600_000) {
        trigger = `final hour before close (${market.closeTime}) — exit at the bid rather than ride settlement variance`;
      } else if (anchorGap <= 0.01) {
        trigger = `edge closed — executable bid ${pct(bid)} is back within 1pt of the ${pct(pos.anchor)} anchor the position was bought against`;
      }
      if (trigger === null) continue;
      const decisionId = emit({
        type: "signal",
        symbol: ticker,
        side: "sell",
        qty: pos.count,
        price: round2(bid),
        pnl: null,
        reason: `PAPER (Kalshi demo) · EXIT — ${trigger} · Risk Gate: APPROVED (exit) · ${paramsSnapshot()}`,
      });
      const order = await kalshi.createOrder({
        ticker,
        side: pos.side,
        action: "sell",
        count: pos.count,
        price: bid,
      });
      state.pendingKalshi.push({
        orderId: order.id,
        ticker,
        kind: "exit",
        side: pos.side,
        count: pos.count,
        price: bid,
        decisionId,
        title: pos.title,
        anchor: pos.anchor,
        closeTime: pos.closeTime,
        trigger,
        entryPrice: pos.entryPrice,
      });
      save();
    }
  }

  /** The 30-minute mispricing scan (Kalshi demo expression of her Polymarket rules). */
  async function scanKalshi(): Promise<void> {
    // Polymarket shadow bookkeeping: one explicit record per day that
    // the sleeve placed NO orders — there is no paper venue, and this
    // build does not pretend otherwise.
    if (state.shadowNoteDate !== etDate(now())) {
      state.shadowNoteDate = etDate(now());
      emit({
        type: "signal",
        symbol: null,
        side: null,
        qty: null,
        price: null,
        pnl: null,
        reason:
          `SHADOW · Polymarket sleeve bookkeeping — Polymarket offers no paper/testnet venue, so this sleeve places no orders and books no fills; ` +
          `her prediction-market paper trading runs on the Kalshi demo venue in this build · ${paramsSnapshot()}`,
      });
      save();
    }

    if (!kalshi) {
      if (!state.kalshiMissingNoted) {
        state.kalshiMissingNoted = true;
        emit({
          type: "signal",
          symbol: null,
          side: null,
          qty: null,
          price: null,
          pnl: null,
          reason:
            `PAPER · PREDICTION sleeve — NO TRADE — Kalshi demo keys not loaded (no KALSHI_API_KEY_ID / readable KALSHI_PRIVATE_KEY_PATH in the keys file or environment), ` +
            `so no demo orders can be placed. The crypto sleeve and the Polymarket shadow bookkeeping are unaffected · ${paramsSnapshot()}`,
        });
        save();
      }
      return;
    }

    let markets: KalshiMarket[];
    try {
      markets = await kalshi.getMarkets(PREDICTION_MARKETS_FETCH);
    } catch (err) {
      emit({
        type: "signal",
        symbol: null,
        side: null,
        qty: null,
        price: null,
        pnl: null,
        reason: `PAPER (Kalshi demo) · scan — NO TRADE — markets fetch failed: ${err instanceof Error ? err.message : String(err)} · ${paramsSnapshot()}`,
      });
      return;
    }
    const candidates = scanKalshiEdges(markets, now());
    let entered = 0;
    for (const cand of candidates) {
      const { market, side, price, anchor, edge } = cand;
      if (state.kalshi[market.ticker]) continue;
      if (state.pendingKalshi.some((p) => p.ticker === market.ticker)) continue;
      const openCount =
        Object.keys(state.kalshi).length +
        state.pendingKalshi.filter((p) => p.kind === "entry").length;
      const count = kalshiOrderSize(edge, price, sleeveEquity("kalshi"), bookEquity());
      let verdict: string | null = null;
      if (dailyCapHit()) {
        verdict = `combined daily loss cap hit — realized ${money(realizedToday())} today vs cap ${money(-((COMBINED_DAILY_LOSS_PCT / 100) * state.startCapital))} (both sleeves, one cap)`;
      } else if (openCount >= PREDICTION_MAX_POSITIONS) {
        verdict = `max prediction positions reached (${openCount}/${PREDICTION_MAX_POSITIONS})`;
      } else if (count < 1) {
        verdict = `quarter-Kelly (halved) sizing rounds below one contract at ${pct(price)} (edge ${Math.round(edge * 100)}pts, sleeve ${money(sleeveEquity("kalshi"))})`;
      }
      const signalText =
        `"${market.title}" — last traded ${pct(anchor)}, ${side.toUpperCase()} offered @ ${pct(price)}: a ${Math.round(edge * 100)}pt edge vs the anchor ` +
        `(her threshold ${EDGE_MIN_POINTS}pts); volume ${Math.round(market.volume).toLocaleString("en-US")}, closes ${market.closeTime}`;
      if (verdict !== null) {
        emit({
          type: "signal",
          symbol: market.ticker,
          side: "buy",
          qty: Math.max(count, 0),
          price: round2(price),
          pnl: null,
          reason: `PAPER (Kalshi demo) · MISPRICING signal — ${signalText} · Risk Gate: REJECTED — ${verdict} · ${paramsSnapshot()}`,
        });
        continue;
      }
      const decisionId = emit({
        type: "signal",
        symbol: market.ticker,
        side: "buy",
        qty: count,
        price: round2(price),
        pnl: null,
        reason:
          `PAPER (Kalshi demo) · MISPRICING signal — ${signalText} · Risk Gate: APPROVED — quarter-Kelly halved → ${count} contract(s) ≈ ${money(count * price)} ` +
          `(caps: ${PREDICTION_MAX_POSITION_PCT}% of book per position); positions ${openCount}/${PREDICTION_MAX_POSITIONS} · ${paramsSnapshot()} · order: limit buy at the offer`,
      });
      const order = await kalshi.createOrder({
        ticker: market.ticker,
        side,
        action: "buy",
        count,
        price,
      });
      state.pendingKalshi.push({
        orderId: order.id,
        ticker: market.ticker,
        kind: "entry",
        side,
        count,
        price,
        decisionId,
        title: market.title,
        anchor,
        closeTime: market.closeTime,
        trigger: null,
        entryPrice: null,
      });
      entered += 1;
      save();
    }
    console.log(
      `[polycrypt] ${bot.name}: Kalshi scan complete (PAPER) — ${markets.length} markets fetched, ${candidates.length} edge candidates, ${entered} entries submitted; prediction positions ${Object.keys(state.kalshi).length}/${PREDICTION_MAX_POSITIONS}; kalshi sleeve ${money(sleeveEquity("kalshi"))}`,
    );
  }

  // ---------------------------------------------------------------- control

  async function cancelOpenOrders(): Promise<void> {
    if (alpaca) {
      const open = await alpaca.getOpenOrders().catch(() => [] as AlpacaOrder[]);
      for (const p of [...state.pendingCrypto]) {
        if (open.some((o) => o.id === p.orderId)) {
          await alpaca.cancelOrder(p.orderId).catch(() => undefined);
          console.log(`[polycrypt] ${bot.name}: cancelled open crypto order ${p.orderId} (${p.pair})`);
        }
      }
    }
    state.pendingCrypto = [];
    if (kalshi) {
      for (const p of [...state.pendingKalshi]) {
        await kalshi.cancelOrder(p.orderId).catch(() => undefined);
        console.log(`[polycrypt] ${bot.name}: cancelled open Kalshi order ${p.orderId} (${p.ticker})`);
      }
    }
    state.pendingKalshi = [];
  }

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
        await cancelOpenOrders();
        for (const [pair, pos] of Object.entries(state.crypto)) {
          if (!alpaca) {
            failed.push({
              codename: bot.codename,
              symbol: pair,
              reason: "Alpaca client unavailable — position left open and reported, never dropped",
            });
            continue;
          }
          try {
            let price = pos.entryPrice;
            try {
              price = await alpaca.getCryptoLatestPrice(pair);
            } catch {
              /* report at entry */
            }
            const order = await alpaca.createOrder({
              symbol: pair,
              qty: pos.qty,
              side: "sell",
              type: "market",
              timeInForce: "gtc",
            });
            state.pendingCrypto.push({
              orderId: order.id,
              pair,
              kind: "exit",
              qty: pos.qty,
              decisionId: pos.decisionId,
              entryAtr: pos.entryAtr,
              trigger: "KILL + LIQUIDATE",
              entryPrice: pos.entryPrice,
            });
            closed.push({
              codename: bot.codename,
              symbol: pair,
              qty: pos.qty,
              price: round2(price),
              pnl: round2((price - pos.entryPrice) * pos.qty),
            });
          } catch (err) {
            failed.push({
              codename: bot.codename,
              symbol: pair,
              reason: `crypto sell failed: ${err instanceof Error ? err.message : String(err)}`,
            });
          }
        }
        for (const [ticker, pos] of Object.entries(state.kalshi)) {
          if (!kalshi) {
            failed.push({
              codename: bot.codename,
              symbol: ticker,
              reason: "Kalshi client unavailable — position left open and reported, never dropped",
            });
            continue;
          }
          try {
            const market = await kalshi.getMarket(ticker);
            const bid = market
              ? pos.side === "yes"
                ? market.yesBid
                : market.noBid
              : 0;
            if (!market || bid <= 0) {
              failed.push({
                codename: bot.codename,
                symbol: ticker,
                reason: "no executable bid on Kalshi demo — position left open and reported, never dropped",
              });
              continue;
            }
            const order = await kalshi.createOrder({
              ticker,
              side: pos.side,
              action: "sell",
              count: pos.count,
              price: bid,
            });
            state.pendingKalshi.push({
              orderId: order.id,
              ticker,
              kind: "exit",
              side: pos.side,
              count: pos.count,
              price: bid,
              decisionId: pos.decisionId,
              title: pos.title,
              anchor: pos.anchor,
              closeTime: pos.closeTime,
              trigger: "KILL + LIQUIDATE",
              entryPrice: pos.entryPrice,
            });
            closed.push({
              codename: bot.codename,
              symbol: ticker,
              qty: pos.count,
              price: round2(bid),
              pnl: round2((bid - pos.entryPrice) * pos.count),
            });
          } catch (err) {
            failed.push({
              codename: bot.codename,
              symbol: ticker,
              reason: `Kalshi exit failed: ${err instanceof Error ? err.message : String(err)}`,
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
        `[polycrypt] ${bot.name}: KILL + LIQUIDATE executed — ${closed.length} exit orders submitted, ${failed.length} failures`,
      );
    }
  }

  /** Boot reconcile — STATE-ONLY for the crypto sleeve (the Phase 4 rule). */
  async function reconcile(): Promise<void> {
    if (!alpaca) return;
    const positions = await alpaca.getPositions();
    for (const pos of positions) {
      const pair = CRYPTO_PAIRS.find(
        (p) => brokerCryptoSymbol(p) === pos.symbol || p === pos.symbol,
      );
      if (!pair) continue;
      if (!state.crypto[pair]) {
        console.log(
          `[polycrypt] ${bot.name}: foreign crypto position ignored at boot — ${pos.qty} × ${pos.symbol} is held on the shared account but is not in PolyCrypt9000's state (state-only reconcile; never adopted)`,
        );
      }
    }
    for (const pair of Object.keys(state.crypto)) {
      const held = positions.some(
        (p) => brokerCryptoSymbol(pair) === p.symbol || pair === p.symbol,
      );
      if (!held && !state.pendingCrypto.some((p) => p.pair === pair)) {
        console.log(
          `[polycrypt] ${bot.name}: ${pair} in state but not at broker — dropping from tracking`,
        );
        delete state.crypto[pair];
      }
    }
    save();
  }

  async function onHalt(): Promise<void> {
    await cancelOpenOrders();
    save();
    console.log(
      `[polycrypt] ${bot.name}: HALTED — open orders cancelled on both venues, no order flow until resumed`,
    );
  }

  async function tick(): Promise<void> {
    if (tickBusy) return;
    tickBusy = true;
    try {
      // Reset All Data (v22): checked first, before liquidations and
      // polls, so nothing from either sleeve's old book can act or
      // report into the fresh history. Idempotent per reset id.
      // Broker caveat: this wipes the APP book only — positions open
      // at Alpaca/Kalshi are NOT closed; they become untracked
      // ("foreign") and the state-only reconcile ignores them.
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
          `[polycrypt] ${bot.name}: DATA RESET applied — book wiped back to the $${STARTING_CAPITAL} start; app positions erased (venue-side positions untouched, now untracked)`,
        );
        return;
      }

      await handleLiquidations();
      await pollCryptoPending();
      await pollKalshiPending();

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

      await manageCrypto();
      await manageKalshi();

      // Crypto evaluates hourly, 24/7 (her markets never sleep).
      const hk = hourKey(now());
      if (state.lastCryptoHour !== hk) {
        await evaluateCrypto();
        state.lastCryptoHour = hk;
        save();
      }
      // Prediction scan every 30 minutes, 24/7.
      const sk = scanKey(now());
      if (state.lastKalshiScanKey !== sk) {
        await scanKalshi();
        state.lastKalshiScanKey = sk;
        save();
      }
    } catch (err) {
      console.error(
        `[polycrypt] ${bot.name}: tick failed (will retry):`,
        err instanceof Error ? err.message : err,
      );
    } finally {
      tickBusy = false;
    }
  }

  console.log(
    `[polycrypt] ${bot.name}: Phase 12 live-paper runner started — crypto sleeve ${alpaca ? "Alpaca paper" : "UNAVAILABLE (no Alpaca keys)"}, ` +
      `prediction sleeve ${kalshi ? "Kalshi demo" : "UNAVAILABLE (no Kalshi demo keys)"}, Polymarket sleeve SHADOW; ` +
      `book ${money(bookEquity())} (crypto ${money(sleeveEquity("crypto"))} / prediction ${money(sleeveEquity("kalshi"))})`,
  );
  void tick();
  setInterval(() => void tick(), tickMs);
}
