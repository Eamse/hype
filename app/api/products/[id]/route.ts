import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function isPrismaNotFound(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: unknown }).code === 'P2025'
  );
}

// GET /api/products/[id]
export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: idNum } });
    return NextResponse.json(product);
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('[GET /api/products/:id]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/products/[id]
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
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

  const b = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (b.title != null) {
    if (typeof b.title !== 'string' || !b.title.trim()) {
      return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 });
    }
    data.title = b.title.trim();
  }
  if (b.brand != null) {
    if (typeof b.brand !== 'string' || !b.brand.trim()) {
      return NextResponse.json({ error: 'brand must be a non-empty string' }, { status: 400 });
    }
    data.brand = b.brand.trim();
  }
  if (b.price != null) {
    const priceNum = Number(b.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'price must be a non-negative number' }, { status: 400 });
    }
    data.price = Math.round(priceNum);
  }
  // imageUrl는 null 허용 (삭제 용도)
  if (b.imageUrl !== undefined) {
    if (b.imageUrl !== null && typeof b.imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl must be a string or null' }, { status: 400 });
    }
    data.imageUrl = b.imageUrl;
  }
  if (b.order != null) {
    const orderNum = Number(b.order);
    if (!Number.isInteger(orderNum) || orderNum < 0) {
      return NextResponse.json({ error: 'order must be a non-negative integer' }, { status: 400 });
    }
    data.order = orderNum;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id: idNum },
      data,
    });
    return NextResponse.json(product);
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('[PATCH /api/products/:id]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('[DELETE /api/products/:id]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
