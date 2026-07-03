import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 1) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      title: { contains: q, mode: 'insensitive' },
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      section: true,
    },
    take: 10,
  });
  return NextResponse.json(products);
}
