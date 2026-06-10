import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import HeroCarousel from '@/components/hero-carousel';
import SnsSidebar from '@/components/sns-sidebar';
import ProductSections from '../_components/product-sections';

export default async function HypeSnapPage() {
  const [jeju, seoul] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Casual Photoshoot in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, brand: true, price: true, imageUrl: true, section: true },
    }),
    prisma.product.findMany({
      where: { section: 'Casual Photoshoot in Seoul' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, brand: true, price: true, imageUrl: true, section: true },
    }),
  ]);

  return (
    <div style={{ backgroundColor: '#fff', color: '#191919', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Header brand="hype-snap" />

      <main style={{ paddingTop: 56 }}>
        <HeroCarousel />

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 24px' }}>
          <div className="dday-banner">
            <span>Leave your desired <strong>photoshoot date</strong></span>
            <a
              href="https://forms.gle/3sWqu4NED5ruJEnN9"
              target="_blank"
              style={{ fontSize: 13, fontWeight: 600, color: '#191919', border: '1px solid #191919', borderRadius: 6, padding: '6px 16px' }}
            >
              Enter photoshoot info
            </a>
          </div>
        </section>

        <ProductSections
          sections={[
            { title: 'Casual Photoshoot in Jeju', subtitle: 'With Couple, Friend and Family', products: jeju },
            { title: 'Casual Photoshoot in Seoul', subtitle: 'With Couple, Friend and Family', products: seoul },
          ]}
        />
      </main>

      <SnsSidebar />
    </div>
  );
}
