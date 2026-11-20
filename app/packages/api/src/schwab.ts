import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import type { FastifyInstance, FastifyReply } from "fastify";
import {
  buildEquityOrderBody,
  buildSchwabAuthUrl,
  deriveSchwabWizardStep,
  extractSchwabAuthCode,
  getPaperKeys,
  loadBotFile,
  loadBots,
  readSchwabTokens,
  resetPaperKeysCache,
  resolveKeysFilePath,
  resolveSchwabTokenFilePath,
  SchwabClient,
  SchwabError,
  schwabPublicStatus,
  SCHWAB_CALLBACK_URL,
  writeSchwabTokens,
} from "@fleet/shared";
import type { BotConfig } from "@fleet/shared/types";
import { findBotFile } from "./candidates.js";

/**
 * Schwab routes (v37): the API half of the Schwab setup wizard and the
 * per-bot venue switch.
 *
 * These routes sit behind the same private-network trust boundary as
 * the kill switch — Tailscale-only in deployment, never exposed
 * publicly. That boundary is the whole security model here, exactly
 * as it is for /control: anyone who can reach this API can already
 * halt the fleet, so the wizard's save/connect/test steps live here
 * too rather than behind a second auth scheme.
 *
 * Credential and token material never leaves the loader / token
 * store. The ONLY secret-bearing request is POST /schwab/credentials,
 * whose values go straight into the local keys file (never logged,
 * never echoed back). Every response below is built from the shared
 * public status surface — presence, last-4, token state — and Schwab
 * account data is masked to the last 4 digits before it is stored or
 * returned. Access tokens, refresh tokens, app secrets, and full
 * account numbers appear in NO response.
 */

/** HTTP-mapped error: the route translates `status` straight through. */
export class SchwabRouteError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** The verification record persisted into the Schwab token record. */
interface SchwabLastVerified {
  at: string;
  /** Masked account number: "…" + last 4 — never the full number. */
  accountMasked: string;
  equity: number;
  cash: number;
  positionCount: number;
}

/**
 * Build a Schwab client from the current paper-keys load, or null
 * when no app credentials are saved yet (wizard step 4 not done).
 * Reads through getPaperKeys() every time, so credentials saved by
 * POST /schwab/credentials (which drops the loader cache) are live
 * in this process immediately.
 */
function buildSchwabClient(): SchwabClient | null {
  const keys = getPaperKeys();
  if (!keys.schwabAppKey || !keys.schwabAppSecret) return null;
  return new SchwabClient({
    appKey: keys.schwabAppKey,
    appSecret: keys.schwabAppSecret,
    tokenFilePath: resolveSchwabTokenFilePath(),
  });
}

function requireSchwabClient(): SchwabClient {
  const client = buildSchwabClient();
  if (!client) {
    throw new SchwabRouteError(
      400,
      "no Schwab app credentials saved yet (wizard step 4)",
    );
  }
  return client;
}

/** 400 unless the saved Schwab tokens are in the authorized state. */
function requireAuthorized(): void {
  const pub = schwabPublicStatus();
  if (pub.state !== "authorized") {
    throw new SchwabRouteError(
      400,
      pub.state === "expired"
        ? "the Schwab connection has expired — reconnect it in the wizard (the refresh token lasts 7 days)"
        : "Schwab is not connected yet — finish the wizard's connect step first",
    );
  }
}

/**
 * Schwab venue eligibility, mirroring the engine gate minus the mode
 * checks (mode is a runtime ceiling, not a property of the bot):
 * PolyCrypt9000 is excluded outright, and the options bots wait on
 * contract mapping that has not been verified yet.
 */
function schwabEligibility(codename: string): {
  eligible: boolean;
  reason: string | null;
} {
  switch (codename) {
    case "polycrypt9000":
      return {
        eligible: false,
        reason: "excluded — Schwab has no crypto or prediction markets",
      };
    case "vega":
    case "wesley":
      return {
        eligible: false,
        reason: "Schwab options contract mapping not yet verified",
      };
    default:
      return { eligible: true, reason: null };
  }
}

