import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';
function parseId(id: string): number | null {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}
export async function POST(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`verify-password:${ip}`, 10, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { id } = await props.params;
    const reviewId = parseId(id);
    if (reviewId === null) {
        return badRequest('reviews/:id/verify-password', 'invalid id');
    }
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { userId: true, password: true },
    });
    if (!review) {
        return NextResponse.json({ error: 'review not found' }, { status: 404 });
    }
    if (review.userId) {
        return badRequest('reviews/:id/verify-password', '회원 작성 리뷰입니다');
    }
    let body: Record<string, any>;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('reviews/:id/verify-password', 'invalid JSON body');
    }
    const password = body.password;
    if (typeof password !== 'string' || !review.password) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, review.password);
    return NextResponse.json({ valid }, { status: valid ? 200 : 401 });
}
