//! On-device credential vault.
//!
//! SECURITY INVARIANTS (carried over from app/packages/shared/src/keys.ts —
//! do not weaken):
//! - Secret VALUES live only in the OS keystore (Keychain / Credential
//!   Manager / Secret Service). They are never written to disk by this app,
//!   never logged, and never returned to the WebView. JavaScript only ever
//!   sees metadata: provider, environment, label, last 4 chars of a key ID.
//! - Secrets are read into `Zeroizing` buffers just long enough to sign or
//!   attach to a request, then wiped.
//! - Every secret use requires an unlocked session. Sessions expire.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::Argon2;
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use zeroize::Zeroizing;

const KEYCHAIN_SERVICE: &str = "com.klovehomes.tradervault";
const PASSPHRASE_ACCOUNT: &str = "__vault_passphrase__";
const INDEX_FILE: &str = "vault-index.json";
const MIN_PASSPHRASE_LEN: usize = 10;
pub const SESSION_LENGTH: Duration = Duration::from_secs(15 * 60);
const MAX_FAILED_UNLOCKS: u32 = 5;
const LOCKOUT: Duration = Duration::from_secs(30);

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Alpaca,
    Kalshi,
    Polymarket,
    Other,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Env {
    Paper,
    Live,
}

/// Non-secret description of a stored credential. Safe to show in the UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialMeta {
    pub id: String,
    pub provider: Provider,
    pub env: Env,
    pub label: String,
    pub key_id_tail: Option<String>,
    pub created_at: u64,
    pub last_tested_at: Option<u64>,
    pub last_test_ok: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewCredential {
    pub provider: Provider,
    pub env: Env,
    pub label: String,
    pub fields: BTreeMap<String, String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultStatus {
    pub initialized: bool,
    pub unlocked: bool,
    pub seconds_left: u64,
}

/// Decrypted secret fields. Every value is wiped from memory on drop.
pub struct SecretFields(BTreeMap<String, String>);

impl SecretFields {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.0.get(key).map(String::as_str)
    }
}

impl Drop for SecretFields {
    fn drop(&mut self) {
        for v in self.0.values_mut() {
            zeroize::Zeroize::zeroize(v);
        }
    }
}

pub struct Vault {
    data_dir: PathBuf,
    unlocked_until: Option<Instant>,
    failed_unlocks: u32,
    locked_out_until: Option<Instant>,
}

pub fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn entry(account: &str) -> Result<keyring::Entry, String> {
    keyring::Entry::new(KEYCHAIN_SERVICE, account).map_err(|e| format!("keystore unavailable: {e}"))
}

fn cred_account(id: &str) -> String {
    format!("cred:{id}")
}

/// Required (and optional) secret fields per provider. Anything else is rejected
/// so a typo can't silently store a key under the wrong name.
fn field_spec(provider: Provider) -> (&'static [&'static str], &'static [&'static str]) {
    match provider {
        Provider::Alpaca => (&["key_id", "secret_key"], &[]),
        Provider::Kalshi => (&["key_id", "private_key_pem"], &[]),
        Provider::Polymarket => (
            &["private_key"],
            &["funder_address", "api_key", "api_secret", "api_passphrase"],
        ),
        Provider::Other => (&[], &[]),
    }
}

fn tail4(value: &str) -> Option<String> {
    let v = value.trim();
    if v.chars().count() < 8 {
        return None; // too short to mask safely
    }
    Some(v.chars().rev().take(4).collect::<Vec<_>>().into_iter().rev().collect())
}

impl Vault {
    pub fn new(data_dir: PathBuf) -> Self {
        Self {
            data_dir,
            unlocked_until: None,
            failed_unlocks: 0,
            locked_out_until: None,
        }
    }

    fn index_path(&self) -> PathBuf {
        self.data_dir.join(INDEX_FILE)
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir
    }

