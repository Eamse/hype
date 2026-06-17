import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma, libsql은 Node.js 전용 모듈 → 브라우저 번들에서 제외
  serverExternalPackages: [
    '@prisma/client',
    '@libsql/client',
    '@prisma/adapter-libsql',
  ],
  images: {
    remotePatterns: [
      {
        hostname: 'pub-c271b5fcdcc34eca9be592092db31905.r2.dev',
      },
    ],
  },
};

export default nextConfig;
