import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// GET /api/admin/packages/[id]/addons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const pkgId = Number(id);
  if (!Number.isFinite(pkgId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const links = await prisma.packageAddon.findMany({
      where: { packageId: pkgId },
      select: { addonId: true, price: true, desc: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(links);
  } catch (e) {
    console.error('[GET /api/admin/packages/:id/addons]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/packages/[id]/addons
// body: { addons: { addonId: number; price: number; desc?: string }[] }  → 전체 교체
// 같은 이름의 addon이라도 패키지마다 가격/설명이 다를 수 있어서, 값은 여기(PackageAddon)에 저장함
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
  const addons: { addonId: number; price: number; desc?: string | null }[] = Array.isArray(
    body?.addons,
  )
    ? body.addons
    : [];

  try {
    await prisma.$transaction([
      prisma.packageAddon.deleteMany({ where: { packageId: pkgId } }),
      ...(addons.length > 0
        ? [prisma.packageAddon.createMany({
            data: addons.map((a, order) => ({
              packageId: pkgId,
              addonId: a.addonId,
              price: Number(a.price) || 0,
              desc: a.desc || null,
              order,
            })),
            skipDuplicates: true,
          })]
        : []),
    ]);
  } catch (e) {
    console.error('[PUT /api/admin/packages/:id/addons]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
