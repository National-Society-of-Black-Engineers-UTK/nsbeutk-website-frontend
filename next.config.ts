import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid restoring stale Turbopack task data across development sessions.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
