export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import MagazineDetailView from '@/components/magazine-detail-view';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const magazine = await prisma.magazine.findUnique({
    where: { id: Number(id), published: true },
  });
  if (!magazine) return { title: 'Not Found' };
  return {
    title: magazine.title,
    description: magazine.content.slice(0, 160),
  };
}

export default async function MagazineDetailPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) notFound();

  const magazine = await prisma.magazine.findUnique({
    where: { id: idNum, published: true },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  if (!magazine) notFound();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <MagazineDetailView magazine={magazine} backHref="/magazine" />
    </div>
  );
}
