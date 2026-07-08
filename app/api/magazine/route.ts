import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';

//magazine 목록 조회
export async function GET() {
  try {
    const magazine = await prisma.magazine.findMany({
      where: { published: true },
    });
    return NextResponse.json(magazine);
  } catch (e) {
    console.error('[GET /api/products]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'No result found' }, { status: 500 });
  }
}

// magazine 작성 (master 전용)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isMagazineMaster(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        content: sanitizeMagazineHtml(b.content.trim()),
        imageUrl: typeof b.imageUrl === 'string' ? b.imageUrl : null,
        published: b.published === true,
      },
    });
    return NextResponse.json(magazine, { status: 201 });
  } catch (e) {
    console.error('[POST /api/magazine]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
