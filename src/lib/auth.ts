import crypto from "node:crypto";

/**
 * Owner auth: HMAC-signed session token stored in an httpOnly cookie.
 * Env vars:
 *   ADMIN_PASSWORD_HASH  sha256 hex of the admin password
 *   SECRET               random string used to sign session tokens
 */

export function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  const a = Buffer.from(sha256(password));
  const b = Buffer.from(hash.trim());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function sign(payload: string): string {
  const secret = process.env.SECRET;
  if (!secret) throw new Error("Missing SECRET");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** token format: exp.hmac(exp) */
export function createSessionToken(): string {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(String(exp))}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = TTL_MS / 1000;
