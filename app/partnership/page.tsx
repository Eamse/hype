import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';
import HomeFooter from '@/app/_components/home-footer';
export const metadata: Metadata = {
    title: 'Partnership | HYPE WEDDING',
    description: 'Vendor partnership inquiries for HYPE WEDDING and HYPE SNAP.',
};
export default async function PartnershipPage({ searchParams, }: {
    searchParams: Promise<{
        brand?: string;
    }>;
}) {
    const { brand } = await searchParams;
    const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
    return (<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header brand={activeBrand}/>
      <SubTabBar tabs={inquirySubTabs(activeBrand)}/>
      <main className="partnership-page" style={{ paddingTop: 56, flex: 1 }}>
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 8,
            padding: '80px 20px',
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 700, color: '#000' }}>
            Coming Soon
          </p>
          <p style={{ fontSize: 14, color: '#666' }}>준비 중입니다</p>
        </div>
      </main>
      <HomeFooter />
    </div>);
}
