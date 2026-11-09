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
import { ScanService } from "./gamma.js";
import { AllocationStore } from "./allocations.js";
import type {
  AllocationState,
  SleeveToggles,
  UserSelection,
  UserSelectionValuation,
  UserSelectionsResponse,
} from "@fleet/shared/types";

const PORT = Number(process.env.API_PORT ?? 8080);
const INTERNAL_EVENT_TOKEN = process.env.INTERNAL_EVENT_TOKEN ?? "dev-token";
/** Fleet run mode from this service's own MODE env (sim | paper | connected). */
const MODE = parseFleetMode(process.env.MODE);
/**
 * Public dashboard origin (UI_URL in app/.env, e.g.
 * https://traderbot.example.com). When set, CORS reflects only that
 * origin — the production posture for a VPS behind TLS. When unset
 * (local development), any origin is reflected, as before.
 */
const UI_URL = (process.env.UI_URL ?? "").trim().replace(/\/+$/, "");
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
/**
 * Where the shared-pool allocation ledger persists (Phase PM3): bot
 * allocation, sleeve toggles, and booked user selections. Same
 * durability requirement — in Docker it lives on the shared
 * fleet-data volume next to the control/mode/history state.
 */
const ALLOCATIONS_STATE_PATH =
  process.env.ALLOCATIONS_STATE_PATH ?? "./data/allocations.json";
/** PolyCrypt9000's starting book (matches fleetState START_EQUITY). */
const START_EQUITY = 10000;
/** How long a kill-liquidate POST waits for the engine's report before
 *  answering with a still-pending report (the report completes over the
 *  WebSocket when it lands). The sim engine polls every 1 s. */
