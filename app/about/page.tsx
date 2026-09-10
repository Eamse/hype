import type { Metadata } from 'next';
import Header from '@/components/header';
import HomeFooter from '@/app/_components/home-footer';
import AboutClient from './_components/about-client';
export const metadata: Metadata = {
    title: 'About Us | HYPE WEDDING',
    description: 'Meet the team behind HYPE WEDDING and HYPE SNAP.',
};
export default async function AboutPage({ searchParams, }: {
    searchParams: Promise<{
        brand?: string;
    }>;
}) {
    const { brand } = await searchParams;
    const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
    return (<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header brand={activeBrand}/>
      <main style={{ paddingTop: 56, flex: 1 }}>
        <AboutClient brand={activeBrand}/>
      </main>
      <HomeFooter />
    </div>);
}
