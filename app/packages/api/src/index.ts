import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws";
import {
  fleetEventSchema,
  loadBots,
  parseFleetMode,
  resolveBotsDir,
} from "@fleet/shared";
import {
  ControlStore,
  type AuditEntry,
  type ControlAction,
  type LiquidationClose,
  type LiquidationFailure,
} from "./control.js";

const PORT = Number(process.env.API_PORT ?? 8080);
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
/** Fleet run mode from this service's own MODE env (sim | paper | connected). */
const MODE = parseFleetMode(process.env.MODE);
/**
 * Where the Risk Gate control state (halts + audit log) persists. A halt
 * must survive restarts, so this file lives on durable storage — in the
 * Docker build, a named volume (see docker-compose.yml).
 */
const CONTROL_STATE_PATH =
  process.env.CONTROL_STATE_PATH ?? "./data/control-state.json";
/** How long a kill-liquidate POST waits for the engine's report before
 *  answering with a still-pending report (the report completes over the
 *  WebSocket when it lands). The sim engine polls every 1 s. */
const LIQUIDATION_WAIT_MS = 10_000;

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  // The API reads the same bot .md files as the engine (shared loader),
  // so GET /bots always reflects the files on disk at startup.
  const botsDir = resolveBotsDir();
  const bots = loadBots(botsDir);
  app.log.info(`loaded ${bots.length} bots from ${botsDir}`);

  // Risk Gate control state (kill switch): single source of truth for
  // halts, owned here, persisted to CONTROL_STATE_PATH.
  const control = new ControlStore(
    CONTROL_STATE_PATH,
    bots.map((b) => b.codename),
  );
  app.log.info(`control state: ${CONTROL_STATE_PATH}`);

  /** Live WebSocket clients subscribed to /events. */
  const clients = new Set<WebSocket>();

  function broadcast(payload: unknown): void {
    const text = JSON.stringify(payload);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) client.send(text);
    }
  }

  /** Fan a control-state change out to every open dashboard. */
  function broadcastControl(entry: AuditEntry | null): void {
    broadcast({
      kind: "control",
      ts: new Date().toISOString(),
      state: control.publicState(),
      entry,
    });
  }

  app.get("/health", async () => ({ ok: true, mode: MODE }));

  app.get("/bots", async () => bots);

  // --- Kill switch / Risk Gate control ---------------------------------
  // These endpoints are the control surface of the fleet. In deployment
  // they sit behind the same private-network boundary as everything
  // else here (Tailscale-only — see CONTROL-DELIVERY.md); they are
  // deliberately NOT exposed publicly.

  app.get("/control", async () => control.publicState());

  async function runAction(apply: () => AuditEntry | null) {
    const entry = apply();
    if (entry) broadcastControl(entry);
    const state = control.publicState();
    if (entry?.liquidation && entry.liquidation.status === "pending") {
      // Give the engine a chance to execute and report so the caller
      // gets the real liquidation report, not just an acknowledgment.
      const done = await control.waitForLiquidation(
        entry.id,
        LIQUIDATION_WAIT_MS,
      );
      if (done?.liquidation?.status === "complete") {
        broadcastControl(done);
        return {
          ok: true,
          changed: done.changed,
          entry: done,
          liquidation: done.liquidation,
          state: control.publicState(),
        };
      }
      return {
        ok: true,
        changed: entry.changed,
        entry,
        liquidation: entry.liquidation,
        liquidationNote:
          "engine has not confirmed the liquidation yet; forced closes stream in as events and the report completes over the WebSocket",
        state,
      };
    }
    return {
      ok: true,
      changed: entry?.changed ?? [],
      noop: entry === null,
      entry,
      state,
    };
  }

  const BOT_ACTIONS: Record<string, ControlAction> = {
    kill: "kill",
    "kill-liquidate": "kill-liquidate",
    resume: "resume",
  };

  app.post<{ Params: { codename: string; action: string } }>(
    "/control/bots/:codename/:action",
    async (request, reply) => {
      const { codename, action } = request.params;
      const mapped = BOT_ACTIONS[action];
      if (!mapped) return reply.code(404).send({ error: "unknown action" });
      if (!control.hasBot(codename)) {
        return reply.code(404).send({ error: `unknown bot: ${codename}` });
      }
      return runAction(() =>
        control.applyBotAction(codename, mapped, "web-ui"),
      );
    },
  );

  app.post<{ Params: { action: string } }>(
    "/control/fleet/:action",
    async (request, reply) => {
      const mapped = BOT_ACTIONS[request.params.action];
      if (!mapped) return reply.code(404).send({ error: "unknown action" });
      return runAction(() => control.applyFleetAction(mapped, "web-ui"));
    },
  );

  // Engine-facing control channel (internal token, same as events).
  app.get("/internal/control", async (request, reply) => {
    if (request.headers["x-internal-token"] !== INTERNAL_EVENT_TOKEN) {
      return reply.code(401).send({ error: "invalid internal token" });
    }
    return control.internalState();
  });

  app.post("/internal/control/liquidation-report", async (request, reply) => {
    if (request.headers["x-internal-token"] !== INTERNAL_EVENT_TOKEN) {
      return reply.code(401).send({ error: "invalid internal token" });
    }
    const body = request.body as {
      id?: string;
      codename?: string;
      closed?: LiquidationClose[];
      failed?: LiquidationFailure[];
    } | null;
    if (!body?.id) {
      return reply.code(400).send({ error: "missing liquidation id" });
    }
    const entry = control.completeLiquidation(
      body.id,
      Array.isArray(body.closed) ? body.closed : [],
      Array.isArray(body.failed) ? body.failed : [],
    );
    if (!entry) {
      return reply.code(404).send({ error: "unknown or already-reported liquidation" });
    }
    broadcastControl(entry);
    return { ok: true };
  });

  // Engine → API ingestion. Internal only: guarded by a shared token and,
  // in the Docker/VPS deployment, reachable only on the private network.
  app.post("/internal/events", async (request, reply) => {
    if (request.headers["x-internal-token"] !== INTERNAL_EVENT_TOKEN) {
      return reply.code(401).send({ error: "invalid internal token" });
    }
    const parsed = fleetEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "invalid event", details: parsed.error.issues });
    }
    const payload = JSON.stringify(parsed.data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
    return { ok: true, delivered: clients.size };
  });

  app.get("/events", { websocket: true }, (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
    socket.on("error", () => clients.delete(socket));
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
}

main().catch((err: unknown) => {
  console.error("[api] fatal:", err);
  process.exit(1);
});
