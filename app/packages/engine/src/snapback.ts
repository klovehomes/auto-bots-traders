// Snapback moved to @fleet/core. This wrapper keeps the VM behaviour: state in a
// JSON file at $SNAPBACK_STATE_PATH, tick cadence from $SNAPBACK_TICK_MS / PAPER_TICK_MS.
import {
  startSnapbackTrader as startCore,
  type SnapbackDeps,
  type StateStore,
} from "@fleet/core";
import { envTickMs, fileStateStore } from "./node-host.js";

export * from "@fleet/core";

export type SnapbackDepsNode = Omit<SnapbackDeps, "store"> & { store?: StateStore };

export function startSnapbackTrader(
  bot: Parameters<typeof startCore>[0],
  client: Parameters<typeof startCore>[1],
  post: Parameters<typeof startCore>[2],
  control: Parameters<typeof startCore>[3],
  deps: SnapbackDepsNode = {},
): void {
  startCore(bot, client, post, control, {
    ...deps,
    store: deps.store ?? fileStateStore,
    statePath: deps.statePath ?? process.env.SNAPBACK_STATE_PATH,
    tickMs: deps.tickMs ?? envTickMs("SNAPBACK_TICK_MS"),
  });
}
