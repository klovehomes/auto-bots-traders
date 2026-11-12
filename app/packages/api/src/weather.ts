import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { marketWeatherSchema, type MarketWeather } from "@fleet/shared";

/**
 * Market weather state (v24) — the day's SPY verdict ("breakout" /
 * "downturn") that the landscape's hub dome renders as particles.
 *
 * The API owns the current weather exactly as it owns the control and
 * mode state: the ENGINE computes it (the engine owns market data) and
 * reports it over the internal channel (POST /internal/weather); the
 * API stores it, serves it to dashboards (GET /weather, so a freshly
 * loaded page shows the right weather immediately) and broadcasts
 * changes over the event WebSocket ({kind: "weather"} frames).
 *
 * It persists on the shared data volume (WEATHER_STATE_PATH,
 * /data/weather-state.json in Docker) so an API restart doesn't blank
 * the dome until the engine's next hourly refresh.
 */
interface PersistedWeatherState {
  version: 1;
  weather: MarketWeather | null;
}

export class WeatherStore {
  private readonly path: string;
  private weather: MarketWeather | null = null;

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const parsed = JSON.parse(
        readFileSync(this.path, "utf8"),
      ) as PersistedWeatherState;
      if (parsed.version !== 1) {
        throw new Error(`unsupported version ${String(parsed.version)}`);
      }
      if (parsed.weather !== null) {
        const w = marketWeatherSchema.safeParse(parsed.weather);
        if (!w.success) throw new Error("stored weather failed validation");
        this.weather = w.data;
      }
    } catch (err) {
      // A corrupt weather file must never wedge the API: start with no
      // weather (the engine re-reports within the hour) and say so.
      console.error(
        `[weather] could not load ${this.path} — starting without weather:`,
        err instanceof Error ? err.message : err,
      );
      this.weather = null;
    }
  }

  private save(): void {
    const data: PersistedWeatherState = { version: 1, weather: this.weather };
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync(tmp, JSON.stringify(data, null, 2));
      renameSync(tmp, this.path);
    } catch (err) {
      console.error(
        `[weather] could not persist ${this.path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  /** The latest reported weather, or null until the engine reports. */
  current(): MarketWeather | null {
    return this.weather;
  }

  /** Record an engine report. Returns true when the payload changed
   *  (kind or rounded change) — the caller broadcasts only then, so
   *  hourly same-weather refreshes update `asOf` quietly. */
  update(weather: MarketWeather): boolean {
    const prev = this.weather;
    const changed =
      prev === null ||
      prev.kind !== weather.kind ||
      prev.spyChangePct !== weather.spyChangePct ||
      prev.source !== weather.source;
    this.weather = weather;
    this.save();
    return changed;
  }
}
