import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { uploadToR2 } from '@/lib/r2';
import { validateAndCompressImage, ImageProcessingError } from '@/lib/validate-image';
import { checkRateLimit } from '@/lib/rate-limit';
import { badRequest } from '@/lib/api-errors';
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isMagazineMaster(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!checkRateLimit(`magazine-upload:${session!.user!.id}`, 60, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    if (!R2_PUBLIC_BASE_URL) {
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }
    let formData: FormData;
    try {
        formData = await request.formData();
    }
    catch {
        return badRequest('magazine/upload-image', 'Invalid form data');
    }
    const file = formData.get('image') as File | null;
    if (!file) {
        return badRequest('magazine/upload-image', 'No image provided');
    }
    let compressed: Buffer;
    try {
        compressed = await validateAndCompressImage(file, { resize: 1600 });
    }
    catch (e) {
        const status = e instanceof ImageProcessingError ? e.status : 500;
        const message = e instanceof Error ? e.message : 'Image processing failed';
        return NextResponse.json({ error: message }, { status });
    }
    const filename = `magazine_body_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
    try {
        await uploadToR2(filename, compressed);
    }
    catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    return NextResponse.json({ url: `${R2_PUBLIC_BASE_URL}/${filename}` }, { status: 201 });
}
