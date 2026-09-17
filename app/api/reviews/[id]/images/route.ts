import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canModifyReview } from '@/lib/review-auth';
import { uploadToR2 } from '@/lib/r2';
import { validateAndCompressImage, ImageProcessingError } from '@/lib/validate-image';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';
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
    if (!checkRateLimit(`review-image:${getClientIp(request)}`, 15, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { id } = await props.params;
    const reviewId = parseId(id);
    if (reviewId === null) {
        return badRequest('reviews/:id/images', 'invalid id');
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
    }
    catch {
        return badRequest('reviews/:id/images', 'invalid form data');
    }
    const session = await auth();
    const password = formData.get('password');
    const allowed = await canModifyReview(review, session, password);
    if (!allowed) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (review._count.images >= 5) {
        return badRequest('reviews/:id/images', 'maximum 5 images allowed');
    }
    const file = formData.get('image');
    if (!(file instanceof File)) {
        return badRequest('reviews/:id/images', 'image file is required');
    }
    if (!R2_PUBLIC_BASE_URL) {
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }
    const filename = `review_${reviewId}_${crypto.randomUUID()}.webp`;
    let compressed: Buffer;
    try {
        compressed = await validateAndCompressImage(file);
    }
    catch (e) {
        const status = e instanceof ImageProcessingError ? e.status : 500;
        const message = e instanceof Error ? e.message : 'Image processing failed';
        return NextResponse.json({ error: message }, { status });
    }
    try {
        await uploadToR2(filename, compressed);
    }
    catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    const url = `${R2_PUBLIC_BASE_URL}/${filename}`;
    const image = await prisma.reviewImage.create({
        data: { reviewId, url, order: review._count.images },
    });
    return NextResponse.json(image, { status: 201 });
}
