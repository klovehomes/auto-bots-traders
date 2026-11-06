/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Public API base URL baked in at build time. Docker Compose sets
   * this from API_URL in app/.env (see the web service's build args);
   * empty/unset keeps the local same-host :8080 default.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
