import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { deleteFileFromR2 } from '@/lib/r2';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

// 문자열로 온 id를 숫자로 반환하는 함수
function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// magazine 조회 — 발행글은 누구나, 미발행글은 master만
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const magazine = await prisma.magazine.findUnique({
    where: { id: idNum },
    include: { images: { orderBy: { order: 'asc' } } },
  });
  if (!magazine) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  if (!magazine.published) {
    const session = await auth();
    if (!isMagazineMaster(session)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
  }

  return NextResponse.json(magazine);
}

// magazine 수정 — master 전용
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isMagazineMaster(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!checkRateLimit(`magazine-write:${session!.user!.id}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (b.title !== undefined) {
    if (typeof b.title !== 'string' || !b.title.trim()) {
      return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 });
    }
    data.title = b.title.trim();
  }
  if (b.content !== undefined) {
    if (typeof b.content !== 'string' || !b.content.trim()) {
      return NextResponse.json({ error: 'content must be a non-empty string' }, { status: 400 });
    }
    data.content = sanitizeMagazineHtml(b.content.trim());
  }
  if (b.imageUrl !== undefined) {
    if (b.imageUrl !== null && typeof b.imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl must be a string or null' }, { status: 400 });
    }
    data.imageUrl = b.imageUrl;
  }
  if (b.published !== undefined) {
    if (typeof b.published !== 'boolean') {
      return NextResponse.json({ error: 'published must be a boolean' }, { status: 400 });
    }
    data.published = b.published;
  }
  if (b.isPinned !== undefined) {
    if (typeof b.isPinned !== 'boolean') {
      return NextResponse.json({ error: 'isPinned must be a boolean' }, { status: 400 });
    }
    data.isPinned = b.isPinned;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const magazine = await prisma.magazine.update({ where: { id: idNum }, data });
    return NextResponse.json(magazine);
  } catch (e) {
    console.error('[PATCH /api/magazine/:id]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// magazine 삭제 — master 전용
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
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const magazine = await prisma.magazine.findUnique({
    where: { id: idNum },
    include: { images: true },
  });
  if (!magazine) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  try {
    if (magazine.imageUrl) {
      await deleteFileFromR2(magazine.imageUrl).catch(() => {});
    }
    await Promise.all(
      magazine.images.map((img) => deleteFileFromR2(img.url).catch(() => {})),
    );
    await prisma.magazine.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/magazine/:id]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
