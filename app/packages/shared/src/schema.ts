import { z } from "zod";
import type { FleetMode } from "./types.js";

/**
 * Zod schemas for the fleet.
 *
 * Only bot *identity* fields are validated strictly. `rules`, `risk` and
 * `universe` in the bot .md files deliberately contain human prose
 * (they are the bot's spec, read by strategy plugins later), so the loader
 * passes them through untouched instead of forcing them numeric.
 */

export const vizConfigSchema = z.object({
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "viz.color must be a #rrggbb hex color"),
  form: z.string().min(1),
  avatar_accessory: z.string().min(1),
});

export const botIdentitySchema = z.object({
  name: z.string().min(1),
  codename: z.string().min(1),
  enabled: z.boolean(),
  mode: z.string().min(1),
  market: z.string().min(1),
  broker: z.string().min(1),
  strategy: z.string().min(1),
  viz: vizConfigSchema,
});

export type BotIdentity = z.infer<typeof botIdentitySchema>;

export const fleetModeSchema = z.enum(["sim", "paper", "connected"]);

/**
 * Parse the MODE env var. Anything unset or unrecognized falls back to
 * "sim" — the safest mode (synthetic data, no broker) — never upward.
 */
export function parseFleetMode(value: string | undefined): FleetMode {
  const parsed = fleetModeSchema.safeParse(value?.trim().toLowerCase());
  return parsed.success ? parsed.data : "sim";
}

export const fleetEventSchema = z.object({
  bot: z.string().min(1),
  type: z.enum(["open", "close", "signal", "halt", "data_reset"]),
  decision_id: z.string().nullable(),
  symbol: z.string().nullable(),
  side: z.enum(["buy", "sell"]).nullable(),
  qty: z.number().nullable(),
  price: z.number().nullable(),
  pnl: z.number().nullable(),
  reason: z.string(),
  ts: z.string().min(1),
});
