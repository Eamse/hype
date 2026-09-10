import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { validateAndCompressImage, ImageProcessingError, HERO_RESIZE_WIDTH, HERO_WEBP_QUALITY, THUMBNAIL_RESIZE_WIDTH, THUMBNAIL_WEBP_QUALITY, } from '@/lib/validate-image';
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';
const KEY_RE = /^[a-zA-Z0-9_-]+$/;
const DB_KEY_PREFIX = 'images_';
const MAX_IMAGES_PER_KEY = 6;
async function readImages(key: string): Promise<string[]> {
    const row = await prisma.siteConfig.findUnique({
        where: { key: `${DB_KEY_PREFIX}${key}` },
    });
    if (!row)
        return [];
    try {
        const parsed: unknown = JSON.parse(row.value);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
    }
    catch {
        return [];
    }
}
async function writeImages(key: string, urls: string[]): Promise<void> {
    await prisma.siteConfig.upsert({
        where: { key: `${DB_KEY_PREFIX}${key}` },
        update: { value: JSON.stringify(urls) },
        create: { key: `${DB_KEY_PREFIX}${key}`, value: JSON.stringify(urls) },
    });
}
async function readAllImages(): Promise<Record<string, string[]>> {
    const rows = await prisma.siteConfig.findMany({
        where: { key: { startsWith: DB_KEY_PREFIX } },
    });
    const result: Record<string, string[]> = {};
    for (const row of rows) {
        const key = row.key.slice(DB_KEY_PREFIX.length);
        try {
            const parsed: unknown = JSON.parse(row.value);
            result[key] = Array.isArray(parsed) ? (parsed as string[]) : [];
        }
        catch {
            result[key] = [];
        }
    }
    return result;
}
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const images = await readAllImages();
    return NextResponse.json(images);
}
export async function POST(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let formData: FormData;
    try {
        formData = await request.formData();
    }
    catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const key = formData.get('key');
    const file = formData.get('image');
    if (typeof key !== 'string' || !key) {
        return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }
    if (!KEY_RE.test(key)) {
        return NextResponse.json({ error: 'key must only contain letters, numbers, underscores, or hyphens' }, { status: 400 });
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'image file is required' }, { status: 400 });
    }
    if (!R2_PUBLIC_BASE_URL) {
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }
    const current = await readImages(key);
    if (current.length >= MAX_IMAGES_PER_KEY) {
        return NextResponse.json({ error: `Maximum ${MAX_IMAGES_PER_KEY} images allowed per key` }, { status: 400 });
    }
    const filename = `${key}_${crypto.randomUUID()}.webp`;
    const isHero = key.startsWith('hero');
    const isThumbnail = key.includes('thumb');
    let compress: Buffer;
    try {
        compress = await validateAndCompressImage(file, isHero
            ? { resize: HERO_RESIZE_WIDTH, quality: HERO_WEBP_QUALITY }
            : isThumbnail
                ? { resize: THUMBNAIL_RESIZE_WIDTH, quality: THUMBNAIL_WEBP_QUALITY }
                : {});
    }
    catch (e) {
        const status = e instanceof ImageProcessingError ? e.status : 500;
        const message = e instanceof Error ? e.message : 'Image processing failed';
        return NextResponse.json({ error: message }, { status });
    }
    try {
        await uploadToR2(filename, compress);
    }
    catch (e) {
        console.error('[POST /api/images] R2 upload failed:', e);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    const imageUrl = `${R2_PUBLIC_BASE_URL}/${filename}`;
    current.push(imageUrl);
    await writeImages(key, current);
    return NextResponse.json({ key, imageUrl });
}
export async function DELETE(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
        return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }
    if (!KEY_RE.test(key)) {
        return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    }
    const indexParam = request.nextUrl.searchParams.get('index');
    const index = indexParam !== null ? Number(indexParam) : -1;
    const current = await readImages(key);
    if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }
    const targetUrl = current[index];
    await deleteFileFromR2(targetUrl).catch(() => { });
    current.splice(index, 1);
    await writeImages(key, current);
    return NextResponse.json({ ok: true });
}
