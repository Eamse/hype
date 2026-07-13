export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
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

  const [jejuWedding, seoulWedding, magazines] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Photographers in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        section: true,
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

        <ProductSections
          sections={[
            {
              title: 'Photographers in Jeju',
              products: jejuWedding,
            },
            {
              title: 'Photographers in Seoul',
              products: seoulWedding,
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
