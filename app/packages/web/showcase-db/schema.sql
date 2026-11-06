-- Phase 9 (v17) — email gate schema for the public showcase.
-- Cloudflare D1 (SQLite). Idempotent: safe to apply more than once.
--
-- Apply with:
--   wrangler d1 create traderbots-showcase            (once; note the id)
--   wrangler d1 execute traderbots-showcase --remote --file=app/packages/web/showcase-db/schema.sql
--
-- All timestamps are INTEGER epoch milliseconds (Date.now()).
-- Sessions are stateless HMAC cookies, so there is no sessions table.
-- Activation codes are stored ONLY as SHA-256 hashes — the plaintext
-- code exists solely in the email and in function memory.

CREATE TABLE IF NOT EXISTS registrations (
  email       TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  verified_at INTEGER,
  unsubscribed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activation_codes (
  email      TEXT PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Minimal rate-limit event log (register attempts per email / per IP).
-- Rows older than ~a day are pruned opportunistically by the function.
CREATE TABLE IF NOT EXISTS rate_events (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  key  TEXT NOT NULL,
  ts   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_events_lookup
  ON rate_events (kind, key, ts);
