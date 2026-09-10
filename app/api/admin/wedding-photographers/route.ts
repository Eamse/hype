import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const photographers = await prisma.director.findMany({
            orderBy: { number: 'asc' },
            include: {
                products: { include: { product: { select: { id: true, title: true, section: true } } } },
            },
        });
        return NextResponse.json(photographers);
    }
    catch (e) {
        console.error('[GET /api/admin/wedding-photographers]', e);
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
    const { number, name, instagram, imageUrl, location } = body as Record<string, unknown>;
    if (typeof number !== 'string' || !number.trim()) {
        return NextResponse.json({ error: 'number is required' }, { status: 400 });
    }
    if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (location !== 'Jeju' && location !== 'Seoul') {
        return NextResponse.json({ error: 'location must be Jeju or Seoul' }, { status: 400 });
    }
    try {
        const photographer = await prisma.director.create({
            data: {
                number: number.trim(),
                name: name.trim(),
                location,
                instagram: typeof instagram === 'string' ? instagram.trim() : null,
                imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : null,
            },
        });
        return NextResponse.json(photographer, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/wedding-photographers]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
