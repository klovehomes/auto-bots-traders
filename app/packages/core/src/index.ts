/**
 * @fleet/core — the platform-neutral trading engine.
 *
 * Strategies, Risk Gate checks, indicators, the simulator and the venue
 * clients, with no Node.js APIs. Each host supplies the platform pieces:
 *   - StateStore        where runner state is saved
 *   - AlpacaClientLike  broker access (SDK on the VM, vault-signed on a device)
 *   - KalshiSigner      request signing (node:crypto on the VM, Rust vault on a device)
 *   - PaperControl      kill switch / liquidation / reset channel
 *
 * The VM engine (packages/engine) wires these to files, env vars and the
 * API; the device app (packages/device) wires them to its vault.
 */
export * from "./state.js";
export * from "./broker.js";
export * from "./indicators.js";
export * from "./control.js";
export * from "./sim.js";
export * from "./earnings.js";
export * from "./kalshi.js";
export * from "./paper.js";
export * from "./snapback.js";
export * from "./vega.js";
export * from "./wesley.js";
export * from "./polycrypt.js";
