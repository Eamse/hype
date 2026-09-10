import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function PATCH(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const photographerId = Number(id);
    if (!Number.isFinite(photographerId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
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
    if (location !== undefined && location !== '' && location !== 'Jeju' && location !== 'Seoul') {
        return NextResponse.json({ error: 'location must be Jeju or Seoul' }, { status: 400 });
    }
    try {
        const photographer = await prisma.director.update({
            where: { id: photographerId },
            data: {
                ...(typeof number === 'string' && { number: number.trim() }),
                ...(typeof name === 'string' && { name: name.trim() }),
                ...(typeof instagram === 'string' && { instagram: instagram.trim() }),
                ...(typeof imageUrl === 'string' && { imageUrl: imageUrl.trim() }),
                ...(typeof location === 'string' && { location: location || null }),
            },
        });
        return NextResponse.json(photographer);
    }
    catch (e) {
        console.error('[PATCH /api/admin/wedding-photographers/[id]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const photographerId = Number(id);
    if (!Number.isFinite(photographerId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        await prisma.director.delete({
            where: { id: photographerId },
        });
        return NextResponse.json({ success: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/wedding-photographers/[id]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
