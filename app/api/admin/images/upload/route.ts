import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
import { validateAndCompressImage, ImageProcessingError, DEFAULT_RESIZE_WIDTH, DEFAULT_WEBP_QUALITY, THUMBNAIL_RESIZE_WIDTH, THUMBNAIL_WEBP_QUALITY, } from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

// 상품/작가/패키지가 아직 DB에 저장되기 전(등록 폼 작성 중)에도 이미지를 먼저 업로드해서
// URL만 받아두기 위한 범용 업로드 엔드포인트. 저장은 /api/admin/products/full 이 URL을 받아서 처리.
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

    const file = formData.get('image');
    if (!(file instanceof File))
        return NextResponse.json({ error: 'image file is required' }, { status: 400 });
    if (!R2_PUBLIC_BASE_URL)
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });

    const uuid = crypto.randomUUID();
    const originalFilename = `product_full_${uuid}_original.webp`;
    const thumbFilename = `product_full_${uuid}_thumb.webp`;

    let originalBuf: Buffer;
    let thumbBuf: Buffer;
    try {
        [originalBuf, thumbBuf] = await Promise.all([
            validateAndCompressImage(file, { resize: DEFAULT_RESIZE_WIDTH, quality: DEFAULT_WEBP_QUALITY }),
            validateAndCompressImage(file, { resize: THUMBNAIL_RESIZE_WIDTH, quality: THUMBNAIL_WEBP_QUALITY }),
        ]);
    }
    catch (e) {
        const status = e instanceof ImageProcessingError ? e.status : 500;
        const message = e instanceof Error ? e.message : 'Image processing failed';
        return NextResponse.json({ error: message }, { status });
    }

    try {
        await Promise.all([
            uploadToR2(originalFilename, originalBuf),
            uploadToR2(thumbFilename, thumbBuf),
        ]);
    }
    catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({
        url: `${R2_PUBLIC_BASE_URL}/${originalFilename}`,
        thumbUrl: `${R2_PUBLIC_BASE_URL}/${thumbFilename}`,
    }, { status: 201 });
}
