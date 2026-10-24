export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const rs = await sql`SELECT key, value, updated_at FROM content`;
  const rows: Record<string, string> = {};
  for (const r of rs.rows) rows[String(r.key)] = String(r.value);
  return NextResponse.json({ content: rows });
}
