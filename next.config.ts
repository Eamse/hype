import type { NextConfig } from 'next';

const R2_HOST = 'pub-ba784eb2bec14ac984de128566a0665e.r2.dev';

const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  `img-src 'self' data: blob: https://${R2_HOST} https://lh3.googleusercontent.com`,
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' ws: wss:",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  serverExternalPackages: [
    '@prisma/client',
    'pg',
    '@prisma/adapter-pg',
    'sharp',
  ],
  images: {
    remotePatterns: [
      {
        hostname: R2_HOST,
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // R2 업로드 파일명은 요청마다 랜덤 UUID가 붙어 URL이 절대 재사용되지 않으므로
    // 오래(1년) 캐싱해도 이미지가 바뀐 뒤 옛 버전이 보이는 문제가 생기지 않음
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // R2 이미지는 업로드 시점에 이미 sharp로 압축(1600px, q82)해두므로, 약한 VPS에서
    // 서버가 또 리사이즈하는 과정을 완전히 건너뛰어 콜드 캐시 시 발생하던 지연을 없앰
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
