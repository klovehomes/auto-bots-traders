// Build version displayed under the "Trader Bot Landscape" header, so
// anyone looking at the dashboard can tell at a glance which build they
// are looking at (a stale build on the Mac or a VM has bitten more than
// once).
//
// The checked-in default below is bumped once per phase build (v20,
// v21, ...). A build can override it without editing this file by
// setting the Vite env var VITE_BUILD_VERSION at build time — e.g. to a
// git short SHA for local builds. Docker Compose passes the app .env
// var BUILD_VERSION through as VITE_BUILD_VERSION (same pattern as
// API_URL → VITE_API_URL); blank/unset keeps the default.
const override = import.meta.env.VITE_BUILD_VERSION as string | undefined;

export const BUILD_VERSION: string =
  typeof override === "string" && override.trim() !== ""
    ? override.trim()
    : "v25";
