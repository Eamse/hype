import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';

const { R2_PUBLIC_BASE_URL } = process.env;
const DATA_PATH = path.join(process.cwd(), 'data', 'images.json');

// key: 영문/숫자/언더스코어/하이픈만 허용 (path traversal 방지)
const KEY_RE = /^[a-zA-Z0-9_-]+$/;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

async function readImages(): Promise<Record<string, string[]>> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, string[]>;
    }
    return {};
  } catch {
    return {};
  }
}

// GET /api/images — 전체 이미지 맵 반환
export async function GET() {
  const images = await readImages();
  return NextResponse.json(images);
}

// POST /api/images — key + image 파일 업로드
export async function POST(request: NextRequest) {
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
      {
        error:
          'key must only contain letters, numbers, underscores, or hyphens',
      },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'image file is required' },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, WEBP, GIF files are allowed' },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File size must not exceed 10 MB' },
      { status: 400 },
    );
  }

  const ext = 'webp';
  const timestamp = Date.now();
  const filename = `${key}_${timestamp}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const compress = await sharp(buffer)
    .resize(1920)
    .webp({ quality: 80 })
    .toBuffer();

  await uploadToR2(filename, compress);

  const imageUrl = `${R2_PUBLIC_BASE_URL}/${filename}`;
  const images = await readImages();
  const current = Array.isArray(images[key]) ? images[key] : [];
  if (current.length >= 10) {
    return NextResponse.json(
      {
        error: 'Maximum 10 images allowed',
      },
      { status: 400 },
    );
  }
  current.push(imageUrl);
  images[key] = current;
  await writeFile(DATA_PATH, JSON.stringify(images, null, 2));

  return NextResponse.json({ key, imageUrl });
}

// DELETE /api/images?key=xxx — 이미지 삭제
export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }
  if (!KEY_RE.test(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const images = await readImages();
  const indexParam = request.nextUrl.searchParams.get('index');
  const index = indexParam !== null ? Number(indexParam) : -1;

  const current = Array.isArray(images[key]) ? (images[key] as string[]) : [];

  if (index < 0 || index >= current.length) {
    return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
  }

  const targetUrl = current[index];
  await deleteFileFromR2(targetUrl).catch(() => {});

  current.splice(index, 1);
  images[key] = current;
  await writeFile(DATA_PATH, JSON.stringify(images, null, 2));

  return NextResponse.json({ ok: true });
}
