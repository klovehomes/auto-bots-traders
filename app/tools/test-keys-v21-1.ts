/**
 * Phase 12 (v21.1) verification harness — Kalshi private key INLINE
 * in the keys file (the Docker mount fix).
 *
 *     node_modules/.bin/tsx tools/test-keys-v21-1.ts        (from app/)
 *
 * Background: v21's loader read the Kalshi PEM from
 * KALSHI_PRIVATE_KEY_PATH, but compose mounts ONLY the keys file
 * into the containers — a host .pem path doesn't exist inside them,
 * so Kalshi could never load under Docker. v21.1 lets the PEM live
 * inside the keys file as KALSHI_PRIVATE_KEY (multi-line block or
 * single-line `\n`-escaped), validated by really parsing it.
 *
 * Exercises the REAL loader (packages/shared/src/keys.ts):
 *   1. parser captures a multi-line PEM block whole; entries before
 *      and after it survive; a missing END line can't swallow the
 *      entries that follow
 *   2. inline block loads and is SIGN-READY (RSA-PSS sign/verify,
 *      Kalshi's scheme) using the loaded PEM
 *   3. single-line `\n`-escaped form loads (file and env sources)
 *   4. invalid inline PEM → not loaded, exact safe detail string
 *   5. PATH unreadable + valid inline → loads via inline
 *   6. PATH valid + inline present → PATH wins
 *   7. PATH file that isn't a real key → parse-based problem string
 *   8. the committed template's placeholder block does NOT load
 *   9. masking: status JSON / boot summary contain no PEM fragment
 *
 * Scratch lives under ~/workspace/trading-bots/scratch-v21-1/,
 * mirroring test-keys-v21. Keys are throwaway RSA pairs minted here.
 */
import {
  createPrivateKey,
  createSign,
  createVerify,
  generateKeyPairSync,
  constants,
} from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  describeKeysStatus,
  loadPaperKeys,
  parseKeysText,
} from "../packages/shared/src/keys.ts";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const SCRATCH = join(homedir(), "workspace/trading-bots/scratch-v21-1");
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const pairA = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pairB = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PEM_A = pairA.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const PEM_B = pairB.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const KALSHI_ID = "kalshi-demo-inline-test-1234";
const NO_ENV = {} as NodeJS.ProcessEnv;

function derBase64(pem: string): string {
  return createPrivateKey(pem).export({ type: "pkcs8", format: "der" }).toString("base64");
}

/** RSA-PSS (SHA-256, salt 32) sign+verify — Kalshi's exact scheme. */
function signsReady(pem: string, publicKey: typeof pairA.publicKey): boolean {
  try {
    const payload = "1700000000000GET/trade-api/v2/portfolio/balance";
    const signer = createSign("SHA256");
    signer.update(payload);
    signer.end();
    const sig = signer.sign({
      key: createPrivateKey(pem),
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    });
    const verifier = createVerify("SHA256");
    verifier.update(payload);
    verifier.end();
    return verifier.verify(
      { key: publicKey, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 },
      sig,
    );
  } catch {
    return false;
  }
}

function writeKeys(name: string, lines: string[]): string {
  const p = join(SCRATCH, name);
  writeFileSync(p, lines.join("\n"));
  return p;
}

