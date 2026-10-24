"use client";

import { useProfile } from "./ContentProvider";

export default function Skills() {
  const profile = useProfile();
  return (
    <section id="skills" aria-labelledby="skills-heading" className="border-t border-zinc-800/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="skills-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Skills
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {profile.skills.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">{group.category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-300"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
