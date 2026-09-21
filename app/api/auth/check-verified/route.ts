import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`check-verified:${ip}`, 20, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('auth/check-verified', 'Invalid JSON body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.email !== 'string' || !b.email.trim()) {
        return badRequest('auth/check-verified', 'email is required');
    }
    const email = b.email.trim().toLowerCase();
    const record = await prisma.emailVerification.findUnique({
        where: { email },
        select: { verified: true, expires: true },
    });
    const verified = !!record?.verified && record.expires > new Date();
    return NextResponse.json({ verified });
}
