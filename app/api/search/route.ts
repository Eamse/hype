import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export type SearchResult = {
  type: 'product' | 'magazine' | 'review';
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`search:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 1) return NextResponse.json([]);

  const insensitive = { contains: q, mode: 'insensitive' as const };

  const [products, magazines, reviews] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { title: insensitive },
          { directors: { some: { director: { name: insensitive } } } },
          { directors: { some: { director: { number: insensitive } } } },
        ],
      },
      select: { id: true, title: true, imageUrl: true, section: true },
      take: 8,
    }),
    prisma.magazine.findMany({
      where: {
        published: true,
        OR: [{ title: insensitive }, { content: insensitive }],
      },
      select: { id: true, title: true, imageUrl: true },
      take: 8,
    }),
    prisma.review.findMany({
      where: {
        OR: [{ title: insensitive }, { content: insensitive }, { name: insensitive }],
      },
      select: {
        id: true,
        title: true,
        productType: true,
        location: true,
        images: { select: { url: true }, orderBy: { order: 'asc' }, take: 1 },
      },
      take: 8,
    }),
  ]);

  const results: SearchResult[] = [
    ...products.map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.title,
      subtitle: p.section,
      imageUrl: p.imageUrl,
    })),
    ...magazines.map((m) => ({
      type: 'magazine' as const,
      id: m.id,
      title: m.title,
      subtitle: 'Editorial',
      imageUrl: m.imageUrl,
    })),
    ...reviews.map((r) => ({
      type: 'review' as const,
      id: r.id,
      title: r.title,
      subtitle: `${r.productType} · ${r.location}`,
      imageUrl: r.images[0]?.url ?? null,
    })),
  ];

  return NextResponse.json(results);
}
