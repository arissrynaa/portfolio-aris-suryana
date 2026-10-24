/**
 * Smoke test (unit-level, mocked DB/Blob): bundles the REAL route handlers with
 * esbuild, aliasing @vercel/postgres, @vercel/blob, next/headers and next/server
 * to shims, then exercises the full API contract in-memory.
 * Run: node tests/smoke-mock.mjs  (requires `npm i -D esbuild` — devDep only)
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const tmp = mkdtempSync(join(tmpdir(), "smoke-"));

// ---- shared mock state ----
writeFileSync(join(tmp, "mock-pg.mjs"), `
const G = globalThis.__SMOKE_PG ?? (globalThis.__SMOKE_PG = { content: new Map(), images: new Map() });
const tables = G;
export function reset() { tables.content.clear(); tables.images.clear(); }
export const sql = async (strings, ...vals) => {
  const q = strings.join("?").trim().replace(/\\s+/g, " ");
  if (q.startsWith("CREATE TABLE")) return { rows: [] };
  if (q.startsWith("SELECT key, value"))
    return { rows: [...tables.content].map(([key, r]) => ({ key, value: r.value, updated_at: r.updated_at })) };
  if (q.startsWith("INSERT INTO content")) {
    tables.content.set(vals[0], { value: vals[1], updated_at: vals[2] });
    return { rows: [], rowCount: 1 };
  }
  if (q.startsWith("SELECT id, url"))
    return { rows: [...tables.images.entries()].map(([id, r]) => ({ id, ...r })) };
  if (q.startsWith("INSERT INTO images")) {
    tables.images.set(vals[0], { url: vals[1], mime: vals[2], size: vals[3], updated_at: vals[4] });
    return { rows: [], rowCount: 1 };
  }
  if (q.startsWith("SELECT url, mime FROM images")) {
    const r = tables.images.get(vals[0]);
    return { rows: r ? [{ url: r.url, mime: r.mime }] : [] };
  }
  if (q.startsWith("DELETE FROM images")) {
    const r = tables.images.get(vals[0]);
    tables.images.delete(vals[0]);
    return { rows: r ? [{ url: r.url }] : [], rowCount: r ? 1 : 0 };
  }
  throw new Error("mock sql: unknown query: " + q);
};
`);

writeFileSync(join(tmp, "mock-blob.mjs"), `
const store = globalThis.__SMOKE_BLOB ?? (globalThis.__SMOKE_BLOB = new Map());
export function resetBlob() { store.clear(); }
export async function put(pathname, body, opts) {
  const url = "https://blob.test/" + pathname;
  store.set(url, { body, opts });
  return { url, pathname, contentType: opts?.contentType };
}
export async function del(url) { return store.delete(url); }
`);

// ---- next/server + next/headers shims ----
writeFileSync(join(tmp, "mock-next.mjs"), `
export class NextRequest {
  constructor(input, init) {
    if (typeof input === "string") this.url = input;
    else { this.url = input.url; Object.assign(this, { headers: input.headers }); }
    this._init = init || {};
    this.method = init?.method || "GET";
  }
  async json() { return JSON.parse(this._init.body); }
  get nextUrl() { return new URL(this.url); }
}
export class NextResponse extends Response {
  static json(data, init) { return new Response(JSON.stringify(data), { status: init?.status ?? 200, headers: init?.headers }); }
  static redirect(url, init) {
    return new Response(null, { status: init?.status ?? 307, headers: { Location: url, ...(init?.headers || {}) } });
  }
}
export async function cookies() {
  const v = globalThis.__SMOKE_COOKIE || "";
  return { get: (n) => (n === "admin_session" && v ? { name: n, value: v } : undefined) };
}
`);

writeFileSync(join(tmp, "cookie-state.mjs"), `
export let jarValue = "";
export function setCookie(v) { jarValue = v; }
export function getJar() { return { get: (n) => (n === "admin_session" && jarValue ? { name: n, value: jarValue } : undefined) }; }
`);



const ADMIN_HASH = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"; // sha256("test")
const SECRET = "a".repeat(64);
process.env.ADMIN_PASSWORD_HASH = ADMIN_HASH;
process.env.SECRET = SECRET;

const alias = {
  "@vercel/postgres": join(tmp, "mock-pg.mjs"),
  "@vercel/blob": join(tmp, "mock-blob.mjs"),
  "next/server": join(tmp, "mock-next.mjs"),
  "next/headers": join(tmp, "mock-next.mjs"),
  "@/lib/db": join(root, "src/lib/db.ts"),
  "@/lib/auth": join(root, "src/lib/auth.ts"),
};

const files = {
  c: ["src/app/api/content/route.ts"],
  ck: ["src/app/api/content/[key]/route.ts"],
  i: ["src/app/api/images/route.ts"],
  iid: ["src/app/api/images/[id]/route.ts"],
};
for (const [k, [entry]] of Object.entries(files)) {
  await build({
    entryPoints: [join(root, entry)],
    outfile: join(tmp, `${k}.mjs`),
    bundle: true, format: "esm", platform: "node", alias,
    external: ["node:*"],
  });
}

const mC = await import(pathToFileURL(join(tmp, "c.mjs")).href);
const mCK = await import(pathToFileURL(join(tmp, "ck.mjs")).href);
const mI = await import(pathToFileURL(join(tmp, "i.mjs")).href);
const mIid = await import(pathToFileURL(join(tmp, "iid.mjs")).href);
const pg = await import(pathToFileURL(join(tmp, "mock-pg.mjs")).href);
const blobMod = await import(pathToFileURL(join(tmp, "mock-blob.mjs")).href);
const cs = { setCookie: (v) => { globalThis.__SMOKE_COOKIE = v; } };
const authBuild = join(tmp, "auth.mjs");
await build({ entryPoints: [join(root, "src/lib/auth.ts")], outfile: authBuild, bundle: true, format: "esm", platform: "node", external: ["node:*"] });
const auth = await import(pathToFileURL(authBuild).href);

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra ?? ""); }
}

// simple request shim matching the NextRequest interface used by handlers
function mkReq(url, init) {
  return {
    url,
    method: init?.method || "GET",
    json: async () => JSON.parse(init?.body),
  };
}

// 1. GET /api/content — empty
pg.reset(); blobMod.resetBlob(); cs.setCookie("");
let r = await mC.GET();
let j = await r.json();
check("GET /api/content empty", r.status === 200 && j.content && Object.keys(j.content).length === 0, j);

// 2. PUT unauthenticated → 401
r = await mCK.PUT(mkReq("http://x/api/content/hero", { method: "PUT", body: JSON.stringify({ key: "hero", value: "{}" }) }));
check("PUT /api/content/[key] unauth → 401", r.status === 401, r.status);

// 3. PUT authenticated → ok
cs.setCookie(auth.createSessionToken());
r = await mCK.PUT(mkReq("http://x/api/content/hero", { method: "PUT", body: JSON.stringify({ key: "hero", value: '{"title":"Aris"}' }) }));
j = await r.json();
check("PUT /api/content/[key] ok", r.status === 200 && j.ok && j.key === "hero", j);

// 4. GET /api/content returns saved value
r = await mC.GET();
j = await r.json();
check("GET /api/content returns value", j.content.hero === '{"title":"Aris"}', j);

// 5. POST /api/images unauth → 401
cs.setCookie("");
const b64 = Buffer.from("fakepngbytes").toString("base64");
r = await mI.POST(mkReq("http://x/api/images", { method: "POST", body: JSON.stringify({ mime: "image/png", data: b64 }) }));
check("POST /api/images unauth → 401", r.status === 401, r.status);

// 6. POST /api/images auth → 201, Blob stored, metadata row
cs.setCookie(auth.createSessionToken());
r = await mI.POST(mkReq("http://x/api/images", { method: "POST", body: JSON.stringify({ mime: "image/png", data: b64 }) }));
j = await r.json();
check("POST /api/images → 201 with id+url", r.status === 201 && j.ok && j.id && j.url?.startsWith("https://blob.test/images/"), j);
const imgId = j.id;
const imgState = pg.state ? null : null;
// verify metadata via GET
r = await mI.GET();
j = await r.json();
check("GET /api/images lists metadata", j.images?.length === 1 && j.images[0].id === imgId && j.images[0].size === Buffer.from("fakepngbytes").length, j);

// 7. GET /api/images/[id] → redirect to Blob URL
r = await mIid.GET(mkReq(`http://x/api/images/${imgId}`), { params: Promise.resolve({ id: imgId }) });
check("GET /api/images/[id] redirects to Blob", r.status === 307 && r.headers.get("Location")?.startsWith("https://blob.test/"), r.status);

// 8. GET /api/images/[id] unknown → 404
r = await mIid.GET(mkReq("http://x/api/images/nope"), { params: Promise.resolve({ id: "nope" }) });
check("GET /api/images/[id] unknown → 404", r.status === 404, r.status);

// 9. DELETE unauth → 401
cs.setCookie("");
r = await mIid.DELETE(mkReq(`http://x/api/images/${imgId}`), { params: Promise.resolve({ id: imgId }) });
check("DELETE unauth → 401", r.status === 401, r.status);

// 10. DELETE auth → ok, metadata + blob removed
cs.setCookie(auth.createSessionToken());
r = await mIid.DELETE(mkReq(`http://x/api/images/${imgId}`), { params: Promise.resolve({ id: imgId }) });
j = await r.json();
check("DELETE ok", r.status === 200 && j.ok, j);
r = await mIid.GET(mkReq(`http://x/api/images/${imgId}`), { params: Promise.resolve({ id: imgId }) });
check("GET after delete → 404", r.status === 404, r.status);

// 11. Invalid mime rejected
r = await mI.POST(mkReq("http://x/api/images", { method: "POST", body: JSON.stringify({ mime: "text/html", data: b64 }) }));
check("POST bad mime → 400", r.status === 400, r.status);

// 12. Upsert overwrite (ON CONFLICT path)
cs.setCookie(auth.createSessionToken());
await mCK.PUT(mkReq("http://x/api/content/hero", { method: "PUT", body: JSON.stringify({ key: "hero", value: '{"title":"Updated"}' }) }));
r = await mC.GET();
j = await r.json();
check("Upsert overwrites value", j.content.hero === '{"title":"Updated"}', j);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
