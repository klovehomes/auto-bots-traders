//! Per-exchange validation, request signing and read-only connection tests.
//! All network calls go straight from this device to the exchange — never
//! through the VM.

use std::collections::BTreeMap;
use std::time::Duration;

use base64::Engine as _;
use rsa::pkcs1::DecodeRsaPrivateKey;
use rsa::pkcs8::DecodePrivateKey;
use rsa::pss::BlindedSigningKey;
use rsa::signature::{RandomizedSigner, SignatureEncoding};
use rsa::RsaPrivateKey;
use serde::Serialize;
use sha2::Sha256;

use crate::vault::{Env, Provider, SecretFields};

pub const KALSHI_DEMO_BASE_URL: &str = "https://demo-api.kalshi.co";
pub const KALSHI_LIVE_BASE_URL: &str = "https://api.elections.kalshi.com";
pub const ALPACA_PAPER_BASE_URL: &str = "https://paper-api.alpaca.markets";
pub const ALPACA_LIVE_BASE_URL: &str = "https://api.alpaca.markets";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    pub ok: bool,
    /// Human-safe explanation. Never contains a secret.
    pub detail: String,
}

fn parse_rsa_key(pem: &str) -> Result<RsaPrivateKey, String> {
    let pem = pem.trim();
    RsaPrivateKey::from_pkcs8_pem(pem)
        .or_else(|_| RsaPrivateKey::from_pkcs1_pem(pem))
        .map_err(|_| "Kalshi private key is not a valid RSA PEM".to_string())
}

fn is_hex_key(value: &str) -> bool {
    let v = value.trim().trim_start_matches("0x");
    v.len() == 64 && v.chars().all(|c| c.is_ascii_hexdigit())
}

fn is_eth_address(value: &str) -> bool {
    let v = value.trim();
    v.len() == 42 && v.starts_with("0x") && v[2..].chars().all(|c| c.is_ascii_hexdigit())
}

/// Format checks run before anything is written to the keystore.
pub fn validate(provider: Provider, fields: &BTreeMap<String, String>) -> Result<(), String> {
    match provider {
        Provider::Kalshi => {
            parse_rsa_key(&fields["private_key_pem"])?;
        }
        Provider::Polymarket => {
            if !is_hex_key(&fields["private_key"]) {
                return Err("Polymarket private key must be 64 hex characters (optionally 0x-prefixed)".into());
            }
            if let Some(addr) = fields.get("funder_address") {
                if !is_eth_address(addr) {
                    return Err("Funder address must be a 0x… Ethereum address".into());
                }
            }
        }
        Provider::Alpaca | Provider::Other => {}
    }
    Ok(())
}

/// The exact string Kalshi expects to be signed (matches engine/src/kalshi.ts).
pub fn kalshi_signature_payload(timestamp_ms: &str, method: &str, path: &str) -> String {
    format!("{timestamp_ms}{}{path}", method.to_uppercase())
}

/// RSA-PSS / SHA-256 / salt length = digest length, base64 — Kalshi's scheme.
pub fn sign_kalshi_request(pem: &str, timestamp_ms: &str, method: &str, path: &str) -> Result<String, String> {
    let key = parse_rsa_key(pem)?;
    let signer = BlindedSigningKey::<Sha256>::new(key);
    let sig = signer.sign_with_rng(
        &mut rand::thread_rng(),
        kalshi_signature_payload(timestamp_ms, method, path).as_bytes(),
    );
    Ok(base64::engine::general_purpose::STANDARD.encode(sig.to_bytes()))
}

fn http() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("trader-vault/0.1")
        .build()
        .map_err(|e| e.to_string())
}

fn status_detail(status: reqwest::StatusCode) -> String {
    match status.as_u16() {
        401 | 403 => "Rejected — the exchange did not accept these keys".into(),
        s => format!("Unexpected response from exchange (HTTP {s})"),
    }
}

