import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function isPrismaNotFound(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: unknown }).code === 'P2025'
  );
}

// GET /api/admin/magazine/[id] — 단건 조회 (임시저장 포함)
export async function GET(
  _: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const magazine = await prisma.magazine.findUniqueOrThrow({
      where: { id: idNum },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(magazine);
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 },
      );
    }
    console.error('[GET /api/admin/magazine/:id]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/magazine/[id] — 수정 (임시저장 ↔ 발행 전환 포함)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  //제목
  if (b.title != null) {
    if (typeof b.title !== 'string' || !b.title.trim()) {
      return NextResponse.json(
        { error: 'title must be a non-empty string' },
        { status: 400 },
      );
    }
    data.title = b.title.trim();
  }
  // 메인 이미지
  if (b.content != null) {
    if (typeof b.content !== 'string' || !b.content.trim()) {
      return NextResponse.json(
        { error: 'content must be a non-empty string' },
        { status: 400 },
      );
    }
    data.content = b.content.trim();
  }
  if (b.imageUrl !== undefined) {
    if (b.imageUrl !== null && typeof b.imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageUrl must be a string or null' },
        { status: 400 },
      );
    }
    data.imageUrl = b.imageUrl;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 },
    );
  }

  try {
    const magazine = await prisma.magazine.update({
      where: { id: idNum },
      data,
    });
    return NextResponse.json(magazine);
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 },
      );
    }
    console.error('[PATCH /api/admin/magazine/:id]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/magazine/[id] — 삭제
export async function DELETE(
  _: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.magazine.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 },
      );
    }
    console.error('[DELETE /api/admin/magazine/:id]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
