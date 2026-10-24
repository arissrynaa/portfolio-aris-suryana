import { sql } from "@vercel/postgres";

/**
 * Vercel Postgres — singleton via the postgres.js driver `sql` template tag.
 * POSTGRES_URL is auto-injected by Vercel when you create a Postgres database
 * (Dashboard → Storage → Create Database, or `vercel link && vercel integration`).
 * For local dev set POSTGRES_URL in .env.local to any Postgres connection string.
 */
export { sql };

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (now()::text)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (now()::text)
    );
  `;
}
