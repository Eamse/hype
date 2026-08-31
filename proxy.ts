import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { decode } from 'next-auth/jwt';
import { isSameOriginRequest } from '@/lib/csrf';

const { auth } = NextAuth(authConfig);

// 어드민 로그인 페이지 경로 — URL 추측을 어렵게 하기 위해 /admin 하위가 아닌 난독화된 경로 사용
const ADMIN_LOGIN_PATH = '/gatekeeper-7f3k9';

async function verifyAdminToken(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 API는 통과 (로그인 페이지 자체는 matcher에 안 걸려있어 여기 안 들어옴)
  if (pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  // /admin(페이지)은 로그인 안 됐을 때 존재 자체를 드러내지 않도록 404로 응답.
  // 실제 로그인은 오직 ADMIN_LOGIN_PATH를 알아야만 접근 가능.
  const isPage = !pathname.startsWith('/api');
  const denied = isPage
    ? NextResponse.rewrite(new URL('/404', request.url), { status: 404 })
    : NextResponse.json({ message: 'Admin not found' }, { status: 401 });

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return denied;
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return denied;
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

  // 세션 쿠키 기반 API 전체에 CSRF 방어: 상태 변경 요청은 Origin이 자기 자신인지 확인
  // (/api/auth는 NextAuth가 자체 CSRF 토큰으로 별도 처리하므로 제외)
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }
  }

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
  matcher: ['/onboarding', '/admin/:path*', '/api/:path*'],
};
