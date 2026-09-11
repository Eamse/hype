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
    const addonId = Number(id);
    if (!Number.isFinite(addonId)) {
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
    const { name, displayName, price, desc } = body as Record<string, unknown>;
    try {
        const addon = await prisma.addon.update({
            where: { id: addonId },
            data: {
                ...(typeof name === 'string' && { name: name.trim() }),
                ...(displayName !== undefined && {
                    displayName: typeof displayName === 'string' && displayName.trim() ? displayName.trim() : null,
                }),
                ...(typeof price === 'number' && { price }),
                ...(desc !== undefined && {
                    desc: typeof desc === 'string' ? desc.trim() : null,
                }),
            },
        });
        return NextResponse.json(addon);
    }
    catch (e) {
        console.error('[PATCH /api/admin/addons/[id]]', e);
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
    const addonId = Number(id);
    if (!Number.isFinite(addonId)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        await prisma.addon.delete({ where: { id: addonId } });
        return NextResponse.json({ success: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/addons/[id]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
