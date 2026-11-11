/**
 * v24 verification — market weather for the hub dome.
 *
 *     node_modules/.bin/tsx tools/test-weather-v24.ts   (from app/)
 *
 * Exercises the REAL shipped code, no replicas:
 *   1. classifyWeather (packages/shared/src/weather.ts) — Keith's
 *      rule: breakout at/above the prior 20-day high or on a ≥ +0.75%
 *      day; downturn on a ≤ −0.75% day or at/below the prior 20-day
 *      low; otherwise the day's sign decides.
 *   2. weatherIntensity — floored at 0.15, capped at 1, monotonic
 *      non-decreasing in |change|.
 *   3. weatherFromBars — which bar counts as "the day" (in-progress
 *      session bar, live-price-new-session, last completed bar on
 *      weekends/evenings) and the insufficient-history null.
 *   4. weatherModeFor (packages/web/src/fleetState.ts) — the web
 *      state selection the landscape reads per frame: payload →
 *      particle kind + intensity; null → calm breakout default.
 *   5. sparkleCountFor / meteorCountFor (Landscape.tsx) — population
 *      scaling inside the caps, small-screen reduction.
 *   6. Source pins: the shipped Landscape/App/API/engine actually
 *      wire weatherRef → updateWeatherParticles, the chip, the
 *      /weather routes, and the engine service start sites — so this
 *      harness can't pass against dead code.
 */
