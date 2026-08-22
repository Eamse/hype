export const revalidate = 60;

import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { contentSubTabs } from '@/lib/service-sub-tabs';
import { withProductNumbers } from '@/lib/product-number';
import ProductSections from '../_components/product-sections';
import HomeFooter from '../_components/home-footer';

export default async function CasualPage() {
  const [jejuRaw, seoulRaw] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Casual Photoshoot in Jeju' },
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
      where: { section: 'Casual Photoshoot in Seoul' },
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
    <div>
      <Header brand="hype-snap" />
      <main style={{ paddingTop: 56 }}>
        <SubTabBar tabs={contentSubTabs('hype-snap')} />
        <ProductSections
          sections={[
            {
              title: 'Casual Photoshoot in Jeju',
              subtitle: 'With Couple, Friend and Family',
              products: jeju,
            },
            {
              title: 'Casual Photoshoot in Seoul',
              subtitle: 'With Couple, Friend and Family',
              products: seoul,
            },
          ]}
        />
      </main>
      <HomeFooter />
    </div>
  );
}
