import type { Metadata } from 'next';
import Header from '@/components/header';
import PrivacyPolicyContent from '@/components/privacy-policy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy | HYPE WEDDING',
  description: 'Privacy Policy for HYPE WEDDING and HYPE SNAP, operated by HYPEPIG.',
};

export default async function PrivacyPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '120px 24px 120px',
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 40,
            letterSpacing: '-0.5px',
          }}
        >
          Privacy Policy
        </h1>

        <PrivacyPolicyContent />
      </main>
    </div>
  );
}
