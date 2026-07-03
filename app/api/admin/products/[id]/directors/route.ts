import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// PUT /api/admin/products/[id]/directors
// body: { directorIds: number[] } → 전체 교체
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => null);
  const directorIds: number[] = Array.isArray(body?.directorIds) ? body.directorIds : [];

  await prisma.$transaction([
    prisma.productDirector.deleteMany({ where: { productId } }),
    ...(directorIds.length > 0
      ? [prisma.productDirector.createMany({
          data: directorIds.map((directorId) => ({ productId, directorId })),
          skipDuplicates: true,
        })]
      : []),
  ]);

  return NextResponse.json({ success: true });
}
