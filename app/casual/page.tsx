import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import ProductSections from '../_components/product-sections';

export default async function CasualPage() {
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
      <Header brand="hype-snap" showSubNav />

      <main style={{ paddingTop: 130 }}>
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
