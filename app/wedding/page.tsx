export const revalidate = 60;
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { contentSubTabs } from '@/lib/service-sub-tabs';
import { withProductNumbers } from '@/lib/product-number';
import ProductSections from '../_components/product-sections';
import HomeFooter from '../_components/home-footer';
export default async function WeddingPage() {
    const [jejuRaw, seoulRaw] = await Promise.all([
        prisma.product.findMany({
            where: { section: 'Photographers in Jeju' },
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
            where: { section: 'Photographers in Seoul' },
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
    return (<div style={{
            backgroundColor: '#fff',
            color: '#000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
      <Header />
      <main style={{ paddingTop: 56, flex: 1 }}>
        <SubTabBar tabs={contentSubTabs('hype-wedding')}/>
        <ProductSections sections={[
            {
                title: 'Photographers in Jeju',
                subtitle: "HypeWedding's picks for this month",
                products: jeju,
            },
            {
                title: 'Photographers in Seoul',
                subtitle: 'Trending snap collection',
                products: seoul,
            },
        ]}/>
      </main>
      <HomeFooter />
    </div>);
}
