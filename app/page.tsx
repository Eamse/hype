export const revalidate = 60;

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { withProductNumbers } from '@/lib/product-number';
import Header from '@/components/header';
import HeroCarousel from '@/components/hero-carousel';
import ProductSections from './_components/product-sections';
import HomeFooter from './_components/home-footer';
import EditorialSection from './_components/editorial-section';
import OurServiceSection from '@/app/service/_components/our-service-section';

export default async function Home() {
  const heroRow = await prisma.siteConfig.findUnique({
    where: { key: 'images_hero_wedding' },
  });
  const heroImages: string[] = (() => {
    try {
      const parsed: unknown = JSON.parse(heroRow?.value ?? '[]');
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  })();

  const [jejuWeddingRaw, seoulWeddingRaw, magazines] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Photographers in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        section: true,
        directors: { select: { director: { select: { number: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { section: 'Photographers in Seoul' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        section: true,
        directors: { select: { director: { select: { number: true } } } },
      },
    }),
    prisma.magazine.findMany({
      where: { published: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        title: true,
        imageUrl: true,
      },
    }),
  ]);
  const jejuWedding = withProductNumbers(jejuWeddingRaw);
  const seoulWedding = withProductNumbers(seoulWeddingRaw);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        color: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

      <main style={{ paddingTop: 56, flex: 1 }}>
        <HeroCarousel images={heroImages}>
          <div className="dday-banner">
            <div className="dday-banner-text"></div>
            <Link href="/inquiry" className="dday-banner-cta">
              Inquiry
            </Link>
          </div>
          <div className="dday-banner">
            <div className="dday-banner-text"></div>
            <Link href="/packages" className="dday-banner-cta">
              Package
            </Link>
          </div>
        </HeroCarousel>
        {/* 속도조절 */}
        <ProductSections
          sections={[
            {
              title: 'Photographers in Jeju',
              products: jejuWedding,
              secondsPerItem: 4.85,
            },
            {
              title: 'Photographers in Seoul',
              products: seoulWedding,
              secondsPerItem: 4.85,
            },
          ]}
        />
        <OurServiceSection showHeader={false} />
        <EditorialSection magazines={magazines} />
      </main>

      <HomeFooter />
    </div>
  );
}