    fn read_index(&self) -> Result<Vec<CredentialMeta>, String> {
        match fs::read_to_string(self.index_path()) {
            Ok(text) => serde_json::from_str(&text).map_err(|e| format!("vault index unreadable: {e}")),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
            Err(e) => Err(format!("vault index unreadable: {e}")),
        }
    }

    fn write_index(&self, items: &[CredentialMeta]) -> Result<(), String> {
        fs::create_dir_all(&self.data_dir).map_err(|e| e.to_string())?;
        let tmp = self.data_dir.join(format!("{INDEX_FILE}.tmp"));
        let text = serde_json::to_string_pretty(items).map_err(|e| e.to_string())?;
        fs::write(&tmp, text).map_err(|e| e.to_string())?;
        fs::rename(&tmp, self.index_path()).map_err(|e| e.to_string())
    }

    pub fn is_initialized(&self) -> bool {
        entry(PASSPHRASE_ACCOUNT)
            .and_then(|e| e.get_password().map_err(|e| e.to_string()))
            .is_ok()
    }

    pub fn is_unlocked(&self) -> bool {
        matches!(self.unlocked_until, Some(t) if Instant::now() < t)
    }

    pub fn status(&self) -> VaultStatus {
        let seconds_left = self
            .unlocked_until
            .and_then(|t| t.checked_duration_since(Instant::now()))
            .map(|d| d.as_secs())
            .unwrap_or(0);
        VaultStatus {
            initialized: self.is_initialized(),
            unlocked: self.is_unlocked(),
            seconds_left,
        }
    }

    pub fn require_unlocked(&self) -> Result<(), String> {
        if self.is_unlocked() {
            Ok(())
        } else {
            Err("Vault is locked".into())
        }
    }

    pub fn setup(&mut self, passphrase: &str) -> Result<(), String> {
        if self.is_initialized() {
            return Err("Vault already set up".into());
        }
        if passphrase.chars().count() < MIN_PASSPHRASE_LEN {
            return Err(format!("Passphrase must be at least {MIN_PASSPHRASE_LEN} characters"));
        }
        let salt = SaltString::generate(&mut OsRng);
        let hash = Argon2::default()
            .hash_password(passphrase.as_bytes(), &salt)
            .map_err(|e| e.to_string())?
            .to_string();
        entry(PASSPHRASE_ACCOUNT)?
            .set_password(&hash)
            .map_err(|e| format!("could not save to keystore: {e}"))?;
        self.unlocked_until = Some(Instant::now() + SESSION_LENGTH);
        Ok(())
    }

    pub fn unlock(&mut self, passphrase: &str) -> Result<(), String> {
        if let Some(t) = self.locked_out_until {
            if Instant::now() < t {
                return Err("Too many attempts — wait 30 seconds".into());
            }
        }
        let stored = Zeroizing::new(
            entry(PASSPHRASE_ACCOUNT)?
                .get_password()
                .map_err(|_| "Vault not set up".to_string())?,
        );
        let parsed = PasswordHash::new(&stored).map_err(|e| e.to_string())?;
        if Argon2::default()
            .verify_password(passphrase.as_bytes(), &parsed)
            .is_ok()
        {
            self.failed_unlocks = 0;
            self.locked_out_until = None;
            self.unlocked_until = Some(Instant::now() + SESSION_LENGTH);
            Ok(())
        } else {
            self.failed_unlocks += 1;
            if self.failed_unlocks >= MAX_FAILED_UNLOCKS {
                self.failed_unlocks = 0;
                self.locked_out_until = Some(Instant::now() + LOCKOUT);
            }
            Err("Wrong passphrase".into())
        }
    }

    pub fn lock(&mut self) {
        self.unlocked_until = None;
    }

    pub fn list(&self) -> Result<Vec<CredentialMeta>, String> {
        self.require_unlocked()?;
        self.read_index()
    }

