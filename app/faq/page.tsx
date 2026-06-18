import type { Metadata } from 'next';
import Header from '@/components/header';
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
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <FaqClient />
      </main>
    </div>
  );
}
