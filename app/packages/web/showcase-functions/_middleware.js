/**
 * Phase 9 (v17) — the gate guard (Pages Functions middleware).
 *
 * Runs in front of the whole showcase deployment:
 * - /api/register and /api/verify are public (they ARE the gate).
 * - /gate.html and every static asset are public (the gate page needs
 *   its JS/CSS/logo before anyone has a cookie).
 * - /snapshot.json and any other /api/* path require a valid session
 *   cookie — without one they get a hard 401, so the fleet data is
 *   never fetchable by just guessing the URL.
 * - Document requests (the app shell) without a session are served
 *   the gate page instead; with a session they pass through to the
 *   showcase app.
 *
 * This is a promo lead-gate: the app bundle itself is public code
 * (it contains no data), the DATA file is what's behind the cookie.
 */
import { readSession } from "./_lib/gate.js";

const PUBLIC_API = new Set(["/api/register", "/api/verify"]);
const ASSET_EXT =
  /\.(?:js|mjs|css|png|jpe?g|gif|svg|ico|webp|woff2?|map|txt|xml)$/i;

function isDocumentRequest(request, path) {
  if (path === "/") return true;
  if (path.endsWith(".html")) return true;
  const accept = request.headers.get("Accept") ?? "";
  return accept.includes("text/html") && !ASSET_EXT.test(path);
}

/** @param {{ request: Request, env: import("../_lib/gate.js").GateEnv, next: () => Promise<Response> }} context */
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (PUBLIC_API.has(path)) return next();
  if (path === "/gate.html" || path === "/gate") return next();

  const session = await readSession(request, env);

  if (path === "/snapshot.json" || path.startsWith("/api/")) {
    if (session) return next();
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  if (request.method === "GET" && isDocumentRequest(request, path)) {
    if (session) return next();
    // Serve the gate page asset in place of the app shell.
    const gateUrl = new URL("/gate.html", url.origin);
    const assetRes = await env.ASSETS.fetch(
      new Request(gateUrl.toString(), { method: "GET" }),
    );
    return new Response(assetRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return next();
}
