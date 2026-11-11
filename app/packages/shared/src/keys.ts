import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

/**
 * PHASE 12 (v21) — local key-file loader for paper trading.
 *
 * Keith's direction (2026-11-10): the app pulls the keys it needs for
 * Alpaca and Kalshi PAPER trading from a local text file on his Mac —
 * later the same loader will read from a vault. To make that swap a
 * one-file change, resolution goes through the tiny `SecretProvider`
 * interface below: today there are two providers (the keys file, then
 * the process environment); a vault provider slots in ahead of them
 * without touching any caller.
 *
 * File: `KEYS_FILE` env var, default `~/traderbot-keys.txt` — outside
 * the repo on purpose, so real keys can never ride a commit. Format is
 * dotenv-style: `KEY=VALUE` lines, `#` comments, blank lines, optional
 * surrounding quotes. Recognized entries:
 *
 *   ALPACA_API_KEY_ID        Alpaca PAPER account key id
 *   ALPACA_API_SECRET_KEY    Alpaca PAPER account secret
 *   KALSHI_API_KEY_ID        Kalshi demo key id (demo.kalshi.co)
 *   KALSHI_PRIVATE_KEY_PATH  path to the Kalshi demo RSA .pem file
 *   KALSHI_ENV               must be "demo" (default) — anything else
 *                            is REFUSED in this phase (no production)
 *
 * The environment remains a fallback (the pre-v21 names ALPACA_API_KEY
 * / ALPACA_API_SECRET included), so nothing breaks when the file is
 * absent: a missing file is not an error, it just means "not loaded
 * from file" and the paper runners say so in their decision records.
 *
 * SECURITY INVARIANTS (do not weaken):
 * - Secret VALUES are never logged, never returned by any API, never
 *   written to state files or decision records. This module's status
 *   surface exposes only: per-provider `loaded`, the source the key id
 *   came from, and the last 4 characters of the key ID (never of a
 *   secret or a PEM).
 * - The Kalshi PEM is read into memory only; its contents never leave
 *   this module except as the signing key inside the Kalshi client.
 */

/** One source of secrets. A future vault implements this same shape. */
export interface SecretProvider {
  readonly name: "file" | "env" | "vault";
  get(key: string): string | undefined;
}

export type KeySourceName = "file" | "env" | "none";

export interface ProviderKeyStatus {
  /** True when every credential this provider needs was resolved. */
  loaded: boolean;
  /** Where the key ID came from ("none" when not loaded). */
  source: KeySourceName;
  /** Last 4 chars of the key ID; null when absent or too short to mask safely. */
  keyIdTail: string | null;
  /** Human-safe explanation when not loaded (never contains a secret). */
  detail: string | null;
}

export interface KeysStatus {
  keysFile: { path: string; exists: boolean };
  alpaca: ProviderKeyStatus;
  kalshi: ProviderKeyStatus & {
    /** The requested Kalshi environment ("demo" unless overridden). */
    env: string;
    /** True when a non-demo KALSHI_ENV was refused (this phase: demo only). */
    refused: boolean;
  };
}

export interface PaperKeys {
  alpacaKeyId: string | null;
  alpacaSecretKey: string | null;
  kalshiKeyId: string | null;
  /** PEM contents (memory only), or null when unavailable/unreadable. */
  kalshiPrivateKeyPem: string | null;
  kalshiEnv: string;
  status: KeysStatus;
}

export interface KeysLoaderOptions {
  /** Environment to read (defaults to process.env). Tests pass a map. */
  env?: NodeJS.ProcessEnv;
  /** Explicit keys-file path (defaults to KEYS_FILE or ~/traderbot-keys.txt). */
  keysFilePath?: string;
}

/** `~/x` and bare `~` expand against the user's home directory. */
export function expandHome(path: string): string {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return resolve(homedir(), path.slice(2));
  return path;
}

/** The keys-file path in force: KEYS_FILE env, else ~/traderbot-keys.txt. */
export function resolveKeysFilePath(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env.KEYS_FILE ?? "").trim();
  return expandHome(raw !== "" ? raw : "~/traderbot-keys.txt");
}

/**
 * Parse dotenv-style text into a map. Rules: one `KEY=VALUE` per line,
 * `#` comment lines and blank lines skipped, whitespace trimmed, one
 * pair of surrounding single/double quotes stripped from the value.
 * Lines without `=` or with an invalid key name are ignored (never an
 * error — a hand-edited file shouldn't crash the engine).
 */
export function parseKeysText(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (value !== "") out.set(key, value);
  }
  return out;
}

function tail(keyId: string | null): string | null {
  if (!keyId || keyId.length <= 4) return null;
  return keyId.slice(-4);
}

/**
 * Resolve paper-trading keys through the provider chain (keys file
 * first — it is the newer source of truth — environment as fallback).
 * Pure with respect to its options: callers that want the process-wide
 * answer use `getPaperKeys()`.
 */
