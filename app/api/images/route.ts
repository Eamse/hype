import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { getAdminId } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_SIZE,
  validateMagicBytes,
  SHARP_OPTIONS,
} from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? '';

// key: 영문/숫자/언더스코어/하이픈만 허용 (path traversal 방지)
const KEY_RE = /^[a-zA-Z0-9_-]+$/;
const DB_KEY_PREFIX = 'images_';
const MAX_IMAGES_PER_KEY = 10;

/** SiteConfig에서 key의 이미지 URL 배열 읽기 */
async function readImages(key: string): Promise<string[]> {
  const row = await prisma.siteConfig.findUnique({
    where: { key: `${DB_KEY_PREFIX}${key}` },
  });
  if (!row) return [];
  try {
    const parsed: unknown = JSON.parse(row.value);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/** SiteConfig에 key의 이미지 URL 배열 저장 */
async function writeImages(key: string, urls: string[]): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: `${DB_KEY_PREFIX}${key}` },
    update: { value: JSON.stringify(urls) },
    create: { key: `${DB_KEY_PREFIX}${key}`, value: JSON.stringify(urls) },
  });
}

/** SiteConfig에서 전체 이미지 맵 읽기 */
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
    } catch {
      result[key] = [];
    }
  }
  return result;
}

// GET /api/images — 전체 이미지 맵 반환 (어드민 전용)
export async function GET(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const images = await readAllImages();
  return NextResponse.json(images);
}

// POST /api/images — key + image 파일 업로드
export async function POST(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const key = formData.get('key');
  const file = formData.get('image');

  if (typeof key !== 'string' || !key) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }
  if (!KEY_RE.test(key)) {
    return NextResponse.json(
      { error: 'key must only contain letters, numbers, underscores, or hyphens' },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'image file is required' }, { status: 400 });
  }
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

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!validateMagicBytes(buffer, file.type)) {
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
  }

  if (!R2_PUBLIC_BASE_URL) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  // 현재 이미지 수 확인 (업로드 전 제한 체크)
  const current = await readImages(key);
  if (current.length >= MAX_IMAGES_PER_KEY) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES_PER_KEY} images allowed per key` },
      { status: 400 },
    );
  }

  const filename = `${key}_${crypto.randomUUID()}.webp`;

  let compress: Buffer;
  try {
    compress = await sharp(buffer, SHARP_OPTIONS)
      .resize(1920)
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'Image processing failed' }, { status: 400 });
  }

  try {
    await uploadToR2(filename, compress);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const imageUrl = `${R2_PUBLIC_BASE_URL}/${filename}`;
  current.push(imageUrl);
  await writeImages(key, current);

  return NextResponse.json({ key, imageUrl });
}

// DELETE /api/images?key=xxx&index=0 — 이미지 삭제
export async function DELETE(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  await deleteFileFromR2(targetUrl).catch(() => {});

  current.splice(index, 1);
  await writeImages(key, current);

  return NextResponse.json({ ok: true });
}
