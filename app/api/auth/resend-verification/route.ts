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
    const existingAccount = await prisma.user.findUnique({
        where: { email },
        select: { password: true },
    });
    // 이미 비밀번호가 설정된(가입 완료된) 계정이면 인증 메일을 다시 보낼 필요 없음.
    if (!existingAccount || !existingAccount.password) {
        await sendVerificationEmail(email, getSiteUrl());
    }
    return NextResponse.json({ ok: true });
}
