export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureSchema } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** Owner-protected: upsert a single content key. Body: { key, value } */
export async function PUT(req: NextRequest) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { key, value } = body ?? {};
  if (typeof key !== "string" || !key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value (string) required" }, { status: 400 });
  }
  if (value.length > 5_000_000) {
    return NextResponse.json({ error: "value too large" }, { status: 413 });
  }
  await ensureSchema();
  const { db } = await import("@/lib/db");
  await db().execute({
    sql: `INSERT INTO content (key, value, updated_at) VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [key, value],
  });
  return NextResponse.json({ ok: true, key });
}
