import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { decode } from 'next-auth/jwt';
import { isSameOriginRequest } from '@/lib/csrf';
import { ADMIN_LOGIN_PATH, ADMIN_PANEL_PATH } from '@/lib/admin-paths';

const { auth } = NextAuth(authConfig);

// 어드민 대시보드 실제 라우트는 app/gatekeeper-7f3k9/panel에 있음 (app/admin은 존재하지
// 않으므로 /admin은 Next.js가 네이티브 404를 반환함 — 별도 차단 로직 불필요)
async function verifyAdminPanel(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }
}

async function verifyAdminApi(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 API는 통과
  if (pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Admin not found' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ message: 'Admin not found' }, { status: 401 });
  }
}

async function verifyOnboarding(request: NextRequest) {
  // 프로토콜 감지에 의존하지 않고 두 쿠키 이름을 다 확인 — 리버스 프록시가
  // protocol을 다르게 넘겨도(또는 나중에 설정이 바뀌어도) 안전하게 동작
  const secureCookieName = '__Secure-authjs.session-token';
  const plainCookieName = 'authjs.session-token';
  const cookieName = request.cookies.get(secureCookieName)?.value
    ? secureCookieName
    : plainCookieName;
  const sessionToken = request.cookies.get(cookieName)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await decode({
      token: sessionToken,
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
    });

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

  if (pathname.startsWith(ADMIN_PANEL_PATH)) {
    return verifyAdminPanel(request);
  }

  if (pathname.startsWith('/api/admin')) {
    return verifyAdminApi(request);
  }

  // 온보딩 페이지 접근 제어
  if (pathname === '/onboarding') {
    return verifyOnboarding(request);
  }

  // 나머지는 NextAuth로 처리 (일반 유저)
  return (auth as unknown as (req: NextRequest) => Promise<NextResponse>)(request);
}
