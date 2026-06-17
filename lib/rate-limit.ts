/**
 * 인메모리 Rate Limiter
 * Vercel 서버리스 환경에서는 인스턴스별로 동작 (단일 인스턴스 기준 보호)
 * 프로덕션 대규모 트래픽 대응이 필요하면 Upstash Redis로 교체
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [k, e] of store) {
    if (now > e.resetAt) store.delete(k);
  }
}

/**
 * @returns true = 허용, false = 차단
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** Vercel/프록시 환경에서 실제 클라이언트 IP 추출 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
