import type { Metadata } from 'next';
import Header from '@/components/header';
import ContactClient from './_components/contact-client';

export const metadata: Metadata = {
  title: 'Contact | HYPE WEDDING',
  description: 'Book your photoshoot with HYPE WEDDING or HYPE SNAP.',
};

export default async function ContactPage({
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
        <ContactClient />
      </main>
    </div>
  );
}
