import { NextRequest, NextResponse } from 'next/server';
import { getAdminId } from '@/lib/admin-auth';
import { validateFullProductInput } from '@/lib/admin/product-full-types';
import { getFullProduct, replaceFullProduct, deleteFullProduct } from '@/lib/admin/product-full-service';

function parseId(id: string): number | null {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const productId = parseId(id);
    if (productId === null)
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    try {
        const product = await getFullProduct(productId);
        if (!product)
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    }
    catch (e) {
        console.error('[GET /api/admin/products/:id/full]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const productId = parseId(id);
    if (productId === null)
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json().catch(() => null);
    if (!body)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validated = validateFullProductInput(body);
    if ('error' in validated)
        return NextResponse.json({ error: validated.error }, { status: 400 });

    try {
        const existing = await getFullProduct(productId);
        if (!existing)
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        await replaceFullProduct(productId, validated.data);
        return NextResponse.json({ ok: true });
    }
    catch (e) {
        console.error('[PUT /api/admin/products/:id/full]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const productId = parseId(id);
    if (productId === null)
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    try {
        const existing = await getFullProduct(productId);
        if (!existing)
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        await deleteFullProduct(productId);
        return NextResponse.json({ ok: true });
    }
    catch (e) {
        console.error('[DELETE /api/admin/products/:id/full]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
