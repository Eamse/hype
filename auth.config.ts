import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

// Edge Runtime 호환 설정 (Prisma 제외)
// 미들웨어에서만 사용
export const authConfig: NextAuthConfig = {
  providers: [Google],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnboarded = auth?.user?.isOnboarded ?? false;
      const path = nextUrl.pathname;

      if (
        path === '/login' ||
        path === '/signup' ||
        path.startsWith('/admin') ||
        path.startsWith('/api/')
      )
        return true;

      // 비로그인 → 접근 차단
      if (!isLoggedIn) return false;

      // 로그인 완료 + 온보딩 미완료 → /onboarding 으로 강제 이동
      if (!isOnboarded && path !== '/onboarding') {
        return Response.redirect(new URL('/onboarding', nextUrl));
      }

      return true;
    },
  },
};
