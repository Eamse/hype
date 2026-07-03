import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// GET /api/admin/packages/[id]/inclusions → 연결된 inclusionId 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pkgId = Number(id);
  if (!Number.isFinite(pkgId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const links = await prisma.packageInclusion.findMany({
    where: { packageId: pkgId },
    select: { inclusionId: true },
  });
  return NextResponse.json(links.map((l) => l.inclusionId));
}

// PUT /api/admin/packages/[id]/inclusions  body: { inclusionIds: number[] } → 전체 교체
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pkgId = Number(id);
  if (!Number.isFinite(pkgId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => null);
  const inclusionIds: number[] = Array.isArray(body?.inclusionIds) ? body.inclusionIds : [];

  await prisma.$transaction([
    prisma.packageInclusion.deleteMany({ where: { packageId: pkgId } }),
    ...(inclusionIds.length > 0
      ? [prisma.packageInclusion.createMany({
          data: inclusionIds.map((inclusionId) => ({ packageId: pkgId, inclusionId })),
          skipDuplicates: true,
        })]
      : []),
  ]);

  return NextResponse.json({ success: true });
}
