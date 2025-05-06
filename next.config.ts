import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // リクエストパス
        destination: 'http://localhost:3000/api/:path*', // リダイレクト先
      },
    ];
  },
};

export default nextConfig;