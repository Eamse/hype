import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { badRequest } from '@/lib/api-errors';
function parseId(id: string): number | null {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}
export async function PATCH(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const session = await auth();
    const isModerator = session?.user?.role === 'master';
    if (!isModerator) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await props.params;
    const reviewId = parseId(id);
    if (reviewId === null) {
        return badRequest('reviews/:id/feature', 'invalid id');
    }
    const body = await request.json();
    if (typeof body.isFeatured !== 'boolean') {
        return badRequest('reviews/:id/feature', 'isFeatured must be a boolean');
    }
    try {
        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { isFeatured: body.isFeatured },
        });
        const { password: _password, ...safeReview } = review;
        return NextResponse.json(safeReview);
    }
    catch (e) {
        console.error('[PATCH /api/reviews/:id/feature]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
