export const revalidate = 60;

import { prisma } from '@/lib/prisma';
import { getProductNumber } from '@/lib/product-number';
import Header from '@/components/header';
import HeroCarousel from '@/components/hero-carousel';
import SnsSidebar from '@/components/sns-sidebar';
import ProductSections from './_components/product-sections';
import HomeFooter from './_components/home-footer';
import EditorialSection from './_components/editorial-section';

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
  const jejuWedding = jejuWeddingRaw.map((p) => ({
    ...p,
    number: getProductNumber(p),
  }));
  const seoulWedding = seoulWeddingRaw.map((p) => ({
    ...p,
    number: getProductNumber(p),
  }));

  return (
    <div
      style={{
        backgroundColor: '#fff',
        color: '#000',
        minHeight: '100vh',
      }}
    >
      <Header />

      <main style={{ paddingTop: 56 }}>
        <HeroCarousel images={heroImages}>
          <div className="dday-banner">
            <div className="dday-banner-text">
              <span>
                Register your wedding date and
                <br />
                <strong>check your D-Day!</strong>
              </span>
            </div>
            <a
              href="https://forms.gle/3sWqu4NED5ruJEnN9"
              className="dday-banner-cta"
            >
              Enter Wedding Info
            </a>
          </div>
        </HeroCarousel>
        {/* 속도조절 */}
        <ProductSections
          sections={[
            {
              title: 'Photographers in Jeju',
              products: jejuWedding,
              secondsPerItem: 2,
            },
            {
              title: 'Photographers in Seoul',
              products: seoulWedding,
              secondsPerItem: 2.85,
            },
          ]}
        />
        <EditorialSection magazines={magazines} />
      </main>

      <SnsSidebar />
      <HomeFooter />
    </div>
  );
}
