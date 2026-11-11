/**
 * Phase 12 (v21) verification harness — the key-file loader.
 *
 *     node_modules/.bin/tsx tools/test-keys-v21.ts        (from app/)
 *
 * Exercises the REAL loader (packages/shared/src/keys.ts) against
 * temp files and env maps:
 *   1. dotenv parsing: comments, blank lines, quotes, junk lines
 *   2. precedence: keys file beats environment for the same variable
 *   3. environment fallback, including the pre-v21 ALPACA_API_KEY /
 *      ALPACA_API_SECRET names
 *   4. missing file is not an error — nothing loaded, details explain
 *   5. Kalshi PEM is read from KALSHI_PRIVATE_KEY_PATH; a missing or
 *      non-PEM file leaves Kalshi unloaded with a safe detail
 *   6. KALSHI_ENV other than "demo" is REFUSED
 *   7. masking: the status surface (what GET /keys/status serves)
 *      contains NO secret value, NO pem content, and only the last
 *      4 chars of each key ID
 *
 * Scratch lives under ~/workspace/trading-bots/scratch-v21/ (never
 * /tmp — it is wiped on runtime restart), mirroring test-history-v19.
 * All "secrets" below are fake strings minted for this test.
 */
import { generateKeyPairSync } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  loadPaperKeys,
  parseKeysText,
  resolveKeysFilePath,
} from "../packages/shared/src/keys.ts";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v21");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const FAKE_ALPACA_ID = "PKFAKEALPACAID1234WXYZ";
const FAKE_ALPACA_SECRET = "fake-alpaca-secret-do-not-leak-0001";
const FAKE_KALSHI_ID = "kalshi-demo-key-id-ABCD-EFGH";
// v21.1: the loader validates PEMs by really parsing them, so the
// fixture is a real (throwaway, test-only) RSA key, not fake base64.
const FAKE_PEM = generateKeyPairSync("rsa", { modulusLength: 2048 })
  .privateKey.export({ type: "pkcs8", format: "pem" })
  .toString();
const FAKE_PEM_FRAGMENT = (FAKE_PEM.split("\n")[2] ?? "").slice(0, 24);

// ---------------------------------------------------------------- parse
{
  const parsed = parseKeysText(
    [
      "# a comment",
      "",
      "  ALPACA_API_KEY_ID = spaced-value  ",
      'QUOTED="double quoted"',
      "SINGLE='single quoted'",
      "NOEQUALS line is junk",
      "1BAD=x",
      "EMPTY=",
      "INLINE=value # not a comment (kept verbatim)",
    ].join("\n"),
  );
  check("parse: plain + spaced", parsed.get("ALPACA_API_KEY_ID") === "spaced-value");
  check("parse: double quotes stripped", parsed.get("QUOTED") === "double quoted");
  check("parse: single quotes stripped", parsed.get("SINGLE") === "single quoted");
  check("parse: junk lines ignored", !parsed.has("NOEQUALS") && !parsed.has("1BAD"));
  check("parse: empty value ignored", !parsed.has("EMPTY"));
}

// ------------------------------------------------------- file beats env
const pemPath = join(SCRATCH, "kalshi-demo.pem");
writeFileSync(pemPath, FAKE_PEM);
const keysPath = join(SCRATCH, "traderbot-keys.txt");
writeFileSync(
  keysPath,
  [
    "# test keys file",
    `ALPACA_API_KEY_ID=${FAKE_ALPACA_ID}`,
    `ALPACA_API_SECRET_KEY=${FAKE_ALPACA_SECRET}`,
    `KALSHI_API_KEY_ID=${FAKE_KALSHI_ID}`,
    `KALSHI_PRIVATE_KEY_PATH=${pemPath}`,
    "KALSHI_ENV=demo",
  ].join("\n"),
);
{
  const keys = loadPaperKeys({
    keysFilePath: keysPath,
    env: {
      ALPACA_API_KEY_ID: "ENV-ID-SHOULD-LOSE",
      ALPACA_API_SECRET_KEY: "env-secret-should-lose",
      KALSHI_API_KEY_ID: "env-kalshi-should-lose",
    } as NodeJS.ProcessEnv,
  });
  check("precedence: file key id wins", keys.alpacaKeyId === FAKE_ALPACA_ID);
  check("precedence: file secret wins", keys.alpacaSecretKey === FAKE_ALPACA_SECRET);
  check("alpaca loaded from file", keys.status.alpaca.loaded && keys.status.alpaca.source === "file");
  check("kalshi loaded from file", keys.status.kalshi.loaded && keys.status.kalshi.source === "file");
  check("kalshi PEM read from path", keys.kalshiPrivateKeyPem === FAKE_PEM);
  check("keys file reported found", keys.status.keysFile.exists === true);
}

