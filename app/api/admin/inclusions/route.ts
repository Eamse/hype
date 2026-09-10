import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const inclusions = await prisma.inclusion.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(inclusions);
    }
    catch (e) {
        console.error('[GET /api/admin/inclusions]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body?.name?.trim())
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    try {
        const inclusion = await prisma.inclusion.create({
            data: { name: body.name.trim() },
        });
        return NextResponse.json(inclusion, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/inclusions]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
