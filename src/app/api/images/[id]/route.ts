export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { cookies } from "next/headers";
import { ensureSchema, sql } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** GET /api/images/[id] — redirect to the Vercel Blob URL (public). */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await ensureSchema();
  const rs = await sql`SELECT url, mime FROM images WHERE id = ${id}`;
  if (rs.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const url = String(rs.rows[0].url);
  return NextResponse.redirect(url, {
    status: 307,
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}

/** DELETE /api/images/[id] — owner-protected. Removes Blob object + metadata row. */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await ensureSchema();
  const rs = await sql`DELETE FROM images WHERE id = ${id} RETURNING url`;
  if (rs.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await del(String(rs.rows[0].url));
  } catch {
    // Blob already gone — metadata deletion still counts as success.
  }
  return NextResponse.json({ ok: true });
}
