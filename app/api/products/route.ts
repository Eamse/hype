import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_SECTIONS = new Set([
  'Meet our Photographers in Jeju',
  'Meet our Photographer in Seoul',
  'Casual Photoshoot in Jeju',
  'Casual Photoshoot in Seoul',
  'Magazine',
]);

// GET /api/products?section=new-season
export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section');
  try {
    const products = await prisma.product.findMany({
      where: section ? { section } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error('[GET /api/products]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const { section, title, brand, price } = body as Record<string, unknown>;

  if (typeof section !== 'string' || !ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json(
      { error: `section must be one of: ${[...ALLOWED_SECTIONS].join(', ')}` },
      { status: 400 },
    );
  }
  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (typeof brand !== 'string' || !brand.trim()) {
    return NextResponse.json({ error: 'brand is required' }, { status: 400 });
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json(
      { error: 'price must be a non-negative number' },
      { status: 400 },
    );
  }

  try {
    const count = await prisma.product.count({ where: { section } });
    const product = await prisma.product.create({
      data: {
        section,
        title: title.trim(),
        brand: brand.trim(),
        price: Math.round(priceNum),
        order: count,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.error('[POST /api/products]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
