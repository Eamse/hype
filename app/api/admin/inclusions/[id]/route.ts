import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const inclusionId = Number(id);
  if (!Number.isFinite(inclusionId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  try {
    const inclusion = await prisma.inclusion.update({
      where: { id: inclusionId },
      data: { name: body.name.trim() },
    });
    return NextResponse.json(inclusion);
  } catch (e) {
    console.error('[PATCH /api/admin/inclusions/:id]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const inclusionId = Number(id);
  if (!Number.isFinite(inclusionId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    await prisma.inclusion.delete({ where: { id: inclusionId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/admin/inclusions/:id]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
