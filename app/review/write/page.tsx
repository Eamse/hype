import type { Metadata } from 'next';
import Header from '@/components/header';
import ReviewForm from './_components/review-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Write a Review | HYPE WEDDING',
};

export default function ReviewWritePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <main style={{ paddingTop: 56 }}>
        <div
          style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}>
            Write a Review
          </h1>
          <ReviewForm />
        </div>
      </main>
    </div>
  );
}
