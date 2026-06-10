import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/magazine — 전체 목록 (임시저장 포함)
export async function GET() {
  try {
    const magazines = await prisma.magazine.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(magazines);
  } catch (e) {
    console.error('[GET /api/admin/magazine]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST /api/admin/magazine — 글 생성
export async function POST(request: NextRequest) {
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

  if (typeof b.title !== 'string' || !b.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (typeof b.content !== 'string' || !b.content.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  try {
    const magazine = await prisma.magazine.create({
      data: {
        title: b.title.trim(),
        content: b.content.trim(),
        imageUrl: typeof b.imageUrl === 'string' ? b.imageUrl : null,
        published: true,
      },
    });
    return NextResponse.json(magazine, { status: 201 });
  } catch (e) {
    console.error('[POST /api/admin/magazine]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
