export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { ensureSchema } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const MAX_BASE64 = 2 * 1024 * 1024; // base64 payload <= 2MB

/** GET /api/images — list image metadata (owner-protected to keep DB private-ish; safe to expose ids) */
export async function GET() {
  await ensureSchema();
  const { db } = await import("@/lib/db");
  const rs = await db().execute(
    "SELECT id, mime, updated_at, LENGTH(data) AS size FROM images ORDER BY updated_at DESC"
  );
  return NextResponse.json({
    images: rs.rows.map((r) => ({
      id: String(r.id),
      mime: String(r.mime),
      updated_at: String(r.updated_at),
      size: Number(r.size),
    })),
  });
}

/** POST /api/images — owner-protected. Body: { mime, data (base64, <=2MB) } */
export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { mime?: string; data?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { mime, data } = body ?? {};
  if (
    typeof mime !== "string" || !/^image\/(png|jpeg|webp|gif|avif)$/.test(mime) ||
    typeof data !== "string" || !data || data.length > MAX_BASE64
  ) {
    return NextResponse.json(
      { error: "mime (png/jpeg/webp/gif/avif) and base64 data <=2MB required" },
      { status: 400 }
    );
  }
  await ensureSchema();
  const { db } = await import("@/lib/db");
  const id = crypto.randomUUID();
  await db().execute({
    sql: "INSERT INTO images (id, mime, data, updated_at) VALUES (?, ?, ?, datetime('now'))",
    args: [id, mime, data],
  });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
