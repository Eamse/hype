export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import HeroCarousel from '@/components/hero-carousel';
import SnsSidebar from '@/components/sns-sidebar';
import ProductSections from './_components/product-sections';
import HomeFooter from './_components/home-footer';

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

  const [jejuWedding, seoulWedding] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Photographers in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      take: 8,
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
      take: 8,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        section: true,
      },
    }),
  ]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        color: '#191919',
        minHeight: '100vh',
      }}
    >
      <Header />

      <main style={{ paddingTop: 56 }}>
        <HeroCarousel images={heroImages} />

        <section
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 24px' }}
        >
          <div className="dday-banner">
            <span>
              Register your wedding date and <strong>check your D-Day!</strong>
            </span>
            <a
              href="https://forms.gle/3sWqu4NED5ruJEnN9"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#191919',
                border: '1px solid #191919',
                borderRadius: 6,
                padding: '6px 16px',
                whiteSpace: 'nowrap',
              }}
            >
              Enter Wedding Info
            </a>
          </div>
        </section>

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
      </main>

      <SnsSidebar />
      <HomeFooter />
    </div>
  );
}
