import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ALLOWED_PRODUCT_TYPES = new Set(['wedding', 'snap']);
const ALLOWED_LOCATIONS = new Set(['jeju', 'seoul']);

//리뷰 목록
export async function GET(request: NextRequest) {
  const productType = request.nextUrl.searchParams.get('productType'); // 'wedding' | 'snap' | null
  const location = request.nextUrl.searchParams.get('location'); // 'jeju' | 'seoul' | null
  const directorId = request.nextUrl.searchParams.get('directorId'); // 숫자 문자열 | null
  const page = Number(request.nextUrl.searchParams.get('page')) || 1; // 없으면 1페이지

  if (productType && !ALLOWED_PRODUCT_TYPES.has(productType)) {
    return NextResponse.json({ error: 'invalid productType' }, { status: 400 });
  }
  if (location && !ALLOWED_LOCATIONS.has(location)) {
    return NextResponse.json({ error: 'invalid location' }, { status: 400 });
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

    const safeReviews = reviews.map(({ password: _password, ...r }) => r); // 비밀번호 해시 제외
    return NextResponse.json({ reviews: safeReviews, totalCount, page, pageSize });
  } catch (e) {
    console.error('[GET /api/reviews]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

//리뷰 작성
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`review:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth(); // 로그인 안 했으면 null
  const body = await request.json();

  const {
    title,
    content,
    country,
    shootingDate,
    productType,
    location,
    rating,
    directorId,
    name, // 비회원만 사용
    password, // 비회원만 사용
  } = body;

  if (!title || !content || !country || !shootingDate) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
  }
  if (!ALLOWED_PRODUCT_TYPES.has(productType)) {
    return NextResponse.json({ error: 'invalid productType' }, { status: 400 });
  }
  if (!ALLOWED_LOCATIONS.has(location)) {
    return NextResponse.json({ error: 'invalid location' }, { status: 400 });
  }

  let finalUserId: string | null = null;
  let finalName: string;
  let hashedPassword: string | null = null;

  if (session?.user?.id) {
    // 회원 → 세션 정보 그대로 사용
    finalUserId = session.user.id;
    finalName = session.user.name ?? '';
  } else {
    // 비회원 → 이름/비밀번호 필수
    if (!name || !password) {
      return NextResponse.json({ error: 'name and password are required' }, { status: 400 });
    }
    finalName = name;
    hashedPassword = await bcrypt.hash(password, 12);
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
    }
  }

  try {
    const review = await prisma.review.create({
      data: {
        title,
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

    const { password: _password, ...safeReview } = review; // 비밀번호 해시 제외
    return NextResponse.json(safeReview, { status: 201 });
  } catch (e) {
    console.error('[POST /api/reviews]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
