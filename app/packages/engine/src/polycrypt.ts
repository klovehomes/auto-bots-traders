// PolyCrypt9000 moved to @fleet/core. This wrapper keeps the VM behaviour: state in a
// JSON file at $POLYCRYPT_STATE_PATH, tick cadence from $POLYCRYPT_TICK_MS / PAPER_TICK_MS.
import {
  startPolyCryptTrader as startCore,
  type PolyCryptDeps,
  type StateStore,
} from "@fleet/core";
import { envTickMs, fileStateStore } from "./node-host.js";

export * from "@fleet/core";

export type PolyCryptDepsNode = Omit<PolyCryptDeps, "store"> & { store?: StateStore };

export function startPolyCryptTrader(
  bot: Parameters<typeof startCore>[0],
  client: Parameters<typeof startCore>[1],
  post: Parameters<typeof startCore>[2],
  control: Parameters<typeof startCore>[3],
  deps: PolyCryptDepsNode = {},
): void {
  startCore(bot, client, post, control, {
    ...deps,
    store: deps.store ?? fileStateStore,
    statePath: deps.statePath ?? process.env.POLYCRYPT_STATE_PATH,
    tickMs: deps.tickMs ?? envTickMs("POLYCRYPT_TICK_MS"),
  });
}