import { readFileSync } from "node:fs";
import {
  classifyWeather,
  weatherFromBars,
  weatherIntensity,
  type WeatherBar,
} from "../packages/shared/src/weather.ts";
import { weatherModeFor } from "../packages/web/src/fleetState.ts";
import {
  MAX_METEORS,
  MAX_SPARKLES,
  meteorCountFor,
  sparkleCountFor,
} from "../packages/web/src/Landscape.tsx";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}
const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps;
/** weatherFromBars rounds the reported change to 2 decimals. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// 1. classifyWeather fixtures
// ---------------------------------------------------------------------------
const base = { priorClose: 100, priorHigh20: 110, priorLow20: 90 };

let r = classifyWeather({ ...base, latestPrice: 111, priorHigh20: 110 });
check("breakout by 20-day high", r.kind === "breakout" && near(r.spyChangePct, 11), `pct=${r.spyChangePct}`);

r = classifyWeather({ ...base, latestPrice: 101 });
check("breakout by day gain ≥ +0.75%", r.kind === "breakout" && near(r.spyChangePct, 1), `pct=${r.spyChangePct}`);

r = classifyWeather({ ...base, latestPrice: 99 });
check("downturn by day loss ≤ −0.75%", r.kind === "downturn" && near(r.spyChangePct, -1), `pct=${r.spyChangePct}`);

r = classifyWeather({ latestPrice: 89.5, priorClose: 90, priorHigh20: 100, priorLow20: 89.8 });
check(
  "downturn by 20-day low (small day loss)",
  r.kind === "downturn" && r.spyChangePct > -0.75,
  `pct=${r.spyChangePct.toFixed(3)} — the low, not the day move, decided`,
);

r = classifyWeather({ ...base, latestPrice: 100.2 });
check("flat day, positive sign → breakout", r.kind === "breakout" && near(r.spyChangePct, 0.2), `pct=${r.spyChangePct}`);

r = classifyWeather({ ...base, latestPrice: 99.8 });
check("flat day, negative sign → downturn", r.kind === "downturn" && near(r.spyChangePct, -0.2), `pct=${r.spyChangePct}`);

r = classifyWeather({ ...base, latestPrice: 100.75 });
check("boundary: exactly +0.75% → breakout", r.kind === "breakout", `pct=${r.spyChangePct}`);

r = classifyWeather({ ...base, latestPrice: 99.25 });
check("boundary: exactly −0.75% → downturn", r.kind === "downturn", `pct=${r.spyChangePct}`);

// ---------------------------------------------------------------------------
// 2. weatherIntensity: floor, cap, monotonic in |change|
// ---------------------------------------------------------------------------
check("intensity floor on a flat day", near(weatherIntensity(0), 0.15), `${weatherIntensity(0)}`);
check("intensity cap on a huge day", near(weatherIntensity(6), 1), `${weatherIntensity(6)}`);
{
  const samples = [0, 0.2, 0.75, 1.15, 2.0, 2.5, 4].map(weatherIntensity);
  const mono = samples.every((v, i) => i === 0 || v >= samples[i - 1]!);
  check("intensity monotonic in |change|", mono, samples.map((v) => v.toFixed(2)).join(" ≤ "));
  check(
    "intensity symmetric in sign",
    near(weatherIntensity(-1.15), weatherIntensity(1.15)),
    `${weatherIntensity(-1.15)}`,
  );
}

// ---------------------------------------------------------------------------
// 3. weatherFromBars: which bar is "the day"
// ---------------------------------------------------------------------------
function barsOf(closes: number[], startDate: string): WeatherBar[] {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  return closes.map((close, i) => ({
    date: new Date(start + i * 86_400_000).toISOString().slice(0, 10),
    high: close * 1.004,
    low: close * 0.996,
    close,
  }));
}
// 25 sessions of a gentle climb 100 → 124 (Jan 2026 dates), then the
// session under judgment is appended per case.
const history = barsOf(
  Array.from({ length: 25 }, (_, i) => 100 + i),
  "2026-01-01",
);
const lastDay = history[history.length - 1]!.date; // 2026-01-25
const nextDay = "2026-01-26";

// In-progress session: a bar dated "today" is excluded from the
// reference frame; the live price is judged against the prior close
// (124) and the prior-20 window.
{
  const bars = [...history, { date: nextDay, high: 130, low: 120, close: 126 }];
  const w = weatherFromBars(bars, 130, nextDay, "alpaca", "2026-01-26T15:00:00Z");
  check(
    "fromBars: live session — live price vs prior close",
    w !== null && near(w.spyChangePct, round2(((130 - 124) / 124) * 100)),
    w ? `pct=${w.spyChangePct}` : "null",
  );
  check(
    "fromBars: live price through the window high → breakout",
    w !== null && w.kind === "breakout" && w.source === "alpaca",
    w ? w.kind : "null",
  );
}
// Weekend: no live price movement (latest == last close) → the last
// completed bar is the day, judged against the bar before it.
{
  const w = weatherFromBars(history, 124, "2026-01-27", "alpaca", "2026-01-27T12:00:00Z");
  check(
    "fromBars: weekend — last bar is the day",
    w !== null && near(w.spyChangePct, round2(((124 - 123) / 123) * 100)),
    w ? `pct=${w.spyChangePct}` : "null",
  );
}
// New session, bars not caught up: live price below the −0.75% line.
{
  const w = weatherFromBars(history, 122.5, nextDay, "alpaca", "2026-01-26T15:00:00Z");
  check(
    "fromBars: new session live price −1.21% → downturn",
    w !== null && w.kind === "downturn" && near(w.spyChangePct, round2(((122.5 - 124) / 124) * 100)),
    w ? `${w.kind} pct=${w.spyChangePct}` : "null",
  );
}
// Insufficient history → null (caller keeps the previous weather).
{
  const w = weatherFromBars(history.slice(0, 1), 100, nextDay, "alpaca", "2026-01-26T15:00:00Z");
  check("fromBars: one bar → null", w === null, "");
  void lastDay;
}

// ---------------------------------------------------------------------------
// 4. weatherModeFor: payload → particle mode
// ---------------------------------------------------------------------------
{
  const m = weatherModeFor(null);
  check(
    "modeFor(null) → calm breakout default",
    m.kind === "breakout" && near(m.intensity, 0.15) && m.spyChangePct === 0,
    JSON.stringify(m),
  );
  const down = weatherModeFor({
    kind: "downturn",
    spyChangePct: -1.15,
    asOf: "2026-01-26T15:00:00Z",
    source: "alpaca",
  });
  check(
    "modeFor(downturn −1.15%) → meteors at scaled intensity",
    down.kind === "downturn" && near(down.intensity, weatherIntensity(-1.15)),
    JSON.stringify(down),
  );
  const up = weatherModeFor({
    kind: "breakout",
    spyChangePct: 0.82,
    asOf: "2026-01-26T15:00:00Z",
    source: "sim",
  });
  check(
    "modeFor(breakout +0.82%) → sparklies",
    up.kind === "breakout" && near(up.intensity, weatherIntensity(0.82)),
    JSON.stringify(up),
  );
}

// ---------------------------------------------------------------------------
// 5. Particle populations: scaling inside the caps
// ---------------------------------------------------------------------------
check("sparkles at zero intensity = 150", sparkleCountFor(0) === 150, `${sparkleCountFor(0)}`);
check("sparkles at full intensity = cap 300", sparkleCountFor(1) === MAX_SPARKLES, `${sparkleCountFor(1)}`);
check("sparkles small screen = 60%", sparkleCountFor(1, true) === 180, `${sparkleCountFor(1, true)}`);
check("meteors at zero intensity = 30", meteorCountFor(0) === 30, `${meteorCountFor(0)}`);
check("meteors at full intensity = cap 45", meteorCountFor(1) === MAX_METEORS, `${meteorCountFor(1)}`);
check("meteors small screen = 60%", meteorCountFor(1, true) === 27, `${meteorCountFor(1, true)}`);
{
  const s = [0, 0.25, 0.5, 0.75, 1].map((i) => sparkleCountFor(i));
  const m = [0, 0.25, 0.5, 0.75, 1].map((i) => meteorCountFor(i));
  check(
    "populations monotonic in intensity",
    s.every((v, i) => i === 0 || v >= s[i - 1]!) && m.every((v, i) => i === 0 || v >= m[i - 1]!),
    `sparkles ${s.join("≤")} · meteors ${m.join("≤")}`,
  );
}

// ---------------------------------------------------------------------------
// 6. Source pins: the shipped surfaces are actually wired
// ---------------------------------------------------------------------------
const landscapeSrc = readFileSync(
  new URL("../packages/web/src/Landscape.tsx", import.meta.url),
  "utf8",
);
const appSrc = readFileSync(
  new URL("../packages/web/src/App.tsx", import.meta.url),
  "utf8",
);
const apiSrc = readFileSync(
  new URL("../packages/api/src/index.ts", import.meta.url),
  "utf8",
);
const engineSrc = readFileSync(
  new URL("../packages/engine/src/index.ts", import.meta.url),
  "utf8",
);
check(
  "pin: landscape updates dome weather from weatherRef per frame",
  landscapeSrc.includes("updateWeatherParticles(weatherModeFor(weatherRef?.current ?? null), dt, t)"),
  "animate() calls updateWeatherParticles(weatherModeFor(...))",
);
check(
  "pin: dome shell lets the interior read (transparent, no depth write)",
  landscapeSrc.includes("opacity: 0.52") && landscapeSrc.includes("depthWrite: false"),
  "hubDomeMat carries the v24 transparency tweak",
);
check(
  "pin: App passes weatherRef and renders the chip",
  appSrc.includes("weatherRef={weatherRef}") &&
    appSrc.includes("Breakout weather") &&
    appSrc.includes("Downturn weather"),
  "App.tsx wires the ref + both chip labels",
);
check(
  "pin: API serves + ingests weather",
  apiSrc.includes('app.get("/weather"') && apiSrc.includes('app.post("/internal/weather"'),
  "GET /weather + POST /internal/weather routes exist",
);
check(
  "pin: engine starts the weather service in sim, paper and connected branches",
  (engineSrc.match(/startWeather\(/g) ?? []).length >= 4,
  `${(engineSrc.match(/startWeather\(/g) ?? []).length} startWeather call sites (def + branches)`,
);

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exit(1);
