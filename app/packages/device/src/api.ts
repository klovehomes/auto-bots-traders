import { invoke } from "@tauri-apps/api/core";

/**
 * Typed wrappers for the Rust commands in src-tauri/src/lib.rs.
 * Nothing here ever receives a secret value back — only metadata.
 */

export type Provider = "alpaca" | "kalshi" | "polymarket" | "other";
export type Env = "paper" | "live";

export interface VaultStatus {
  initialized: boolean;
  unlocked: boolean;
  secondsLeft: number;
  /** Seconds left in the bot (trading) session; 0 = bots can't use keys. */
  botSessionSecondsLeft: number;
}

export interface RawResponse {
  status: number;
  text: string;
}

export interface BrokerRequest {
  credentialId: string;
  venue: "alpaca" | "kalshi";
  api?: "trading" | "data";
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

/** Calls the Rust side makes for the bots. Keys are attached in Rust, never here. */
export const native = {
  armBots: (hours: number) => invoke<VaultStatus>("bots_arm", { hours }),
  disarmBots: () => invoke<VaultStatus>("bots_disarm"),
  broker: (request: BrokerRequest) => invoke<RawResponse>("broker_request", { request }),
  publicGet: (url: string) => invoke<RawResponse>("public_get", { url }),
  stateLoadAll: () => invoke<Record<string, string>>("bot_state_load_all"),
  stateWrite: (key: string, text: string) => invoke<void>("bot_state_write", { key, text }),
  stateRemove: (key: string) => invoke<void>("bot_state_remove", { key }),
};

export interface CredentialMeta {
  id: string;
  provider: Provider;
  env: Env;
  label: string;
  keyIdTail: string | null;
  createdAt: number;
  lastTestedAt: number | null;
  lastTestOk: boolean | null;
}

export interface NewCredential {
  provider: Provider;
  env: Env;
  label: string;
  fields: Record<string, string>;
}

export interface TestResult {
  ok: boolean;
  detail: string;
}

export interface StrategySelection {
  codename: string;
  enabled: boolean;
  /** Credential id per provider the strategy uses. */
  credentials: Partial<Record<Provider, string>>;
  universe: string[];
  maxPositionPct: number | null;
  maxDailyLossPct: number | null;
}

export const vault = {
  status: () => invoke<VaultStatus>("vault_status"),
  setup: (passphrase: string) => invoke<VaultStatus>("vault_setup", { passphrase }),
  unlock: (passphrase: string) => invoke<VaultStatus>("vault_unlock", { passphrase }),
  lock: () => invoke<VaultStatus>("vault_lock"),
  list: () => invoke<CredentialMeta[]>("vault_list"),
  add: (input: NewCredential) => invoke<CredentialMeta>("vault_add", { input }),
  remove: (id: string) => invoke<void>("vault_delete", { id }),
  test: (id: string) => invoke<TestResult>("vault_test", { id }),
};

export const selections = {
  load: () => invoke<StrategySelection[]>("selections_load"),
  save: (items: StrategySelection[]) => invoke<void>("selections_save", { selections: items }),
};

export function errorText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : "Something went wrong";
}
