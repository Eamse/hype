import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { deleteFileFromR2 } from '@/lib/r2';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';
function parseId(id: string): number | null {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}
export async function GET(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await props.params;
    const idNum = parseId(id);
    if (idNum === null) {
        return badRequest('magazine/:id', 'invalid id');
    }
    const magazine = await prisma.magazine.findUnique({
        where: { id: idNum },
        include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!magazine) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    if (!magazine.published) {
        const session = await auth();
        if (!isMagazineMaster(session)) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
    }
    return NextResponse.json(magazine);
}
export async function PATCH(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const session = await auth();
    if (!isMagazineMaster(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!checkRateLimit(`magazine-write:${session!.user!.id}`, 30, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { id } = await props.params;
    const idNum = parseId(id);
    if (idNum === null) {
        return badRequest('magazine/:id', 'invalid id');
    }
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return badRequest('magazine/:id', 'Invalid JSON body');
    }
    if (typeof body !== 'object' || body === null) {
        return badRequest('magazine/:id', 'Invalid request body');
    }
    const b = body as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (b.title !== undefined) {
        if (typeof b.title !== 'string' || !b.title.trim()) {
            return badRequest('magazine/:id', 'title must be a non-empty string');
        }
        data.title = b.title.trim();
    }
    if (b.content !== undefined) {
        if (typeof b.content !== 'string') {
            return badRequest('magazine/:id', 'content must be a string');
        }
        data.content = sanitizeMagazineHtml(b.content.trim());
    }
    if (b.imageUrl !== undefined) {
        if (b.imageUrl !== null && typeof b.imageUrl !== 'string') {
            return badRequest('magazine/:id', 'imageUrl must be a string or null');
        }
        data.imageUrl = b.imageUrl;
    }
    if (b.published !== undefined) {
        if (typeof b.published !== 'boolean') {
            return badRequest('magazine/:id', 'published must be a boolean');
        }
        data.published = b.published;
    }
    if (b.isPinned !== undefined) {
        if (typeof b.isPinned !== 'boolean') {
            return badRequest('magazine/:id', 'isPinned must be a boolean');
        }
        data.isPinned = b.isPinned;
    }
    if (Object.keys(data).length === 0) {
        return badRequest('magazine/:id', 'No valid fields to update');
    }
    try {
        const magazine = await prisma.magazine.update({ where: { id: idNum }, data });
        return NextResponse.json(magazine);
    }
    catch (e) {
        console.error('[PATCH /api/magazine/:id]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const session = await auth();
    if (!isMagazineMaster(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await props.params;
    const idNum = parseId(id);
    if (idNum === null) {
        return badRequest('magazine/:id', 'invalid id');
    }
    const magazine = await prisma.magazine.findUnique({
        where: { id: idNum },
        include: { images: true },
    });
    if (!magazine) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    try {
        if (magazine.imageUrl) {
            await deleteFileFromR2(magazine.imageUrl).catch(() => { });
        }
        await Promise.all(magazine.images.map((img) => deleteFileFromR2(img.url).catch(() => { })));
        await prisma.magazine.delete({ where: { id: idNum } });
        return NextResponse.json({ ok: true });
    }
    catch (e) {
        console.error('[DELETE /api/magazine/:id]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
