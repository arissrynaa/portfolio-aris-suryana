import type { NextConfig } from "next";

// vercel branch: fullstack mode — NO output:"export" (API route handlers + /admin
// need a Node server on Vercel). See VERCEL_DEPLOY.md. Main branch keeps the
// static-export config for the Vela platform.
const nextConfig: NextConfig = {
  // cacheComponents disabled: incompatible with `force-dynamic` route handlers
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
