import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const admin = await getAdminId(request);
  if (!admin) {
    return NextResponse.json({ message: 'Admin not found' }, { status: 401 });
  }

  const user = await prisma.user.count();

  const data = await prisma.product.groupBy({
    by: ['section'],
    _count: { id: true },
  });

  const recentProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, imageUrl: true, section: true, createdAt: true },
  });

  return NextResponse.json({ useCount: user, product: data, recentProducts });
}
