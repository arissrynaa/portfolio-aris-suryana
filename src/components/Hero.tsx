import PhotoCard from "./PhotoCard";
import { profile } from "@/data/profile";

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* subtle background ornament */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Halo, saya 👋</p>
          <h1 id="hero-heading" className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-3 text-xl font-medium text-zinc-300 sm:text-2xl">{profile.role}</p>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">{profile.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Contact Me
            </a>
          </div>
        </div>
        <PhotoCard />
      </div>
    </section>
  );
}
