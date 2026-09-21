import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/auth-emails';
import { getSiteUrl } from '@/lib/site-url';
import { badRequest } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`forgot-password:${ip}`, 5, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('auth/forgot-password', 'Invalid JSON body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.email !== 'string' || !b.email.trim()) {
        return badRequest('auth/forgot-password', 'email is required');
    }
    const email = b.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    // 계정 존재 여부를 노출하지 않기 위해 항상 같은 성공 응답을 반환.
    // 단, 구글 전용 계정(비밀번호 없음)이면 안내 메시지를 다르게 내려줌 — 화면에서 "구글로 로그인하세요" 표시용.
    if (!user) {
        return NextResponse.json({ ok: true, googleOnly: false });
    }
    if (!user.password) {
        return NextResponse.json({ ok: true, googleOnly: true });
    }
    try {
        await sendPasswordResetEmail(email, user.id, getSiteUrl());
    }
    catch (e) {
        console.error('[auth/forgot-password] failed to send email:', e);
        return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, googleOnly: false });
}
