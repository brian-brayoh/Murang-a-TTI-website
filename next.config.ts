import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old media URLs -> files mirrored by `npm run migrate`
      { source: "/wp-content/uploads/:path*", destination: "/uploads/migrated/:path*", permanent: true },
      // Old WordPress pages -> new pages
      { source: "/downloads-2", destination: "/downloads", permanent: true },
      { source: "/downloads-2/", destination: "/downloads", permanent: true },
      { source: "/tenders-and-careers", destination: "/tenders-careers", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/blog-2", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
