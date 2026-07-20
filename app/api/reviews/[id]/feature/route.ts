import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 우수 리뷰 고정 토글 (master 전용)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const isModerator = session?.user?.role === 'master';
  if (!isModerator) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const reviewId = parseId(id);
  if (reviewId === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const body = await request.json();
  if (typeof body.isFeatured !== 'boolean') {
    return NextResponse.json({ error: 'isFeatured must be a boolean' }, { status: 400 });
  }

  try {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isFeatured: body.isFeatured },
    });
    const { password: _password, ...safeReview } = review;
    return NextResponse.json(safeReview);
  } catch (e) {
    console.error('[PATCH /api/reviews/:id/feature]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