/** Translate the two route error shapes into `{ error }` responses. */
function sendRouteError(reply: FastifyReply, err: unknown): unknown {
  if (err instanceof SchwabRouteError) {
    return reply.code(err.status).send({ error: err.message });
  }
  if (err instanceof SchwabError) {
    return reply.code(502).send({ error: err.message });
  }
  throw err;
}

/**
 * Save the Schwab app key/secret into the local keys file. Existing
 * SCHWAB_APP_KEY= / SCHWAB_APP_SECRET= lines are replaced in place
 * (every occurrence — the loader's later line wins, so a stale
 * duplicate must not survive); missing entries are appended. Every
 * other line is preserved byte-for-byte. A missing file starts fresh
 * with a short header comment.
 */
function writeSchwabCredentials(appKey: string, appSecret: string): void {
  const path = resolveKeysFilePath();
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      text = "# TraderBot keys — local only, never commit this file.\n";
    } else {
      const detail = err instanceof Error ? err.message : String(err);
      throw new SchwabRouteError(
        500,
        `the keys file at ${path} could not be read (${detail}), so the wizard cannot save your Schwab app credentials — the save step needs a readable, writable keys file in this deployment`,
      );
    }
  }
  const lines = text.split("\n");
  let keyDone = false;
  let secretDone = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^SCHWAB_APP_KEY=/.test(lines[i]!)) {
      lines[i] = `SCHWAB_APP_KEY=${appKey}`;
      keyDone = true;
    } else if (/^SCHWAB_APP_SECRET=/.test(lines[i]!)) {
      lines[i] = `SCHWAB_APP_SECRET=${appSecret}`;
      secretDone = true;
    }
  }
  const appends: string[] = [];
  if (!keyDone) appends.push(`SCHWAB_APP_KEY=${appKey}`);
  if (!secretDone) appends.push(`SCHWAB_APP_SECRET=${appSecret}`);
  if (appends.length > 0) {
    // Keep a trailing newline trailing: insert before the empty tail
    // element a final "\n" produces instead of after it.
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.splice(lines.length - 1, 0, ...appends);
    } else {
      lines.push(...appends);
    }
  }
  try {
    writeFileSync(path, lines.join("\n"), "utf8");
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new SchwabRouteError(
      500,
      `the keys file at ${path} could not be written (${detail}), so the wizard cannot save your Schwab app credentials — the save step needs a writable keys file in this deployment (a read-only mount blocks it)`,
    );
  }
  try {
    chmodSync(path, 0o600);
  } catch {
    // Best effort only — the write above is the step that matters.
  }
}

/** The frontmatter block's line range: lines[start] and lines[end] are "---". */
function frontmatterRange(
  lines: string[],
): { start: number; end: number } | null {
  const start = lines.findIndex((l) => /^-{3}\s*$/.test(l));
  if (start < 0) return null;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^-{3}\s*$/.test(lines[i]!)) return { start, end: i };
  }
  return null;
}

/**
 * Set one frontmatter field by LINE (the appendCandidate discipline —
 * never re-serialize the YAML, which would reflow the whole file):
 * replace the field's line in place, or insert `field: value` after
 * the codename: line when the field is absent.
 */
function setFrontmatterField(
  lines: string[],
  field: string,
  value: string,
): void {
  const range = frontmatterRange(lines);
  if (!range) {
    throw new SchwabRouteError(
      500,
      "the bot file has no frontmatter block to edit",
    );
  }
  const fieldRe = new RegExp(`^${field}:`);
  for (let i = range.start + 1; i < range.end; i++) {
    if (fieldRe.test(lines[i]!)) {
      lines[i] = `${field}: ${value}`;
      return;
    }
  }
  for (let i = range.start + 1; i < range.end; i++) {
    if (/^codename:/.test(lines[i]!)) {
      lines.splice(i + 1, 0, `${field}: ${value}`);
      return;
    }
  }
  lines.splice(range.start + 1, 0, `${field}: ${value}`);
}