// ------------------------------------------------------- parser behavior
{
  const parsed = parseKeysText(
    [
      "BEFORE=one",
      `KALSHI_PRIVATE_KEY=${PEM_A.trimEnd()}`,
      "AFTER=two",
      "KALSHI_ENV=demo",
    ].join("\n"),
  );
  const block = parsed.get("KALSHI_PRIVATE_KEY") ?? "";
  check("parse: block captured with BEGIN line", block.startsWith("-----BEGIN PRIVATE KEY-----"));
  check("parse: block captured with END line", block.includes("-----END PRIVATE KEY-----"));
  check("parse: block body complete", derBase64(block) === derBase64(PEM_A));
  check("parse: entry before block intact", parsed.get("BEFORE") === "one");
  check("parse: entry after block intact", parsed.get("AFTER") === "two");
  check("parse: env entry after block intact", parsed.get("KALSHI_ENV") === "demo");
}
{
  // Missing END line: the next real entry must NOT be swallowed.
  const parsed = parseKeysText(
    [
      "KALSHI_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----",
      "AAAAB3NzaC1yc2EAAAADAQABAAABAQCfakefakefake",
      "KALSHI_ENV=demo",
      `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    ].join("\n"),
  );
  check("parse: missing END does not swallow KALSHI_ENV", parsed.get("KALSHI_ENV") === "demo");
  check("parse: missing END does not swallow key id", parsed.get("KALSHI_API_KEY_ID") === KALSHI_ID);
}

// ------------------------------------------------- inline block loads
const inlineBlockPath = writeKeys("keys-inline-block.txt", [
  `KALSHI_API_KEY_ID=${KALSHI_ID}`,
  `KALSHI_PRIVATE_KEY=${PEM_A.trimEnd()}`,
  "KALSHI_ENV=demo",
]);
{
  const keys = loadPaperKeys({ keysFilePath: inlineBlockPath, env: NO_ENV });
  check("inline block: kalshi loaded", keys.status.kalshi.loaded === true);
  check("inline block: source is file", keys.status.kalshi.source === "file");
  check("inline block: detail null", keys.status.kalshi.detail === null);
  check("inline block: pem parses", keys.kalshiPrivateKeyPem !== null && derBase64(keys.kalshiPrivateKeyPem) === derBase64(PEM_A));
  check("inline block: sign-ready (RSA-PSS)", keys.kalshiPrivateKeyPem !== null && signsReady(keys.kalshiPrivateKeyPem, pairA.publicKey));
}

// ------------------------------------------- single-line \n-escaped form
{
  const escaped = PEM_A.replace(/\n/g, "\\n");
  const p = writeKeys("keys-inline-escaped.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    `KALSHI_PRIVATE_KEY=${escaped}`,
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("inline escaped: kalshi loaded", keys.status.kalshi.loaded === true);
  check(
    "inline escaped: unescaped to the same key",
    keys.kalshiPrivateKeyPem !== null && derBase64(keys.kalshiPrivateKeyPem) === derBase64(PEM_A),
  );
  // …and via the environment provider.
  const envKeys = loadPaperKeys({
    keysFilePath: join(SCRATCH, "absent.txt"),
    env: { KALSHI_API_KEY_ID: KALSHI_ID, KALSHI_PRIVATE_KEY: escaped } as NodeJS.ProcessEnv,
  });
  check("inline escaped (env): loaded, source env", envKeys.status.kalshi.loaded && envKeys.status.kalshi.source === "env");
}

// ------------------------------------------------------- invalid inline
{
  const p = writeKeys("keys-inline-bad.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    "KALSHI_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----",
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "-----END PRIVATE KEY-----",
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("invalid inline: not loaded", keys.status.kalshi.loaded === false && keys.kalshiPrivateKeyPem === null);
  check(
    "invalid inline: exact detail",
    keys.status.kalshi.detail === "the inline KALSHI_PRIVATE_KEY is not a valid PEM private key",
    keys.status.kalshi.detail ?? "",
  );
}

// ------------------------------------------ PATH broken, inline saves it
{
  const p = writeKeys("keys-path-broken-inline-ok.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    `KALSHI_PRIVATE_KEY_PATH=${join(SCRATCH, "no-such-file.pem")}`,
    `KALSHI_PRIVATE_KEY=${PEM_A.trimEnd()}`,
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("path unreadable + inline valid: loaded", keys.status.kalshi.loaded === true);
  check("path unreadable + inline valid: no stale problem", keys.status.kalshi.detail === null);
}

// ------------------------------------------------------- PATH wins
{
  const pemFile = join(SCRATCH, "kalshi-a.pem");
  writeFileSync(pemFile, PEM_A);
  const p = writeKeys("keys-path-and-inline.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    `KALSHI_PRIVATE_KEY_PATH=${pemFile}`,
    `KALSHI_PRIVATE_KEY=${PEM_B.trimEnd()}`,
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("path + inline: loaded", keys.status.kalshi.loaded === true);
  check("path + inline: PATH key wins", keys.kalshiPrivateKeyPem === PEM_A);
}

// -------------------------------------------- PATH file that isn't a key
{
  const junkFile = join(SCRATCH, "junk.pem");
  writeFileSync(junkFile, "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n");
  const p = writeKeys("keys-path-junk.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    `KALSHI_PRIVATE_KEY_PATH=${junkFile}`,
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("path junk: not loaded", keys.status.kalshi.loaded === false);
  check(
    "path junk: parse-based detail",
    keys.status.kalshi.detail === "the file at KALSHI_PRIVATE_KEY_PATH is not a PEM private key",
    keys.status.kalshi.detail ?? "",
  );
}

// ------------------------------------------------ neither form present
{
  const p = writeKeys("keys-id-only.txt", [`KALSHI_API_KEY_ID=${KALSHI_ID}`]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check(
    "neither form: detail names both",
    (keys.status.kalshi.detail ?? "").includes("KALSHI_PRIVATE_KEY") &&
      (keys.status.kalshi.detail ?? "").includes("KALSHI_PRIVATE_KEY_PATH"),
    keys.status.kalshi.detail ?? "",
  );
}

// ------------------------------------- committed template does NOT load
{
  const template = readFileSync(join(import.meta.dirname, "..", "keys.example.txt"), "utf8");
  const blockLines: string[] = [];
  let inBlock = false;
  for (const line of template.split(/\r?\n/)) {
    if (line.startsWith("KALSHI_PRIVATE_KEY=")) inBlock = true;
    if (inBlock) blockLines.push(line);
    if (inBlock && line.includes("-----END")) break;
  }
  check("template: placeholder block found", blockLines.length >= 3, `${blockLines.length} lines`);
  const p = writeKeys("keys-template-verbatim.txt", [
    `KALSHI_API_KEY_ID=${KALSHI_ID}`,
    ...blockLines,
    "KALSHI_ENV=demo",
  ]);
  const keys = loadPaperKeys({ keysFilePath: p, env: NO_ENV });
  check("template verbatim: kalshi NOT loaded", keys.status.kalshi.loaded === false && keys.kalshiPrivateKeyPem === null);
  check(
    "template verbatim: inline-invalid detail",
    keys.status.kalshi.detail === "the inline KALSHI_PRIVATE_KEY is not a valid PEM private key",
    keys.status.kalshi.detail ?? "",
  );
  check("template verbatim: trailing entry survived", keys.kalshiEnv === "demo");
}

// ------------------------------------------------------------- masking
{
  const keys = loadPaperKeys({ keysFilePath: inlineBlockPath, env: NO_ENV });
  const statusJson = JSON.stringify(keys.status);
  const summary = describeKeysStatus(keys.status);
  const bodyLines = PEM_A.split("\n").filter((l) => l.length > 30);
  const fragments = bodyLines.map((l) => l.slice(8, 32));
  check(
    "masking: no pem body fragment in status JSON",
    fragments.every((f) => !statusJson.includes(f)),
  );
  check("masking: no BEGIN marker in status JSON", !statusJson.includes("-----BEGIN"));
  check("masking: no full kalshi id in status JSON", !statusJson.includes(KALSHI_ID));
  check("masking: boot summary fragment-free", fragments.every((f) => !summary.includes(f)));
  check("masking: kalshi tail is last 4 of id", keys.status.kalshi.keyIdTail === KALSHI_ID.slice(-4));
}

console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
