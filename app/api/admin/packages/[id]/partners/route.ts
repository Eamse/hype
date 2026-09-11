import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const pkgId = Number(id);
    if (!Number.isFinite(pkgId))
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    try {
        const links = await prisma.packagePartner.findMany({
            where: { packageId: pkgId },
            select: { partnerId: true },
        });
        return NextResponse.json(links.map((l) => l.partnerId));
    }
    catch (e) {
        console.error('[GET /api/admin/packages/:id/partners]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function PUT(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const pkgId = Number(id);
    if (!Number.isFinite(pkgId))
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body = await request.json().catch(() => null);
    const partnerIds: number[] = Array.isArray(body?.partnerIds) ? body.partnerIds : [];
    try {
        await prisma.$transaction([
            prisma.packagePartner.deleteMany({ where: { packageId: pkgId } }),
            ...(partnerIds.length > 0
                ? [prisma.packagePartner.createMany({
                        data: partnerIds.map((partnerId, order) => ({ packageId: pkgId, partnerId, order })),
                        skipDuplicates: true,
                    })]
                : []),
        ]);
    }
    catch (e) {
        console.error('[PUT /api/admin/packages/:id/partners]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
