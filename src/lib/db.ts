import { createClient } from "@libsql/client";

/**
 * Turso (libSQL) client — singleton.
 * Required env vars:
 *   TURSO_DATABASE_URL   e.g. libsql://mydb-myorg.turso.io  (or file:local.db for local dev)
 *   TURSO_AUTH_TOKEN     auth token from `turso db tokens create`
 */
let _client: ReturnType<typeof createClient> | null = null;

export function db() {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("Missing TURSO_DATABASE_URL");
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function ensureSchema() {
  await db().executeMultiple(`
    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      mime TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
