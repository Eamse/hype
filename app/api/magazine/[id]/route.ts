import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 문자열로 온 id를 숫자로 반환하는 함수
function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// prisma 레코드가 2025인지 확인하는 함수
function isPrismaNotFound(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: unknown }).code === 'P2025'
  );
}

// magazine 조회
export async function GET(
  _: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    const magazine = await prisma.magazine.findUniqueOrThrow({
      where: { id: idNum, published: true },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(magazine);
  } catch (e) {
    if (isPrismaNotFound(e)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    console.error('[GET /api/magazine/:id]', e);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 },
    );
  }
}
