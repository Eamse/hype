interface Entry {
    count: number;
    resetAt: number;
}
const store = new Map<string, Entry>();
let lastCleanup = Date.now();
function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 5 * 60 * 1000)
        return;
    lastCleanup = now;
    for (const [k, e] of store) {
        if (now > e.resetAt)
            store.delete(k);
    }
}
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    cleanup();
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (entry.count >= limit)
        return false;
    entry.count++;
    return true;
}
export function resetRateLimit(key: string): void {
    store.delete(key);
}
export function peekRateLimitLocked(key: string, limit: number): boolean {
    const entry = store.get(key);
    if (!entry || Date.now() > entry.resetAt)
        return false;
    return entry.count >= limit;
}
export function getClientIp(request: Request): string {
    return (request.headers.get('x-real-ip') ??
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown');
}
