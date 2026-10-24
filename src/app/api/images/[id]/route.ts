export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureSchema } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** GET /api/images/[id] — serve image bytes (public). */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await ensureSchema();
  const { db } = await import("@/lib/db");
  const rs = await db().execute({
    sql: "SELECT mime, data FROM images WHERE id = ?",
    args: [id],
  });
  if (rs.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const mime = String(rs.rows[0].mime);
  const data = String(rs.rows[0].data);
  const bytes = Buffer.from(data, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

/** DELETE /api/images/[id] — owner-protected. */
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
  const { db } = await import("@/lib/db");
  const rs = await db().execute({ sql: "DELETE FROM images WHERE id = ?", args: [id] });
  if (rs.rowsAffected === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
