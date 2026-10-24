import Image from "next/image";
import { profile } from "@/data/profile";

const MAX_VISIBLE = 6;

export default function Projects() {
  const visible = profile.projects.slice(0, MAX_VISIBLE);
  const hasMore = profile.projects.length > MAX_VISIBLE;

  return (
    <section id="projects" aria-labelledby="projects-heading" className="border-t border-zinc-800/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="projects-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Projects
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => {
            const link = project.liveUrl ?? project.repoUrl;
            const Card = (
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 motion-reduce:transform-none">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={`Tangkapan layar proyek ${project.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600" aria-hidden="true">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{project.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Teknologi yang dipakai">
                    {project.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {(project.liveUrl || project.repoUrl) && (
                    <div className="mt-4 flex gap-4 text-sm font-medium">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                          Live Demo ↗
                        </a>
                      )}
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
            return link ? (
              <a
                key={project.title}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                {Card}
              </a>
            ) : (
              <div key={project.title}>{Card}</div>
            );
          })}
        </div>
        {hasMore && (
          <div className="mt-10 text-center">
            <a
              href={profile.contact.socials.find((s) => s.label === "GitHub")?.url ?? "#projects"}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              View all projects
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
