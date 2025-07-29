import type { NextConfig } from 'next';

// 環境変数からS3バケット名を取得
const s3BucketName = process.env.AWS_S3_BUCKET || 'blackbuck-bucket';
const s3Hostname = `${s3BucketName}.s3.ap-northeast-1.amazonaws.com`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: s3Hostname,
        pathname: '/photo-bubbles/**',
      },
      {
        protocol: 'https',
        hostname: s3Hostname,
        pathname: '/headers/**',
      },
      {
        protocol: 'https',
        hostname: s3Hostname,
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: s3Hostname,
        pathname: '/profiles/**',
      },
      {
        protocol: 'https',
        hostname: s3Hostname,
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