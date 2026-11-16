/**
 * On-device bot runtime: runs the real @fleet/core strategies in this app.
 *
 * Host wiring (the device equivalents of packages/engine):
 *   broker access  → Rust `broker_request` (keys attached in Rust, endpoint allowlist)
 *   Kalshi signing → done in Rust inside `broker_request`
 *   state          → in-memory StateStore preloaded from, and written back to, app storage
 *   kill switch    → createLocalControl (halts persist across restarts)
 *   earnings feed  → Rust `public_get` (Nasdaq; a WebView can't call it directly)
 *
 * Paper/demo only: Rust refuses live keys for trading.
 */
import {
  createAlpacaRestClient,
  createKalshiClientWithTransport,
  createLocalControl,
  createMemoryStateStore,
  createNasdaqEarningsCalendar,
  startPaperTrader,
  startPolyCryptTrader,
  startSnapbackTrader,
  startVegaTrader,
  startWesleyTrader,
  type AlpacaClientLike,
  type KalshiClientLike,
  type LocalControl,
  type StateStore,
} from "@fleet/core";
import type { FleetEvent } from "@fleet/shared/types";
import { native, type StrategySelection } from "./api";
import { CATALOG, botForSelection, missingKeys } from "./catalog";

const EVENTS_KEY = "events/log.json";
const MAX_EVENTS = 500;

export interface RuntimeSnapshot {
  ready: boolean;
  running: string[];
  halted: string[];
  events: FleetEvent[];
  /** Why bots aren't running when they should be (e.g. session expired). */
  notice: string | null;
}

type Listener = (s: RuntimeSnapshot) => void;

let store: StateStore | null = null;
let control: LocalControl | null = null;
const running = new Map<string, () => void>();
let events: FleetEvent[] = [];
let notice: string | null = null;
const listeners = new Set<Listener>();
let saveEventsTimer: number | null = null;

function snapshot(): RuntimeSnapshot {
  return {
    ready: store !== null,
    running: [...running.keys()],
    halted: control?.halted() ?? [],
    events,
    notice,
  };
}

function emit() {
  const s = snapshot();
  for (const l of listeners) l(s);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(snapshot());
  return () => listeners.delete(listener);
}

function systemEvent(reason: string): FleetEvent {
  return {
    bot: "system",
    type: "signal",
    decision_id: null,
    symbol: null,
    side: null,
    qty: null,
    price: null,
    pnl: null,
    reason,
    ts: new Date().toISOString(),
  };
}

function record(event: FleetEvent) {
  events = [event, ...events].slice(0, MAX_EVENTS);
  // Persist the feed at most once a second; it's a convenience log, the
  // runners' own state files are the source of truth.
  if (saveEventsTimer === null) {
    saveEventsTimer = window.setTimeout(() => {
      saveEventsTimer = null;
      store?.write(EVENTS_KEY, JSON.stringify(events));
    }, 1000);
  }
  emit();
}

/** Load saved bot state from app storage. Call once before starting bots. */
export async function initRuntime(): Promise<void> {
  if (store) return;
  const initial = await native.stateLoadAll();
  store = createMemoryStateStore(initial, {
    onWrite: (key, text) => {
      native.stateWrite(key, text).catch((e) => console.warn(`[runtime] save ${key} failed:`, e));
    },
    onRemove: (key) => {
      native.stateRemove(key).catch((e) => console.warn(`[runtime] remove ${key} failed:`, e));
    },
  });
  try {
    const saved = initial[EVENTS_KEY];
    if (saved) events = (JSON.parse(saved) as FleetEvent[]).slice(0, MAX_EVENTS);
  } catch {
    events = [];
  }
  control = createLocalControl(store);
  control.onReport((r) =>
    record(
      systemEvent(
        `${r.codename}: liquidation finished — ${r.closed.length} closed, ${r.failed.length} could not be closed` +
          (r.failed.length ? ` (${r.failed.map((f) => `${f.symbol}: ${f.reason}`).join("; ")})` : ""),
      ),
    ),
  );
  emit();
}

function alpacaFor(credentialId: string): AlpacaClientLike {
  return createAlpacaRestClient((req) =>
    native.broker({ credentialId, venue: "alpaca", ...req }),
  );
}

