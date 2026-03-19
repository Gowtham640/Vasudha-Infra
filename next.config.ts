import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Turbopack to treat this project directory as the workspace root.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
