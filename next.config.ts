import { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'picsum.photos',
      'images.unsplash.com',
      'randomuser.me',
      'www.lathampool.com',
      'images.pexels.com'
    ],
  },
  turbopack: {},
  compress: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: false,

  },
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
