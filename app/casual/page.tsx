export const revalidate = 60;

import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import SubTabBar from '@/components/sub-tab-bar';
import { serviceSubTabs } from '@/lib/service-sub-tabs';
import ProductSections from '../_components/product-sections';

export default async function CasualPage() {
  const [jeju, seoul] = await Promise.all([
    prisma.product.findMany({
      where: { section: 'Casual Photoshoot in Jeju' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, imageUrl: true, section: true },
    }),
    prisma.product.findMany({
      where: { section: 'Casual Photoshoot in Seoul' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, imageUrl: true, section: true },
    }),
  ]);

  return (
    <div>
      <Header brand="hype-snap" />
      <main style={{ paddingTop: 56 }}>
        <SubTabBar tabs={serviceSubTabs('hype-snap')} />
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

      <SnsSidebar />
    </div>
  );
}
