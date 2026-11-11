import {
  classifyWeather,
  weatherFromBars,
  type MarketWeather,
  type WeatherBar,
} from "@fleet/shared";
import type { AlpacaClientLike } from "./alpaca.js";
import { mulberry32, type SimSpyProbe } from "./sim.js";

/**
 * Market weather service (v24) — the engine half of the hub dome's
 * particle weather.
 *
 * The engine owns market data, so the engine judges the day: SPY's
 * latest price against its prior completed close and prior 20-day
 * range (the pure rule lives in @fleet/shared/weather). The verdict is
 * reported to the API (POST /internal/weather, internal token — the
 * mode report's trust pattern); the API stores, serves, and
 * broadcasts it, and the dashboard renders green sparklies inside the
 * dome on breakout days or a red meteor shower on downturn days.
 *
 * Cadence: once shortly after boot, then hourly. Failures are logged
 * and retried on the next tick — weather must never take the engine
 * down, and a stale sky beats no sky.
 *
 * Sources:
 * - paper / connected: real SPY daily bars + latest trade through the
 *   existing Alpaca client (paper keys — the same feed Trendia's
 *   regime gate reads).
 * - sim (and the paper-with-no-keys simulator fallback): the
 *   simulator's own live SPY walk, judged against a synthesized
 *   prior-day frame (25 seeded daily bars ending at the price the
 *   walk had when the frame was built — that last close is the sim
 *   day's "prior close"). The sim's weather therefore starts near
 *   flat and genuinely flips as its SPY walk drifts up or dips.
 */

const REFRESH_MS = 3_600_000;
const FIRST_DELAY_MS = 1_500;
const BARS_LOOKBACK_DAYS = 70;

/** Current date in America/New_York (YYYY-MM-DD) — session dates are ET. */
function etDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export interface WeatherServiceDeps {
  /** Alpaca client when one exists (paper/connected); null in sim. */
  client: AlpacaClientLike | null;
  /** The simulator's SPY probe (filled when a simulator runs). */
  simSpy: SimSpyProbe;
  apiBaseUrl: string;
  token: string;
}

export function startWeatherService(deps: WeatherServiceDeps): void {
  let simFrame: { anchor: number; bars: WeatherBar[] } | null = null;
  let lastReportedKey: string | null = null;

  async function report(weather: MarketWeather): Promise<void> {
    const key = `${weather.kind}|${weather.spyChangePct}|${weather.source}`;
    try {
      const res = await fetch(`${deps.apiBaseUrl}/internal/weather`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-token": deps.token,
        },
        body: JSON.stringify(weather),
      });
      if (!res.ok) {
        console.warn(`[weather] report failed: HTTP ${res.status}`);
        return;
      }
      if (key !== lastReportedKey) {
        lastReportedKey = key;
        console.log(
          `[weather] ${weather.kind} — SPY ${weather.spyChangePct >= 0 ? "+" : ""}${weather.spyChangePct}% (${weather.source})`,
        );
      }
    } catch (err) {
      console.warn(
        "[weather] report failed (is the API running?):",
        err instanceof Error ? err.message : err,
      );
    }
  }

  /**
   * The sim day frame: 25 seeded daily bars whose last close is the
   * anchor (the sim SPY price when the frame is built). Built once;
   * the live walk is then judged against it all day.
   */
  function buildSimFrame(anchor: number): { anchor: number; bars: WeatherBar[] } {
    const rng = mulberry32(0x5eed24);
    const closes: number[] = [anchor];
    // Walk backwards: each earlier close differs by a seeded ±1.5% day.
    for (let i = 0; i < 25; i++) {
      const dayReturn = (rng() - 0.48) * 0.03;
      closes.unshift(closes[0]! / (1 + dayReturn));
    }
    const bars: WeatherBar[] = closes.map((close, i) => {
      const next = closes[i + 1] ?? close;
      const swing = Math.abs(next - close) * 0.5 + close * 0.001;
      // Dates are decorative here (the frame logic keys off order, and
      // etDate() never equals these past dates) — step back i days.
      const d = new Date(Date.now() - (closes.length - i) * 86_400_000);
      return {
        date: d.toISOString().slice(0, 10),
        high: Math.max(close, next) + swing * 0.4,
        low: Math.min(close, next) - swing * 0.4,
        close,
      };
    });
    return { anchor, bars };
  }

  async function compute(): Promise<MarketWeather | null> {
    const asOf = new Date().toISOString();
    if (deps.client) {
      const startISO = new Date(
        Date.now() - BARS_LOOKBACK_DAYS * 86_400_000,
      ).toISOString();
      const bars = await deps.client.getDailyBars("SPY", startISO);
      let latest: number | null = null;
      try {
        latest = await deps.client.getLatestPrice("SPY");
      } catch {
        // Bars alone still judge the day (last close vs its prior).
        latest = null;
      }
      return weatherFromBars(bars, latest, etDate(), "alpaca", asOf);
    }
    const spyNow = deps.simSpy.current?.() ?? null;
    if (spyNow === null) return null;
    if (!simFrame) simFrame = buildSimFrame(spyNow);
    const priorClose =
      simFrame.bars[simFrame.bars.length - 1]?.close ?? simFrame.anchor;
    const window = simFrame.bars.slice(-20);
    const { kind, spyChangePct } = classifyWeather({
      latestPrice: spyNow,
      priorClose,
      priorHigh20: Math.max(...window.map((b) => b.high)),
      priorLow20: Math.min(...window.map((b) => b.low)),
    });
    return {
      kind,
      spyChangePct: Math.round(spyChangePct * 100) / 100,
      asOf,
      source: "sim",
    };
  }

  const tick = async (): Promise<void> => {
    try {
      const weather = await compute();
      if (weather) await report(weather);
    } catch (err) {
      console.warn(
        "[weather] computation failed; will retry next tick:",
        err instanceof Error ? err.message : err,
      );
    }
  };

  setTimeout(() => void tick(), FIRST_DELAY_MS);
  setInterval(() => void tick(), REFRESH_MS);
  console.log(
    `[weather] market weather service running — SPY judged at boot and hourly (source: ${
      deps.client ? "alpaca" : "sim"
    })`,
  );
}
