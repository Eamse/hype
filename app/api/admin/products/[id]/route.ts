import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
import { logFieldChanges } from '@/lib/audit-log';
export async function PATCH(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId))
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body = await request.json().catch(() => null);
    if (!body)
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    const { title, imageUrl, order } = body as Record<string, unknown>;
    try {
        const before = await prisma.product.findUnique({ where: { id: productId } });
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(typeof title === 'string' && { title: title.trim() }),
                ...(typeof imageUrl === 'string' && { imageUrl }),
                ...(typeof order === 'number' && Number.isFinite(order) && { order }),
            },
        });
        if (before) {
            await logFieldChanges(adminId, 'Product', productId, before, product);
        }
        return NextResponse.json(product);
    }
    catch (e) {
        console.error('[PATCH /api/admin/products/:id]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId))
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    try {
        await prisma.product.delete({ where: { id: productId } });
        return NextResponse.json({ success: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/products/:id]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
