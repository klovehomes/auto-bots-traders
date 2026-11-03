import type { BotConfig, FleetEvent } from "@fleet/shared";

/**
 * SIM MODE — synthetic market + activity generator for local testing.
 *
 * Activated when the fleet MODE is "sim" (MODE=sim, the default; see
 * engine/src/index.ts). Lets Keith run the
 * whole stack on his laptop (WSL + Docker) and watch the fleet "trade"
 * with fake data: no broker, no API keys, no real market data.
 *
 * How it works:
 * - A seeded RNG (mulberry32, fixed seed) drives a random walk per symbol,
 *   so runs are reproducible.
 * - Each bot keeps a small in-memory position book and starts with $10,000
 *   of sim equity (the decided paper allocation — $5,000 originally,
 *   doubled fleet-wide by Keith on 2026-11-03).
 * - Every ~4–8s (staggered per bot) one bot opens or closes a position and
 *   the event goes through the exact same /internal/events pipeline and
 *   FleetEvent schema as real trading will.
 * - Sizing uses each bot's real `risk.max_position_pct` when the .md file
 *   carries a plain number (Trendia 20, Snapback 20, Vega 6 is prose —
 *   see below). Where the file carries prose instead of a number
 *   (Vega: "6 (premium paid per options position)", Wesley: "100 (one
 *   position may use the whole account…)", PolyCrypt9000: "3 (per
 *   Polymarket position) / 15 (per crypto position)"), we fall back to
 *   FALLBACK_MAX_POSITION_PCT — parsing prose caps is a Phase 1+ strategy
 *   plugin job, not the simulator's.
 *
 * The activity generators are stand-ins written in each bot's voice
 * (trigger text mirrors its .md rules); the real strategies arrive in
 * Phase 1+. Prices and fills are synthetic — see LOCAL-RUN.md.
 *
 * Kill switch: the simulator consults the Risk Gate control state (see
 * engine/src/control.ts) before every action — a halted bot is skipped
 * entirely — and executes kill+liquidate requests against its own
 * position book, reporting results back to the API.
 */

const SIM_START_EQUITY = 10000;
const FALLBACK_MAX_POSITION_PCT = 10;
const FALLBACK_MAX_POSITIONS = 5;
const PRICE_TICK_MS = 1000;
const ACTION_CHECK_MS = 250;

/** mulberry32: tiny seeded PRNG — same seed, same run. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PriceKind = "equity" | "volatile" | "crypto" | "prob";

interface PriceSeries {
  price: number;
  vol: number;
  kind: PriceKind;
}

/** Plausible starting prices for the synthetic book (they are fake data). */
const START_PRICES: Record<string, { price: number; kind: PriceKind }> = {
  SPY: { price: 685, kind: "equity" }, QQQ: { price: 610, kind: "equity" },
  IWM: { price: 245, kind: "equity" }, AAPL: { price: 272, kind: "equity" },
  MSFT: { price: 505, kind: "equity" }, NVDA: { price: 182, kind: "equity" },
  AMZN: { price: 232, kind: "equity" }, META: { price: 585, kind: "equity" },
  GOOGL: { price: 192, kind: "equity" }, AVGO: { price: 352, kind: "equity" },
  COST: { price: 915, kind: "equity" }, NFLX: { price: 1180, kind: "equity" },
  TSLA: { price: 345, kind: "equity" },
  AMD: { price: 215, kind: "volatile" }, PLTR: { price: 168, kind: "volatile" },
  SMCI: { price: 46, kind: "volatile" }, COIN: { price: 262, kind: "volatile" },
  HOOD: { price: 118, kind: "volatile" }, MARA: { price: 14.5, kind: "volatile" },
  SOFI: { price: 26, kind: "volatile" }, RIVN: { price: 13.5, kind: "volatile" },
  AFRM: { price: 68, kind: "volatile" }, IONQ: { price: 44, kind: "volatile" },
  SOXL: { price: 46, kind: "volatile" }, TQQQ: { price: 58, kind: "volatile" },
  UVXY: { price: 17, kind: "volatile" },
  F: { price: 11.8, kind: "equity" }, INTC: { price: 38, kind: "equity" },
  BAC: { price: 47, kind: "equity" }, PFE: { price: 25.5, kind: "equity" },
  T: { price: 24.5, kind: "equity" }, VZ: { price: 40, kind: "equity" },
  NU: { price: 15.5, kind: "equity" }, WBD: { price: 10.5, kind: "equity" },
  BTC: { price: 97400, kind: "crypto" }, ETH: { price: 3380, kind: "crypto" },
  SOL: { price: 208, kind: "crypto" },
  "PM:FED": { price: 0.61, kind: "prob" },
  "PM:BTC100K": { price: 0.44, kind: "prob" },
  "PM:SHUTDOWN": { price: 0.32, kind: "prob" },
};