const LIQUIDATION_WAIT_MS = 10_000;

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: UI_URL ? [UI_URL] : true });
  if (UI_URL) app.log.info(`CORS allowlist: ${UI_URL} (UI_URL)`);
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
  const historyCounts = historyStore.counts;
  app.log.info(
    `event history: ${EVENT_HISTORY_PATH} (${historyCounts.total} retained events — ` +
      `${historyCounts.protectedDecisions} protected decisions / ` +
      `${historyCounts.simDecisions} sim decisions / ${historyCounts.other} other; ` +
      `latest seq ${historyStore.latestSeq()})`,
  );
  app.addHook("onClose", async () => {
    historyStore.close();
  });

  // Phase PM3: the Polymarket scan service (live Gamma data, cached
  // server-side) and the shared-pool allocation ledger.
  const scanService = new ScanService();
  const allocationStore = new AllocationStore(ALLOCATIONS_STATE_PATH);
  app.log.info(`allocations: ${ALLOCATIONS_STATE_PATH}`);

  const round2 = (n: number): number => Math.round(n * 100) / 100;

  /**
   * Total available funds for the shared pool: PolyCrypt9000's current
   * book equity — the single bot this branch loads — derived from the
   * API's own event history the same way the dashboard derives it
   * (start equity + cumulative realized PnL from closes). Falls back
   * to the $10,000 start when no closes have been recorded.
   */
  function totalFunds(): number {
    const bot = bots[0];
    if (!bot) return START_EQUITY;
    let realized = 0;
    for (const e of historyStore.snapshot().events) {
      if (e.bot === bot.name && e.type === "close" && e.pnl !== null) {
        realized += e.pnl;
      }
    }
    const equity = round2(START_EQUITY + realized);
    return equity > 0 ? equity : START_EQUITY;
  }

  function allocationState(): AllocationState {
    const total = totalFunds();
    const ledger = allocationStore.ledger;
    const selectionsTotal = allocationStore.openSelectionsTotal();
    return {
      totalFunds: total,
      botAllocation: ledger.botAllocation,
      userSelectionsTotal: selectionsTotal,
      remainingAvailable: round2(total - ledger.botAllocation - selectionsTotal),
      sleeveToggles: ledger.sleeveToggles,
      userSelections: ledger.userSelections,
    };
  }

  let selectionCounter = 0;
  function newSelectionId(): string {
    selectionCounter += 1;
    return `sel-${Date.now().toString(36)}-${selectionCounter.toString(36)}-${Math.floor(
      Math.random() * 1e6,
    ).toString(36)}`;
  }

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

  // --- Phase PM3: split-screen scans + shared-pool allocations --------
  // Same trust boundary as the other dashboard endpoints: private
  // network only (Tailscale), never public. Gamma data is fetched
  // HERE, server-side — the browser never calls Polymarket directly.

  app.get("/scans", async () => scanService.definitions());

  app.get<{ Params: { id: string } }>(
    "/scans/:id/results",
    async (request, reply) => {
      try {
        const results = await scanService.getResults(request.params.id);
        if (!results) {
          return reply.code(404).send({ error: "unknown scan" });
        }
        return results;
      } catch (err) {
        return reply.code(502).send({
          error: `Polymarket scan failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  );

  app.get("/allocations", async () => allocationState());

  // Carve out (or resize) the Bot Trades portion of the shared pool.
  app.post("/allocations/bot", async (request, reply) => {
    const body = request.body as { amount?: unknown } | null;
    const amount = typeof body?.amount === "number" ? body.amount : NaN;
    if (!Number.isFinite(amount) || amount < 0) {
      return reply
        .code(400)
        .send({ error: "amount must be a number >= 0" });
    }
    const total = totalFunds();
    const selectionsTotal = allocationStore.openSelectionsTotal();
    if (round2(amount + selectionsTotal) > total) {
      return reply.code(400).send({
        error:
          `Bot allocation of $${round2(amount).toFixed(2)} would exceed the shared pool: ` +
          `$${selectionsTotal.toFixed(2)} is already in open user selections ` +
          `out of $${total.toFixed(2)} total available funds.`,
      });
    }
    allocationStore.setBotAllocation(amount);
    return allocationState();
  });

  // The three independent sleeve toggles (Crypto / Kalshi /
  // Polymarket) — stored settings, persisted in the ledger.
  app.post("/allocations/sleeves", async (request, reply) => {
    const body = request.body as Partial<
      Record<keyof SleeveToggles, unknown>
    > | null;
    const partial: Partial<SleeveToggles> = {};
    for (const key of ["crypto", "kalshi", "polymarket"] as const) {
      if (typeof body?.[key] === "boolean") partial[key] = body[key] as boolean;
    }
    if (Object.keys(partial).length === 0) {
      return reply.code(400).send({
        error: "provide at least one boolean sleeve toggle",
      });
    }
    allocationStore.setSleeveToggles(partial);
    return allocationState();
  });

  /**
   * Book a batch of user selections from the left scan panel. The
   * batch is validated against the shared pool as a WHOLE first —
   * an over-pool batch books nothing (never a partial fill).
   * Selections book inside the app in this cut; external paper
   * execution (Kalshi demo / Alpaca) is the next phase.
   */
  app.post("/user-selections", async (request, reply) => {
    const body = request.body as {
      items?: {
        scanId?: unknown;
        marketId?: unknown;
        outcome?: unknown;
        amount?: unknown;
        price?: unknown;
        question?: unknown;
      }[];
    } | null;
    const items = Array.isArray(body?.items) ? body!.items : [];
    if (items.length === 0) {
      return reply.code(400).send({
        error:
          "nothing to submit — check at least one market and enter a dollar amount for it",
      });
    }

    interface ParsedItem {
      scanId: string;
      marketId: string;
      outcome: string;
      amount: number;
      clientPrice: number | null;
      clientQuestion: string | null;
    }
    const parsed: ParsedItem[] = [];
    for (const raw of items) {
      const scanId = typeof raw.scanId === "string" ? raw.scanId : "";
      const marketId = typeof raw.marketId === "string" ? raw.marketId : "";
      const outcome = typeof raw.outcome === "string" ? raw.outcome : "";
      const amount = typeof raw.amount === "number" ? raw.amount : NaN;
      if (!scanService.labelFor(scanId)) {
        return reply.code(400).send({ error: `unknown scan: ${scanId || "(missing)"}` });
      }
      if (!marketId || !outcome) {
        return reply
          .code(400)
          .send({ error: "each item needs a marketId and an outcome" });
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return reply.code(400).send({
          error: `amount for market ${marketId} must be a dollar amount above 0`,
        });
      }
      parsed.push({
        scanId,
        marketId,
        outcome,
        amount: round2(amount),
        clientPrice:
          typeof raw.price === "number" && raw.price > 0 ? raw.price : null,
        clientQuestion:
          typeof raw.question === "string" && raw.question ? raw.question : null,
      });
    }

    // Shared-pool validation for the batch as a whole.
    const state = allocationState();
    const batchSum = round2(parsed.reduce((s, i) => s + i.amount, 0));
    const needed = round2(state.botAllocation + state.userSelectionsTotal + batchSum);
    if (needed > state.totalFunds) {
      return reply.code(400).send({
        error:
          `This batch ($${batchSum.toFixed(2)}) would exceed the shared pool: ` +
          `$${state.botAllocation.toFixed(2)} Bot Trades allocation + ` +
          `$${state.userSelectionsTotal.toFixed(2)} existing user selections + ` +
          `$${batchSum.toFixed(2)} new = $${needed.toFixed(2)}, over the ` +
          `$${state.totalFunds.toFixed(2)} total available funds. Nothing was booked.`,
      });
    }

    // Price each item at selection time: cached scan price first
    // (exactly what the user saw), then a live Gamma lookup, then —
    // only if Gamma is unreachable — the client-supplied price.
    const booked: UserSelection[] = [];
    const now = new Date().toISOString();
    for (const item of parsed) {
      let resolved: { question: string; outcome: string; price: number } | null =
        null;
      try {
        resolved = await scanService.resolveSelection(
          item.scanId,
          item.marketId,
          item.outcome,
        );
      } catch {
        resolved = null;
      }
      if (!resolved && item.clientPrice !== null && item.clientQuestion) {
        resolved = {
          question: item.clientQuestion,
          outcome: item.outcome,
          price: item.clientPrice,
        };
      }
      if (!resolved) {
        return reply.code(502).send({
          error: `could not price market ${item.marketId} from Polymarket right now — nothing was booked`,
        });
      }
      booked.push({
        id: newSelectionId(),
        marketId: item.marketId,
        question: resolved.question,
        outcome: resolved.outcome,
        scanId: item.scanId,
        scanLabel: scanService.labelFor(item.scanId)!,
        amount: item.amount,
        priceAtSelection: resolved.price,
        ts: now,
        status: "Open",
      });
    }
    allocationStore.addSelections(booked);
    return { ok: true, booked, allocations: allocationState() };
  });

  /**
   * User selections with a live valuation: each selection is
   * re-priced from Gamma by market id when this loads (falling back
   * to its selection price when Gamma can't price it), and valued as
   * shares = amount / priceAtSelection, value = shares × current.
   */
  app.get("/user-selections", async (): Promise<UserSelectionsResponse> => {
    const selections: UserSelectionValuation[] = [];
    let totalAllocated = 0;
    let totalCurrentValue = 0;
    for (const s of allocationStore.ledger.userSelections) {
      const current =
        (await scanService
          .currentPrice(s.marketId, s.outcome)
          .catch(() => null)) ?? s.priceAtSelection;
      const shares = s.priceAtSelection > 0 ? s.amount / s.priceAtSelection : 0;
      const value = round2(shares * current);
      totalAllocated += s.amount;
      totalCurrentValue += value;
      selections.push({
        ...s,
        currentPrice: current,
        currentValue: value,
        pnl: round2(value - s.amount),
      });
    }
    totalAllocated = round2(totalAllocated);
    totalCurrentValue = round2(totalCurrentValue);
    return {
      selections,
      totals: {
        totalAllocated,
        totalCurrentValue,
        totalPnl: round2(totalCurrentValue - totalAllocated),
      },
    };
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
