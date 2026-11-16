mod providers;
mod vault;

use std::fs;
use std::sync::Mutex;

use tauri::{Manager, State};

use providers::TestResult;
use vault::{CredentialMeta, NewCredential, Vault, VaultStatus};

struct AppState {
    vault: Mutex<Vault>,
    http: reqwest::Client,
}

const SELECTIONS_FILE: &str = "strategy-selections.json";
const BOT_STATE_DIR: &str = "bot-state";
const MAX_STATE_BYTES: usize = 5 * 1024 * 1024;

/// Bot-state keys look like "data/paper-vega-state.json" or "control/halted.json".
/// Map them to one flat, safe filename inside the app's bot-state folder.
fn state_file_name(key: &str) -> Result<String, String> {
    let ok = !key.is_empty()
        && key.len() <= 120
        && !key.contains("..")
        && key.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_' | '/'));
    if !ok {
        return Err("Invalid state key".into());
    }
    Ok(key.replace('/', "__"))
}

fn state_key_from_file(name: &str) -> String {
    name.replace("__", "/")
}

fn with_vault<T>(state: &State<'_, AppState>, f: impl FnOnce(&mut Vault) -> Result<T, String>) -> Result<T, String> {
    let mut v = state.vault.lock().map_err(|_| "vault state poisoned".to_string())?;
    f(&mut v)
}

#[tauri::command]
fn vault_status(state: State<'_, AppState>) -> Result<VaultStatus, String> {
    with_vault(&state, |v| Ok(v.status()))
}

#[tauri::command]
fn vault_setup(state: State<'_, AppState>, passphrase: String) -> Result<VaultStatus, String> {
    let passphrase = zeroize::Zeroizing::new(passphrase);
    with_vault(&state, |v| {
        v.setup(&passphrase)?;
        Ok(v.status())
    })
}

#[tauri::command]
fn vault_unlock(state: State<'_, AppState>, passphrase: String) -> Result<VaultStatus, String> {
    let passphrase = zeroize::Zeroizing::new(passphrase);
    with_vault(&state, |v| {
        v.unlock(&passphrase)?;
        Ok(v.status())
    })
}

#[tauri::command]
fn vault_lock(state: State<'_, AppState>) -> Result<VaultStatus, String> {
    with_vault(&state, |v| {
        v.lock();
        Ok(v.status())
    })
}

#[tauri::command]
fn vault_list(state: State<'_, AppState>) -> Result<Vec<CredentialMeta>, String> {
    with_vault(&state, |v| v.list())
}

#[tauri::command]
fn vault_add(state: State<'_, AppState>, input: NewCredential) -> Result<CredentialMeta, String> {
    with_vault(&state, |v| v.add(input))
}

#[tauri::command]
fn vault_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    with_vault(&state, |v| v.delete(&id))
}

#[tauri::command]
async fn vault_test(state: State<'_, AppState>, id: String) -> Result<TestResult, String> {
    // Read what we need, then release the lock before any network await.
    let (meta, secrets) = with_vault(&state, |v| Ok((v.meta(&id)?, v.secrets(&id)?)))?;
    let result = providers::test_connection(meta.provider, meta.env, secrets).await;
    with_vault(&state, |v| v.record_test(&id, result.ok))?;
    Ok(result)
}

