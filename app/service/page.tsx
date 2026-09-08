import type { Metadata } from 'next';
import Header from '@/components/header';
import SubTabBar from '@/components/sub-tab-bar';
import { offerSubTabs } from '@/lib/service-sub-tabs';
import WhyHypeSection from './_components/why-hype-section';
import OurServiceSection from './_components/our-service-section';
import ShootScheduleSection from './_components/shoot-schedule-section';
import ShootDayTimelineSection from './_components/shoot-day-timeline-section';
import HomeFooter from '@/app/_components/home-footer';

export const metadata: Metadata = {
  title: 'What We Offer | HYPE WEDDING',
  description: 'What HYPE WEDDING and HYPE SNAP offer.',
};

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56, flex: 1 }}>
        <SubTabBar tabs={offerSubTabs(activeBrand)} />
        <WhyHypeSection />
        <OurServiceSection />
        <ShootScheduleSection />
        <ShootDayTimelineSection />
      </main>
      <HomeFooter />
    </div>
  );
}
