import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Preserve this existing app's prefetch behavior during the security update.
  // Adopt the newer Partial Prefetching behavior as a separate navigation review.
  partialPrefetching: false,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "sam-murgatroyd.co.uk",
          },
        ],
        destination: "https://www.sam-murgatroyd.co.uk/:path*",
        permanent: true,
      },
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
