"use client";

import { useRef, useState } from "react";
import { useProfile } from "./ContentProvider";

export default function PhotoCard() {
  const profile = useProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(profile.photo);
  const [failed, setFailed] = useState(false);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    )
      return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    window.requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
    });
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    });
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* gradient glow behind the card */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.25),transparent_60%)] blur-2xl"
      />
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="relative aspect-[4/5] rounded-3xl border border-zinc-700/70 bg-zinc-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`Foto profil ${profile.name}`}
          loading="eager"
          decoding="async"
          onError={() => {
            if (!failed) {
              setFailed(true);
              setImgSrc(profile.fallbackPhoto);
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* gradient scrim + overlay info */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <div>
            <p className="text-lg font-semibold text-white">{profile.name}</p>
            <p className="text-sm text-zinc-300">{profile.role}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Open to work
          </span>
        </div>
      </div>
    </div>
  );
}
