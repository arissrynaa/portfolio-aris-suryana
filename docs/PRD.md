# Product Requirements Document (PRD)

## Website Portofolio Profesional — Aris Suryana

| | |
|---|---|
| **Dokumen** | PRD v1.0 |
| **Tanggal** | 24 Oktober 2026 |
| **Status** | Draft untuk review Tech Lead |
| **Stack target** | Next.js (App Router, `src/` directory) + Tailwind CSS |
| **Tipe produk** | Website portofolio profesional, statis / SPA-lite, tanpa backend berat |

---

## 1. Executive Summary

### 1.1 Problem Statement
Aris Suryana belum memiliki kehadiran digital terpusat yang profesional. Rekan kerja, rekruter, dan klien potensial sulit menemukan ringkasan profil, keahlian, dan karya terbaiknya dalam satu tempat yang rapi, cepat, dan meyakinkan.

### 1.2 Proposed Solution
Website portofolio satu halaman (single-page dengan navigasi anchored) bertema modern-minimalis dark mode yang menampilkan Hero dengan Photo Card elegan, About Me, Skills, Projects, dan Contact. Dibangun sebagai Next.js App Router yang dapat di-deploy sebagai static site (SSG) ke Vercel/Netlify/CDN apa pun — tanpa backend, tanpa database, tanpa CMS berat.

### 1.3 Success Criteria
| # | KPI | Target |
|---|-----|--------|
| 1 | Lighthouse Performance (mobile) | ≥ 90 |
| 2 | Lighthouse Accessibility | ≥ 95 |
| 3 | LCP (First Load, mobile 4G) | ≤ 2.0s |
| 4 | CLS | ≤ 0.05 |
| 5 | Bundle JS initial (First Load JS) | ≤ 120 KB |
| 6 | Fully responsive | 360px – 1920px, tanpa horizontal scroll |
| 7 | Waktu deployment (build) | ≤ 2 menit, zero-error build |

---

## 2. User Experience & Functionality

### 2.1 User Personas

1. **Rekruter / Hiring Manager** — datang dari LinkedIn/CV, punya 30–60 detik. Butuh: siapa ini, apa keahliannya, lihat 2–3 karya, cara kontak. Prioritas: cepat, scanning-friendly.
2. **Klien potensial / kolaborator** — butuh bukti kualitas kerja (project cards) dan cara menghubungi dengan mudah (email/socials).
3. **Aris sendiri (content owner)** — butuh mudah mengupdate konten (proyek, skill, foto) tanpa refactor kode: konten terpusat di satu file data/MDX, bukan tersebar di komponen.

### 2.2 Sitemap & Navigasi

Single-page layout, urutan section:
`Hero → About Me → Skills → Projects → Contact`

