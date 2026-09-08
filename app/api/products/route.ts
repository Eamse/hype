import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
import { withProductNumbers } from '@/lib/product-number';

const ALLOWED_SECTIONS = new Set([
  'Photographers in Jeju',
  'Photographers in Seoul',
  'Casual Photoshoot in Jeju',
  'Casual Photoshoot in Seoul',
]);

// searchParams를 읽어서 자동으로 dynamic 처리되긴 하지만, 어드민에서 상세 이미지를
// 올린 직후에도 캐시된 옛 응답(이미지 업로드 전 상태)이 보이는 문제가 있어서
// 명시적으로 캐시를 막음
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section');
  try {
    const products = await prisma.product.findMany({
      where: section ? { section } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        images: { orderBy: { order: 'asc' } },
        directors: { select: { director: { select: { number: true } } } },
      },
    });
    return NextResponse.json(withProductNumbers(products), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    console.error('[GET /api/products]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { section, title } = body as Record<string, unknown>;

  if (typeof section !== 'string' || !ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json(
      { error: `section must be one of: ${[...ALLOWED_SECTIONS].join(', ')}` },
      { status: 400 },
    );
  }
  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  try {
    const count = await prisma.product.count({ where: { section } });
    const product = await prisma.product.create({
      data: {
        section,
        title: title.trim(),
        order: count,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error('[POST /api/products]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
