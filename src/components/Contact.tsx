"use client";

import { useState } from "react";
import { useProfile } from "./ContentProvider";

export default function Contact() {
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — mailto link still works
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="border-t border-zinc-800/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="contact-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Let&apos;s work together
        </h2>
        <p className="mt-3 max-w-xl text-zinc-400">
          Punya proyek, lowongan, atau sekadar ingin menyapa? Hubungi saya lewat salah satu kanal di bawah.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={copyEmail}
            className="flex flex-col items-start gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-colors hover:border-indigo-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <span className="text-sm font-medium text-zinc-500">Email {copied && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">Copied!</span>}</span>
            <span className="break-all text-lg font-semibold text-white">{profile.contact.email}</span>
            <span className="mt-1 text-xs text-zinc-500">Klik untuk copy alamat email</span>
          </button>
          {profile.contact.socials.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-indigo-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              <span className="text-sm font-medium text-zinc-500">{social.label}</span>
              <span className="text-lg font-semibold text-white">{social.url.replace(/^https?:\/\//, "")} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
