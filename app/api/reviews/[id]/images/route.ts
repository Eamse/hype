import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canModifyReview } from '@/lib/review-auth';
import { uploadToR2 } from '@/lib/r2';
import { validateAndCompressImage, ImageProcessingError } from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function POST(
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
    select: { userId: true, password: true, _count: { select: { images: true } } },
  });
  if (!review) {
    return NextResponse.json({ error: 'review not found' }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 });
  }

  const session = await auth();
  const password = formData.get('password');
  const allowed = await canModifyReview(review, session, password);
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (review._count.images >= 5) {
    return NextResponse.json({ error: 'maximum 5 images allowed' }, { status: 400 });
  }

  const file = formData.get('image');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'image file is required' }, { status: 400 });
  }
  if (!R2_PUBLIC_BASE_URL) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  const filename = `review_${reviewId}_${crypto.randomUUID()}.webp`;

  let compressed: Buffer;
  try {
    compressed = await validateAndCompressImage(file);
  } catch (e) {
    const status = e instanceof ImageProcessingError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Image processing failed';
    return NextResponse.json({ error: message }, { status });
  }

  try {
    await uploadToR2(filename, compressed);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const url = `${R2_PUBLIC_BASE_URL}/${filename}`;
  const image = await prisma.reviewImage.create({
    data: { reviewId, url, order: review._count.images },
  });

  return NextResponse.json(image, { status: 201 });
}