- Navbar sticky minimalis: logo/nama (anchor ke #hero) + link anchor ke tiap section + indikator section aktif (scroll-spy via IntersectionObserver).
- Mobile: navbar collapse menjadi tombol hamburger → menu fullscreen atau drawer.
- Footer: copyright, social links, back-to-top.

### 2.3 Spesifikasi per Section

#### 2.3.1 Hero
- **Layout**: dua kolom di desktop (teks kiri, Photo Card kanan); stack vertikal di mobile (teks atas, kartu bawah).
- **Konten teks**: greeting/sapaan singkat, nama besar (Aris Suryana), headline/role (mis. "Frontend Developer"), 1–2 kalimat tagline, 2 CTA: "View Projects" (primary) dan "Contact Me" (secondary/outline).
- **Photo Card (elemen wajib, signature element)**:
  - Kartu foto profil dengan rasio tetap (mis. 4:5), sudut membulat besar (`rounded-2xl`/`rounded-3xl`), border/bingkai halus (1px, warna aksen netral-abu gelap).
  - **Efek elegan**: gradient glow/aurora halus di belakang kartu, subtle shadow berlapis, dan micro-interaction tilt-on-hover (transform 3D ringan, max ±6°, respect `prefers-reduced-motion`).
  - Opsi tambahan dalam card: badge/status kecil ("Open to work") dan/atau overlay info (nama + role) di bagian bawah kartu dengan gradient scrim.
  - Foto: `next/image`, responsif (srcset otomatis), placeholder blur (LQIP) dihasilkan saat build. Dimensi file asli ≤ 500 KB, format WebP/AVIF.
- **Background section**: dark base + ornamen halus (grid pattern / noise / gradient radial sangat lembut) — tidak boleh mengurangi kontras teks (WCAG AA).

#### 2.3.2 About Me
- Heading + 2–3 paragraf singkat (bio profesional, latar belakang, apa yang didorong Aris).
- Opsional: 3–4 stat highlight (tahun pengalaman, jumlah proyek, dsb.) sebagai angka besar.
- Opsional: foto sekunder atau ilustrasi kecil; jika tidak ada aset, layout tetap teks yang rapi.

#### 2.3.3 Skills
- Dikelompokkan per kategori (mis. "Frontend", "Tools", "Lainnya") — bukan daftar datar panjang.
- Setiap skill berupa chip/card dengan nama (ikon opsional dari `react-icons`/`simple-icons`, diimport sebagai komponen — bukan fetch runtime).
- Layout: grid responsif (1 kolom mobile → 3 kolom desktop), gap konsisten.
- Wajib ada level/label deskriptif hanya jika data tersedia; jangan tampilkan progress bar yang mengada-ada.

#### 2.3.4 Projects
- Grid kartu proyek: 1 kolom mobile → 2–3 kolom desktop.
- Setiap kartu berisi: thumbnail (`next/image`, rasio 16:10, rounded), judul, deskripsi 1–2 kalimat, tag teknologi (chips kecil), dan link (Live Demo dan/atau GitHub, masing-masing opsional; card tanpa link tetap valid).
- Hover: lift + border accent halus; klik area kartu membuka link di tab baru (`rel="noopener noreferrer"`).
- Jika proyek > 6: tampilkan 6 teratas + tombol "View all projects" (link ke GitHub atau halaman `/projects` — default MVP: link eksternal, tanpa halaman terpisah).
- Data proyek bersumber dari satu file data terpusat (lihat 4.4), dengan validasi schema (zod) agar kartu tidak pernah break karena data kosong.

#### 2.3.5 Contact
- Heading + kalimat ajakan ("Let's work together").
- Opsi A (default MVP): daftar kanal kontak — email (mailto dengan copy-to-clipboard + feedback "Copied"), LinkedIn, GitHub — sebagai kartu/tombol besar.
- Opsi B (v1.1): form kontak (nama, email, pesan) memakai layanan pihak ketiga tanpa backend sendiri (Web3Forms/Formspree/Resend edge), dengan validasi client-side dan state (idle/sending/success/error).
- Minimal satu jalur kontak pasti berfungsi di MVP (email + socials). Form adalah enhancement, bukan blocker.

### 2.4 User Stories & Acceptance Criteria

| ID | Story | Acceptance Criteria |
|----|-------|--------------------|
| US-1 | Sebagai rekruter, saya ingin langsung memahami siapa Aris dan keahliannya dalam < 30 detik | Hero menampilkan nama, role, tagline di atas the-fold pada viewport 1366×768 dan 390×844; CTA "View Projects" terlihat tanpa scroll di desktop |
| US-2 | Sebagai pengunjung, saya ingin melihat foto profil yang tampil premium | Photo Card dirender dengan aspect ratio stabil (CLS 0 dari elemen ini), efek glow/tilt tampil di desktop, dan tetap statis-santai di mobile & `prefers-reduced-motion` |
| US-3 | Sebagai pengunjung, saya ingin membaca profil singkat Aris | Section About terbaca penuh dalam 1 layar scroll; teks kontras ≥ 4.5:1 |
| US-4 | Sebagai klien, saya ingin menilai kualitas lewat karya | Setiap kartu proyek punya gambar, judul, deskripsi, tags, minimal satu link; gambar lazy-load di bawah the-fold |
| US-5 | Sebagai pengunjung, saya ingin menghubungi Aris dengan satu klik | Link email (mailto/copy) dan minimal 2 social link berfungsi; semua external link buka tab baru dengan noopener |
| US-6 | Sebagai pengguna mobile, saya ingin navigasi mudah | Navbar collapse dengan hamburger di < 768px; menu dapat ditutup dengan klik link/klik di luar/tombol close; fokus ter-trap dengan benar saat menu terbuka (a11y) |
| US-7 | Sebagai pengguna dengan preferensi tema terang, saya tetap nyaman | Dark mode adalah tema default; toggle light/dark adalah enhancement v1.1 (default dark sesuai brief), preference disimpan di localStorage + respect `prefers-color-scheme` |
| US-8 | Sebagai content owner, saya ingin mengupdate konten tanpa refactor | Semua konten teks/foto/link tersimpan di file data terpusat (`src/data/`); mengganti proyek hanya perlu edit 1 file |

### 2.5 Non-Goals (v1.0)
- ❌ Backend, database, autentikasi, atau CMS penuh (headless CMS = v2.0 bila dibutuhkan).
- ❌ Blog/artikel (bisa jadi v2.0 via MDX).
- ❌ Multi-halaman routing kompleks — single page + anchor navigation.
- ❌ i18n/multi-bahasa.
- ❌ Animasi berat (parallax 3D, WebGL, Lottie besar) — animasi dibatasi transform/opacity, semua ≤ 300ms, opsional via `prefers-reduced-motion`.

---

## 3. AI System Requirements

Tidak ada komponen AI/ML pada produk ini. (Bagian tidak berlaku.)

---

## 4. Technical Specifications

### 4.1 Architecture Overview

- **Framework**: Next.js (App Router, versi 14+ atau 15), TypeScript (strict).
- **Struktur direktori**: `src/` directory — `src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/styles/`.
- **Styling**: Tailwind CSS (v3.4+ atau v4), dark mode default via class strategy atau konfigurasi tema custom (token warna dark-first: background, surface, border, accent).
- **Rendering**: Static Site Generation (SSG) penuh — `output: 'export'` bila deploy ke hosting statis murni, atau default Vercel SSR/ISR (tanpa biaya server). Tidak ada API route di MVP.
- **Komponen**: Server Components secara default; `"use client"` hanya untuk navbar (scroll-spy + mobile menu), Photo Card tilt, copy-to-clipboard, dan (opsional) form kontak.
- **Data flow**: `src/data/profile.ts` (atau `content/` markdown + frontmatter) → dikonsumsi komponen section → dirender saat build. Tanpa fetch runtime.
- **Font**: `next/font` (mis. Inter/Satoshi/Space Grotesk), subset latin, `display: swap` — tanpa FOUT layout shift.
- **Ikon**: `react-icons` atau `lucide-react`, tree-shaken.

### 4.2 Integration Points
| Integrasi | Kebutuhan | Catatan |
|---|---|---|
| Vercel / Netlify / GitHub Pages | Hosting & CI | Deploy otomatis dari push ke `main` |
| Google Analytics / Plausible (opsional) | Analytics | Script async, matikan di dev; Plausible lebih disarankan (privacy) |
| Web3Forms / Formspree / Resend | Form kontak (v1.1 saja) | Tanpa backend sendiri |
| OG image | `next/og` / statik | OG image statik 1200×630 dengan nama + role |

Tidak ada database, tidak ada auth.

### 4.3 Security & Privacy
- Semua link eksternal: `target="_blank" rel="noopener noreferrer"`.
- Tidak ada form yang mengirim data ke server sendiri (MVP) → tidak ada PII yang disimpan.
- Kepatuhan: hanya privacy-friendly analytics (atau tidak sama sekali); tidak ada cookie banner yang diperlukan bila tanpa tracking pihak ketiga yang invasive.
- Env var (kunci form pihak ketiga, v1.1) via `.env.local` + `NEXT_PUBLIC_` hanya untuk non-sekret.
- `Content-Security-Policy` dasar disarankan via header hosting.

### 4.4 Kontrak Data (content schema)
`src/data/profile.ts` (TypeScript, divalidasi zod saat build/dev):
```ts
{
  name: string; role: string; tagline: string;
  photo: string; // path di public/ atau src/assets
  about: string[]; // paragraf
  stats?: { label: string; value: string }[];
  skills: { category: string; items: { name: string; icon?: string }[] }[];
  projects: { title: string; description: string; image?: string;
              tags: string[]; liveUrl?: string; repoUrl?: string }[];
  contact: { email: string; socials: { label: string; url: string }[] };
}
```
Semua field opsional harus punya fallback render aman (section tidak boleh crash/blank karena data kosong).

### 4.5 Performance & Quality Budget
- Gambar: `next/image` semua tempat, `sizes` prop benar, AVIF/WebP otomatis, lazy di bawah fold, `priority` hanya pada foto hero.
- Animasi: CSS transform/opacity saja; gunakan Tailwind + `transition`; tilt via event pointer dengan `requestAnimationFrame`.
- Aksesibilitas: semantic landmarks (`header/main/section/footer`), heading hierarchy (satu h1 di Hero), semua interaktif keyboard-accessible, focus-visible ring, alt text untuk semua gambar, kontras WCAG AA (teks normal ≥ 4.5:1).
- SEO: metadata API Next.js (title, description, canonical, Open Graph, Twitter card), `robots.txt`, `sitemap.xml` (statis), favicon + apple-touch-icon.
- Lint/format: ESLint (next/core-web-vitals) + Prettier; `next build` harus lolos tanpa error/warning TypeScript.

### 4.6 Definition of Done (Engineering)
- [ ] `npm run build` sukses, tanpa error TS/ESLint.
- [ ] Lighthouse (mobile, prod build) memenuhi KPI di 1.3.
- [ ] Diuji manual di Chrome, Firefox, Safari (desktop) + Chrome & Safari iOS (mobile).
- [ ] Semua section & US di 2.4 lolos acceptance criteria.
- [ ] Konten diisi dengan data asli Aris (bukan lorem ipsum) di branch rilis.
- [ ] README menjelaskan cara mengganti konten (edit `src/data/`).

---

## 5. Risks & Roadmap

### 5.1 Phased Rollout
| Fase | Scope | Estimasi |
|---|---|---|
| **MVP (v1.0)** | 5 section lengkap, dark mode, responsive, SSG deploy, SEO dasar, konten asli | 1–1.5 minggu |
| **v1.1** | Toggle light/dark, form kontak (pihak ketiga), halaman `/projects` detail, animasi scroll-reveal halus | +3–5 hari |
| **v2.0** | Blog (MDX), headless CMS (opsional), testimonial, i18n | Sesuai kebutuhan |

### 5.2 Technical Risks & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Foto profil asli tidak tersedia / kualitas rendah | Hero kehilangan elemen signature | Siapkan placeholder berkelas; spek dimensinya jelas; minta foto ≥ 1000px sejak hari-1 |
| Over-animation mengganggu performa | Lighthouse turun | Budget animasi ketat (4.5); audit Lighthouse sebelum rilis |
| Tailwind v4 vs v3 perbedaan tooling | Konfigurasi dark theme beda cara | Tech Lead pilih satu dan dokumentasikan di README |
| Konten (copy) tidak siap dari klien | Blokir rilis | Draft copy disiapkan oleh tim dan disetujui Aris; semua copy terpusat di 1 file data sehingga revisi murah |
| Link proyek mati/repo private | Kartu proyek mengecewakan | Validasi URL saat build; default sembunyikan link kosong |
| Safari/iOS quirks pada tilt & gradient glow | Visual rusak di iOS | Uji Safari sejak dev; fallback: matikan tilt bila `hover: none` |

### 5.3 Open Questions (perlu konfirmasi Aris/klien)
1. Foto profil final — kapan tersedia, berapa resolusinya?
2. Daftar proyek aktual (maks. 6 terbaik) + link live/repo?
3. Data kontak: email profesional dan akun social mana yang dipublikasikan?
4. Bahasa konten: Indonesia, Inggris, atau keduanya (memengaruhi copy, bukan arsitektur)?
5. Domain & hosting: sudah punya domain? Default rekomendasi: Vercel + domain kustom.