const VOL_BY_KIND: Record<PriceKind, number> = {
  equity: 0.0028,
  volatile: 0.0055,
  crypto: 0.0035,
  prob: 0.012,
};

const POLYMARKET_LABELS: Record<string, string> = {
  "PM:FED": "YES — Fed holds in December",
  "PM:BTC100K": "YES — BTC above $100k by Dec 31",
  "PM:SHUTDOWN": "YES — Government shutdown in January",
};

type PositionKind = "stock" | "crypto" | "prob" | "optionLong" | "shortPremium";

/**
 * The slice of the Risk Gate control client the simulator needs
 * (structurally the engine's ControlClient — see engine/src/control.ts).
 */
export interface SimControl {
  isHalted: (codename: string) => boolean;
  drainLiquidations: () => { id: string; codename: string }[];
  reportLiquidation: (
    id: string,
    codename: string,
    closed: {
      codename: string;
      symbol: string;
      qty: number | null;
      price: number | null;
      pnl: number | null;
    }[],
    failed: { codename: string; symbol: string; reason: string }[],
  ) => Promise<void>;
}

interface SimPosition {
  label: string;
  priceKey: string;
  kind: PositionKind;
  side: "buy" | "sell";
  qty: number;
  /** Underlying (or probability) price when the position opened. */
  entryPrice: number;
  /** What the open event showed as `price` (premium for options). */
  displayEntryPrice: number;
  /** Realized PnL on close = (exitPrice - entryPrice) * pnlPerDollar. */
  pnlPerDollar: number;
  /** For long options: +1 calls / -1 puts (premium follows the underlying). */
  optionSign: number;
}

