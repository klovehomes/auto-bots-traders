import Alpaca from "@alpacahq/alpaca-trade-api";

/**
 * Phase 0 broker check: verify the Alpaca *paper* connection when keys are
 * configured. With no keys (the normal state until Keith creates his Alpaca
 * paper account), log a clear stub-mode message and let the engine run —
 * never fabricate a connection result.
 */
export async function checkAlpacaPaperConnection(): Promise<void> {
  const keyId = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_API_SECRET;

  if (!keyId || !secretKey) {
    console.log(
      "[alpaca] stub mode: Alpaca keys not configured " +
        "(ALPACA_API_KEY / ALPACA_API_SECRET unset) — skipping broker connection check.",
    );
    return;
  }

  const paper = (process.env.ALPACA_PAPER ?? "true") !== "false";
  const client = new Alpaca({ keyId, secretKey, paper });

  try {
    const account = (await client.getAccount()) as unknown as Record<
      string,
      unknown
    >;
    console.log(
      `[alpaca] ${paper ? "paper" : "LIVE"} connection OK — ` +
        `account status=${String(account.status)} equity=${String(account.equity)}`,
    );
  } catch (err) {
    console.error(
      "[alpaca] connection check failed:",
      err instanceof Error ? err.message : err,
    );
  }
}
