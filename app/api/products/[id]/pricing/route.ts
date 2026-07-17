import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const directorLinks = await prisma.productDirector.findMany({
    where: { productId: idNum },
    include: {
      director: {
        include: {
          packages: { select: { id: true, priceSNS: true, priceNoSNS: true } },
        },
      },
    },
  });

  const prices: Record<number, { priceSNS: number; priceNoSNS: number }> = {};
  for (const link of directorLinks) {
    for (const pkg of link.director.packages) {
      prices[pkg.id] = { priceSNS: pkg.priceSNS, priceNoSNS: pkg.priceNoSNS };
    }
  }

  return NextResponse.json({ prices });
}