function kalshiFor(credentialId: string): KalshiClientLike {
  return createKalshiClientWithTransport((req) =>
    native.broker({ credentialId, venue: "kalshi", ...req }),
  );
}

/** fetch() stand-in that routes the Nasdaq calendar through Rust. */
const nasdaqFetch: typeof fetch = async (input) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const res = await native.publicGet(url);
  return new Response(res.status === 204 ? null : res.text, { status: res.status });
};

/**
 * Start every enabled, fully-keyed selection that isn't already running.
 * The caller must have started a bot session (native.armBots) first.
 */
export function startBots(selections: StrategySelection[]): string[] {
  if (!store || !control) throw new Error("Runtime not initialised");
  const started: string[] = [];
  notice = null;
  for (const sel of selections) {
    if (!sel.enabled || running.has(sel.codename)) continue;
    const def = CATALOG.find((d) => d.codename === sel.codename);
    if (!def || missingKeys(def, sel).length > 0) continue;
    const bot = botForSelection(def, sel);
    const ctl = control.forBot(bot.codename);
    const deps = { store, statePath: `data/paper-${bot.codename}-state.json` };
    const alpaca = sel.credentials.alpaca ? alpacaFor(sel.credentials.alpaca) : null;
    let stop: (() => void) | null = null;
    switch (bot.codename) {
      case "trendia":
        if (alpaca) stop = startPaperTrader(bot, alpaca, async (e) => record(e), ctl, deps);
        break;
      case "snapback":
        if (alpaca) stop = startSnapbackTrader(bot, alpaca, async (e) => record(e), ctl, deps);
        break;
      case "vega":
        // Vega stays in SHADOW (decisions only, no orders) — the same default
        // as the VM's VEGA_SHADOW=true until her soak is signed off.
        if (alpaca)
          stop = startVegaTrader(bot, alpaca, async (e) => record(e), ctl, {
            ...deps,
            earnings: createNasdaqEarningsCalendar(nasdaqFetch),
          });
        break;
      case "wesley":
        if (alpaca) stop = startWesleyTrader(bot, alpaca, async (e) => record(e), ctl, deps);
        break;
      case "polycrypt9000":
        stop = startPolyCryptTrader(
          bot,
          { alpaca, kalshi: sel.credentials.kalshi ? kalshiFor(sel.credentials.kalshi) : null },
          async (e) => record(e),
          ctl,
          deps,
        );
        break;
      default:
        record(systemEvent(`${bot.name}: no device runner for strategy "${bot.strategy}" yet`));
    }
    if (stop) {
      running.set(bot.codename, stop);
      started.push(bot.codename);
      record(systemEvent(`${bot.name} started (paper)`));
    }
  }
  emit();
  return started;
}

/** Stop one bot's timer. Its saved state stays; open positions stay open. */
export function stopBot(codename: string) {
  running.get(codename)?.();
  if (running.delete(codename)) record(systemEvent(`${codename} stopped`));
  emit();
}

/** Stop every bot and end the bot session so keys are unusable. */
export async function stopAll(reason = "All bots stopped"): Promise<void> {
  for (const [, stop] of running) stop();
  running.clear();
  record(systemEvent(reason));
  await native.disarmBots().catch(() => undefined);
  emit();
}

/** Called by the UI's status poll: stop bots once the bot session has ended. */
export function onSessionEnded() {
  if (running.size === 0) return;
  notice = "The bot session ended, so bots lost access to your keys and were stopped. Start a new session to resume.";
  void stopAll("Bot session ended — bots stopped");
}

export function halt(codename: string) {
  control?.halt(codename);
  record(systemEvent(`${codename} halted (kill switch)`));
}

export function resume(codename: string) {
  control?.resume(codename);
  record(systemEvent(`${codename} resumed`));
}

export function haltAndLiquidate(codename: string) {
  control?.haltAndLiquidate(codename);
  record(
    systemEvent(
      `${codename} halted + liquidation queued — ${running.has(codename) ? "runs on its next tick" : "start the bot to execute it"}`,
    ),
  );
}
