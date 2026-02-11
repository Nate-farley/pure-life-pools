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
  compress: true,
  poweredByHeader: false,
  experimental: {
    scrollRestoration: false,
    esmExternals: 'loose',
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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
          name: '[name].[hash].[ext]',
        },
      },
    });
    return config;
  },
};

export default nextConfig;
