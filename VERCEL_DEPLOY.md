# Deploy Vercel Fullstack (branch `vercel`)

Branch `vercel` mengubah portfolio menjadi **Next.js 16 fullstack** di Vercel: API route handlers + Turso (libSQL) sebagai database + dashboard admin `/admin`. Branch `main` tetap versi Vela (static export) — jangan dihapus.

## Kenapa Turso (libSQL)?

- Client `@libsql/client` ringan, tanpa driver native → cocok untuk Vercel Functions.
- Setup paling minim: buat database di dashboard/CLI, copy URL + token.
- Skema tetap sesuai kontrak data: `content(key, value, updated_at)` + `images(id, mime, data, updated_at)` dengan payload base64 ≤ 2MB.

## Arsitektur

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/content` | GET | publik | Semua konten sebagai `{ key: value }` |
| `/api/content/[key]` | PUT | owner | Upsert satu key (`{ key, value }`) |
| `/api/images` | GET | publik | Daftar metadata gambar |
| `/api/images` | POST | owner | Upload `{ mime, data(base64 ≤2MB) }` |
| `/api/images/[id]` | GET | publik | Serve bytes gambar (cache 1 hari) |
| `/api/images/[id]` | DELETE | owner | Hapus gambar |
| `/api/auth/login` | POST | publik | Login (`{ password }`) → cookie httpOnly |
| `/api/auth/login` | DELETE | — | Logout |
| `/api/auth/session` | GET | — | Cek status sesi |
| `/admin` | — | — | Dashboard admin (client component: login, editor konten, upload/hapus gambar) |

**Auth owner**: password diverifikasi terhadap `ADMIN_PASSWORD_HASH` (sha256). Sesi = HMAC token (`exp.hmac(exp)`) disimpan di cookie httpOnly `admin_session`, TTL 7 hari, ditandatangani dengan `SECRET`. Tidak ada dependency JWT eksternal.

Tabel dibuat otomatis (`CREATE TABLE IF NOT EXISTS`) saat request pertama via `ensureSchema()` — tidak perlu migrasi manual.

## Langkah deploy

### 1. Provision Turso

```bash
# via CLI (atau daftar di https://turso.tech dan buat DB lewat dashboard)
turso db create portfolio
turso db show portfolio --url          # → TURSO_DATABASE_URL
turso db tokens create portfolio       # → TURSO_AUTH_TOKEN
```

### 2. Import repo ke Vercel

1. Push branch `vercel` ke GitHub.
2. Vercel Dashboard → **Add New Project** → import repo.
3. **Root Directory**: repo root (biarkan default).
4. **Production Branch**: pilih `vercel` (atau merge `vercel` → `main` setelah siap).
5. Framework preset terdeteksi otomatis: Next.js. Build command & output default (`next build`).

### 3. Set env vars di Vercel (Project → Settings → Environment Variables)

| Var | Nilai |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://portfolio-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | token dari langkah 1 |
| `ADMIN_PASSWORD_HASH` | `sha256` hex password admin: `echo -n 'passwordmu' \| sha256sum` |
| `SECRET` | random hex: `openssl rand -hex 32` |

Lihat `.env.example`. Untuk development lokal, salin `.env.example` → `.env.local` dan isi.

### 4. Deploy

Push/Deploy. Verifikasi:

- `GET /api/content` → `{"content":{}}`
- `/admin` → login dengan password admin → edit konten & upload gambar.
- `GET /api/images/<id>` → gambar tersaji.

## Catatan

- Ukuran gambar dibatasi base64 ≤ 2 MB di `POST /api/images` (sesuai kontrak).
- Password admin tidak pernah dikirim/disimpan plain — hanya hash di env var.
- Cookie `secure` otomatis di production; `sameSite=lax`.
