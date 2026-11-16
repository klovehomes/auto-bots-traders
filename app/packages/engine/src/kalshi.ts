// The Kalshi client moved to @fleet/core and now signs through an injected
// KalshiSigner. On the VM the signer is node:crypto over the PEM from the
// shared keys loader; on a device it is the Rust vault.
import { constants, createSign } from "node:crypto";
import { getPaperKeys } from "@fleet/shared";
import {
  createKalshiClientWithSigner,
  kalshiSignaturePayload,
  type KalshiClientLike,
  type KalshiClientOptions as CoreKalshiClientOptions,
} from "@fleet/core";

export * from "@fleet/core";

export interface KalshiClientOptions extends CoreKalshiClientOptions {
  keyId?: string;
  privateKeyPem?: string;
}

/**
 * RSA-PSS / SHA-256 / salt-length-equals-digest signature, base64.
 * Exported for the harness, which verifies it against a throwaway
 * keypair using node:crypto's verify with the same PSS parameters.
 */
export function signKalshiRequest(
  privateKeyPem: string,
  timestampMs: string,
  method: string,
  path: string,
): string {
  const signer = createSign("RSA-SHA256");
  signer.update(kalshiSignaturePayload(timestampMs, method, path));
  signer.end();
  return signer.sign(
    {
      key: privateKeyPem,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32, // digest length for SHA-256, per Kalshi's scheme
    },
    "base64",
  );
}

/** Build a client that signs with node:crypto over an in-memory PEM. */
export function createKalshiClientWithKeys(
  keyId: string,
  privateKeyPem: string,
  options: CoreKalshiClientOptions = {},
): KalshiClientLike {
  return createKalshiClientWithSigner(
    keyId,
    (timestampMs, method, path) => signKalshiRequest(privateKeyPem, timestampMs, method, path),
    options,
  );
}

/**
 * Build the demo client from the shared keys loader, or null when the
 * Kalshi demo keys are not loaded (missing key id, unreadable PEM, or
 * a refused non-demo KALSHI_ENV). Never throws on missing keys — the
 * caller logs the loader's own detail.
 */
export function createKalshiClient(
  options: KalshiClientOptions = {},
): KalshiClientLike | null {
  const keys = getPaperKeys();
  const keyId = options.keyId ?? keys.kalshiKeyId;
  const pem = options.privateKeyPem ?? keys.kalshiPrivateKeyPem;
  if (!keyId || !pem) return null;
  // Belt-and-braces: even with keys in hand, a non-demo environment
  // request is refused in this phase — the client is demo-only.
  if (keys.kalshiEnv !== "demo" && !options.baseUrl) return null;
  return createKalshiClientWithKeys(keyId, pem, options);
}
