import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { decode } from 'next-auth/jwt';

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

async function verifyOnboarding(request: NextRequest) {
  const cookieName = 'authjs.session-token';
  const sessionToken = request.cookies.get(cookieName)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
    });
    if (decoded?.isOnboarded) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 어드민 경로는 JWT 쿠키 검증
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return verifyAdminToken(request);
  }

  // 온보딩 페이지 접근 제어
  if (pathname === '/onboarding') {
    return verifyOnboarding(request);
  }

  // 나머지는 NextAuth로 처리 (일반 유저)
  return (auth as unknown as (req: NextRequest) => Promise<NextResponse>)(request);
}

export const config = {
  matcher: ['/onboarding', '/admin/:path*', '/api/admin/:path*'],
};
