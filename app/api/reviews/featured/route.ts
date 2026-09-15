import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maskName } from '@/lib/mask-name';

function formatDirectorBadge(
  director: { number: string; location: string | null } | null,
) {
  if (!director) return null;
  const locationLabel = director.location === 'Jeju' ? 'Jeju' : 'Seoul';
  const num = director.number.replace('#', '').split('-')[0].padStart(2, '0');
  return `${locationLabel} ${num}`;
}

export async function GET() {
  const featuredReviews = await prisma.review.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      director: { select: { number: true, location: true } },
    },
  });
  return NextResponse.json(
    featuredReviews.map((review) => ({
      id: review.id,
      name: maskName(review.name),
      country: review.country,
      productType: review.productType,
      location: review.location,
      directorLabel: formatDirectorBadge(review.director),
      content: review.content,
      shootingDate: review.shootingDate,
    })),
  );
}
