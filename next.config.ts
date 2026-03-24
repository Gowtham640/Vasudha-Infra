import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Turbopack to treat this project directory as the workspace root.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Allow remote image providers used in app content and admin previews.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
