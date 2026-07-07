import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Review.location은 'jeju'/'seoul'(소문자), Director.location은 'Jeju'/'Seoul'(대문자 시작)이라 여기서 맞춰줌
const LOCATION_MAP: Record<string, string> = { jeju: 'Jeju', seoul: 'Seoul' };

// 지역별 작가 목록 (리뷰 작성 폼 드롭다운용)
export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get('location');

  if (location && !LOCATION_MAP[location]) {
    return NextResponse.json({ error: 'invalid location' }, { status: 400 });
  }

  const directors = await prisma.director.findMany({
    where: location ? { location: LOCATION_MAP[location] } : undefined,
    orderBy: { order: 'asc' },
    select: { id: true, number: true, name: true, location: true },
  });

  return NextResponse.json(directors);
}