/// Read-only connection test. Never places or cancels orders.
pub async fn test_connection(provider: Provider, env: Env, secrets: SecretFields) -> TestResult {
    let result = match provider {
        Provider::Alpaca => test_alpaca(env, &secrets).await,
        Provider::Kalshi => test_kalshi(env, &secrets).await,
        Provider::Polymarket => Ok(
            "Key format valid. Polymarket has no paper venue — this sleeve runs in shadow mode.".into(),
        ),
        Provider::Other => Ok("Stored. No automatic test exists for this provider yet.".into()),
    };
    drop(secrets);
    match result {
        Ok(detail) => TestResult { ok: true, detail },
        Err(detail) => TestResult { ok: false, detail },
    }
}

async fn test_alpaca(env: Env, s: &SecretFields) -> Result<String, String> {
    let base = match env {
        Env::Paper => ALPACA_PAPER_BASE_URL,
        Env::Live => ALPACA_LIVE_BASE_URL,
    };
    let res = http()?
        .get(format!("{base}/v2/account"))
        .header("APCA-API-KEY-ID", s.get("key_id").unwrap_or_default())
        .header("APCA-API-SECRET-KEY", s.get("secret_key").unwrap_or_default())
        .send()
        .await
        .map_err(|_| "Could not reach Alpaca".to_string())?;
    if !res.status().is_success() {
        return Err(status_detail(res.status()));
    }
    let body: serde_json::Value = res.json().await.unwrap_or_default();
    let status = body.get("status").and_then(|v| v.as_str()).unwrap_or("unknown");
    Ok(format!("Connected to Alpaca {} — account status {status}", match env {
        Env::Paper => "paper",
        Env::Live => "live",
    }))
}

async fn test_kalshi(env: Env, s: &SecretFields) -> Result<String, String> {
    let base = match env {
        Env::Paper => KALSHI_DEMO_BASE_URL,
        Env::Live => KALSHI_LIVE_BASE_URL,
    };
    let path = "/trade-api/v2/portfolio/balance";
    let ts = crate::vault::now_secs().saturating_mul(1000).to_string();
    let sig = sign_kalshi_request(s.get("private_key_pem").unwrap_or_default(), &ts, "GET", path)?;
    let res = http()?
        .get(format!("{base}{path}"))
        .header("KALSHI-ACCESS-KEY", s.get("key_id").unwrap_or_default())
        .header("KALSHI-ACCESS-TIMESTAMP", ts)
        .header("KALSHI-ACCESS-SIGNATURE", sig)
        .send()
        .await
        .map_err(|_| "Could not reach Kalshi".to_string())?;
    if !res.status().is_success() {
        return Err(status_detail(res.status()));
    }
    Ok(format!("Connected to Kalshi {}", match env {
        Env::Paper => "demo",
        Env::Live => "production",
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsa::pkcs8::{EncodePrivateKey, LineEnding};
    use rsa::pss::VerifyingKey;
    use rsa::signature::Verifier;

    #[test]
    fn kalshi_signature_verifies() {
        let key = RsaPrivateKey::new(&mut rand::thread_rng(), 2048).unwrap();
        let pem = key.to_pkcs8_pem(LineEnding::LF).unwrap();
        let sig_b64 = sign_kalshi_request(&pem, "1700000000000", "get", "/trade-api/v2/portfolio/balance").unwrap();
        let sig_bytes = base64::engine::general_purpose::STANDARD.decode(sig_b64).unwrap();
        let sig = rsa::pss::Signature::try_from(sig_bytes.as_slice()).unwrap();
        let verifier = VerifyingKey::<Sha256>::new(key.to_public_key());
        verifier
            .verify(b"1700000000000GET/trade-api/v2/portfolio/balance", &sig)
            .expect("signature must verify");
    }

    #[test]
    fn polymarket_key_format() {
        assert!(is_hex_key(&format!("0x{}", "a".repeat(64))));
        assert!(!is_hex_key("0x1234"));
        assert!(is_eth_address(&format!("0x{}", "b".repeat(40))));
    }
}
