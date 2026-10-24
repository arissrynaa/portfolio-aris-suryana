"use client";

import { useCallback, useEffect, useState } from "react";

type ImageMeta = { id: string; mime: string; updated_at: string; bytes: number; url: string };

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  const json = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
  if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json;
}

export default function AdminPage() {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [images, setImages] = useState<ImageMeta[]>([]);
  const [imgMsg, setImgMsg] = useState("");

  const loadContent = useCallback(async () => {
    try {
      const json = await api("/api/content");
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(json.sections ?? {})) {
        next[key] = JSON.stringify(value, null, 2);
      }
      setSections(next);
      setLoaded(true);
    } catch (e) {
      setSaveMsg(`Gagal memuat konten: ${(e as Error).message}`);
    }
  }, []);

  const loadImages = useCallback(async () => {
    try {
      const json = await api("/api/images");
      setImages(json.images ?? []);
    } catch (e) {
      setImgMsg(`Gagal memuat gambar: ${(e as Error).message}`);
    }
  }, []);

  useEffect(() => {
    loadContent();
    loadImages();
  }, [loadContent, loadImages]);

  const SECTION_KEYS = ["hero", "about", "skills", "projects", "contact"];

  function setValue(key: string, value: string) {
    setSections((s) => ({ ...s, [key]: value }));
    setDirty((d) => ({ ...d, [key]: true }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function saveAll() {
    const payload: Record<string, unknown> = {};
    let bad = "";
    for (const key of SECTION_KEYS) {
      if (!dirty[key]) continue;
      const text = sections[key] ?? "";
      try {
        payload[key] = JSON.parse(text); // validate before sending
      } catch (err) {
        setErrors((e2) => ({ ...e2, [key]: `JSON tidak valid: ${(err as Error).message}` }));
        if (!bad) bad = key;
      }
    }
    if (bad) {
      setSaveMsg(`Perbaiki JSON pada section "${bad}".`);
      return;
    }
    if (Object.keys(payload).length === 0) {
      setSaveMsg("Tidak ada perubahan untuk disimpan.");
      return;
    }
    setSaveMsg("Menyimpan…");
    try {
      await api("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: payload }),
      });
      setDirty({});
      setSaveMsg("Konten tersimpan ✓");
    } catch (e) {
      setSaveMsg(`Gagal menyimpan: ${(e as Error).message}`);
    }
  }

  async function uploadImage(file: File) {
    setImgMsg("Mengunggah…");
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join(""));
      const json = await api("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: file.type || "application/octet-stream", data: base64 }),
      });
      setImgMsg(`Tersimpan: ${json.url} ✓`);
      await loadImages();
    } catch (e) {
      setImgMsg(`Gagal upload: ${(e as Error).message}`);
    }
  }

  async function deleteImage(id: string) {
    if (!confirm(`Hapus gambar "${id}"?`)) return;
    try {
      await api(`/api/images/${encodeURIComponent(id)}`, { method: "DELETE" });
      await loadImages();
    } catch (e) {
      setImgMsg(`Gagal hapus: ${(e as Error).message}`);
    }
  }

  function copyImageUrl(id: string) {
    const full = `${location.origin}/api/images/${id}`;
    navigator.clipboard?.writeText(full);
  }

  const dirtyKeys = SECTION_KEYS.filter((k) => dirty[k]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-neutral-950 p-6 space-y-10 text-neutral-100">
      <header>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Kelola konten &amp; gambar portfolio tanpa edit kode. Login owner di bawah bila sesi berakhir.
        </p>
        <a href="/" className="mt-2 inline-block text-sm text-indigo-400 hover:underline">
          ← Lihat site
        </a>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Konten</h2>
        {!loaded && <p className="text-sm text-neutral-400">Memuat konten…</p>}
        {SECTION_KEYS.map((key) => (
          <div key={key} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label className="flex items-center justify-between text-sm font-medium text-neutral-300">
              <span className="font-mono">{key}</span>
              {dirty[key] && <span className="text-amber-400">belum disimpan</span>}
            </label>
            <textarea
              value={sections[key] ?? ""}
              onChange={(e) => setValue(key, e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder="{}"
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-100 outline-none focus:border-neutral-500"
            />
            {errors[key] && <p className="mt-1 text-xs text-red-400">{errors[key]}</p>}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button
            onClick={saveAll}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Simpan Semua Perubahan
          </button>
          <button
            onClick={loadContent}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Muat Ulang
          </button>
          <span className="text-sm text-neutral-400">
            {dirtyKeys.length > 0 ? `Belum disimpan: ${dirtyKeys.join(", ")}` : saveMsg || "Semua tersimpan ✓"}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Gambar</h2>
        <p className="text-xs text-neutral-500">
          Maks 4MB per gambar. Gunakan URL <code className="text-neutral-400">/api/images/&lt;id&gt;</code> di field
          gambar konten (mis. profile.photo atau project image).
        </p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = "";
          }}
          className="block text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-400"
        />
        {imgMsg && <p className="text-sm text-neutral-400">{imgMsg}</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.id} className="h-28 w-full object-cover" />
              <div className="p-2 text-xs">
                <p className="truncate text-neutral-300">{img.id}</p>
                <p className="text-neutral-500">
                  {(img.bytes / 1024).toFixed(0)} KB · {img.mime}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => copyImageUrl(img.id)}
                    className="rounded border border-neutral-700 px-2 py-0.5 text-neutral-300 hover:bg-neutral-800"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="rounded px-2 py-0.5 text-red-400 hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {images.length === 0 && !imgMsg && (
          <p className="text-sm text-neutral-500">Belum ada gambar.</p>
        )}
      </section>
    </main>
  );
}
