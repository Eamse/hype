import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { uploadToR2 } from '@/lib/r2';
import sharp from 'sharp';
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_SIZE,
  validateMagicBytes,
  SHARP_OPTIONS,
} from '@/lib/validate-image';
import { checkRateLimit } from '@/lib/rate-limit';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

// 에디터 본문에 삽입할 이미지 업로드 (master 전용, 매거진 id 불필요)
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
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP, GIF files are allowed' }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'File size must not exceed 50 MB' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!validateMagicBytes(buffer, file.type)) {
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
  }

  let compressed: Buffer;
  try {
    compressed = await sharp(buffer, SHARP_OPTIONS).resize(1600).webp({ quality: 80 }).toBuffer();
  } catch {
    return NextResponse.json({ error: 'Image processing failed' }, { status: 400 });
  }

  const filename = `magazine_body_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

  try {
    await uploadToR2(filename, compressed);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  return NextResponse.json({ url: `${R2_PUBLIC_BASE_URL}/${filename}` }, { status: 201 });
}
