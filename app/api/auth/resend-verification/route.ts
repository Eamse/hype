import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/auth-emails';
import { getSiteUrl } from '@/lib/site-url';
import { badRequest } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`resend-verification:${ip}`, 5, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('auth/resend-verification', 'Invalid JSON body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.email !== 'string' || !b.email.trim()) {
        return badRequest('auth/resend-verification', 'email is required');
    }
    const email = b.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    // 계정 존재 여부를 노출하지 않기 위해 실제로 존재/미인증인 경우에만 발송하되 응답은 항상 동일.
    if (user && user.password && !user.emailVerified) {
        await sendVerificationEmail(email, getSiteUrl());
    }
    return NextResponse.json({ ok: true });
}
