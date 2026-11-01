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

const PORT = Number(process.env.API_PORT ?? 8080);
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
/** Fleet run mode from this service's own MODE env (sim | paper | connected). */
const MODE = parseFleetMode(process.env.MODE);

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  // The API reads the same bot .md files as the engine (shared loader),
  // so GET /bots always reflects the files on disk at startup.
  const botsDir = resolveBotsDir();
  const bots = loadBots(botsDir);
  app.log.info(`loaded ${bots.length} bots from ${botsDir}`);

  /** Live WebSocket clients subscribed to /events. */
  const clients = new Set<WebSocket>();

  app.get("/health", async () => ({ ok: true, mode: MODE }));

  app.get("/bots", async () => bots);

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
