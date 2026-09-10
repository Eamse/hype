import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        productId: string;
        photographerId: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { productId, photographerId } = await params;
    const productIdNum = Number(productId);
    const directorIdNum = Number(photographerId);
    if (!Number.isFinite(productIdNum) || !Number.isFinite(directorIdNum)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        await prisma.productDirector.delete({
            where: {
                productId_directorId: {
                    productId: productIdNum,
                    directorId: directorIdNum,
                },
            },
        });
        return NextResponse.json({ success: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/wedding-directors/[productId]/[photographerId]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
