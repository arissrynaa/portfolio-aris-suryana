export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { ensureSchema, sql } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024; // raw file <= 4MB

/** GET /api/images — list image metadata (owner-protected to keep DB private-ish; safe to expose ids) */
export async function GET() {
  await ensureSchema();
  const rs = await sql`SELECT id, url, mime, size, updated_at FROM images ORDER BY updated_at DESC`;
  return NextResponse.json({
    images: rs.rows.map((r) => ({
      id: String(r.id),
      url: String(r.url),
      mime: String(r.mime),
      updated_at: String(r.updated_at),
      size: Number(r.size),
      bytes: Number(r.size),
    })),
  });
}

/** POST /api/images — owner-protected. Body: { mime, data (base64, <=4MB) } → stored in Vercel Blob. */
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
    typeof data !== "string" || !data || data.length > MAX_BYTES * 2 // base64 inflates ~4/3; cap generously
  ) {
    return NextResponse.json(
      { error: "mime (png/jpeg/webp/gif/avif) and base64 data <=4MB required" },
      { status: 400 }
    );
  }
  const bytes = Buffer.from(data, "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "decoded file <=4MB required" }, { status: 400 });
  }
  await ensureSchema();
  const id = crypto.randomUUID();
  const ext = mime.split("/")[1];
  const blob = await put(`images/${id}.${ext}`, bytes, {
    access: "public",
    contentType: mime,
    addRandomSuffix: false,
  });
  await sql`
    INSERT INTO images (id, url, mime, size, updated_at)
    VALUES (${id}, ${blob.url}, ${mime}, ${bytes.length}, now()::text)
  `;
  return NextResponse.json({ ok: true, id, url: blob.url }, { status: 201 });
}
