import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'images.unsplash.com',
      'https://randomuser.me/api/*',
      'randomuser.me',
      'www.lathampool.com',
      "images.pexels.com"
    ],
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
