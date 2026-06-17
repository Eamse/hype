import type { NextConfig } from 'next';

const R2_HOST = 'pub-c271b5fcdcc34eca9be592092db31905.r2.dev';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'sharp',
  ],
  images: {
    remotePatterns: [
      {
        hostname: 'pub-c271b5fcdcc34eca9be592092db31905.r2.dev',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
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
