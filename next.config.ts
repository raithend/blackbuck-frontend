import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/photo-bubbles/**',
      },
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/headers/**',
      },
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/profiles/**',
      },
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/posts/**',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.yaml': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.yml': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig; 