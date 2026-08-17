export const revalidate = 60;

import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { serviceSubTabs } from '@/lib/service-sub-tabs';
import { prisma } from '@/lib/prisma';
import { withProductNumbers } from '@/lib/product-number';
import ProductSections from '../_components/product-sections';

export const metadata: Metadata = {
  title: 'Packages | HYPE WEDDING',
  description: 'Packages offered by HYPE WEDDING and HYPE SNAP.',
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  const jejuSection =
    activeBrand === 'hype-snap'
      ? 'Casual Photoshoot in Jeju'
      : 'Photographers in Jeju';
  const seoulSection =
    activeBrand === 'hype-snap'
      ? 'Casual Photoshoot in Seoul'
      : 'Photographers in Seoul';

  const [jejuRaw, seoulRaw] = await Promise.all([
    prisma.product.findMany({
      where: { section: jejuSection },
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
      where: { section: seoulSection },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        section: true,
        directors: { select: { director: { select: { number: true } } } },
      },
    }),
  ]);
  const jeju = withProductNumbers(jejuRaw);
  const seoul = withProductNumbers(seoulRaw);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <SubTabBar tabs={serviceSubTabs(activeBrand)} />
        <ProductSections
          sections={[
            { title: jejuSection, products: jeju, showAll: true },
            { title: seoulSection, products: seoul, showAll: true },
          ]}
        />
      </main>
    </div>
  );
}
