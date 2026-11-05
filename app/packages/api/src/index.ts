import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws";
import {
  fleetEventSchema,
  fleetModeSchema,
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
import { ModeStore } from "./mode.js";
import { EventHistoryStore } from "./history.js";

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
/**
 * Where the dashboard mode switch's desired mode persists (Phase 5).
 * Same durability requirement as the control state — in Docker it
 * lives on the shared fleet-data volume next to it, and the engine
 * reads the same file at boot (stored mode beats the MODE env).
 */
const MODE_STATE_PATH =
  process.env.MODE_STATE_PATH ?? "./data/mode-state.json";
/**
 * Where the event history persists (Phase 6). The event stream is the
 * fleet's record of itself — decisions especially must survive both
 * closed dashboard tabs and API restarts, so this lives on the same
 * durable volume as the control and mode state.
 */
const EVENT_HISTORY_PATH =
  process.env.EVENT_HISTORY_PATH ?? "./data/event-history.json";
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

  // Dashboard mode switch (Phase 5): the API owns the fleet's desired
  // mode (persisted), serves it to the engine on the internal control
  // poll, and tracks the engine's running-mode reports for the UI.
  const modeStore = new ModeStore(MODE_STATE_PATH, MODE);
  app.log.info(
    `mode state: ${MODE_STATE_PATH} (desired: ${modeStore.desiredMode()})`,
  );

  // Event history (Phase 6): the stream's durable memory. Ingested
  // events are appended here (which stamps their sequence number)
  // BEFORE broadcast, and dashboards seed from GET /events/history so
  // the Decisions tab shows the full day — not just whatever streamed
  // while a tab happened to be open.
  const historyStore = new EventHistoryStore(EVENT_HISTORY_PATH);
  app.log.info(
    `event history: ${EVENT_HISTORY_PATH} (${historyStore.size} retained events, latest seq ${historyStore.latestSeq()})`,
  );
  app.addHook("onClose", async () => {
    historyStore.close();
  });

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

  /** Fan a mode-state change (switch requested / engine reported) out
   *  to every open dashboard. */
  function broadcastMode(): void {
    broadcast({
      kind: "mode",
      ts: new Date().toISOString(),
      state: modeStore.publicState(),
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

  // --- Dashboard mode switch (Phase 5) -------------------------------
  // Same trust boundary as the kill switch above: private network
  // only, never exposed publicly. Validation lives in ModeStore:
  // unknown modes are rejected, and "connected" (live cash account)
  // is refused outright — the switch can never reach real money.
  app.get("/mode", async () => modeStore.publicState());

  app.post("/mode", async (request, reply) => {
    const body = request.body as { mode?: unknown } | null;
    const result = modeStore.requestMode(body?.mode, "web-ui");
    if (!result.ok) {
      return reply.code(result.status).send({ error: result.error });
    }
    if (result.changed) broadcastMode();
    return {
      ok: true,
      changed: result.changed,
      state: modeStore.publicState(),
    };
  });

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
  // Phase 5: the payload also carries the fleet's desired mode, which
  // is how a running engine learns the dashboard switch was flipped.
  app.get("/internal/control", async (request, reply) => {
    if (request.headers["x-internal-token"] !== INTERNAL_EVENT_TOKEN) {
      return reply.code(401).send({ error: "invalid internal token" });
    }
    return { ...control.internalState(), desiredMode: modeStore.desiredMode() };
  });

  // The engine reports the mode it is actually running (at boot and
  // on a heartbeat) so dashboards can show switch progress. Mirrors
  // the liquidation-report handshake below.
  app.post("/internal/control/mode-report", async (request, reply) => {
    if (request.headers["x-internal-token"] !== INTERNAL_EVENT_TOKEN) {
      return reply.code(401).send({ error: "invalid internal token" });
    }
    const body = request.body as {
      mode?: unknown;
      source?: unknown;
    } | null;
    const parsed = fleetModeSchema.safeParse(body?.mode);
    if (!parsed.success) {
      return reply.code(400).send({ error: "missing or invalid mode" });
    }
    modeStore.reportRunning(
      parsed.data,
      typeof body?.source === "string" ? body.source : "engine",
    );
    broadcastMode();
    return { ok: true };
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
    // Persist FIRST (Phase 6): the store stamps the event's sequence
    // number, and the stamped event is both the durable record and
    // the broadcast frame — dashboards merge history and live by seq.
    const stored = historyStore.append(parsed.data);
    const payload = JSON.stringify(stored);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
    return { ok: true, delivered: clients.size, seq: stored.seq };
  });

  // Event history read-back (Phase 6): dashboards fetch this on load
  // to seed the stream/Decisions state before merging live frames.
  // Same trust boundary as the other read endpoints (private network).
  app.get("/events/history", async () => historyStore.snapshot());

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
