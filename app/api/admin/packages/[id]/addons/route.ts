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
      select: { addonId: true },
    });
    return NextResponse.json(links.map((l) => l.addonId));
  } catch (e) {
    console.error('[GET /api/admin/packages/:id/addons]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/packages/[id]/addons
// body: { addonIds: number[] }  → 전체 교체
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
  const addonIds: number[] = Array.isArray(body?.addonIds) ? body.addonIds : [];

  try {
    await prisma.$transaction([
      prisma.packageAddon.deleteMany({ where: { packageId: pkgId } }),
      ...(addonIds.length > 0
        ? [prisma.packageAddon.createMany({
            data: addonIds.map((addonId) => ({ packageId: pkgId, addonId })),
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