    pub fn add(&self, input: NewCredential) -> Result<CredentialMeta, String> {
        self.require_unlocked()?;
        let label = input.label.trim();
        if label.is_empty() || label.len() > 60 {
            return Err("Label must be 1–60 characters".into());
        }
        let (required, optional) = field_spec(input.provider);
        let mut fields: BTreeMap<String, String> = BTreeMap::new();
        for (k, v) in input.fields.iter() {
            let v = v.trim();
            if v.is_empty() {
                continue;
            }
            if input.provider != Provider::Other
                && !required.contains(&k.as_str())
                && !optional.contains(&k.as_str())
            {
                return Err(format!("Unexpected field: {k}"));
            }
            fields.insert(k.clone(), v.to_string());
        }
        for r in required {
            if !fields.contains_key(*r) {
                return Err(format!("Missing field: {r}"));
            }
        }
        if input.provider == Provider::Other && fields.is_empty() {
            return Err("Add at least one field".into());
        }
        crate::providers::validate(input.provider, &fields)?;

        let key_id_tail = fields
            .get("key_id")
            .or_else(|| fields.get("funder_address"))
            .and_then(|v| tail4(v));
        let id = uuid::Uuid::new_v4().to_string();
        let secret = Zeroizing::new(serde_json::to_string(&fields).map_err(|e| e.to_string())?);
        // Wipe the plaintext map's strings once serialized.
        for (_, mut v) in fields {
            zeroize::Zeroize::zeroize(&mut v);
        }
        entry(&cred_account(&id))?
            .set_password(&secret)
            .map_err(|e| format!("could not save to keystore: {e}"))?;

        let meta = CredentialMeta {
            id,
            provider: input.provider,
            env: input.env,
            label: label.to_string(),
            key_id_tail,
            created_at: now_secs(),
            last_tested_at: None,
            last_test_ok: None,
        };
        let mut index = self.read_index()?;
        index.push(meta.clone());
        if let Err(e) = self.write_index(&index) {
            // Don't leave an orphaned secret in the keystore.
            let _ = entry(&cred_account(&meta.id)).and_then(|e| e.delete_credential().map_err(|e| e.to_string()));
            return Err(e);
        }
        Ok(meta)
    }

    pub fn delete(&self, id: &str) -> Result<(), String> {
        self.require_unlocked()?;
        let mut index = self.read_index()?;
        let before = index.len();
        index.retain(|c| c.id != id);
        if index.len() == before {
            return Err("No such credential".into());
        }
        match entry(&cred_account(id))?.delete_credential() {
            Ok(()) | Err(keyring::Error::NoEntry) => {}
            Err(e) => return Err(format!("could not remove from keystore: {e}")),
        }
        self.write_index(&index)
    }

    pub fn meta(&self, id: &str) -> Result<CredentialMeta, String> {
        self.read_index()?
            .into_iter()
            .find(|c| c.id == id)
            .ok_or_else(|| "No such credential".to_string())
    }

    /// Secret fields for one credential. Only the Rust side ever calls this.
    pub fn secrets(&self, id: &str) -> Result<SecretFields, String> {
        self.require_unlocked()?;
        let raw = Zeroizing::new(
            entry(&cred_account(id))?
                .get_password()
                .map_err(|_| "Secret missing from keystore".to_string())?,
        );
        let map: BTreeMap<String, String> =
            serde_json::from_str(&raw).map_err(|_| "Secret unreadable".to_string())?;
        Ok(SecretFields(map))
    }

    pub fn record_test(&self, id: &str, ok: bool) -> Result<(), String> {
        let mut index = self.read_index()?;
        if let Some(c) = index.iter_mut().find(|c| c.id == id) {
            c.last_tested_at = Some(now_secs());
            c.last_test_ok = Some(ok);
        }
        self.write_index(&index)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tail_masks_short_values() {
        assert_eq!(tail4("abc"), None);
        assert_eq!(tail4("PKABCDEFGH1234").as_deref(), Some("1234"));
    }
}
