# Trader Vault (device app)

On-device trading-keys vault and strategy picker, built with **Tauri 2**
(Rust core + React UI). Runs on macOS, Windows and Linux today; iOS and
Android use the same code base in later phases.

**Key rule:** exchange keys never leave the device and never touch the VM.
They live in the OS keystore (Keychain / Credential Manager / Secret
Service). The Rust core signs and sends requests directly to the exchange.
The WebView only ever sees metadata (provider, Paper/Live, label, last 4
chars of a key ID).

## Run it

```bash
nvm use            # Node 22.12.0, pinned in app/.nvmrc
cd app && npm install
cd packages/device
npm run tauri dev  # dev window with hot reload
npm run tauri build -- --bundles app   # macOS .app (dmg/msi/AppImage on other targets)
```

Rust tests: `cd src-tauri && cargo test`

## What's here

| Path | What |
|---|---|
| `src-tauri/src/vault.rs` | Passphrase (Argon2id) + 15-min unlock sessions, credential index, OS-keystore storage, lockout after 5 bad tries |
| `src-tauri/src/providers.rs` | Field validation, Kalshi RSA-PSS signing, read-only "Test connection" for Alpaca and Kalshi |
| `src-tauri/src/lib.rs` | Tauri commands exposed to the UI |
| `scripts/build-catalog.mjs` | Builds the Strategy Library from `../../../bots/*.md` (runs before dev/build) |
| `src/StrategiesView.tsx` | Pick strategies, assign keys, tighten (never loosen) risk caps |
| `src/KeysView.tsx` | Add / test / delete exchange keys |

## Not done yet

- The bots don't trade from the device yet. That needs the engine moved into a
  platform-neutral `@fleet/core` package (phase 1 of the plan).
- Touch ID / Windows Hello unlock, signed installers + auto-update, and the
  iOS/Android builds (need full Xcode, and a JDK + Android SDK).
