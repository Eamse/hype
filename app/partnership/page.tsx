import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';

export const metadata: Metadata = {
  title: 'Partnership | HYPE WEDDING',
  description: 'Vendor partnership inquiries for HYPE WEDDING and HYPE SNAP.',
};

export default async function PartnershipPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <SubTabBar tabs={inquirySubTabs(activeBrand)} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px 120px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Partnership</h1>
        {/* TODO: 파트너십 문의 콘텐츠 추가 */}
        <p style={{ color: '#000', fontSize: 14 }}>파트너십 안내 콘텐츠 들어갈 자리</p>
      </main>
    </div>
  );
}
