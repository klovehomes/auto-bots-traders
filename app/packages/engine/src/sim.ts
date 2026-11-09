import type { BotConfig, FleetEvent } from "@fleet/shared";

/**
 * SIM MODE — synthetic market + activity generator for local testing.
 *
 * Activated when the MODE is "sim" (MODE=sim, the default; see
 * engine/src/index.ts). Lets Keith run the
 * whole stack on his laptop (WSL + Docker) and watch the bot "trade"
 * with fake data: no broker, no API keys, no real market data.
 *
 * How it works:
 * - A seeded RNG (mulberry32, fixed seed) drives a random walk per symbol,
 *   so runs are reproducible.
 * - The bot keeps a small in-memory position book and starts with $10,000
 *   of sim equity (the decided paper allocation — $5,000 originally,
 *   doubled by Keith on 2026-11-03).
 * - Every ~4–8s (staggered per bot) one bot opens or closes a position and
 *   the event goes through the exact same /internal/events pipeline and
 *   FleetEvent schema as real trading will.
 * - Sizing uses the bot's real `risk.max_position_pct` when the .md
 *   file carries a plain number. PolyCrypt9000's file carries prose
 *   instead ("3 (per Polymarket position) / 15 (per crypto position)"),
 *   so we fall back to FALLBACK_MAX_POSITION_PCT — parsing prose caps
 *   is a strategy plugin job, not the simulator's.
 *
 * The activity generator is a stand-in written in PolyCrypt9000's voice
 * (trigger text mirrors its .md rules); its real/shadow runners are not
 * built yet. Prices and fills are synthetic — see LOCAL-RUN.md.
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
    return openPolyCrypt(state);
  };

  // --- Closing ------------------------------------------------------------

  const closeReason = (state: BotSim, pos: SimPosition, pnl: number): string => {
    const win = pnl >= 0;
    if (state.bot.codename === "polycrypt9000" && pos.kind !== "prob") {
      return "exit: 2x ATR trailing stop";
    }
    return win
      ? "exit: market converged to model — edge captured"
      : "exit: model edge invalidated — cut";
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
