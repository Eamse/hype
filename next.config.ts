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
