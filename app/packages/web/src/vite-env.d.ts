/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Public API base URL baked in at build time. Docker Compose sets
   * this from API_URL in app/.env (see the web service's build args);
   * empty/unset keeps the local same-host :8080 default.
   */
  readonly VITE_API_URL?: string;
  /**
   * Phase 8 showcase: where the read-only page fetches its published
   * snapshot from. Empty/unset = relative "snapshot.json" beside the
   * page (the sample in public/ until the publisher's file replaces
   * it). Only read by src/showcase.tsx.
   */
  readonly VITE_SNAPSHOT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
