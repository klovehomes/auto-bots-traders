mod providers;
mod vault;

use std::fs;
use std::sync::Mutex;

use tauri::{Manager, State};

use providers::TestResult;
use vault::{CredentialMeta, NewCredential, Vault, VaultStatus};

struct AppState {
    vault: Mutex<Vault>,
}

const SELECTIONS_FILE: &str = "strategy-selections.json";

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            app.manage(AppState {
                vault: Mutex::new(Vault::new(data_dir)),
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
