export interface Profile {
  name: string;
  role: string;
  tagline: string;
  photo: string;
  fallbackPhoto: string;
  about: string[];
  stats?: { label: string; value: string }[];
  skills: { category: string; items: { name: string; icon?: string }[] }[];
  projects: {
    title: string;
    description: string;
    image?: string;
    tags: string[];
    liveUrl?: string;
    repoUrl?: string;
  }[];
  contact: { email: string; socials: { label: string; url: string }[] };
}

/**
 * Single source of truth for all site content.
 * Edit this file to update the portfolio — no component changes needed.
 */
export const profile: Profile = {
  name: "Aris Suryana",
  role: "Frontend Developer",
  tagline:
    "Saya membangun antarmuka web yang cepat, aksesibel, dan enak dipakai — dari desain piksel sampai production.",
  photo: "/images/profile.jpg",
  fallbackPhoto: "/images/avatar.svg",
  about: [
    "Halo! Saya Aris, seorang frontend developer dengan fokus pada ekosistem React dan Next.js. Saya senang mengubah desain yang rumit menjadi kode yang bersih, cepat, dan mudah dirawat.",
    "Selama beberapa tahun terakhir saya mengerjakan berbagai proyek web — dari landing page perusahaan sampai dashboard internal — selalu dengan perhatian pada performa, aksesibilitas, dan detail visual.",
    "Di luar coding, saya menikmati mengeksplorasi tooling modern dan berbagi apa yang saya pelajari dengan komunitas developer Indonesia.",
  ],
  stats: [
    { label: "Tahun Pengalaman", value: "5+" },
    { label: "Proyek Selesai", value: "20+" },
    { label: "Klien Puas", value: "12+" },
  ],
  skills: [
    {
      category: "Frontend",
      items: [
        { name: "TypeScript" },
        { name: "React" },
        { name: "Next.js" },
        { name: "Tailwind CSS" },
        { name: "HTML & CSS" },
      ],
    },
    {
      category: "Tools",
      items: [
        { name: "Git & GitHub" },
        { name: "Vite" },
        { name: "Figma" },
        { name: "Vercel" },
      ],
    },
    {
      category: "Lainnya",
      items: [
        { name: "Testing (Vitest)" },
        { name: "REST API" },
        { name: "A11y" },
        { name: "SEO" },
      ],
    },
  ],
  projects: [
    {
      title: "SahamKu Dashboard",
      description:
        "Dashboard pemantauan saham real-time dengan grafik interaktif dan mode gelap yang bisa dikustomisasi.",
      image: "/images/project-1.svg",
      tags: ["Next.js", "TypeScript", "Chart.js"],
      liveUrl: "https://example.com/sahamku",
      repoUrl: "https://github.com/arissuryana/sahamku",
    },
    {
      title: "TokoKita E-commerce",
      description:
        "Platform e-commerce sederhana dengan katalog produk, keranjang, dan checkout tanpa backend berat.",
      image: "/images/project-2.svg",
      tags: ["React", "Tailwind CSS", "Stripe"],
      liveUrl: "https://example.com/tokokita",
    },
    {
      title: "Catat Harian",
      description:
        "Aplikasi catatan PWA dengan dukungan offline, pencarian instan, dan sinkronisasi lokal.",
      image: "/images/project-3.svg",
      tags: ["PWA", "IndexedDB", "React"],
      repoUrl: "https://github.com/arissuryana/catat-harian",
    },
    {
      title: "Rumah Sakit Queue",
      description:
        "Sistem antrean pasien berbasis web untuk klinik kecil, dengan display TV dan notifikasi suara.",
      image: "/images/project-4.svg",
      tags: ["Next.js", "Socket.io"],
      liveUrl: "https://example.com/antrian",
    },
    {
      title: "Landing Page SaaS",
      description:
        "Halaman marketing SaaS dengan skor Lighthouse 98+, animasi halus, dan SEO terstruktur.",
      image: "/images/project-5.svg",
      tags: ["Next.js", "SEO", "Tailwind CSS"],
    },
    {
      title: "Library CLI",
      description:
        "CLI tool untuk mengelola koleksi buku pribadi — impor dari Goodreads, ekspor JSON/CSV.",
      image: "/images/project-6.svg",
      tags: ["Node.js", "TypeScript"],
      repoUrl: "https://github.com/arissuryana/library-cli",
    },
  ],
  contact: {
    email: "halo@arissuryana.dev",
    socials: [
      { label: "GitHub", url: "https://github.com/arissuryana" },
      { label: "LinkedIn", url: "https://linkedin.com/in/arissuryana" },
      { label: "Twitter / X", url: "https://x.com/arissuryana" },
    ],
  },
};
