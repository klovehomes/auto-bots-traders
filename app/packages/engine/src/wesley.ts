// Wesley moved to @fleet/core. This wrapper keeps the VM behaviour: state in a
// JSON file at $WESLEY_STATE_PATH, tick cadence from $WESLEY_TICK_MS / PAPER_TICK_MS.
import {
  startWesleyTrader as startCore,
  type WesleyDeps,
  type StateStore,
} from "@fleet/core";
import { envTickMs, fileStateStore } from "./node-host.js";

export * from "@fleet/core";

export type WesleyDepsNode = Omit<WesleyDeps, "store"> & { store?: StateStore };

export function startWesleyTrader(
  bot: Parameters<typeof startCore>[0],
  client: Parameters<typeof startCore>[1],
  post: Parameters<typeof startCore>[2],
  control: Parameters<typeof startCore>[3],
  deps: WesleyDepsNode = {},
): void {
  startCore(bot, client, post, control, {
    ...deps,
    store: deps.store ?? fileStateStore,
    statePath: deps.statePath ?? process.env.WESLEY_STATE_PATH,
    tickMs: deps.tickMs ?? envTickMs("WESLEY_TICK_MS"),
  });
}
