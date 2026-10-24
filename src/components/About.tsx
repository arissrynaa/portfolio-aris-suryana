import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-t border-zinc-800/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="about-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          About Me
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {profile.about.map((para, i) => (
              <p key={i} className="leading-7 text-zinc-400">
                {para}
              </p>
            ))}
          </div>
          {profile.stats && profile.stats.length > 0 && (
            <dl className="flex flex-row gap-6 md:flex-col md:gap-6">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <dd className="text-3xl font-bold text-indigo-400">{stat.value}</dd>
                  <dt className="mt-1 text-sm text-zinc-400">{stat.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
