import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';
import HomeFooter from '@/app/_components/home-footer';
import FaqClient from './_components/faq-client';

export const metadata: Metadata = {
  title: 'FAQ | HYPE WEDDING',
  description: 'Frequently asked questions about HYPE WEDDING photography services.',
};

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56, flex: 1 }}>
        <SubTabBar tabs={inquirySubTabs(activeBrand)} />
        <FaqClient />
      </main>
      <HomeFooter />
    </div>
  );
}
