import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    try {
        const partners = await prisma.partner.findMany({
            where: role ? { role } : undefined,
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(partners);
    }
    catch (e) {
        console.error('[GET /api/admin/partners]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (typeof body !== 'object' || body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { role, name, instagram, imageUrl } = body as Record<string, unknown>;
    if (typeof role !== 'string' || !['hmu', 'dress', 'suit', 'bouquet', 'videographer'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    try {
        const partner = await prisma.partner.create({
            data: {
                role,
                name: name.trim(),
                instagram: typeof instagram === 'string' ? instagram.trim() : null,
                imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : null,
            },
        });
        return NextResponse.json(partner, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/partners]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
