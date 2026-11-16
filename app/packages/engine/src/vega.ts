// Vega moved to @fleet/core. This wrapper keeps the VM behaviour: state in a
// JSON file at $VEGA_STATE_PATH, tick cadence from $VEGA_TICK_MS / PAPER_TICK_MS.
import {
  startVegaTrader as startCore,
  type VegaDeps,
  type StateStore,
} from "@fleet/core";
import { envTickMs, fileStateStore } from "./node-host.js";

export * from "@fleet/core";

export type VegaDepsNode = Omit<VegaDeps, "store"> & { store?: StateStore };

export function startVegaTrader(
  bot: Parameters<typeof startCore>[0],
  client: Parameters<typeof startCore>[1],
  post: Parameters<typeof startCore>[2],
  control: Parameters<typeof startCore>[3],
  deps: VegaDepsNode = {},
): void {
  startCore(bot, client, post, control, {
    ...deps,
    store: deps.store ?? fileStateStore,
    statePath: deps.statePath ?? process.env.VEGA_STATE_PATH,
    tickMs: deps.tickMs ?? envTickMs("VEGA_TICK_MS"),
    shadow:
      deps.shadow ??
      (process.env.VEGA_SHADOW ?? "true").trim().toLowerCase() !== "false",
  });
}
