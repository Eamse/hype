import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
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

// 이미지 등록
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) {
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

  const files = formData.getAll('images') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  const saved: { id: number; url: string; order: number }[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, GIF files are allowed' },
        { status: 400 },
      );
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'File size must not exceed 10 MB' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }

    let compress: Buffer;
    try {
      compress = await sharp(buffer, SHARP_OPTIONS)
        .resize(1920)
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: 'Image processing failed' }, { status: 400 });
    }

    const filename = `magazine_detail_${idNum}_${Date.now()}.webp`;

    try {
      await uploadToR2(filename, compress);
    } catch {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const url = `${R2_PUBLIC_BASE_URL}/${filename}`;

    const image = await prisma.magazineImage.create({
      data: { magazineId: idNum, url, order: 0 },
    });
    saved.push(image);
  }

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId) {
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
