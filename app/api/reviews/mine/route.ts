import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// 내가 작성한 리뷰 목록 (마이페이지용)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  });

  const safeReviews = reviews.map(({ password: _password, ...r }) => r); // 비밀번호 해시 제외
  return NextResponse.json(safeReviews);
}