#[tauri::command]
fn selections_load(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    with_vault(&state, |v| {
        match fs::read_to_string(v.data_dir().join(SELECTIONS_FILE)) {
            Ok(text) => serde_json::from_str(&text).map_err(|e| e.to_string()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(serde_json::json!([])),
            Err(e) => Err(e.to_string()),
        }
    })
}

#[tauri::command]
fn selections_save(state: State<'_, AppState>, selections: serde_json::Value) -> Result<(), String> {
    if !selections.is_array() {
        return Err("selections must be an array".into());
    }
    with_vault(&state, |v| {
        fs::create_dir_all(v.data_dir()).map_err(|e| e.to_string())?;
        let text = serde_json::to_string_pretty(&selections).map_err(|e| e.to_string())?;
        let tmp = v.data_dir().join(format!("{SELECTIONS_FILE}.tmp"));
        fs::write(&tmp, text).map_err(|e| e.to_string())?;
        fs::rename(&tmp, v.data_dir().join(SELECTIONS_FILE)).map_err(|e| e.to_string())
    })
}

/// Start a bot (trading) session so bots keep key access after the UI auto-locks.
#[tauri::command]
fn bots_arm(state: State<'_, AppState>, hours: u64) -> Result<VaultStatus, String> {
    with_vault(&state, |v| {
        v.arm_bots(hours)?;
        Ok(v.status())
    })
}

/// End the bot session immediately (part of "Stop all").
#[tauri::command]
fn bots_disarm(state: State<'_, AppState>) -> Result<VaultStatus, String> {
    with_vault(&state, |v| {
        v.disarm_bots();
        Ok(v.status())
    })
}

/// Authenticated exchange call on behalf of a bot. Keys never leave Rust.
#[tauri::command]
async fn broker_request(
    state: State<'_, AppState>,
    request: providers::BrokerRequest,
) -> Result<providers::RawResponse, String> {
    let (meta, secrets) = with_vault(&state, |v| {
        let meta = v.meta(&request.credential_id)?;
        Ok((meta, v.secrets(&request.credential_id)?))
    })?;
    providers::broker_send(&state.http, meta.provider, meta.env, request, secrets).await
}

/// Allowlisted public data (Nasdaq earnings calendar for Vega's guard).
#[tauri::command]
async fn public_get(state: State<'_, AppState>, url: String) -> Result<providers::RawResponse, String> {
    providers::public_get(&state.http, &url).await
}

#[tauri::command]
fn bot_state_load_all(state: State<'_, AppState>) -> Result<std::collections::BTreeMap<String, String>, String> {
    with_vault(&state, |v| {
        let dir = v.data_dir().join(BOT_STATE_DIR);
        let mut out = std::collections::BTreeMap::new();
        let entries = match fs::read_dir(&dir) {
            Ok(e) => e,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(out),
            Err(e) => return Err(e.to_string()),
        };
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".tmp") {
                continue;
            }
            if let Ok(text) = fs::read_to_string(entry.path()) {
                out.insert(state_key_from_file(&name), text);
            }
        }
        Ok(out)
    })
}

#[tauri::command]
fn bot_state_write(state: State<'_, AppState>, key: String, text: String) -> Result<(), String> {
    if text.len() > MAX_STATE_BYTES {
        return Err("State too large".into());
    }
    let name = state_file_name(&key)?;
    with_vault(&state, |v| {
        let dir = v.data_dir().join(BOT_STATE_DIR);
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let tmp = dir.join(format!("{name}.tmp"));
        fs::write(&tmp, text).map_err(|e| e.to_string())?;
        fs::rename(&tmp, dir.join(&name)).map_err(|e| e.to_string())
    })
}

#[tauri::command]
fn bot_state_remove(state: State<'_, AppState>, key: String) -> Result<(), String> {
    let name = state_file_name(&key)?;
    with_vault(&state, |v| match fs::remove_file(v.data_dir().join(BOT_STATE_DIR).join(name)) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            let http = reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(20))
                .user_agent("trader-vault/0.1")
                .build()?;
            app.manage(AppState {
                vault: Mutex::new(Vault::new(data_dir)),
                http,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            vault_status,
            vault_setup,
            vault_unlock,
            vault_lock,
            vault_list,
            vault_add,
            vault_delete,
            vault_test,
            selections_load,
            selections_save,
            bots_arm,
            bots_disarm,
            broker_request,
            public_get,
            bot_state_load_all,
            bot_state_write,
            bot_state_remove,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
