import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { stripPassword } from '@/lib/review-queries';
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reviews = await prisma.review.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { images: true },
    });
    const safeReviews = reviews.map(stripPassword);
    return NextResponse.json(safeReviews);
}
