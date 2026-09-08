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

// 유저페이지 갤러리(패키지 선택 탭)는 Package.images(PackageImage)를 읽는데,
// 실제로는 한 상품에 연결된 모든 작가·모든 패키지가 동일한 사진 세트를 공유함
// (구글폼 일괄 업로드 방식과 동일하게 유지). 그래서 상품 단위로 사진을 관리하되
// 저장 시 연결된 모든 Package에 동일하게 복제해서 어디서 패키지를 선택해도 같은 사진이 나오게 함.
async function targetPackageIds(productId: number): Promise<number[]> {
  const links = await prisma.productDirector.findMany({
    where: { productId },
    select: { directorId: true },
  });
  const directorIds = links.map((l) => l.directorId);
  if (directorIds.length === 0) return [];
  const packages = await prisma.package.findMany({
    where: { directorId: { in: directorIds } },
    select: { id: true },
  });
  return packages.map((p) => p.id);
}

// GET: 대표 이미지 목록(실제로는 대상 패키지 중 하나의 이미지 목록과 동일)
export async function GET(
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

  const packageIds = await targetPackageIds(productId);
  if (packageIds.length === 0) {
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
  const images = await prisma.packageImage.findMany({
    where: { packageId: packageIds[0] },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(images, {
    headers: { 'Cache-Control': 'no-store' },
  });
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

  const packageIds = await targetPackageIds(productId);
  if (packageIds.length === 0)
    return NextResponse.json(
      { error: '연결된 작가/패키지가 없습니다' },
      { status: 400 },
    );

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
  const webFilename = `package_detail_product_${productId}_${uuid}_web.webp`;
  const originalFilename = `package_detail_product_${productId}_${uuid}_original.webp`;
  const thumbFilename = `package_detail_product_${productId}_${uuid}_thumb.webp`;

  let webBuf: Buffer, originalBuf: Buffer, thumbBuf: Buffer;
  try {
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

  const count = await prisma.packageImage.count({
    where: { packageId: packageIds[0] },
  });
  const created = await prisma.packageImage.createManyAndReturn({
    data: packageIds.map((packageId) => ({
      packageId,
      webUrl,
      originalUrl,
      thumbUrl,
      order: count,
    })),
  });
  return NextResponse.json(created[0], { status: 201 });
}

// webUrl로 대상 상품의 모든 패키지에 복제된 동일 이미지를 한번에 삭제
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

  const webUrl = request.nextUrl.searchParams.get('webUrl');
  if (!webUrl)
    return NextResponse.json({ error: 'webUrl is required' }, { status: 400 });

  const packageIds = await targetPackageIds(productId);
  const images = await prisma.packageImage.findMany({
    where: { packageId: { in: packageIds }, webUrl },
  });
  if (images.length === 0)
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  const { originalUrl, thumbUrl } = images[0];
  await Promise.all([
    deleteFileFromR2(webUrl).catch(() => {}),
    deleteFileFromR2(originalUrl).catch(() => {}),
    thumbUrl ? deleteFileFromR2(thumbUrl).catch(() => {}) : Promise.resolve(),
  ]);
  await prisma.packageImage.deleteMany({
    where: { packageId: { in: packageIds }, webUrl },
  });

  return NextResponse.json({ ok: true });
}

// order 값을 webUrl로 매칭해서 대상 상품의 모든 패키지에 동일하게 반영
export async function PATCH(
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

  const webUrl = request.nextUrl.searchParams.get('webUrl');
  if (!webUrl)
    return NextResponse.json({ error: 'webUrl is required' }, { status: 400 });

  const body = await request.json();
  const order = body.order;
  if (!Number.isInteger(order))
    return NextResponse.json({ error: 'Invaild order' }, { status: 400 });

  const packageIds = await targetPackageIds(productId);
  await prisma.packageImage.updateMany({
    where: { packageId: { in: packageIds }, webUrl },
    data: { order },
  });

  return NextResponse.json({ ok: true });
}
