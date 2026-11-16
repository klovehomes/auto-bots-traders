// Trendia (paper.ts) moved to @fleet/core. This wrapper keeps the VM behaviour: state in a
// JSON file at $PAPER_STATE_PATH, tick cadence from $PAPER_TICK_MS.
import {
  startPaperTrader as startCore,
  type PaperDeps,
  type StateStore,
} from "@fleet/core";
import { envTickMs, fileStateStore } from "./node-host.js";

export * from "@fleet/core";

export type PaperDepsNode = Omit<PaperDeps, "store"> & { store?: StateStore };

export function startPaperTrader(
  bot: Parameters<typeof startCore>[0],
  client: Parameters<typeof startCore>[1],
  post: Parameters<typeof startCore>[2],
  control: Parameters<typeof startCore>[3],
  deps: PaperDepsNode = {},
): void {
  startCore(bot, client, post, control, {
    ...deps,
    store: deps.store ?? fileStateStore,
    statePath: deps.statePath ?? process.env.PAPER_STATE_PATH,
    tickMs: deps.tickMs ?? envTickMs(),
  });
}
