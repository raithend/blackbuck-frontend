import type { NextConfig } from 'next';

// 環境変数からS3バケット名を取得
const s3BucketName = process.env.AWS_S3_BUCKET || 'blackbuck-bucket';

// 開発環境とプロダクション環境の両方のバケットを許可
const allowedHostnames = [
  `${s3BucketName}.s3.ap-northeast-1.amazonaws.com`,
  'blackbuck-dev-bucket.s3.ap-northeast-1.amazonaws.com',
  'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
];

const nextConfig: NextConfig = {
  images: {
    // unoptimized: true,
    remotePatterns: allowedHostnames.flatMap(hostname => [
      {
        protocol: 'https' as const,
        hostname,
        pathname: '/photo-bubbles/**',
      },
      {
        protocol: 'https' as const,
        hostname,
        pathname: '/headers/**',
      },
      {
        protocol: 'https' as const,
        hostname,
        pathname: '/avatars/**',
      },
      {
        protocol: 'https' as const,
        hostname,
        pathname: '/profiles/**',
      },
      {
        protocol: 'https' as const,
        hostname,
        pathname: '/posts/**',
      },
    ]),
  },

};

export default nextConfig; 