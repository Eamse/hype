import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// GET /api/admin/addons
export async function GET(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const addons = await prisma.addon.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(addons);
  } catch (e) {
    console.error('[GET /api/admin/addons]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/addons
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

  const { name, price, desc } = body as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (typeof price !== 'number') {
    return NextResponse.json({ error: 'price is required' }, { status: 400 });
  }

  try {
    const addon = await prisma.addon.create({
      data: {
        name: name.trim(),
        price,
        desc: typeof desc === 'string' ? desc.trim() : null,
      },
    });
    return NextResponse.json(addon, { status: 201 });
  } catch (e) {
    console.error('[POST /api/admin/addons]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
