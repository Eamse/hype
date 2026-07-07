import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import sharp from 'sharp';
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_SIZE,
  validateMagicBytes,
  SHARP_OPTIONS,
} from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

class ImageValidationError extends Error {}

async function processFile(file: File, idNum: number, tag: string): Promise<string> {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new ImageValidationError('Only JPG, PNG, WEBP, GIF files are allowed');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageValidationError('File size must not exceed 10 MB');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!validateMagicBytes(buffer, file.type)) {
    throw new ImageValidationError('Invalid image file');
  }

  let compress: Buffer;
  try {
    compress = await sharp(buffer, SHARP_OPTIONS)
      .resize(1920)
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new ImageValidationError('Image processing failed');
  }

  const filename = `magazine_${tag}_${idNum}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

  try {
    await uploadToR2(filename, compress);
  } catch {
    throw new ImageValidationError('Upload failed');
  }

  return `${R2_PUBLIC_BASE_URL}/${filename}`;
}

// 이미지 등록 — cover(단일) + images(다중 갤러리)
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isMagazineMaster(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
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

  const coverFile = formData.get('cover') as File | null;
  const files = formData.getAll('images') as File[];

  if ((!coverFile || coverFile.size === 0) && files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  try {
    let coverUrl: string | null = null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await processFile(coverFile, idNum, 'cover');
      await prisma.magazine.update({
        where: { id: idNum },
        data: { imageUrl: coverUrl },
      });
    }

    const saved: { id: number; url: string; order: number }[] = [];
    for (const file of files) {
      const url = await processFile(file, idNum, 'detail');
      const image = await prisma.magazineImage.create({
        data: { magazineId: idNum, url, order: 0 },
      });
      saved.push(image);
    }

    return NextResponse.json({ coverUrl, images: saved }, { status: 201 });
  } catch (e) {
    if (e instanceof ImageValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error('[POST /magazine/:id/images]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isMagazineMaster(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const imageId = parseId(searchParams.get('imageId') ?? '');
  if (imageId === null) {
    return NextResponse.json({ error: 'Invalid imageId' }, { status: 400 });
  }

  try {
    const image = await prisma.magazineImage.findUniqueOrThrow({
      where: { id: imageId, magazineId: idNum },
    });

    await prisma.magazineImage.delete({
      where: { id: imageId, magazineId: idNum },
    });

    await deleteFileFromR2(image.url).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code: unknown }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    console.error('[DELETE /magazine/:id/images]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
