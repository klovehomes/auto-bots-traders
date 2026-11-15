import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadBotFile } from "@fleet/shared";
import type { BotConfig } from "@fleet/shared/types";

/**
 * Watch List candidates (v30): the server-side home of "which symbols
 * may this bot trade".
 *
 * The bot .md files stay the single source of truth — the engine
 * loader reads them at boot — so an add here edits the same file the
 * engine reads. The API re-reads the file from disk on every call
 * (its boot-time `bots` array goes stale the moment a file changes),
 * and the engine picks a new symbol up on its next restart: runners
 * capture their pool at boot (engine/src/index.ts loads the bots
 * once), so there is no honest "live reload" to offer — the POST
 * response says so plainly instead of pretending otherwise.
 *
 * PolyCrypt9000 has no stock list: her pairs are hardcoded in the
 * engine (polycrypt.ts `CRYPTO_PAIRS`), so she is read-only here.
 */

/** PolyCrypt9000's crypto pairs — mirrors polycrypt.ts `CRYPTO_PAIRS`. */
export const POLYCRYPT_CRYPTO_PAIRS = ["BTC/USD", "ETH/USD", "SOL/USD"] as const;

export type CandidateField = "universe" | "candidate_pool" | "watchlist_examples" | "crypto_pairs";

export interface CandidateList {
  codename: string;
  name: string;
  /** Which .md field holds this bot's list (crypto_pairs = read-only). */
  field: CandidateField;
  symbols: string[];
  editable: boolean;
  /** Absolute path of the bot's .md file. */
  sourcePath: string;
}

/** HTTP-mapped error: the route translates `status` straight through. */
export class CandidateError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Which field holds a bot's tradable list, and whether it can grow. */
export function candidateFieldFor(bot: BotConfig): {
  field: CandidateField;
  symbols: string[];
  editable: boolean;
} {
  if (bot.codename === "polycrypt9000") {
    return {
      field: "crypto_pairs",
      symbols: [...POLYCRYPT_CRYPTO_PAIRS],
      editable: false,
    };
  }
  if (Array.isArray(bot.universe)) {
    return {
      field: "universe",
      symbols: bot.universe.filter((v): v is string => typeof v === "string"),
      editable: true,
    };
  }
  if (Array.isArray(bot.candidate_pool) && bot.candidate_pool.length > 0) {
    return { field: "candidate_pool", symbols: [...bot.candidate_pool], editable: true };
  }
  if (Array.isArray(bot.watchlist_examples) && bot.watchlist_examples.length > 0) {
    return { field: "watchlist_examples", symbols: [...bot.watchlist_examples], editable: true };
  }
  // No list field yet: a new candidate_pool line will be created on add.
  return { field: "candidate_pool", symbols: [], editable: true };
}

/** Find a bot's .md file by codename, reading the directory fresh. */
export function findBotFile(botsDir: string, codename: string): string | null {
  const files = readdirSync(botsDir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name)
    .sort();
  for (const name of files) {
    const path = join(botsDir, name);
    try {
      if (loadBotFile(path).codename === codename) return path;
    } catch {
      // A broken file is not this bot — skip it, don't fail the lookup.
      continue;
    }
  }
  return null;
}

/** Read a bot's candidate list straight from its .md file on disk. */
export function readCandidates(botsDir: string, codename: string): CandidateList | null {
  const path = findBotFile(botsDir, codename);
  if (!path) return null;
  const bot = loadBotFile(path);
  const { field, symbols, editable } = candidateFieldFor(bot);
  return { codename: bot.codename, name: bot.name, field, symbols, editable, sourcePath: path };
}

/** A US-equity ticker: letters/digits plus the "." in BRK.B and "-" in some issues. */
export const SYMBOL_RE = /^[A-Z0-9.\-]{1,12}$/;

export function normalizeSymbol(raw: unknown): string {
  if (typeof raw !== "string") {
    throw new CandidateError(400, "symbol must be a string");
  }
  const symbol = raw.trim().toUpperCase();
  if (!SYMBOL_RE.test(symbol)) {
    throw new CandidateError(
      400,
      `invalid symbol: ${JSON.stringify(raw)} (expected a US-equity ticker)`,
    );
  }
  return symbol;
}

/**
 * Append one symbol to a bot's list field in its .md file. Only the
 * single field line changes — the rest of the file is preserved
 * byte-for-byte (a full YAML re-serialize would reflow every list and
 * comment in the file). The file is re-parsed afterwards to prove the
 * edit is still a valid bot file.
 */
