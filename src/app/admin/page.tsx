"use client";

import { useCallback, useEffect, useState } from "react";

type ImageMeta = { id: string; mime: string; updated_at: string; size: number };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // content editor
  const [contentKey, setContentKey] = useState("profile");
  const [contentValue, setContentValue] = useState("");
  const [contentMsg, setContentMsg] = useState("");

  // images
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [imgMsg, setImgMsg] = useState("");

  const loadContent = useCallback(async (key: string) => {
    setContentMsg("");
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      setContentValue(json.content?.[key] ?? "");
    } catch {
      setContentMsg("Failed to load content");
    }
  }, []);

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch("/api/images");
      const json = await res.json();
      setImages(json.images ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      setAuthed(json.authenticated);
      if (json.authenticated) await loadImages();
    })();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      setAuthed(true);
      await loadImages();
    } else {
      setError("Invalid password");
    }
  }

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    setAuthed(false);
  }

  async function saveContent(e: React.FormEvent) {
    e.preventDefault();
    setContentMsg("Saving...");
    const res = await fetch(`/api/content/${encodeURIComponent(contentKey)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: contentKey, value: contentValue }),
    });
    setContentMsg(res.ok ? "Saved ✓" : `Error ${res.status}`);
    if (res.ok) await loadContent(contentKey);
  }

  async function uploadImage(file: File) {
    setImgMsg("Uploading...");
    const buf = await file.arrayBuffer();
    const base64 = btoa(
      Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join("")
    );
    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mime: file.type || "image/png", data: base64 }),
    });
    const json = await res.json();
    setImgMsg(res.ok ? `Uploaded: ${json.id}` : `Error: ${json.error ?? res.status}`);
    if (res.ok) await loadImages();
  }

  async function deleteImage(id: string) {
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) await loadImages();
  }

  if (authed === null) {
    return <main className="p-8 text-neutral-400">Loading…</main>;
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4"
        >
          <h1 className="text-xl font-semibold text-neutral-100">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-100 px-3 py-2 font-medium text-neutral-900 hover:bg-white"
          >
            Log in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-neutral-950 p-6 space-y-10 text-neutral-100">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
        >
          Log out
        </button>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Content</h2>
        <div className="flex gap-2">
          <input
            value={contentKey}
            onChange={(e) => setContentKey(e.target.value)}
            placeholder="key (e.g. profile)"
            className="w-56 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          <button
            onClick={() => loadContent(contentKey)}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Load
          </button>
        </div>
        <form onSubmit={saveContent} className="space-y-2">
          <textarea
            value={contentValue}
            onChange={(e) => setContentValue(e.target.value)}
            rows={12}
            placeholder="JSON or text value for this key"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
            >
              Save
            </button>
            {contentMsg && <span className="text-sm text-neutral-400">{contentMsg}</span>}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Images</h2>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = "";
          }}
          className="block text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-900"
        />
        {imgMsg && <p className="text-sm text-neutral-400">{imgMsg}</p>}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/images/${img.id}`}
                alt={img.id}
                className="h-28 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-2 text-xs">
                <span className="truncate text-neutral-400">
                  {(img.size / 1024).toFixed(0)} KB · {img.mime}
                </span>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="rounded px-2 py-0.5 text-red-400 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
