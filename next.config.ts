import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // vercel branch: fullstack — output:"export" removed (incompatible with
  // force-dynamic route handlers); cacheComponents disabled for same reason.
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