export function loadPaperKeys(options: KeysLoaderOptions = {}): PaperKeys {
  const env = options.env ?? process.env;
  const keysFilePath = options.keysFilePath ?? resolveKeysFilePath(env);

  let fileValues = new Map<string, string>();
  let fileExists = false;
  try {
    if (existsSync(keysFilePath)) {
      fileExists = true;
      fileValues = parseKeysText(readFileSync(keysFilePath, "utf8"));
    }
  } catch {
    // An unreadable keys file behaves like an absent one; the status
    // detail below says the file exists but yielded nothing usable.
    fileExists = true;
    fileValues = new Map();
  }

  const providers: SecretProvider[] = [
    { name: "file", get: (k) => fileValues.get(k) },
    {
      name: "env",
      get: (k) => {
        const v = env[k];
        return v !== undefined && v.trim() !== "" ? v.trim() : undefined;
      },
    },
  ];

  /** First hit wins, providers in order, candidate names in order. */
  const resolve = (
    candidates: readonly string[],
  ): { value: string; source: KeySourceName } | null => {
    for (const provider of providers) {
      for (const name of candidates) {
        const value = provider.get(name);
        if (value !== undefined && value !== "") {
          return { value, source: provider.name as KeySourceName };
        }
      }
    }
    return null;
  };

  // --- Alpaca (paper). The keys file uses Alpaca's own names; the
  // pre-v21 environment names remain as fallback candidates.
  const alpacaId = resolve(["ALPACA_API_KEY_ID", "ALPACA_API_KEY"]);
  const alpacaSecret = resolve(["ALPACA_API_SECRET_KEY", "ALPACA_API_SECRET"]);
  const alpacaLoaded = alpacaId !== null && alpacaSecret !== null;

  // --- Kalshi (demo only in this phase).
  const kalshiEnvHit = resolve(["KALSHI_ENV"]);
  const kalshiEnv = (kalshiEnvHit?.value ?? "demo").trim().toLowerCase();
  const kalshiRefused = kalshiEnv !== "demo";
  const kalshiId = resolve(["KALSHI_API_KEY_ID"]);
  const pemPathHit = resolve(["KALSHI_PRIVATE_KEY_PATH"]);
  let kalshiPem: string | null = null;
  let pemProblem: string | null = null;
  if (pemPathHit) {
    try {
      kalshiPem = readFileSync(expandHome(pemPathHit.value), "utf8");
      if (!kalshiPem.includes("PRIVATE KEY")) {
        kalshiPem = null;
        pemProblem = "the file at KALSHI_PRIVATE_KEY_PATH is not a PEM private key";
      }
    } catch {
      pemProblem = "the Kalshi private key file could not be read";
    }
  }
  const kalshiLoaded = !kalshiRefused && kalshiId !== null && kalshiPem !== null;

  const status: KeysStatus = {
    keysFile: { path: keysFilePath, exists: fileExists },
    alpaca: {
      loaded: alpacaLoaded,
      source: alpacaLoaded ? (alpacaId?.source ?? "none") : "none",
      keyIdTail: tail(alpacaId?.value ?? null),
      detail: alpacaLoaded
        ? null
        : alpacaId === null && alpacaSecret === null
          ? "no Alpaca paper keys found in the keys file or environment"
          : "Alpaca paper key id and secret must both be present",
    },
    kalshi: {
      loaded: kalshiLoaded,
      source: kalshiLoaded ? (kalshiId?.source ?? "none") : "none",
      keyIdTail: tail(kalshiId?.value ?? null),
      env: kalshiEnv,
      refused: kalshiRefused,
      detail: kalshiLoaded
        ? null
        : kalshiRefused
          ? `KALSHI_ENV "${kalshiEnv}" refused — this build trades Kalshi demo only`
          : pemProblem ??
            (kalshiId === null
              ? "no Kalshi demo key id found in the keys file or environment"
              : "KALSHI_PRIVATE_KEY_PATH is not set"),
    },
  };

  return {
    alpacaKeyId: alpacaLoaded ? (alpacaId?.value ?? null) : null,
    alpacaSecretKey: alpacaLoaded ? (alpacaSecret?.value ?? null) : null,
    kalshiKeyId: kalshiLoaded ? (kalshiId?.value ?? null) : null,
    kalshiPrivateKeyPem: kalshiLoaded ? kalshiPem : null,
    kalshiEnv,
    status,
  };
}

let cached: PaperKeys | null = null;

/** Process-wide keys, loaded once at first use. */
export function getPaperKeys(): PaperKeys {
  if (cached === null) cached = loadPaperKeys();
  return cached;
}

/** Test hook: drop the cached load so a changed file/env is re-read. */
export function resetPaperKeysCacheForTests(): void {
  cached = null;
}

/** One-line, secret-free summary for boot logs. */
export function describeKeysStatus(status: KeysStatus): string {
  const fmt = (p: ProviderKeyStatus): string =>
    p.loaded
      ? `loaded (from ${p.source}, key …${p.keyIdTail ?? "????"})`
      : `not loaded — ${p.detail ?? "missing"}`;
  return (
    `alpaca paper: ${fmt(status.alpaca)}; kalshi demo: ${fmt(status.kalshi)}; ` +
    `keys file ${status.keysFile.path} ${status.keysFile.exists ? "found" : "not found"}`
  );
}
