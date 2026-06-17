import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const { auth } = NextAuth(authConfig);

async function verifyAdminToken(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지 & 로그인 API는 통과
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 어드민 경로는 JWT 쿠키 검증
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return verifyAdminToken(request);
  }

  // 나머지는 NextAuth로 처리 (일반 유저)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth as any)(request);
}

export const config = {
  matcher: ['/onboarding', '/admin/:path*', '/api/admin/:path*'],
};
