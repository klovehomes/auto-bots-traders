// Builds src/catalog.generated.json from the repo's bots/*.md files, so the
// device app's Strategy Library always matches the bot definitions the VM
// fleet uses. Run automatically before `dev` and `build`.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const botsDir = resolve(here, "../../../../bots");
const outFile = resolve(here, "../src/catalog.generated.json");

/**
 * Per-strategy key overrides where the `broker` line doesn't tell the whole story.
 * PolyCrypt9000 (engine/src/polycrypt.ts): only the Alpaca crypto sleeve places
 * real paper orders; the Polymarket sleeve is shadow-only (no key needed) and the
 * Kalshi demo sleeve is optional.
 */
const KEY_OVERRIDES = {
  polycrypt9000: { requires: ["alpaca"], optional: ["kalshi", "polymarket"] },
};

const CATEGORY = {
  us_stocks: "Stocks",
  us_options: "Options",
  "polymarket + crypto": "Crypto + prediction markets",
};

/** "6 (premium paid per position)" → 6; "3 (...) / 15 (...)" → null (ambiguous). */
function capNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  if (value.includes("/")) return null;
  const m = value.match(/^\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function firstParagraph(body) {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => l.trim() && !l.startsWith("#"));
  if (start < 0) return "";
  const para = [];
  for (const l of lines.slice(start)) {
    if (!l.trim()) break;
    para.push(l.trim());
  }
  return para.join(" ");
}

const files = readdirSync(botsDir).filter((f) => f.endsWith(".md"));
const catalog = files
  .map((file) => {
    const { data, content } = matter(readFileSync(join(botsDir, file), "utf8"));
    const broker = String(data.broker ?? "").toLowerCase();
    const requires = ["alpaca", "kalshi", "polymarket"].filter((p) => broker.includes(p));
    const risk = data.risk ?? {};
    return {
      codename: data.codename,
      name: data.name,
      category: CATEGORY[data.market] ?? String(data.market ?? "Other"),
      market: data.market,
      broker: data.broker,
      strategy: data.strategy,
      timeframe: data.timeframe ?? null,
      schedule: data.schedule ?? null,
      universe: Array.isArray(data.universe)
        ? data.universe.map(String)
        : Array.isArray(data.candidate_pool)
          ? data.candidate_pool.map(String)
          : [],
      universeNote: Array.isArray(data.universe) ? null : String(data.universe ?? ""),
      rules: data.rules ?? {},
      risk,
      caps: {
        maxPositionPct: capNumber(risk.max_position_pct),
        maxDailyLossPct: capNumber(risk.max_daily_loss_pct),
        maxPositions: capNumber(risk.max_positions),
      },
      color: data.viz?.color ?? "#94a3b8",
      requires: KEY_OVERRIDES[data.codename]?.requires ?? requires,
      optional: KEY_OVERRIDES[data.codename]?.optional ?? [],
      summary: firstParagraph(content),
    };
  })
  .filter((s) => s.codename && s.requires.length > 0)
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

writeFileSync(outFile, JSON.stringify(catalog, null, 2) + "\n");
console.log(`[catalog] ${catalog.length} strategies → ${outFile}`);
