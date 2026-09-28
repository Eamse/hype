import { NextRequest, NextResponse } from 'next/server';
import { getAdminId } from '@/lib/admin-auth';
import { validateFullProductInput } from '@/lib/admin/product-full-types';
import { createFullProduct } from '@/lib/admin/product-full-service';

export async function POST(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validated = validateFullProductInput(body);
    if ('error' in validated)
        return NextResponse.json({ error: validated.error }, { status: 400 });

    try {
        const productId = await createFullProduct(validated.data);
        return NextResponse.json({ id: productId }, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/admin/products/full]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
