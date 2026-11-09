import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { botIdentitySchema } from "./schema.js";
import type { BotConfig } from "./types.js";

/**
 * Default bots directory: the `bots/` folder next to this monorepo
 * (app/packages/shared/src → up four levels → trading-bots/, then `bots/`).
 */
export function defaultBotsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "../../../../bots");
}

/** BOTS_DIR env wins; an empty/unset value falls back to the default. */
export function resolveBotsDir(): string {
  const fromEnv = process.env.BOTS_DIR;
  return fromEnv && fromEnv.trim() ? resolve(fromEnv) : defaultBotsDir();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((v): v is string => typeof v === "string");
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Parse and validate a single bot .md file. Throws on invalid identity fields. */
export function loadBotFile(filePath: string): BotConfig {
  const parsed = matter(readFileSync(filePath, "utf8"));
  const data = isRecord(parsed.data) ? parsed.data : {};

  const identity = botIdentitySchema.parse({
    name: data.name,
    codename: data.codename,
    enabled: data.enabled,
    mode: data.mode,
    market: data.market,
    broker: data.broker,
    strategy: data.strategy,
    viz: data.viz,
  });

  return {
    ...identity,
    universe: data.universe,
    watchlist_examples: asStringArray(data.watchlist_examples),
    candidate_pool: asStringArray(data.candidate_pool),
    timeframe: asString(data.timeframe),
    schedule: asString(data.schedule),
    rules: isRecord(data.rules) ? data.rules : {},
    risk: isRecord(data.risk) ? data.risk : {},
    philosophy: parsed.content.trim(),
    sourcePath: filePath,
    raw: data,
  };
}

/**
 * POLYMARKET-ONLY VARIANT (branch `polymarket-only`, Keith's call
 * 2026-11-08): this build is a single-bot app. No matter which bot
 * files sit in the bots directory, only PolyCrypt9000 is ever loaded —
 * by the engine, by the API's GET /bots, and by the Risk Gate control
 * store, which all share this loader. The other bots' files may still
 * exist on this branch (inherited from `dev`; the GitHub snapshot
 * push route cannot delete files), but they are inert: filtered out
 * here, so they are never listed, never controlled, never traded.
 */
export const ONLY_BOT_CODENAME = "polycrypt9000";

/**
 * Load the bot(s) in a directory. Only top-level `*.md` files are
 * read — subfolders (e.g. `bots/retired/`) are never recursed into —
 * and on this variant the result is filtered to ONLY_BOT_CODENAME.
 */
export function loadBots(dir: string = resolveBotsDir()): BotConfig[] {
  const files = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
  return files
    .map((name) => loadBotFile(join(dir, name)))
    .filter((bot) => bot.codename === ONLY_BOT_CODENAME);
}
