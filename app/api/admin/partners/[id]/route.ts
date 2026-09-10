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
    const partnerId = Number(id);
    if (!Number.isFinite(partnerId)) {
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
    const { name, instagram, imageUrl } = body as Record<string, unknown>;
    try {
        const partner = await prisma.partner.update({
            where: { id: partnerId },
            data: {
                ...(typeof name === 'string' && { name: name.trim() }),
                ...(instagram !== undefined && { instagram: typeof instagram === 'string' ? instagram.trim() : null }),
                ...(imageUrl !== undefined && { imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : null }),
            },
        });
        return NextResponse.json(partner);
    }
    catch (e) {
        console.error('[PATCH /api/admin/partners/[id]]', e);
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
    const partnerId = Number(id);
    if (!Number.isFinite(partnerId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        await prisma.partner.delete({ where: { id: partnerId } });
        return NextResponse.json({ success: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/partners/[id]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
