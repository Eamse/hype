import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest, { params }: {
    params: Promise<{
        productId: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { productId } = await params;
    const id = Number(productId);
    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }
    try {
        const links = await prisma.productDirector.findMany({
            where: { productId: id },
            include: {
                director: {
                    include: {
                        packages: {
                            include: {
                                addons: { include: { addon: true }, orderBy: { order: 'asc' } },
                                inclusions: { include: { inclusion: true }, orderBy: { order: 'asc' } },
                                partners: { include: { partner: true }, orderBy: { order: 'asc' } },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        const result = links.map((l) => l.director);
        return NextResponse.json(result);
    }
    catch (e) {
        console.error('[GET /api/admin/wedding-directors/[productId]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest, { params }: {
    params: Promise<{
        productId: string;
    }>;
}) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { productId } = await params;
    const id = Number(productId);
    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { directorId } = body as Record<string, unknown>;
    const directorIdNum = Number(directorId);
    if (!Number.isFinite(directorIdNum)) {
        return NextResponse.json({ error: 'directorId is required' }, { status: 400 });
    }
    try {
        await prisma.productDirector.create({
            data: { productId: id, directorId: directorIdNum },
        });
        return NextResponse.json({ success: true }, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/wedding-directors/[productId]]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
