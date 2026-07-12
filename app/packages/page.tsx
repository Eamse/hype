import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { serviceSubTabs } from '@/lib/service-sub-tabs';

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

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <SubTabBar tabs={serviceSubTabs(activeBrand)} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px 120px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Packages</h1>
          {/* TODO: Packages 콘텐츠 추가 */}
          <p style={{ color: '#000', fontSize: 14 }}>
            {activeBrand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'} 패키지 콘텐츠 들어갈 자리
          </p>
        </div>
      </main>
    </div>
  );
}
