import { NextConfig } from "next";

const nextConfig: NextConfig = {
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
async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: 'https://pure-life-crm.vercel.app/:path*',
        permanent: true,           // 308 (best for SEO) or false for 307 temporary
      },
    ];
  },
};

export default nextConfig;
