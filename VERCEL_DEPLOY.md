# Deploy Vercel Fullstack — Portfolio Aris Suryana

Branch `vercel` menjalankan **100% di Vercel**: frontend Next.js 16 (App Router) + backend (route handlers) + **Vercel Postgres** (database) + **Vercel Blob** (penyimpanan gambar) + dashboard admin `/admin`. Tidak ada lagi backend Vela/CMS terpisah, tidak ada layanan eksternal (Turso sudah dihapus). Branch `main` tidak dipakai untuk deployment ini.

## Arsitektur & Endpoints

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/content` | GET | publik | Semua konten CMS sebagai `{ content: { key: value } }` |
| `/api/content/[key]` | PUT | owner | Upsert satu key konten (`{ key, value }`) |
| `/api/images` | GET | publik | Daftar metadata gambar (dari Postgres) |
| `/api/images` | POST | owner | Upload `{ mime, data(base64 ≤4MB) }` → file disimpan di Vercel Blob, metadata di Postgres → `{ id, url }` |
| `/api/images/[id]` | GET | publik | Redirect ke URL Blob (cache 1 hari) |
| `/api/images/[id]` | DELETE | owner | Hapus gambar (Blob + metadata) |
| `/api/auth/login` | POST | publik | Login `{ password }` → cookie httpOnly `admin_session` (HMAC-signed, TTL 7 hari) |
| `/api/auth/login` | DELETE | — | Logout |
| `/api/auth/session` | GET | — | Cek status sesi |
| `/admin` | — | — | Dashboard admin (client component): login, editor JSON per-section, upload/hapus/copy-URL gambar |

**Frontend**: `ContentProvider` (client) fetch `GET /api/content` saat mount, deep-merge hasilnya di atas data default `src/data/profile.ts`. Jika API gagal / belum di-setup, site tetap tampil dengan data default — tidak pernah blank.

**Auth owner**: password diverifikasi terhadap `ADMIN_PASSWORD_HASH` (sha256, timing-safe). Sesi = token HMAC `exp.signature` di cookie httpOnly `admin_session`, ditandatangani dengan `SECRET` (atau `SESSION_SECRET`).

**Skema database** (dibuat otomatis saat request pertama via `CREATE TABLE IF NOT EXISTS` di write path — tidak perlu migrasi manual):

- `content(key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`
- `images(id TEXT PRIMARY KEY, url TEXT, mime TEXT, size INTEGER, updated_at TEXT)` — hanya metadata; byte file disimpan di Vercel Blob.

## Langkah Deploy

### 1. Push branch & import ke Vercel

1. Push branch `vercel` ke GitHub:
   ```bash
   git push -u origin vercel
   ```
2. Vercel Dashboard → **Add New… → Project** → import repo GitHub.
3. **Production Branch**: pilih `vercel` (atau merge `vercel` → branch default saat siap).
4. Framework Preset: **Next.js** (terdeteksi otomatis). Build command & output biarkan default (`next build` — Vercel menjalankan serverless functions untuk route handlers secara native).

### 2. Provision Vercel Postgres (database)

**Dari Dashboard:**
1. Project → tab **Storage** → **Create Database** → pilih **Postgres** (atau Marketplace → Neon/Vercel Postgres).
2. Pilih region terdekat (mis. `singapore1` / `iad1`), klik **Create**.
3. Saat diminta **Connect Project**, pilih project ini — Vercel otomatis meng-inject `POSTGRES_URL` (beserta varian `POSTGRES_URL_NO_SSL`/`_PRISMA`/`_NON_POOLING`) ke semua environment. Tidak perlu set manual.

**Atau via CLI:**
```bash
npm i -g vercel
vercel link                        # hubungkan ke project
vercel integrate add postgres --project <nama-project>
vercel env pull .env.local         # tarik env otomatis untuk dev lokal
```

### 3. Provision Vercel Blob (penyimpanan file/gambar)

**Dari Dashboard:**
1. Project → tab **Storage** → **Connect Store** → **Blob** → buat store baru.
2. `BLOB_READ_WRITE_TOKEN` otomatis di-inject ke semua environment.

**Atau via CLI:**
```bash
vercel blob store add portfolio-blob
vercel blob connect portfolio-blob --project <nama-project>
```

### 4. Set environment variables admin

Project → **Settings → Environment Variables** (Production + Preview + Development):

| Var | Contoh / Cara | Keterangan |
|---|---|---|
| `POSTGRES_URL` | *(auto oleh Vercel Postgres)* | tidak perlu set manual |
| `BLOB_READ_WRITE_TOKEN` | *(auto oleh Vercel Blob)* | tidak perlu set manual |
| `ADMIN_PASSWORD_HASH` | output `echo -n 'password' \| sha256sum` | hash sha256 hex password admin |
| `SECRET` (atau `SESSION_SECRET`) | output `openssl rand -hex 32` | kunci HMAC session cookie |

```bash
# hash password admin (ganti 'passwordmu' dengan password asli):
echo -n 'passwordmu' | sha256sum
# secret untuk signing session cookie:
openssl rand -hex 32
```

⚠️ `echo -n` penting (tanpa newline). Password asli TIDAK pernah disimpan di mana pun — hanya hash-nya. Jangan pernah commit secret ke git.

Untuk dev lokal: `vercel env pull .env.local` lalu isi `ADMIN_PASSWORD_HASH` & `SECRET` manual (atau salin `.env.example` → `.env.local`), jalankan `npm run dev`. `POSTGRES_URL` bisa diarahkan ke Postgres mana pun (mis. Docker lokal); `BLOB_READ_WRITE_TOKEN` dibuat dari dashboard Blob.

### 5. Deploy & Verifikasi

Klik **Deploy** (atau `vercel --prod`). Setelah selesai:

1. `https://<project>.vercel.app/api/content` → `{"content":{}}` (atau berisi konten tersimpan) — ini juga memicu pembuatan tabel otomatis.
2. Buka `/admin` → login dengan password admin.
3. **Edit konten**: tiap section (hero/about/skills/projects/contact) adalah editor JSON. Ubah nilai → **Simpan Semua Perubahan** → site langsung memakai konten baru (fetch runtime, tanpa rebuild).
4. **Upload gambar**: pilih file (≤4MB, png/jpeg/webp/gif/avif) → tersimpan di Vercel Blob → dapatkan URL `/api/images/<id>` (tombol copy) → tempel ke field gambar di konten JSON (mis. `photo`, `image`). Hapus gambar lewat kartu di dashboard.
5. Cek `/api/images/<id>` langsung membuka gambar (redirect ke Blob).

## Catatan

- Ukuran gambar dibatasi base64 ≤ 4MB di `POST /api/images`; byte file disimpan di Vercel Blob (bukan SQL), Postgres hanya metadata.
- Semua tabel dibuat otomatis; schema: `content(key, value, updated_at)` + `images(id, url, mime, size, updated_at)`.
- Cookie session: `httpOnly`, `secure` (production), `sameSite=lax`, TTL 7 hari.
- `@vercel/postgres` memakai driver postgres.js dengan `sql` template tag (parameterized, aman dari SQL injection); `@vercel/blob` edge-compatible.
- Jangan pernah commit `.env.local` atau nilai secret ke git (sudah di-gitignore).
