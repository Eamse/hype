import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
import {
  validateAndCompressImage,
  ImageProcessingError,
  DEFAULT_RESIZE_WIDTH,
  DEFAULT_WEBP_QUALITY,
  HERO_RESIZE_WIDTH,
  HERO_WEBP_QUALITY,
  THUMBNAIL_RESIZE_WIDTH,
  THUMBNAIL_WEBP_QUALITY,
} from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 유저페이지 갤러리(image-gallery.tsx)가 실제로 읽는 건 Package.images(PackageImage)라서,
// 어드민에서 사진을 관리할 땐 Product가 아니라 Package 단위로 올려야 실제 페이지에 반영됨
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId)
    return NextResponse.json({ error: 'Unautorized' }, { status: 401 });

  const { id } = await props.params;
  const packageId = parseId(id);
  if (packageId === null)
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
  if (!R2_PUBLIC_BASE_URL)
    return NextResponse.json(
      { error: 'Storage not configured' },
      { status: 500 },
    );

  const uuid = crypto.randomUUID();
  const webFilename = `package_detail_${packageId}_${uuid}_web.webp`;
  const originalFilename = `package_detail_${packageId}_${uuid}_original.webp`;
  const thumbFilename = `package_detail_${packageId}_${uuid}_thumb.webp`;

  let webBuf: Buffer, originalBuf: Buffer, thumbBuf: Buffer;
  try {
    // 갤러리 평소 노출용(웹 최적화) / 클릭 확대용(원본에 가까운 고화질) / 스트립 썸네일용
    [webBuf, originalBuf, thumbBuf] = await Promise.all([
      validateAndCompressImage(file, {
        resize: DEFAULT_RESIZE_WIDTH,
        quality: DEFAULT_WEBP_QUALITY,
      }),
      validateAndCompressImage(file, {
        resize: HERO_RESIZE_WIDTH,
        quality: HERO_WEBP_QUALITY,
      }),
      validateAndCompressImage(file, {
        resize: THUMBNAIL_RESIZE_WIDTH,
        quality: THUMBNAIL_WEBP_QUALITY,
      }),
    ]);
  } catch (e) {
    const status = e instanceof ImageProcessingError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Image processing failed';
    return NextResponse.json({ error: message }, { status });
  }

  try {
    await Promise.all([
      uploadToR2(webFilename, webBuf),
      uploadToR2(originalFilename, originalBuf),
      uploadToR2(thumbFilename, thumbBuf),
    ]);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const webUrl = `${R2_PUBLIC_BASE_URL}/${webFilename}`;
  const originalUrl = `${R2_PUBLIC_BASE_URL}/${originalFilename}`;
  const thumbUrl = `${R2_PUBLIC_BASE_URL}/${thumbFilename}`;
  const count = await prisma.packageImage.count({ where: { packageId } });
  const image = await prisma.packageImage.create({
    data: { packageId, webUrl, originalUrl, thumbUrl, order: count },
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
  const packageId = parseId(id);
  if (packageId === null)
    return NextResponse.json({ error: 'Invaild ID' }, { status: 400 });
  const imageIdParam = request.nextUrl.searchParams.get('imageId');
  const imageId = imageIdParam !== null ? Number(imageIdParam) : NaN;
  if (!Number.isInteger(imageId) || imageId <= 0) {
    return NextResponse.json({ error: 'Invaild imageId' }, { status: 400 });
  }
  const image = await prisma.packageImage.findUnique({
    where: { id: imageId },
  });
  if (!image || image.packageId !== packageId) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
  await Promise.all([
    deleteFileFromR2(image.webUrl).catch(() => {}),
    deleteFileFromR2(image.originalUrl).catch(() => {}),
    image.thumbUrl
      ? deleteFileFromR2(image.thumbUrl).catch(() => {})
      : Promise.resolve(),
  ]);
  await prisma.packageImage.delete({ where: { id: imageId } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId(request);
  if (!adminId)
    return NextResponse.json({ error: 'Unautorized' }, { status: 401 });
  const { id } = await props.params;
  const packageId = parseId(id);
  const body = await request.json();
  const order = body.order;
  if (packageId === null)
    return NextResponse.json({ error: 'Invaild ID' }, { status: 400 });
  const imageIdParam = request.nextUrl.searchParams.get('imageId');
  const imageId = imageIdParam !== null ? Number(imageIdParam) : NaN;
  if (!Number.isInteger(imageId) || imageId <= 0) {
    return NextResponse.json({ error: 'Invaild imageId' }, { status: 400 });
  }
  const image = await prisma.packageImage.findUnique({
    where: { id: imageId },
  });
  if (!image || image.packageId !== packageId) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
  await prisma.packageImage.update({ where: { id: imageId }, data: { order } });

  return NextResponse.json({ ok: true });
}
