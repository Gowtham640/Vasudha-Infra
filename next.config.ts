import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Turbopack to treat this project directory as the workspace root.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Issue 1: Next/Image requires explicit host + path patterns; wildcards like "**" are unreliable.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
