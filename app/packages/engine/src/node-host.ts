/**
 * Node (VM) implementations of @fleet/core's host ports.
 *
 * Runner state is saved exactly as before the core split: JSON files,
 * written atomically (write .tmp, then rename), with paths and tick
 * cadences taken from the same environment variables.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { StateStore } from "@fleet/core";

export function createFileStateStore(): StateStore {
  return {
    read(path) {
      return existsSync(path) ? readFileSync(path, "utf8") : null;
    },
    write(path, text) {
      // Same atomic write as the pre-core runners. Errors propagate to the
      // runner's own try/catch, which logs "state save failed" as before.
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(`${path}.tmp`, text);
      renameSync(`${path}.tmp`, path);
    },
    remove(path) {
      if (existsSync(path)) unlinkSync(path);
    },
  };
}

/** The shared file store every runner uses on the VM. */
export const fileStateStore: StateStore = createFileStateStore();

/** `<NAME>_TICK_MS`, else PAPER_TICK_MS, else 30s — the pre-core rule. */
export function envTickMs(name?: string): number {
  const raw = (name ? process.env[name] : undefined) ?? process.env.PAPER_TICK_MS ?? 30_000;
  return Number(raw) || 30_000;
}
