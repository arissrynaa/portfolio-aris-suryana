export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** GET /api/auth/session — check whether the current cookie is a valid admin session. */
export async function GET() {
  const jar = await cookies();
  const ok = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authenticated: ok });
}
