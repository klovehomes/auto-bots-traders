import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Phase 8 — showcase build config.
 *
 * The public read-only flavor is a SEPARATE entry tree
 * (index-showcase.html → src/showcase-main.tsx → ShowcaseApp) that
 * shares only presentational components with the private dashboard
 * (Landscape, Leaderboard, avatars, fleetState). src/App.tsx — the
 * kill switch, the mode switch, every control endpoint — is never
 * imported by this entry, so none of that code exists in the
 * showcase bundle at all. The default build (vite.config.ts) is
 * untouched.
 *
 * Phase 9 (v17) adds a second entry: index-gate.html →
 * src/gate-main.tsx → GateApp — the email-gate page the Pages
 * middleware serves to visitors without a session cookie.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        showcase: fileURLToPath(
          new URL("./index-showcase.html", import.meta.url),
        ),
        gate: fileURLToPath(new URL("./index-gate.html", import.meta.url)),
      },
    },
  },
});
