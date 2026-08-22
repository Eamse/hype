import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { inquirySubTabs } from '@/lib/inquiry-sub-tabs';
import BookingProcessClient from './_components/booking-process-client';
import HomeFooter from '@/app/_components/home-footer';

export const metadata: Metadata = {
  title: 'Booking Process | HYPE WEDDING',
  description: 'How to book your HYPE WEDDING or HYPE SNAP photoshoot.',
};

export default async function BookingProcessPage({
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
        <BookingProcessClient />
      </main>
      <HomeFooter />
    </div>
  );
}
