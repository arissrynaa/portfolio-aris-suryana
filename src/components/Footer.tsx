import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-zinc-500">
          © {new Date(Date.UTC(2026, 9, 24)).getFullYear()} {profile.name}. Dibuat dengan Next.js & Tailwind CSS.
        </p>
        <ul className="flex gap-4 text-sm">
          {profile.contact.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                {social.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#hero" className="text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
              Back to top ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
