import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

//magazine 목록 조회
export async function GET() {
  try {
    const magazine = await prisma.magazine.findMany({
      where: { published: true },
    });
    return NextResponse.json(magazine);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'No result found' }, { status: 500 });
  }
}
