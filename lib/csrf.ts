import type { NextRequest } from 'next/server';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// 세션 쿠키(SameSite=lax)만으로는 top-level GET 요청의 CSRF를 막지 못하므로,
// 상태를 바꾸는 요청은 Origin이 이 서버 자신인지 한 번 더 검증한다.
export function isSameOriginRequest(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get('origin');
  if (!origin) return true; // 브라우저가 아닌 클라이언트(curl 등) 호출은 통과, API 자체 인증에 위임

  try {
    const originHost = new URL(origin).host;
    return originHost === request.headers.get('host');
  } catch {
    return false;
  }
}
