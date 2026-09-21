import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`reset-password:${ip}`, 10, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('auth/reset-password', 'Invalid JSON body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.token !== 'string' || !b.token) {
        return badRequest('auth/reset-password', 'token is required');
    }
    if (typeof b.password !== 'string' || !PASSWORD_RULE.test(b.password)) {
        return badRequest('auth/reset-password', 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character');
    }
    const record = await prisma.passwordResetToken.findUnique({ where: { token: b.token } });
    if (!record || record.used || record.expires < new Date()) {
        return badRequest('auth/reset-password', 'This reset link is invalid or has expired');
    }
    const hashedPassword = await bcrypt.hash(b.password, 12);
    await prisma.$transaction([
        prisma.user.update({
            where: { id: record.userId },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
            where: { id: record.id },
            data: { used: true },
        }),
    ]);
    return NextResponse.json({ ok: true });
}
