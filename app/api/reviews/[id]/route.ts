import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canModifyReview } from '@/lib/review-auth';
import { deleteFileFromR2 } from '@/lib/r2';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ALLOWED_PRODUCT_TYPES = new Set(['wedding', 'snap']);
const ALLOWED_LOCATIONS = new Set(['jeju', 'seoul']);

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 리뷰 상세
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const reviewId = parseId(id);
  if (reviewId === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { images: true },
  });

  if (!review) {
    return NextResponse.json({ error: 'review not found' }, { status: 404 });
  }

  const { password: _password, ...safeReview } = review; // 비밀번호 해시는 응답에서 제외
  return NextResponse.json(safeReview);
}

// 리뷰 수정
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(`review-modify:${getClientIp(request)}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await props.params;
  const reviewId = parseId(id);
  if (reviewId === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return NextResponse.json({ error: 'review not found' }, { status: 404 });
  }

  const body = await request.json();
  const session = await auth();
  const allowed = await canModifyReview(review, session, body.password);
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    title,
    content,
    country,
    shootingDate,
    productType,
    location,
    rating,
    directorId,
    isFeatured,
  } = body;

  if (productType !== undefined && !ALLOWED_PRODUCT_TYPES.has(productType)) {
    return NextResponse.json({ error: 'invalid productType' }, { status: 400 });
  }
  if (location !== undefined && !ALLOWED_LOCATIONS.has(location)) {
    return NextResponse.json({ error: 'invalid location' }, { status: 400 });
  }
  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 },
      );
    }
  }
  // 우수 리뷰 지정은 master만 가능 (작성자 본인도 불가)
  if (isFeatured !== undefined) {
    const isModerator = session?.user?.role === 'master';
    if (!isModerator || typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(country !== undefined && { country }),
        ...(shootingDate !== undefined && { shootingDate }),
        ...(productType !== undefined && { productType }),
        ...(location !== undefined && { location }),
        ...(rating !== undefined && { rating }),
        ...(directorId !== undefined && {
          directorId: directorId ? Number(directorId) : null,
        }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    const { password: _password, ...safeReview } = updated;
    return NextResponse.json(safeReview);
  } catch (e) {
    console.error('[PATCH /api/reviews/:id]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// 리뷰 삭제
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  if (!checkRateLimit(`review-modify:${getClientIp(request)}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await props.params;
  const reviewId = parseId(id);
  if (reviewId === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { images: true },
  });
  if (!review) {
    return NextResponse.json({ error: 'review not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const session = await auth();
  const allowed = await canModifyReview(review, session, body.password);
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await Promise.all(
      review.images.map((img) => deleteFileFromR2(img.url).catch(() => {})),
    );
    await prisma.review.delete({ where: { id: reviewId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/reviews/:id]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
