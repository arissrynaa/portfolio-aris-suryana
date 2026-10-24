# Deploy Vercel Fullstack — Portfolio Aris Suryana

Branch `vercel` menjalankan **semua di Vercel**: frontend Next.js 16 (App Router) + backend (route handlers) + database Turso (libSQL) + dashboard admin `/admin`. Tidak ada lagi backend Vela/CMS terpisah. Branch `main` tidak dipakai untuk deployment ini.

## Arsitektur & Endpoints

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/content` | GET | publik | Semua konten CMS sebagai `{ content: { key: value } }` |
| `/api/content/[key]` | PUT | owner | Upsert satu key konten (`{ key, value }`) |
| `/api/images` | GET | publik | Daftar metadata gambar |
| `/api/images` | POST | owner | Upload `{ mime, data(base64 ≤2MB) }` → `{ id, url }` |
| `/api/images/[id]` | GET | publik | Serve bytes gambar (cache 1 hari) |
| `/api/images/[id]` | DELETE | owner | Hapus gambar |
| `/api/auth/login` | POST | publik | Login `{ password }` → cookie httpOnly `admin_session` (HMAC-signed, TTL 7 hari) |
| `/api/auth/login` | DELETE | — | Logout |
| `/api/auth/session` | GET | — | Cek status sesi |
| `/admin` | — | — | Dashboard admin (client component): login, editor JSON per-section, upload/hapus/copy-URL gambar |

**Frontend**: `ContentProvider` (client) fetch `GET /api/content` saat mount, deep-merge hasilnya di atas data default `src/data/profile.ts`. Jika API gagal / belum di-setup, site tetap tampil dengan data default — tidak pernah blank.

**Auth owner**: password diverifikasi terhadap `ADMIN_PASSWORD_HASH` (sha256, timing-safe). Sesi = token HMAC `exp.signature` di cookie httpOnly `admin_session`, ditandatangani dengan `SECRET` (atau `SESSION_SECRET`). Tabel dibuat otomatis saat request pertama (`ensureSchema`) — tidak perlu migrasi manual.

## Langkah Deploy

### 1. Provision Turso (database)

Daftar di [turso.tech](https://turso.tech) (ada free tier), lalu:

```bash
# install CLI: curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup          # atau: turso auth login
turso db create portfolio
turso db show portfolio --url        # → TURSO_DATABASE_URL
turso db tokens create portfolio     # → TURSO_AUTH_TOKEN
```

### 2. Generate password hash & secret admin

```bash
# hash password admin (ganti 'passwordmu' dengan password asli):
echo -n 'passwordmu' | sha256sum
# → mis. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08

# secret untuk signing session cookie:
openssl rand -hex 32
```

⚠️ `echo -n` penting (tanpa newline). Password asli TIDAK pernah disimpan di mana pun — hanya hash-nya.

### 3. Push branch & import ke Vercel

1. Push branch `vercel` ke GitHub:
   ```bash
   git push -u origin vercel
   ```
2. Vercel Dashboard → **Add New… → Project** → import repo GitHub.
3. **Production Branch**: pilih `vercel` (atau merge `vercel` → branch default saat siap).
4. Framework Preset: **Next.js** (terdeteksi otomatis). Build command & output biarkan default (`next build` — Vercel menjalankan serverless functions untuk route handlers secara native).

### 4. Set Environment Variables

Project → **Settings → Environment Variables** (berlaku untuk Production + Preview):

| Var | Contoh / Cara | Keterangan |
|---|---|---|
| `TURSO_DATABASE_URL` | `libsql://portfolio-<org>.turso.io` | dari `turso db show --url` |
| `TURSO_AUTH_TOKEN` | token dari `turso db tokens create` | jangan commit ke git |
| `ADMIN_PASSWORD_HASH` | output `echo -n 'password' \| sha256sum` | hash sha256 hex password admin |
| `SECRET` (atau `SESSION_SECRET`) | output `openssl rand -hex 32` | kunci HMAC session cookie |

Contoh lokal (dev): salin `.env.example` → `.env.local`, isi nilainya, jalankan `npm run dev`.

### 5. Deploy & Verifikasi

Klik **Deploy**. Setelah selesai:

1. `https://<project>.vercel.app/api/content` → `{"content":{}}` (atau berisi konten tersimpan).
2. Buka `/admin` → login dengan password admin.
3. **Edit konten**: tiap section (hero/about/skills/projects/contact) adalah editor JSON. Ubah nilai → **Simpan Semua Perubahan** → site langsung memakai konten baru (fetch runtime, tanpa rebuild).
4. **Upload gambar**: pilih file (≤2MB, png/jpeg/webp/gif/avif) → tersimpan di Turso → dapatkan URL `/api/images/<id>` (tombol copy) → tempel ke field gambar di konten JSON (mis. `photo`, `image`). Hapus gambar lewat kartu di dashboard.
5. Cek `/api/images/<id>` langsung membuka gambar.

## Catatan

- Ukuran gambar dibatasi base64 ≤ 2MB di `POST /api/images` (sesuai kontrak skema).
- Semua tabel dibuat otomatis; schema tetap: `content(key, value, updated_at)` + `images(id, mime, data, updated_at)`.
- Cookie session: `httpOnly`, `secure` (production), `sameSite=lax`, TTL 7 hari.
- Jangan pernah commit `.env.local` atau nilai secret ke git (sudah di-gitignore).
