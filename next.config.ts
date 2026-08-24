import type { NextConfig } from 'next';

const R2_HOST = 'pub-ba784eb2bec14ac984de128566a0665e.r2.dev';
// R2 커스텀 도메인 — r2.dev는 Cloudflare가 테스트/개발용으로만 쓰라고 명시한
// 도메인이라 해외에서 불안정했음(필리핀에서 이미지 깨짐 확인). 앞으로 새로
// 올리는 파일은 이 도메인으로 저장되지만, 기존 파일들은 여전히 R2_HOST를
// 가리키므로 당분간 둘 다 허용해야 함
const R2_CUSTOM_HOST = 'photo.hypewedding.kr';

const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  `img-src 'self' data: blob: https://${R2_HOST} https://${R2_CUSTOM_HOST} https://lh3.googleusercontent.com`,
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
        hostname: R2_CUSTOM_HOST,
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // R2 업로드 파일명은 요청마다 랜덤 UUID가 붙어 URL이 절대 재사용되지 않으므로
    // 오래(1년) 캐싱해도 이미지가 바뀐 뒤 옛 버전이 보이는 문제가 생기지 않음
    minimumCacheTTL: 60 * 60 * 24 * 365,
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
