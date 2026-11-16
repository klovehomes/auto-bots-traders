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
| `src-tauri/src/vault.rs` | Passphrase (Argon2id) + 15-min unlock sessions, bot sessions (1–24h), credential index, OS-keystore storage, lockout after 5 bad tries |
| `src-tauri/src/providers.rs` | Field validation, Kalshi RSA-PSS signing, "Test connection", and the **broker proxy**: an endpoint allowlist, paper hosts only, auth attached in Rust |
| `src-tauri/src/lib.rs` | Tauri commands exposed to the UI (vault, broker proxy, bot-state storage) |
| `scripts/build-catalog.mjs` | Builds the Strategy Library from `../../../bots/*.md` (runs before dev/build) |
| `src/runtime.ts` | Runs the real `@fleet/core` bots on this device (REST Alpaca + Kalshi through the proxy, local kill switch, app-storage state) |
| `src/BotsView.tsx` | Start/stop bots, bot session, halt / resume / halt + liquidate, activity feed |
| `src/StrategiesView.tsx` | Pick strategies, assign keys, tighten (never loosen) risk caps |
| `src/KeysView.tsx` | Add / test / delete exchange keys |

## How bots trade from the device

1. Unlock, then on **Bots** pick a session length and press **Start bots**.
   That starts a *bot session*: bots may use keys for that long, even after
   the screen auto-locks. **Stop all** (or the session ending) cuts key access
   immediately and stops every bot.
2. Each bot calls the exchange through the Rust `broker_request` command. Rust
   checks the endpoint against an allowlist (orders, positions, bars, quotes —
   no account settings, no transfers), uses the **paper/demo host only**, and
   attaches the key headers / Kalshi signature itself.
3. Bot state (positions, pending orders, P&L) is saved in the app's data
   folder, so a restart picks up where it left off. Halts persist too.

Vega runs in **shadow mode** (decisions only, no orders), matching the VM's
`VEGA_SHADOW=true` default. Core tests: `cd ../core && npm test`.

## Not done yet

- Not yet run against real Alpaca paper / Kalshi demo accounts from the app.
- Bots only run while the app is open and the computer is awake; a hidden or
  minimized window may slow their timers (macOS App Nap).
- Live trading (deliberately locked), Touch ID / Windows Hello unlock, signed
  installers + auto-update, and the iOS/Android builds (need full Xcode, and
  a JDK + Android SDK).
