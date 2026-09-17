import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';
export async function GET() {
    try {
        const magazine = await prisma.magazine.findMany({
            where: { published: true },
        });
        return NextResponse.json(magazine);
    }
    catch (e) {
        console.error('[GET /api/products]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'No result found' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isMagazineMaster(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!checkRateLimit(`magazine-write:${session!.user!.id}`, 30, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('magazine', 'Invalid JSON body');
    }
    if (typeof body !== 'object' || body === null) {
        return badRequest('magazine', 'Invalid request body');
    }
    const b = body as Record<string, unknown>;
    if (typeof b.title !== 'string' || !b.title.trim()) {
        return badRequest('magazine', 'title is required');
    }
    if (typeof b.content !== 'string') {
        return badRequest('magazine', 'content must be a string');
    }
    try {
        const magazine = await prisma.magazine.create({
            data: {
                title: b.title.trim(),
                content: sanitizeMagazineHtml(b.content.trim()),
                imageUrl: typeof b.imageUrl === 'string' ? b.imageUrl : null,
                published: b.published === true,
            },
        });
        return NextResponse.json(magazine, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/magazine]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
