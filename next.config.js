/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'raw-loader',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blackbuck-bucket.s3.ap-northeast-1.amazonaws.com',
        pathname: '/uploads/**',
      },
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
    ],
  },
};

module.exports = nextConfig; 