export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
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

      <main style={{ paddingTop: 80 }}>
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
