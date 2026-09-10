import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
import { logFieldChanges } from '@/lib/audit-log';

// PATCH /api/admin/packages/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const pkgId = Number(id);
  if (!Number.isFinite(pkgId)) {
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

  const { name, subtitle, priceSNS, priceNoSNS, shootingTime, locations, originalPhotos, retouched, retouchedDetail, thumbnailUrl } =
    body as Record<string, unknown>;

  try {
    const before = await prisma.package.findUnique({ where: { id: pkgId } });
    const pkg = await prisma.package.update({
      where: { id: pkgId },
      data: {
        ...(typeof name === 'string' && { name: name.trim() }),
        ...(subtitle !== undefined && { subtitle: typeof subtitle === 'string' ? subtitle.trim() : null }),
        ...(priceSNS !== undefined && { priceSNS: Number(priceSNS) || 0 }),
        ...(priceNoSNS !== undefined && { priceNoSNS: Number(priceNoSNS) || 0 }),
        ...(typeof shootingTime === 'string' && { shootingTime: shootingTime.trim() }),
        ...(typeof locations === 'string' && { locations: locations.trim() }),
        ...(typeof originalPhotos === 'string' && { originalPhotos: originalPhotos.trim() }),
        ...(retouched !== undefined && { retouched: Number(retouched) || 0 }),
        ...(retouchedDetail !== undefined && { retouchedDetail: typeof retouchedDetail === 'string' ? retouchedDetail.trim() : null }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl : null }),
      },
    });
    if (before) {
      await logFieldChanges(adminId, 'Package', pkgId, before, pkg);
    }
    return NextResponse.json(pkg);
  } catch (e) {
    console.error('[PATCH /api/admin/packages/[id]]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/packages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const pkgId = Number(id);
  if (!Number.isFinite(pkgId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.package.delete({ where: { id: pkgId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/admin/packages/[id]]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
