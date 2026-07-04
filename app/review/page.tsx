import type { Metadata } from 'next';
import Header from '@/components/header';
import ReviewClient from './_components/review-client';

export const metadata: Metadata = {
  title: 'Review | HYPE WEDDING',
  description: 'Real reviews from our clients.',
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; tab?: string }>;
}) {
  const { brand, tab } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  return (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <ReviewClient brand={activeBrand} initialTab={tab} />
      </main>
    </div>
  );
}
