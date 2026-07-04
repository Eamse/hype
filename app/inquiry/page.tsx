import type { Metadata } from 'next';
import Header from '@/components/header';
import InquiryClient from './_components/inquiry-client';

export const metadata: Metadata = {
  title: 'Inquiry | HYPE WEDDING',
  description: 'Book your photoshoot with HYPE WEDDING or HYPE SNAP.',
};

export default async function InquiryPage({
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
      }}
    >
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <InquiryClient />
      </main>
    </div>
  );
}