interface BotSim {
  bot: BotConfig;
  equity: number;
  positions: SimPosition[];
  nextActionAt: number;
  polyToggle: boolean;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function numericOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function startSimulator(
  bots: BotConfig[],
  post: (event: FleetEvent) => Promise<void>,
  control?: SimControl,
): void {
  const rng = mulberry32(0x5eed);
  const prices = new Map<string, PriceSeries>();
  let decisionCounter = 0;

  const series = (key: string): PriceSeries => {
    let s = prices.get(key);
    if (!s) {
      const start = START_PRICES[key] ?? { price: 100, kind: "equity" as PriceKind };
      s = { price: start.price, vol: VOL_BY_KIND[start.kind], kind: start.kind };
      prices.set(key, s);
    }
    return s;
  };
  // Pre-warm the whole book so walks run before the first trade.
  for (const key of Object.keys(START_PRICES)) series(key);

  const stepPrices = (): void => {
    for (const s of prices.values()) {
      if (s.kind === "prob") {
        s.price = Math.min(0.96, Math.max(0.04, s.price + (rng() - 0.485) * s.vol));
      } else {
        // Slight upward drift (rng - 0.47) → roughly a 55/45 win/loss mix
        // on closes; losses still land regularly.
        s.price = Math.max(0.5, s.price * (1 + (rng() - 0.47) * s.vol));
      }
    }
  };

  const states: BotSim[] = bots.map((bot, i) => ({
    bot,
    equity: SIM_START_EQUITY,
    positions: [],
    nextActionAt: Date.now() + 1200 + i * 1100 + rng() * 800,
    polyToggle: false,
  }));

  const emit = (state: BotSim, event: Omit<FleetEvent, "bot" | "decision_id" | "ts">): void => {
    decisionCounter += 1;
    const full: FleetEvent = {
      ...event,
      bot: state.bot.name,
      decision_id: String(decisionCounter),
      ts: new Date().toISOString(),
    };
    console.log(
      `[sim] ${full.bot} ${full.type} ${full.symbol ?? ""} ` +
        `${full.side ?? ""} qty=${full.qty ?? "-"} @ ${full.price ?? "-"} ` +
        `${full.pnl !== null ? `pnl=${full.pnl.toFixed(2)} ` : ""}— ${full.reason}`,
    );
    void post(full);
  };

  const budget = (state: BotSim): number => {
    const pct = numericOr(state.bot.risk.max_position_pct, FALLBACK_MAX_POSITION_PCT);
    return state.equity * (pct / 100) * (0.7 + rng() * 0.5);
  };

  const maxPositions = (state: BotSim): number =>
    numericOr(state.bot.risk.max_positions, FALLBACK_MAX_POSITIONS);

  // --- Open-position generators, one per bot style -----------------------

  const openStock = (state: BotSim): void => {
    const universe = stringList(state.bot.universe);
    if (universe.length === 0) return;
    const symbol = universe[Math.floor(rng() * universe.length)]!;
    const price = series(symbol).price;
    const qty = Math.max(1, Math.floor(budget(state) / price));
    const reason =
      state.bot.codename === "trendia"
        ? `20-day high breakout; RSI(14) ${55 + Math.floor(rng() * 25)}; above 200DMA`
        : `z-score -${(2 + rng() * 1.2).toFixed(1)} vs 20-day mean; RSI(2) ${3 + Math.floor(rng() * 6)}; above 200DMA`;
    state.positions.push({
      label: symbol, priceKey: symbol, kind: "stock", side: "buy",
      qty, entryPrice: price, displayEntryPrice: price, pnlPerDollar: qty, optionSign: 1,
    });
    emit(state, {
      type: "open", symbol, side: "buy", qty, price: round2(price), pnl: null,
      reason: `SIM · ${reason}`,
    });
  };

  const openVega = (state: BotSim): void => {
    const list = state.bot.watchlist_examples ?? [];
    if (list.length === 0) return;
    const underlying = list[Math.floor(rng() * list.length)]!;
    const spot = series(underlying).price;
    const isCall = rng() < 0.6;
    const strike = Math.max(1, Math.round(spot * (0.97 + rng() * 0.06)));
    const expiry = ["Nov 7", "Nov 14", "Nov 21"][Math.floor(rng() * 3)]!;
    const label = `${underlying} ${strike}${isCall ? "C" : "P"} ${expiry}`;
    const premium = round2(spot * (0.04 + rng() * 0.04));
    const contracts = Math.max(1, Math.round(budget(state) / (premium * 100)));
    state.positions.push({
      label, priceKey: underlying, kind: "optionLong", side: "buy",
      qty: contracts, entryPrice: spot, displayEntryPrice: premium,
      pnlPerDollar: contracts * 100 * 0.45 * (isCall ? 1 : -1),
      optionSign: isCall ? 1 : -1,
    });
    emit(state, {
      type: "open", symbol: label, side: "buy", qty: contracts, price: premium, pnl: null,
      reason:
        `SIM · breakout + IV percentile ${70 + Math.floor(rng() * 28)}; ` +
        `delta 0.${35 + Math.floor(rng() * 20)}; long ${isCall ? "calls" : "puts"}`,
    });
  };

  const openWesley = (state: BotSim): void => {
    const list = state.bot.watchlist_examples ?? [];
    if (list.length === 0) return;
    const underlying = list[Math.floor(rng() * list.length)]!;
    const spot = series(underlying).price;
    const isPut = rng() < 0.55;
    const dte = [7, 14, 30][Math.floor(rng() * 3)]!;
    const expiry = dte === 7 ? "Nov 7" : dte === 14 ? "Nov 14" : "Nov 21";
    const strike = isPut
      ? Math.max(1, Math.floor(spot * (0.9 + rng() * 0.05)))
      : Math.max(1, Math.ceil(spot * (1.05 + rng() * 0.05)));
    const premium = round2(strike * (0.01 + rng() * 0.008));
    // The wheel trades in 100-share blocks; at $10k sim equity that is one
    // contract for most strikes in Wesley's $5–$55 band.
    const contracts = Math.max(1, Math.floor(budget(state) / (strike * 100)));
    const label = `${underlying} ${strike}${isPut ? "P" : "C"} ${expiry} (${isPut ? "CSP" : "CC"})`;
    state.positions.push({
      label, priceKey: underlying, kind: "shortPremium", side: "sell",
      qty: contracts, entryPrice: spot, displayEntryPrice: premium,
      // Short put gains as the underlying rises (delta ~0.25); the covered
      // call leg loses a little as it rallies (shares themselves aren't
      // modeled in the sim book).
      pnlPerDollar: contracts * 100 * (isPut ? 0.25 : -0.2),
      optionSign: 1,
    });
    emit(state, {
      type: "open", symbol: label, side: "sell", qty: contracts, price: premium, pnl: null,
      reason:
        `SIM · ${isPut ? "CSP" : "CC"} ${dte} DTE, delta 0.${20 + Math.floor(rng() * 10)}, ` +
        `premium ${((premium / strike) * 100).toFixed(1)}% of strike`,
    });
  };

  const openPolyCrypt = (state: BotSim): void => {
    state.polyToggle = !state.polyToggle;
    if (state.polyToggle) {
      const keys = Object.keys(POLYMARKET_LABELS);
      const key = keys[Math.floor(rng() * keys.length)]!;
      const market = series(key).price;
      const edge = 8 + Math.floor(rng() * 11);
      const model = Math.min(0.97, market + edge / 100);
      const qty = Math.round((budget(state) / market) * 10) / 10;
      state.positions.push({
        label: POLYMARKET_LABELS[key]!, priceKey: key, kind: "prob", side: "buy",
        qty, entryPrice: market, displayEntryPrice: market, pnlPerDollar: qty, optionSign: 1,
      });
      emit(state, {
        type: "open", symbol: POLYMARKET_LABELS[key]!, side: "buy", qty,
        price: Math.round(market * 1000) / 1000, pnl: null,
        reason:
          `SIM · market ${Math.round(market * 100)}% vs model ${Math.round(model * 100)}% — ` +
          `${edge}pt edge; quarter-Kelly`,
      });
    } else {
      const pairs: Array<[string, string]> = [
        ["BTC/USD", "BTC"], ["ETH/USD", "ETH"], ["SOL/USD", "SOL"],
      ];
      const [label, key] = pairs[Math.floor(rng() * pairs.length)]!;
      const price = series(key).price;
      const qty = Math.round((budget(state) / price) * 10000) / 10000;
      state.positions.push({
        label, priceKey: key, kind: "crypto", side: "buy",
        qty, entryPrice: price, displayEntryPrice: price, pnlPerDollar: qty, optionSign: 1,
      });
      emit(state, {
        type: "open", symbol: label, side: "buy", qty, price: round2(price), pnl: null,
        reason: "SIM · Donchian 20 breakout, ATR expanding; hourly",
      });
    }
  };

  const openPosition = (state: BotSim): void => {
    switch (state.bot.codename) {
      case "vega": return openVega(state);
      case "wesley": return openWesley(state);
      case "polycrypt9000": return openPolyCrypt(state);
      default: return openStock(state); // trendia, snapback
    }
  };

  // --- Closing ------------------------------------------------------------

  const closeReason = (state: BotSim, pos: SimPosition, pnl: number): string => {
    const win = pnl >= 0;
    switch (state.bot.codename) {
      case "trendia":
        return win
          ? "exit: momentum cooled — RSI(14) overbought, profit locked"
          : "exit: 8% trailing stop hit / close below 50DMA";
      case "snapback":
        return win
          ? "exit: price returned to the 20-day mean"
          : "exit: 5% stop hit / 5-day time stop";
      case "vega":
        return win
          ? "exit: +50% premium target hit"
          : "exit: -35% premium stop / 5-day time stop";
      case "wesley":
        return win
          ? "exit: bought back at ~50% of premium — redeploy"
          : "exit: defended at 2x premium — rolled out";
      case "polycrypt9000":
        return pos.kind === "prob"
          ? win
            ? "exit: market converged to model — edge captured"
            : "exit: model edge invalidated — cut"
          : "exit: 2x ATR trailing stop";
      default:
        return win ? "exit: target reached" : "exit: stop hit";
    }
  };

  /**
   * Settle one position at the current sim price: compute the display
   * exit price + realized PnL, update equity, and emit the close event
   * with the given reason. Shared by normal closes and forced
   * kill-switch liquidations — a liquidation close is a close, booked
   * identically, only its reason differs.
   */
  const settleClose = (
    state: BotSim,
    pos: SimPosition,
    reason: string,
  ): { symbol: string; qty: number; price: number; pnl: number } => {
    const exitPrice = series(pos.priceKey).price;
    const pnl = round2((exitPrice - pos.entryPrice) * pos.pnlPerDollar);
    state.equity = round2(state.equity + pnl);

    let displayExit = exitPrice;
    if (pos.kind === "optionLong") {
      displayExit = Math.max(
        0.05,
        round2(pos.displayEntryPrice + (exitPrice - pos.entryPrice) * 0.45 * pos.optionSign),
      );
    } else if (pos.kind === "shortPremium") {
      // Sold premium mostly decays; sometimes it spikes against the seller.
      displayExit = Math.max(0.02, round2(pos.displayEntryPrice * (0.25 + rng() * 0.85)));
    } else if (pos.kind === "prob") {
      displayExit = Math.round(exitPrice * 1000) / 1000;
    } else {
      displayExit = round2(exitPrice);
    }

    emit(state, {
      type: "close",
      symbol: pos.label,
      side: pos.side === "buy" ? "sell" : "buy",
      qty: pos.qty,
      price: displayExit,
      pnl,
      reason: `${reason} · sim equity $${state.equity.toFixed(2)}`,
    });
    return { symbol: pos.label, qty: pos.qty, price: displayExit, pnl };
  };

  const closePosition = (state: BotSim): void => {
    const idx = Math.floor(rng() * state.positions.length);
    const pos = state.positions.splice(idx, 1)[0]!;
    // PnL sign decides the narrative reason; settleClose recomputes the
    // same pnl deterministically from the same price snapshot.
    const exitPrice = series(pos.priceKey).price;
    const pnl = round2((exitPrice - pos.entryPrice) * pos.pnlPerDollar);
    settleClose(state, pos, `SIM · ${closeReason(state, pos, pnl)}`);
  };

  /**
   * KILL + LIQUIDATE: force-close the bot's entire book at current sim
   * prices. Every close is a normal close event whose reason is clearly
   * marked as a forced liquidation. Sim positions always settle (the
   * price series is created on demand), so `failed` is empty here — the
   * field exists for the live-engine contract, where an unclosable
   * position must be reported, never silently dropped.
   */
  const liquidateAll = (
    state: BotSim,
  ): {
    closed: { codename: string; symbol: string; qty: number; price: number; pnl: number }[];
    failed: { codename: string; symbol: string; reason: string }[];
  } => {
    const closed: {
      codename: string; symbol: string; qty: number; price: number; pnl: number;
    }[] = [];
    const book = state.positions.splice(0, state.positions.length);
    for (const pos of book) {
      const exitPrice = series(pos.priceKey).price;
      const pnl = round2((exitPrice - pos.entryPrice) * pos.pnlPerDollar);
      const done = settleClose(
        state,
        pos,
        `KILL + LIQUIDATE · forced liquidation at market — ${closeReason(state, pos, pnl)}`,
      );
      closed.push({ codename: state.bot.codename, ...done });
    }
    return { closed, failed: [] };
  };

  const act = (state: BotSim): void => {
    const canClose = state.positions.length > 0;
    const canOpen = state.positions.length < maxPositions(state);
    if (canClose && (!canOpen || rng() < 0.45)) {
      closePosition(state);
    } else if (canOpen) {
      openPosition(state);
    }
    state.nextActionAt = Date.now() + 4000 + rng() * 4000;
  };

  setInterval(stepPrices, PRICE_TICK_MS);
  setInterval(() => {
    const now = Date.now();

    // Risk Gate first: execute any pending kill+liquidate requests.
    // The engine owns the position book, so it performs the forced
    // closes itself and reports the results back to the API.
    if (control) {
      for (const req of control.drainLiquidations()) {
        const state = states.find((s) => s.bot.codename === req.codename);
        if (!state) {
          void control.reportLiquidation(req.id, req.codename, [], [
            {
              codename: req.codename,
              symbol: "(whole book)",
              reason: "bot is not running in this engine",
            },
          ]);
          continue;
        }
        const { closed, failed } = liquidateAll(state);
        console.log(
          `[sim] KILL + LIQUIDATE ${state.bot.name}: closed ${closed.length} position(s)` +
            (failed.length ? `, ${failed.length} FAILED` : ""),
        );
        void control.reportLiquidation(req.id, req.codename, closed, failed);
      }
    }

    for (const state of states) {
      // A halted bot does nothing — no evaluations, no orders — and its
      // book stays frozen. Keep pushing its next action out so a resume
      // starts from a clean beat instead of firing instantly.
      if (control?.isHalted(state.bot.codename)) {
        state.nextActionAt = now + 1000;
        continue;
      }
      if (now >= state.nextActionAt) act(state);
    }
  }, ACTION_CHECK_MS);

  console.log(
    `[sim] simulator running — ${states.length} bots, $${SIM_START_EQUITY} sim equity each, ` +
      `seeded RNG (deterministic), activity every ~4-8s per bot`,
  );
}
