import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';
import PartnershipClient from './_components/partnership-client';
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
      <main className="partnership-page" style={{ flex: 1 }}>
        <PartnershipClient />
      </main>
      <HomeFooter />
    </div>);
}
