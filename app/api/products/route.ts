import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withProductNumbers } from '@/lib/product-number';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    const section = request.nextUrl.searchParams.get('section');
    try {
        const products = await prisma.product.findMany({
            where: section ? { section } : undefined,
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            include: {
                images: { orderBy: { order: 'asc' } },
                directors: { select: { director: { select: { number: true } } } },
            },
        });
        return NextResponse.json(withProductNumbers(products), {
            headers: { 'Cache-Control': 'no-store' },
        });
    }
    catch (e) {
        console.error('[GET /api/products]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
