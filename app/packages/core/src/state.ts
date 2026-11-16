/**
 * Durable storage for a runner's state (positions, pending orders,
 * realized PnL, decision counter).
 *
 * Synchronous on purpose: runners load once at boot and save after each
 * tick, and the original file-based code was synchronous. Hosts provide:
 * - VM engine: atomic JSON files (engine/src/node-store.ts)
 * - Device: an in-memory store preloaded from app storage before the
 *   runners start, flushing each write back to the app asynchronously
 *   (createMemoryStateStore with an onWrite hook)
 */
export interface StateStore {
  /** The saved text for `key`, or null when nothing has been saved. */
  read(key: string): string | null;
  /** Replace the saved text for `key`. Must not throw on transient failure. */
  write(key: string, text: string): void;
  /** Forget `key` (Reset All Data). Missing keys are not an error. */
  remove(key: string): void;
}

export function createMemoryStateStore(
  initial: Record<string, string> = {},
  hooks: {
    onWrite?: (key: string, text: string) => void;
    onRemove?: (key: string) => void;
  } = {},
): StateStore & { snapshot(): Record<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    read: (key) => data.get(key) ?? null,
    write: (key, text) => {
      data.set(key, text);
      hooks.onWrite?.(key, text);
    },
    remove: (key) => {
      data.delete(key);
      hooks.onRemove?.(key);
    },
    snapshot: () => Object.fromEntries(data),
  };
}
