import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/journal",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/journal/:slug",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
