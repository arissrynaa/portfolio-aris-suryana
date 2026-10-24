"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const sections = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (id: string) =>
    `rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
      active === id ? "text-white" : "text-zinc-400 hover:text-zinc-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#hero" className="text-lg font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
          {profile.name}
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? "true" : undefined} className={linkClass(id)}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${profile.contact.email}`}
              className="ml-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Hire me
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 md:hidden"
        >
          <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-16 z-40 bg-zinc-950/95 backdrop-blur md:hidden"
          onClick={() => setOpen(false)}
        >
          <ul className="flex flex-col gap-2 p-6">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                    active === id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
