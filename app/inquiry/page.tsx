import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';
import InquiryClient from './_components/inquiry-client';
import HomeFooter from '@/app/_components/home-footer';
export const metadata: Metadata = {
    title: 'Inquiry | HYPE WEDDING',
    description: 'Book your photoshoot with HYPE WEDDING or HYPE SNAP.',
};
export default async function InquiryPage({ searchParams, }: {
    searchParams: Promise<{
        brand?: string;
    }>;
}) {
    const { brand } = await searchParams;
    const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
    return (<div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
      <Header brand={activeBrand}/>
      <main style={{ paddingTop: 56, flex: 1 }}>
        <SubTabBar tabs={inquirySubTabs(activeBrand)}/>
        <InquiryClient />
      </main>
      <HomeFooter />
    </div>);
}
