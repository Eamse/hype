import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const directorId = Number(searchParams.get('directorId'));
    if (!Number.isFinite(directorId)) {
        return NextResponse.json({ error: 'directorId is required' }, { status: 400 });
    }
    try {
        const packages = await prisma.package.findMany({
            where: { directorId },
            include: {
                addons: { include: { addon: true }, orderBy: { order: 'asc' } },
                inclusions: { include: { inclusion: true }, orderBy: { order: 'asc' } },
                partners: { include: { partner: true } },
            },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(packages, {
            headers: { 'Cache-Control': 'no-store' },
        });
    }
    catch (e) {
        console.error('[GET /api/admin/packages]', e);
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
    const { directorId, name, subtitle, priceSNS, priceNoSNS, shootingTime, locations, originalPhotos, retouched, retouchedDetail, } = body as Record<string, unknown>;
    if (!Number.isFinite(Number(directorId))) {
        return NextResponse.json({ error: 'directorId is required' }, { status: 400 });
    }
    if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    try {
        const pkg = await prisma.package.create({
            data: {
                directorId: Number(directorId),
                name: name.trim(),
                subtitle: typeof subtitle === 'string' ? subtitle.trim() : null,
                priceSNS: Number(priceSNS) || 0,
                priceNoSNS: Number(priceNoSNS) || 0,
                shootingTime: typeof shootingTime === 'string' ? shootingTime.trim() : '',
                locations: typeof locations === 'string' ? locations.trim() : '',
                originalPhotos: typeof originalPhotos === 'string' ? originalPhotos.trim() : '',
                retouched: Number(retouched) || 0,
                retouchedDetail: typeof retouchedDetail === 'string' ? retouchedDetail.trim() : null,
            },
        });
        return NextResponse.json(pkg, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/packages]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
