import { proxy } from './proxy';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/onboarding', '/gatekeeper-7f3k9/panel/:path*', '/api/:path*'],
};
