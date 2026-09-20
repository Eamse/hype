export function getSiteUrl(request?: { nextUrl: { origin: string } }): string {
    if (request) return request.nextUrl.origin;
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hypewedding.kr';
}
