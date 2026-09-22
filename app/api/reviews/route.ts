import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isStrongGuestPassword } from '@/lib/guest-password';
import { badRequest } from '@/lib/api-errors';
import { stripPassword } from '@/lib/review-queries';
const ALLOWED_PRODUCT_TYPES = new Set(['wedding', 'snap']);
const ALLOWED_LOCATIONS = new Set(['jeju', 'seoul']);
export async function GET(request: NextRequest) {
    const productType = request.nextUrl.searchParams.get('productType');
    const location = request.nextUrl.searchParams.get('location');
    const directorId = request.nextUrl.searchParams.get('directorId');
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    if (productType && !ALLOWED_PRODUCT_TYPES.has(productType)) {
        return badRequest('reviews', 'invalid productType');
    }
    if (location && !ALLOWED_LOCATIONS.has(location)) {
        return badRequest('reviews', 'invalid location');
    }
    if (directorId && !Number.isInteger(Number(directorId))) {
        return badRequest('reviews', 'invalid directorId');
    }
    const pageSize = 12;
    const where = {
        ...(productType && { productType }),
        ...(location && { location }),
        ...(directorId && { directorId: Number(directorId) }),
    };
    try {
        const reviews = await prisma.review.findMany({
            where,
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { images: true },
        });
        const totalCount = await prisma.review.count({ where });
        const safeReviews = reviews.map(stripPassword);
        return NextResponse.json({ reviews: safeReviews, totalCount, page, pageSize });
    }
    catch (e) {
        console.error('[GET /api/reviews]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(`review:${ip}`, 5, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const session = await auth();
    let body: Record<string, any>;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('reviews', 'invalid JSON body');
    }
    const { content, country, shootingDate, productType, location, rating, directorId, name, password, } = body;
    if (!content || !country || !shootingDate) {
        return badRequest('reviews', 'missing required fields');
    }
    if (typeof content !== 'string' || content.length > 5000) {
        return badRequest('reviews', 'content must be 5000 characters or fewer');
    }
    if (!ALLOWED_PRODUCT_TYPES.has(productType)) {
        return badRequest('reviews', 'invalid productType');
    }
    if (!ALLOWED_LOCATIONS.has(location)) {
        return badRequest('reviews', 'invalid location');
    }
    let finalUserId: string | null = null;
    let finalName: string;
    let hashedPassword: string | null = null;
    if (session?.user?.id) {
        finalUserId = session.user.id;
        finalName = session.user.name ?? '';
    }
    else {
        if (!name || !password) {
            return badRequest('reviews', 'name and password are required');
        }
        if (!isStrongGuestPassword(password)) {
            return badRequest('reviews', 'password must be at least 8 characters and include a special character');
        }
        finalName = name;
        hashedPassword = await bcrypt.hash(password, 12);
    }
    if (rating !== undefined && rating !== null) {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return badRequest('reviews', 'rating must be between 1 and 5');
        }
    }
    if (directorId && !Number.isInteger(Number(directorId))) {
        return badRequest('reviews', 'invalid directorId');
    }
    try {
        const review = await prisma.review.create({
            data: {
                content,
                name: finalName,
                country,
                shootingDate,
                productType,
                location,
                rating: rating ?? null,
                password: hashedPassword,
                userId: finalUserId,
                directorId: directorId ? Number(directorId) : null,
            },
        });
        const safeReview = stripPassword(review);
        return NextResponse.json(safeReview, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/reviews]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
