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

// ───────────────────────────── Broker proxy ─────────────────────────────
//
// The device's bots call exchanges through here. JavaScript names the
// credential, the endpoint and the payload; Rust picks the host from the
// credential's environment, attaches auth, and refuses anything outside a
// short allowlist. A compromised WebView therefore can't use the keys on
// other hosts or endpoints (transfers, account settings, live trading).

pub const ALPACA_DATA_BASE_URL: &str = "https://data.alpaca.markets";

#[derive(Debug, Clone, Copy, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Venue {
    Alpaca,
    Kalshi,
}

#[derive(Debug, Clone, Copy, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AlpacaApi {
    Trading,
    Data,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrokerRequest {
    pub credential_id: String,
    pub venue: Venue,
    /// Alpaca only.
    pub api: Option<AlpacaApi>,
    pub method: String,
    pub path: String,
    pub query: Option<BTreeMap<String, String>>,
    pub body: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct RawResponse {
    pub status: u16,
    pub text: String,
}

fn path_is_clean(path: &str) -> bool {
    path.starts_with('/')
        && !path.contains("..")
        && !path.contains("//")
        && !path.contains('?')
        && !path.contains('#')
        && path.chars().all(|c| c.is_ascii_graphic())
}

/// Endpoint allowlist: exactly what the strategies use, nothing more.
pub fn broker_allowed(venue: Venue, api: Option<AlpacaApi>, method: &str, path: &str) -> bool {
    if !path_is_clean(path) {
        return false;
    }
    let under = |prefix: &str| path.starts_with(prefix) && path.len() > prefix.len();
    match (venue, api, method) {
        (Venue::Alpaca, Some(AlpacaApi::Trading), "GET") => {
            matches!(path, "/v2/account" | "/v2/clock" | "/v2/positions" | "/v2/orders" | "/v2/options/contracts")
                || under("/v2/orders/")
        }
        (Venue::Alpaca, Some(AlpacaApi::Trading), "POST") => path == "/v2/orders",
        (Venue::Alpaca, Some(AlpacaApi::Trading), "DELETE") => under("/v2/orders/") || under("/v2/positions/"),
        (Venue::Alpaca, Some(AlpacaApi::Data), "GET") => {
            under("/v2/stocks/") || path == "/v1beta1/options/snapshots" || under("/v1beta3/crypto/us/")
        }
        (Venue::Kalshi, None, "GET") => {
            path == "/trade-api/v2/portfolio/balance"
                || path == "/trade-api/v2/markets"
                || under("/trade-api/v2/markets/")
                || under("/trade-api/v2/portfolio/orders/")
        }
        (Venue::Kalshi, None, "POST") => path == "/trade-api/v2/portfolio/orders",
        (Venue::Kalshi, None, "DELETE") => under("/trade-api/v2/portfolio/orders/"),
        _ => false,
    }
}

pub async fn broker_send(
    client: &reqwest::Client,
    provider: Provider,
    env: Env,
    req: BrokerRequest,
    secrets: SecretFields,
) -> Result<RawResponse, String> {
    if env == Env::Live {
        return Err("Live trading is locked in this build — use paper/demo keys".into());
    }
    let expected = match req.venue {
        Venue::Alpaca => Provider::Alpaca,
        Venue::Kalshi => Provider::Kalshi,
    };
    if provider != expected {
        return Err("That key belongs to a different exchange".into());
    }
    let method = req.method.to_uppercase();
    if !broker_allowed(req.venue, req.api, &method, &req.path) {
        return Err(format!("Endpoint not allowed: {method} {}", req.path));
    }
    let http_method = reqwest::Method::from_bytes(method.as_bytes()).map_err(|e| e.to_string())?;

    let base = match (req.venue, req.api) {
        (Venue::Alpaca, Some(AlpacaApi::Trading)) => ALPACA_PAPER_BASE_URL,
        (Venue::Alpaca, _) => ALPACA_DATA_BASE_URL,
        (Venue::Kalshi, _) => KALSHI_DEMO_BASE_URL,
    };
    let mut builder = client.request(http_method, format!("{base}{}", req.path));
    if let Some(q) = &req.query {
        builder = builder.query(q);
    }
    if let Some(b) = &req.body {
        builder = builder.json(b);
    }
    builder = match req.venue {
        Venue::Alpaca => builder
            .header("APCA-API-KEY-ID", secrets.get("key_id").unwrap_or_default())
            .header("APCA-API-SECRET-KEY", secrets.get("secret_key").unwrap_or_default()),
        Venue::Kalshi => {
            let ts = crate::vault::now_millis().to_string();
            let sig = sign_kalshi_request(secrets.get("private_key_pem").unwrap_or_default(), &ts, &method, &req.path)?;
            builder
                .header("KALSHI-ACCESS-KEY", secrets.get("key_id").unwrap_or_default())
                .header("KALSHI-ACCESS-TIMESTAMP", ts)
                .header("KALSHI-ACCESS-SIGNATURE", sig)
        }
    };
    drop(secrets);
    let res = builder.send().await.map_err(|e| format!("network error: {e}"))?;
    let status = res.status().as_u16();
    let text = res.text().await.unwrap_or_default();
    Ok(RawResponse { status, text })
}

/// Unauthenticated GET for public data the strategies need (no keys involved).
pub async fn public_get(client: &reqwest::Client, url: &str) -> Result<RawResponse, String> {
    let parsed = reqwest::Url::parse(url).map_err(|_| "Bad URL".to_string())?;
    let allowed = parsed.scheme() == "https"
        && parsed.host_str() == Some("api.nasdaq.com")
        && parsed.path() == "/api/calendar/earnings";
    if !allowed {
        return Err("Host not allowed".into());
    }
    let res = client
        .get(parsed)
        // The public endpoint rejects non-browser agents (same as engine/src/earnings.ts).
        .header(
            "user-agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        )
        .header("accept", "application/json, text/plain, */*")
        .send()
        .await
        .map_err(|e| format!("network error: {e}"))?;
    let status = res.status().as_u16();
    let text = res.text().await.unwrap_or_default();
    Ok(RawResponse { status, text })
}

#[cfg(test)]
mod proxy_tests {
    use super::*;

    #[test]
    fn allowlist_permits_strategy_endpoints() {
        let t = Some(AlpacaApi::Trading);
        let d = Some(AlpacaApi::Data);
        assert!(broker_allowed(Venue::Alpaca, t, "GET", "/v2/account"));
        assert!(broker_allowed(Venue::Alpaca, t, "POST", "/v2/orders"));
        assert!(broker_allowed(Venue::Alpaca, t, "DELETE", "/v2/positions/BTC%2FUSD"));
        assert!(broker_allowed(Venue::Alpaca, d, "GET", "/v2/stocks/AAPL/bars"));
        assert!(broker_allowed(Venue::Alpaca, d, "GET", "/v1beta3/crypto/us/latest/trades"));
        assert!(broker_allowed(Venue::Kalshi, None, "POST", "/trade-api/v2/portfolio/orders"));
    }

    #[test]
    fn allowlist_blocks_everything_else() {
        let t = Some(AlpacaApi::Trading);
        assert!(!broker_allowed(Venue::Alpaca, t, "PATCH", "/v2/account/configurations"));
        assert!(!broker_allowed(Venue::Alpaca, t, "GET", "/v2/account/activities"));
        assert!(!broker_allowed(Venue::Alpaca, t, "DELETE", "/v2/positions/"));
        assert!(!broker_allowed(Venue::Alpaca, t, "GET", "/v2/orders/../account"));
        assert!(!broker_allowed(Venue::Alpaca, t, "GET", "/v2/orders?x=1"));
        assert!(!broker_allowed(Venue::Alpaca, Some(AlpacaApi::Data), "POST", "/v2/stocks/AAPL/bars"));
        assert!(!broker_allowed(Venue::Kalshi, None, "GET", "/trade-api/v2/portfolio/settlements"));
        assert!(!broker_allowed(Venue::Kalshi, Some(AlpacaApi::Trading), "GET", "/trade-api/v2/markets"));
    }
}
