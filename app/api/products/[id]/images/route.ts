import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_SIZE,
  validateMagicBytes,
  SHARP_OPTIONS,
} from '@/lib/validate-image';
import sharp from 'sharp';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId)
    return NextResponse.json({ error: 'Unautorized' }, { status: 401 });

  const { id } = await props.params;
  const productId = parseId(id);
  if (productId === null)
    return NextResponse.json({ error: 'Invaild ID' }, { status: 400 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invaild form data' }, { status: 400 });
  }
  const file = formData.get('image');
  if (!(file instanceof File))
    return NextResponse.json(
      { error: 'image file is required' },
      { status: 400 },
    );
  if (!ALLOWED_IMAGE_MIME.has(file.type))
    return NextResponse.json(
      { error: 'Only JPG, PNG, WEBP, GIF files are allowed' },
      { status: 400 },
    );
  if (file.size > MAX_IMAGE_SIZE)
    return NextResponse.json(
      { error: 'File size must not exceed 10MB' },
      { status: 400 },
    );
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateMagicBytes(buffer, file.type))
    return NextResponse.json({ error: 'Invald image file' }, { status: 400 });
  if (!R2_PUBLIC_BASE_URL)
    return NextResponse.json(
      { error: 'Storage not configured' },
      { status: 500 },
    );
  const filename = `product_detail_${productId}_${crypto.randomUUID()}.webp`;

  let compressed: Buffer;
  try {
    compressed = await sharp(buffer, SHARP_OPTIONS)
      .resize(1920)
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: 'Image processing failed' },
      { status: 400 },
    );
  }
  try {
    await uploadToR2(filename, compressed);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const url = `${R2_PUBLIC_BASE_URL}/${filename}`;
  const count = await prisma.productImage.count({ where: { productId } });
  const image = await prisma.productImage.create({
    data: { productId, url, order: count },
  });
  return NextResponse.json(image, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId)
    return NextResponse.json({ error: 'Unautorized' }, { status: 401 });
  const { id } = await props.params;
  const productId = parseId(id);
  if (productId === null)
    return NextResponse.json({ error: 'Invaild ID' }, { status: 400 });
  const imageIdParam = request.nextUrl.searchParams.get('imageId');
  const imageId = imageIdParam !== null ? Number(imageIdParam) : NaN;
  if (!Number.isInteger(imageId) || imageId <= 0) {
    return NextResponse.json({ error: 'Invaild imageId' }, { status: 400 });
  }
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });
  if (!image || image.productId !== productId) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
  await deleteFileFromR2(image.url).catch(() => {});
  await prisma.productImage.delete({ where: { id: imageId } });

  return NextResponse.json({ ok: true });
}
