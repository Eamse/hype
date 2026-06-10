import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import ProductSections from '../_components/product-sections';

export default async function WeddingPage() {
  const [jeju, seoul] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Meet our Photographers in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        brand: true,
        price: true,
        imageUrl: true,
        section: true,
      },
    }),
    prisma.product.findMany({
      where: { section: 'Meet our Photographer in Seoul' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        brand: true,
        price: true,
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
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Header showSubNav />

      <main style={{ paddingTop: 130 }}>
        <ProductSections
          sections={[
            {
              title: 'Meet our Photographers in Jeju',
              subtitle: "HypeWedding's picks for this month",
              products: jeju,
            },
            {
              title: 'Meet our Photographer in Seoul',
              subtitle: 'Trending snap collection',
              products: seoul,
            },
          ]}
        />
      </main>

      <SnsSidebar />
    </div>
  );
}
