import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import SubTabBar from '@/components/sub-tab-bar';
import { serviceSubTabs } from '@/lib/service-sub-tabs';
import { prisma } from '@/lib/prisma';
import ProductsGrid from './_components/products-grid';

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const products = await prisma.product.findMany({
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
  const brand = section?.includes('Casual') ? 'hype-snap' : 'hype-wedding';

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Header brand={brand} />
      <div style={{ paddingTop: 56 }}>
        <SubTabBar tabs={serviceSubTabs(brand)} />
      </div>
      <main className="products-main">
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {products.length} {section ?? 'All Products'}
        </h1>

        <p style={{ fontSize: 13, color: '#000', marginBottom: 32 }}></p>

        <ProductsGrid products={products} />
      </main>
    </div>
  );
}