export function appendCandidate(
  botsDir: string,
  codename: string,
  rawSymbol: string,
): CandidateList {
  const symbol = normalizeSymbol(rawSymbol);
  const current = readCandidates(botsDir, codename);
  if (!current) {
    throw new CandidateError(404, `unknown bot: ${codename}`);
  }
  if (!current.editable) {
    throw new CandidateError(
      400,
      `${current.name} has no stock candidate list — her crypto pairs are fixed in the engine`,
    );
  }
  if (current.symbols.includes(symbol)) {
    throw new CandidateError(409, `${symbol} is already in ${current.name}'s candidate list`);
  }
  const text = readFileSync(current.sourcePath, "utf8");
  const field = current.field;
  const lines = text.split("\n");
  const fieldRe = new RegExp(`^([ \\t]*${field}:[ \\t]*\\[)([^\\]\\n]*)\\]`);
  let rewritten = false;
  for (let i = 0; i < lines.length; i++) {
    const m = fieldRe.exec(lines[i]!);
    if (!m) continue;
    const items = m[2]!.trim();
    lines[i] = `${m[1]}${items === "" ? symbol : `${items}, ${symbol}`}]`;
    rewritten = true;
    break;
  }
  if (!rewritten) {
    // No single-line field list to append to. If a field line exists
    // at all it must be a multi-line list we cannot safely edit by
    // line — refuse rather than write a duplicate field.
    if (lines.some((l) => new RegExp(`^[ \\t]*${field}:`).test(l))) {
      throw new CandidateError(
        500,
        `${current.name}'s ${field} list is not a single-line list — refusing to edit it by hand`,
      );
    }
    // No field line yet: create one right after watchlist_examples /
    // universe / codename, whichever comes first in the frontmatter.
    const anchorRe = /^(watchlist_examples|universe|codename):/;
    const at = lines.findIndex((l) => anchorRe.test(l));
    const insert = `${field}: [${symbol}]`;
    if (at >= 0) lines.splice(at + 1, 0, insert);
    else lines.splice(1, 0, insert);
  }
  writeFileSync(current.sourcePath, lines.join("\n"), "utf8");
  // Prove the edit parses as the same bot with the symbol in its list.
  const after = readCandidates(botsDir, codename);
  if (!after || !after.symbols.includes(symbol)) {
    throw new CandidateError(500, `failed to verify ${symbol} in ${current.name}'s file after writing`);
  }
  return after;
}

// --- Alpaca asset lookup (v30 symbol search) --------------------------
// Same keys and host split as the engine's Alpaca client (alpaca.ts):
// the paper Trading API host for paper accounts, the live host
// otherwise. Raw REST — the JS SDK has no assets-search surface.

export interface AlpacaKeys {
  keyId: string | null;
  secretKey: string | null;
}

export interface SymbolResult {
  symbol: string;
  name: string;
  exchange: string;
}

function alpacaHost(): string {
  const paper = (process.env.ALPACA_PAPER ?? "true") !== "false";
  return paper
    ? "https://paper-api.alpaca.markets"
    : "https://api.alpaca.markets";
}

type FetchFn = typeof fetch;

function alpacaHeaders(keys: AlpacaKeys): Record<string, string> {
  return {
    "APCA-API-KEY-ID": keys.keyId ?? "",
    "APCA-API-SECRET-KEY": keys.secretKey ?? "",
  };
}

function requireKeys(keys: AlpacaKeys): void {
  if (!keys.keyId || !keys.secretKey) {
    throw new CandidateError(
      503,
      "symbol search unavailable — Alpaca paper keys are not configured",
    );
  }
}

/**
 * Search active US equities by ticker or company name. Returns at most
 * 8, exact/prefix matches first. Throws CandidateError(502) when the
 * Alpaca call itself fails.
 */
export async function searchAssets(
  query: string,
  keys: AlpacaKeys,
  fetchImpl: FetchFn = fetch,
): Promise<SymbolResult[]> {
  requireKeys(keys);
  const q = query.trim();
  if (q.length === 0 || q.length > 30) {
    throw new CandidateError(400, "search query must be 1–30 characters");
  }
  const url = new URL(`${alpacaHost()}/v2/assets`);
  url.searchParams.set("status", "active");
  url.searchParams.set("asset_class", "us_equity");
  url.searchParams.set("search", q);
  const res = await fetchImpl(url, { headers: alpacaHeaders(keys) });
  if (!res.ok) {
    throw new CandidateError(
      502,
      `Alpaca asset search failed: HTTP ${res.status}`,
    );
  }
  const body = (await res.json()) as {
    symbol?: unknown;
    name?: unknown;
    exchange?: unknown;
    tradable?: unknown;
  }[];
  const upper = q.toUpperCase();
  const out: SymbolResult[] = [];
  for (const a of Array.isArray(body) ? body : []) {
    if (a.tradable === false) continue;
    if (typeof a.symbol !== "string" || typeof a.name !== "string") continue;
    out.push({
      symbol: a.symbol.toUpperCase(),
      name: a.name,
      exchange: typeof a.exchange === "string" ? a.exchange : "",
    });
  }
  out.sort((x, y) => {
    const px = x.symbol.startsWith(upper) ? 0 : 1;
    const py = y.symbol.startsWith(upper) ? 0 : 1;
    return px - py || (x.symbol < y.symbol ? -1 : x.symbol > y.symbol ? 1 : 0);
  });
  return out.slice(0, 8);
}

/**
 * Exact asset lookup for POST validation: the symbol must exist as an
 * active, tradable US equity. Returns null when Alpaca 404s it.
 */
export async function fetchAsset(
  symbol: string,
  keys: AlpacaKeys,
  fetchImpl: FetchFn = fetch,
): Promise<SymbolResult | null> {
  requireKeys(keys);
  const url = new URL(
    `${alpacaHost()}/v2/assets/${encodeURIComponent(symbol)}`,
  );
  const res = await fetchImpl(url, { headers: alpacaHeaders(keys) });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new CandidateError(
      502,
      `Alpaca asset lookup failed: HTTP ${res.status}`,
    );
  }
  const a = (await res.json()) as {
    symbol?: unknown;
    name?: unknown;
    exchange?: unknown;
    status?: unknown;
    tradable?: unknown;
    asset_class?: unknown;
  };
  if (typeof a.symbol !== "string" || typeof a.name !== "string") return null;
  if (a.status !== undefined && a.status !== "active") return null;
  if (a.tradable === false) return null;
  return {
    symbol: a.symbol.toUpperCase(),
    name: a.name,
    exchange: typeof a.exchange === "string" ? a.exchange : "",
  };
}
