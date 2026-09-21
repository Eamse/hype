import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`verify-code:${ip}`, 10, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('auth/verify-code', 'Invalid JSON body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.email !== 'string' || !b.email.trim()) {
        return badRequest('auth/verify-code', 'email is required');
    }
    if (typeof b.code !== 'string' || !b.code.trim()) {
        return badRequest('auth/verify-code', 'code is required');
    }
    const email = b.email.trim().toLowerCase();
    const code = b.code.trim();
    const record = await prisma.emailVerification.findUnique({ where: { email } });
    if (!record || record.token !== code || record.expires < new Date()) {
        return NextResponse.json({ verified: false });
    }
    await prisma.emailVerification.update({
        where: { email },
        data: { verified: true },
    });
    return NextResponse.json({ verified: true });
}
