import type { NextRequest } from 'next/server';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export function isSameOriginRequest(request: NextRequest): boolean {
    if (SAFE_METHODS.has(request.method))
        return true;
    const host = request.headers.get('host');
    const origin = request.headers.get('origin');
    if (origin) {
        try {
            return new URL(origin).host === host;
        }
        catch {
            return false;
        }
    }
    const referer = request.headers.get('referer');
    if (referer) {
        try {
            return new URL(referer).host === host;
        }
        catch {
            return false;
        }
    }
    return false;
}
