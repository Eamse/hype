import type { NextRequest } from 'next/server';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// 세션 쿠키(SameSite=lax)만으로는 top-level GET 요청의 CSRF를 막지 못하므로,
// 상태를 바꾸는 요청은 Origin(없으면 Referer)이 이 서버 자신인지 한 번 더 검증한다.
// 세션 쿠키로 인증하는 요청은 애초에 브라우저에서만 오므로, Origin/Referer가 둘 다 없는
// 요청은 통과시키지 않는다 — 통과시키면 그 헤더가 없는 것 자체를 우회 수단으로 악용될 수 있음.
export function isSameOriginRequest(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return false;
}