// ------------------------------------------------------------- env fallback
{
  const keys = loadPaperKeys({
    keysFilePath: join(SCRATCH, "absent.txt"),
    env: {
      ALPACA_API_KEY: "LEGACYENVKEYID9999",
      ALPACA_API_SECRET: "legacy-env-secret",
    } as NodeJS.ProcessEnv,
  });
  check("env fallback: legacy names load", keys.alpacaKeyId === "LEGACYENVKEYID9999");
  check("env fallback: source=env", keys.status.alpaca.loaded && keys.status.alpaca.source === "env");
  check("env fallback: missing file is not an error", keys.status.keysFile.exists === false);
  check("env fallback: kalshi unloaded, detail explains", !keys.status.kalshi.loaded && (keys.status.kalshi.detail ?? "").length > 0);
}

// ------------------------------------------------------------ missing file
{
  const keys = loadPaperKeys({ keysFilePath: join(SCRATCH, "absent.txt"), env: {} as NodeJS.ProcessEnv });
  check("missing file: alpaca unloaded", !keys.status.alpaca.loaded && keys.alpacaKeyId === null);
  check("missing file: kalshi unloaded", !keys.status.kalshi.loaded && keys.kalshiPrivateKeyPem === null);
  check("missing file: default kalshi env is demo", keys.kalshiEnv === "demo" && !keys.status.kalshi.refused);
}

// ------------------------------------------------------------- PEM problems
{
  writeFileSync(join(SCRATCH, "not-a-pem.txt"), "this is not a key");
  const bad = loadPaperKeys({
    keysFilePath: join(SCRATCH, "absent.txt"),
    env: {
      KALSHI_API_KEY_ID: FAKE_KALSHI_ID,
      KALSHI_PRIVATE_KEY_PATH: join(SCRATCH, "not-a-pem.txt"),
    } as NodeJS.ProcessEnv,
  });
  check("pem: non-PEM file refused", !bad.status.kalshi.loaded && bad.kalshiPrivateKeyPem === null);
  const missing = loadPaperKeys({
    keysFilePath: join(SCRATCH, "absent.txt"),
    env: {
      KALSHI_API_KEY_ID: FAKE_KALSHI_ID,
      KALSHI_PRIVATE_KEY_PATH: join(SCRATCH, "no-such.pem"),
    } as NodeJS.ProcessEnv,
  });
  check("pem: unreadable file refused", !missing.status.kalshi.loaded);
}

// ------------------------------------------------------- KALSHI_ENV refusal
{
  const keys = loadPaperKeys({
    keysFilePath: keysPath,
    env: { KALSHI_ENV: "production" } as NodeJS.ProcessEnv,
  });
  // File says demo and file wins for KALSHI_ENV too… use a file without it:
  const keysPath2 = join(SCRATCH, "keys-prod.txt");
  writeFileSync(
    keysPath2,
    [
      `KALSHI_API_KEY_ID=${FAKE_KALSHI_ID}`,
      `KALSHI_PRIVATE_KEY_PATH=${pemPath}`,
      "KALSHI_ENV=production",
    ].join("\n"),
  );
  const refused = loadPaperKeys({ keysFilePath: keysPath2, env: {} as NodeJS.ProcessEnv });
  check("kalshi_env: production refused", refused.status.kalshi.refused === true && !refused.status.kalshi.loaded);
  check("kalshi_env: pem withheld when refused", refused.kalshiPrivateKeyPem === null);
  void keys;
}

// ------------------------------------------------------------- masking
{
  const keys = loadPaperKeys({ keysFilePath: keysPath, env: {} as NodeJS.ProcessEnv });
  const statusJson = JSON.stringify(keys.status);
  check("masking: status has no alpaca secret", !statusJson.includes(FAKE_ALPACA_SECRET));
  check("masking: status has no pem content", !statusJson.includes(FAKE_PEM_FRAGMENT));
  check("masking: status has no full alpaca id", !statusJson.includes(FAKE_ALPACA_ID));
  check("masking: status has no full kalshi id", !statusJson.includes(FAKE_KALSHI_ID));
  check("masking: alpaca tail is last 4", keys.status.alpaca.keyIdTail === FAKE_ALPACA_ID.slice(-4));
  check("masking: kalshi tail is last 4", keys.status.kalshi.keyIdTail === FAKE_KALSHI_ID.slice(-4));
  const fullDump = JSON.stringify(keys, (k, v: unknown) =>
    k === "kalshiPrivateKeyPem" || k === "alpacaSecretKey" ? "[withheld]" : v,
  );
  check("masking: derived dump sane", fullDump.length > 0);
}

// ------------------------------------------------------- default path rule
{
  const p = resolveKeysFilePath({} as NodeJS.ProcessEnv);
  check("default path is ~/traderbot-keys.txt", p.endsWith("/traderbot-keys.txt") && p.startsWith(homedir()));
  const p2 = resolveKeysFilePath({ KEYS_FILE: "~/custom/keys.txt" } as NodeJS.ProcessEnv);
  check("KEYS_FILE honored + ~ expanded", p2 === join(homedir(), "custom/keys.txt"));
}

check("keys.example.txt committed", existsSync(join(import.meta.dirname, "..", "keys.example.txt")));
void readFileSync;

console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