/** The 1-share limit-away test order body shared by preview/place-cancel.
 *  buildEquityOrderBody takes the helper's lowercase side/type and
 *  translates them into Schwab's BUY / LIMIT enums itself. */
function testOrderBody(symbol: string, limitPrice: number) {
  return buildEquityOrderBody({
    symbol,
    side: "buy",
    qty: 1,
    type: "limit",
    limitPrice,
  });
}

const CALLBACK_OK_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Schwab connected</title></head>
<body style="font-family: system-ui, sans-serif; margin: 3rem auto; max-width: 32rem; padding: 0 1rem;">
<h1>Schwab connected</h1>
<p>Schwab connected — you can close this tab and return to the TraderBot dashboard.</p>
</body></html>`;

const CALLBACK_FAIL_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Schwab connection incomplete</title></head>
<body style="font-family: system-ui, sans-serif; margin: 3rem auto; max-width: 32rem; padding: 0 1rem;">
<h1>Connection did not complete</h1>
<p>The Schwab connection did not complete. Close this tab, return to the TraderBot dashboard, and use the wizard's paste-the-URL fallback instead: after Schwab redirects, copy the full address-bar URL and paste it into the wizard.</p>
</body></html>`;

export function registerSchwabRoutes(
  app: FastifyInstance,
  deps: { botsDir: string; bots: BotConfig[] },
): void {
  const { botsDir, bots } = deps;

  // Wizard state in one read: the public Schwab status (presence,
  // last-4, token state, refresh days left), the last successful
  // verification (masked account + balances, from the token record),
  // the wizard step those facts imply, and every bot's Schwab
  // eligibility. Bots are read FRESH from disk — the boot array goes
  // stale the moment a venue POST below edits a file.
  app.get("/schwab/status", async () => {
    const pub = schwabPublicStatus();
    const record = readSchwabTokens(resolveSchwabTokenFilePath());
    const lastVerified = record?.lastVerified ?? null;
    return {
      schwab: pub,
      verified: lastVerified,
      derivedStep: deriveSchwabWizardStep({
        configured: pub.configured,
        state: pub.state,
        verified: lastVerified !== null,
      }),
      callbackUrl: SCHWAB_CALLBACK_URL,
      bots: loadBots(botsDir).map((bot) => {
        const { eligible, reason } = schwabEligibility(bot.codename);
        return {
          codename: bot.codename,
          name: bot.name,
          broker: bot.broker,
          mode: bot.mode,
          schwabEligible: eligible,
          ineligibleReason: reason,
        };
      }),
    };
  });

  // Wizard step 4: save the app credentials into the local keys file.
  // The submitted values are never logged and never echoed — the
  // response is the public status surface only.
  app.post("/schwab/credentials", async (request, reply) => {
    try {
      const body = request.body as {
        appKey?: unknown;
        appSecret?: unknown;
      } | null;
      const appKey =
        typeof body?.appKey === "string" ? body.appKey.trim() : "";
      const appSecret =
        typeof body?.appSecret === "string" ? body.appSecret.trim() : "";
      if (appKey === "" || appSecret === "") {
        throw new SchwabRouteError(
          400,
          "appKey and appSecret are both required (non-empty strings)",
        );
      }
      if (/[\r\n]/.test(appKey) || /[\r\n]/.test(appSecret)) {
        throw new SchwabRouteError(
          400,
          "appKey and appSecret must be single-line values",
        );
      }
      writeSchwabCredentials(appKey, appSecret);
      // The loader caches process-wide; drop the cache so the new
      // credentials are the ones every later call in this process sees.
      resetPaperKeysCache();
      return { ok: true, schwab: schwabPublicStatus() };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });

  // Wizard step 5 (connect): the Schwab authorize URL for the saved
  // app key. The dashboard opens it in a new tab; Schwab redirects to
  // the loopback callback below when the user approves.
  app.get("/schwab/auth-url", async (_request, reply) => {
    const keys = getPaperKeys();
    if (!keys.schwabAppKey) {
      return reply.code(400).send({
        error: "no Schwab app credentials saved yet (wizard step 4)",
      });
    }
    return { url: buildSchwabAuthUrl(keys.schwabAppKey) };
  });

  // The wizard's paste fallback: the user pastes either the bare code
  // or the full redirect URL from their address bar (the loopback
  // callback port is not always reachable from where they approve).
  app.post("/schwab/oauth/exchange", async (request, reply) => {
    try {
      const body = request.body as { code?: unknown } | null;
      const raw = typeof body?.code === "string" ? body.code : "";
      const code = raw !== "" ? extractSchwabAuthCode(raw) : null;
      if (!code) {
        throw new SchwabRouteError(
          400,
          "could not find an authorization code in that value — paste the code or the full redirect URL from Schwab",
        );
      }
      const client = requireSchwabClient();
      await client.exchangeCode(code);
      return { ok: true, schwab: schwabPublicStatus() };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });

  // The OAuth redirect landing route (Schwab sends the browser to
  // https://127.0.0.1:8182, which the deployment forwards here).
  // Answers HTML, not JSON — this page is for the human mid-connect.
  // Static pages only: no code, token, or secret is ever rendered.
  app.get("/schwab/callback", async (request, reply) => {
    const q = request.query as { code?: unknown; error?: unknown } | undefined;
    const fail = () =>
      reply.type("text/html; charset=utf-8").send(CALLBACK_FAIL_HTML);
    if (typeof q?.error === "string" && q.error !== "") return fail();
    const code = typeof q?.code === "string" && q.code !== "" ? q.code : null;
    if (!code) return fail();
    const client = buildSchwabClient();
    if (!client) return fail();
    try {
      await client.exchangeCode(code);
    } catch {
      return fail();
    }
    return reply.type("text/html; charset=utf-8").send(CALLBACK_OK_HTML);
  });

  // Wizard step 6: prove the connection end-to-end with a read-only
  // account fetch, and persist the (masked) verification record into
  // the token record so GET /schwab/status can show it across
  // restarts without calling Schwab again.
  app.post("/schwab/verify", async (_request, reply) => {
    try {
      requireAuthorized();
      const client = requireSchwabClient();
      const hash = await client.accountHash();
      const account = await client.getAccount(hash);
      const verified: SchwabLastVerified = {
        at: new Date().toISOString(),
        accountMasked: `…${account.accountNumber.slice(-4)}`,
        equity: account.equity,
        cash: account.cash,
        positionCount: account.positions.length,
      };
      const tokenPath = resolveSchwabTokenFilePath();
      const record = readSchwabTokens(tokenPath);
      if (record) {
        writeSchwabTokens(tokenPath, { ...record, lastVerified: verified });
      }
      return { ok: true, verified };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });

  // Wizard step 7a: preview the limit-away test order. Previewing
  // places nothing — Schwab validates the order body and prices it.
  app.post("/schwab/test/preview", async (request, reply) => {
    try {
      requireAuthorized();
      const body = request.body as {
        symbol?: unknown;
        limitPrice?: unknown;
      } | null;
      let symbol = "AAPL";
      if (body?.symbol !== undefined) {
        if (typeof body.symbol !== "string" || body.symbol.trim() === "") {
          throw new SchwabRouteError(400, "symbol must be a non-empty string");
        }
        symbol = body.symbol.trim().toUpperCase();
      }
      let limitPrice = 1.0;
      if (body?.limitPrice !== undefined) {
        if (
          typeof body.limitPrice !== "number" ||
          !Number.isFinite(body.limitPrice) ||
          body.limitPrice <= 0
        ) {
          throw new SchwabRouteError(
            400,
            "limitPrice must be a positive number",
          );
        }
        limitPrice = body.limitPrice;
      }
      const client = requireSchwabClient();
      const hash = await client.accountHash();
      const orderBody = testOrderBody(symbol, limitPrice);
      const preview = await client.previewOrder(hash, orderBody);
      return { ok: true, orderBody, preview };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });

  // Wizard step 7b: place the limit-away test order and cancel it.
  // Schwab has NO paper mode — this is a REAL order on the live
  // account, which is why it refuses without an explicit
  // confirmLiveTest and why the limit ($1.00 on AAPL) sits far below
  // market so the order cannot fill before the cancel lands.
  app.post("/schwab/test/place-cancel", async (request, reply) => {
    try {
      const body = request.body as { confirmLiveTest?: unknown } | null;
      if (body?.confirmLiveTest !== true) {
        throw new SchwabRouteError(
          400,
          "refused: Schwab has no paper mode, so this test places a REAL order (1 share of AAPL at a $1.00 limit, far below market so it cannot fill) and then cancels it — resend with confirmLiveTest: true to proceed",
        );
      }
      requireAuthorized();
      const client = requireSchwabClient();
      const hash = await client.accountHash();
      const orderBody = testOrderBody("AAPL", 1.0);
      const placed = await client.placeOrder(hash, orderBody);
      if (!placed.orderId) {
        return {
          ok: true,
          orderId: null,
          placedStatus: placed.status,
          cancelled: false,
          note: "Schwab's response carried no order id, so there was nothing to cancel — check the account's orders in Schwab to confirm nothing is working before running the test again",
        };
      }
      try {
        await client.cancelOrder(hash, placed.orderId);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        throw new SchwabRouteError(
          502,
          `the test order was placed (order ${placed.orderId}) but cancelling it failed: ${detail} — cancel order ${placed.orderId} in Schwab now`,
        );
      }
      return {
        ok: true,
        orderId: placed.orderId,
        placedStatus: placed.status,
        cancelled: true,
      };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });

  // Wizard step 8 / venue switch: point one bot at Alpaca or Schwab
  // by editing its .md frontmatter by line. The file is re-parsed to
  // prove the edit is valid and the in-memory `bots` entry refreshed
  // so GET /bots agrees. goLive additionally raises the bot's mode to
  // connected — still subject to the fleet MODE ceiling at runtime.
  app.post("/schwab/venue", async (request, reply) => {
    try {
      const body = request.body as {
        codename?: unknown;
        venue?: unknown;
        goLive?: unknown;
      } | null;
      const codename =
        typeof body?.codename === "string" ? body.codename : "";
      const venue = typeof body?.venue === "string" ? body.venue : "";
      if (codename === "") {
        throw new SchwabRouteError(400, "codename is required");
      }
      if (venue !== "alpaca" && venue !== "schwab") {
        throw new SchwabRouteError(
          400,
          `venue must be "alpaca" or "schwab" (got ${JSON.stringify(body?.venue)})`,
        );
      }
      const path = findBotFile(botsDir, codename);
      if (!path) {
        return reply
          .code(404)
          .send({ error: `unknown bot: ${codename}` });
      }
      const before = loadBotFile(path);
      if (venue === "schwab") {
        const { eligible, reason } = schwabEligibility(codename);
        if (!eligible) {
          throw new SchwabRouteError(
            400,
            `${before.name} cannot trade at Schwab — ${reason}`,
          );
        }
      }
      const lines = readFileSync(path, "utf8").split("\n");
      setFrontmatterField(lines, "broker", venue);
      if (body?.goLive === true && venue === "schwab") {
        setFrontmatterField(lines, "mode", "connected");
      }
      writeFileSync(path, lines.join("\n"), "utf8");
      // Prove the edit parses, and refresh the boot array's entry so
      // GET /bots reflects the new venue without an API restart.
      const after = loadBotFile(path);
      const idx = bots.findIndex((b) => b.codename === after.codename);
      if (idx >= 0) bots[idx] = after;
      return {
        ok: true,
        codename: after.codename,
        name: after.name,
        broker: after.broker,
        mode: after.mode,
        appliesOn: "engine restart",
        note:
          `${after.name} now points at ${venue}. The engine loads bot configs at boot, ` +
          `so this applies on the next engine restart. The fleet MODE ceiling still ` +
          `applies — a bot can never run above the fleet mode — and Schwab only ` +
          `trades in the CONNECTED deployment.`,
      };
    } catch (err) {
      return sendRouteError(reply, err);
    }
  });
}
