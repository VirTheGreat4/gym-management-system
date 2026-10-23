import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.app.github.dev',
        'humble-fiesta-r766gjjxvpg3x995-3000.app.github.dev',
        'localhost:3000',
      ],
    },
  },
};

export default nextConfig;
