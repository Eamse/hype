export const revalidate = 60;

import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { regionSubTabs } from '@/lib/service-sub-tabs';
import { prisma } from '@/lib/prisma';
import { withProductNumbers } from '@/lib/product-number';
import ProductsGrid from './_components/products-grid';
import HomeFooter from '../_components/home-footer';

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const productsRaw = await prisma.product.findMany({
    where: { section },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      section: true,
      directors: { select: { director: { select: { number: true } } } },
    },
  });
  const products = withProductNumbers(productsRaw);
  const brand = section?.includes('Casual') ? 'hype-snap' : 'hype-wedding';

  return (
    <div
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header brand={brand} />
      <div style={{ paddingTop: 56 }}>
        <SubTabBar tabs={regionSubTabs(brand)} />
      </div>
      <main className="products-main" style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {products.length} {section ?? 'All Products'}
        </h1>

        <p style={{ fontSize: 13, color: '#000', marginBottom: 32 }}></p>

        <ProductsGrid products={products} />
      </main>
      <HomeFooter />
    </div>
  );
}
