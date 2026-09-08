export const revalidate = 60; // 이미지 많은 매거진 상세 — 60초 캐싱

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import Header from '@/components/header';
import HomeFooter from '@/app/_components/home-footer';
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
    where: { id: idNum },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  if (!magazine) notFound();

  if (!magazine.published) {
    const session = await auth();
    if (!isMagazineMaster(session)) notFound();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header brand="hype-wedding" />
      <div style={{ flex: 1 }}>
        <MagazineDetailView magazine={magazine} backHref="/editorial" />
      </div>
      <HomeFooter />
    </div>
  );
}
