import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

const ALLOWED_SECTIONS = new Set([
  'Photographers in Jeju',
  'Photographers in Seoul',
  'Casual Photoshoot in Jeju',
  'Casual Photoshoot in Seoul',
]);

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section');
  try {
    const products = await prisma.product.findMany({
      where: section ? { section } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: { images: true },
    });
    return NextResponse.json(products);
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
