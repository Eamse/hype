import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// PATCH /api/admin/products/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { title, imageUrl } = body as Record<string, unknown>;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(typeof title === 'string' && { title: title.trim() }),
      ...(typeof imageUrl === 'string' && { imageUrl }),
    },
  });
  return NextResponse.json(product);
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}
