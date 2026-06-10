import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import Accordion from './_components/accordion';
import { BackButton, StickyBottomBar } from './_components/product-actions';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4dd9d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const INCLUSIONS = [
  'Wedding dress (ceremony)',
  'Studio photo shoot — 1 session',
  'Makeup & hair (ceremony day)',
  'Bridal bouquet & corsage',
  'Fitting gown — 1 piece',
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return { title: 'Not Found' };
  return {
    title: `${product.title} — ${product.brand}`,
    description: `${product.brand}의 ${product.title}. ₩${product.price.toLocaleString()}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) notFound();

  const product = await prisma.product.findUnique({ where: { id: idNum } });
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { section: product.section, id: { not: product.id } },
    take: 10,
    orderBy: { order: 'asc' },
  });

  return (
    <div style={{ backgroundColor: '#fff', color: '#191919', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 80 }}>
      <Header />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 20px 0' }}>
        <BackButton />

        {/* Product Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 8 }}>
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.title} fill sizes="(max-width: 720px) 100vw, 720px" priority style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(110deg, #ececec 8%, #ddd 18%, #ececec 33%)', backgroundSize: '200% 100%' }} />
          )}
        </div>

        {/* Brand / Title / Price */}
        <div style={{ marginBottom: 20, marginTop: 20 }}>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{product.brand}</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{product.title}</h1>
          <p style={{ fontSize: 18, fontWeight: 700 }}>₩{product.price.toLocaleString()}</p>
        </div>

        <div style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 }} />

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>About This Product</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9 }}>
            A detailed description of this product will appear here — covering the brand&apos;s atmosphere, highlights, studio locations, and available styles.
          </p>
        </div>

        {/* What's Included */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What&apos;s Included</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INCLUSIONS.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#f0fffe', border: '1px solid #c8f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <span style={{ fontSize: 13, color: '#333' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 24 }} />

        {/* Brand Card */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Brand</h2>
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f0f0f0', flexShrink: 0, overflow: 'hidden' }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{product.brand}</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>Gangnam, Seoul · Wedding Studio</p>
            </div>
            <button style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#191919', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 14px', flexShrink: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              View Brand
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>More from This Brand</h2>
            <div className="hide-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} style={{ flexShrink: 0, width: 140, display: 'block' }}>
                  <div style={{ width: 140, height: 140, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: 6, position: 'relative' }}>
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.title} fill sizes="140px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{p.brand}</p>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#191919', lineHeight: 1.3 }}>{p.title}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>₩{p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 4 }} />

        {/* Accordion */}
        <div style={{ marginBottom: 24 }}>
          <Accordion title="Booking Guide">
            <p>Please book at least 2 weeks in advance. A 30% deposit is required at the time of booking. Refunds may be restricted once a booking is confirmed.</p>
          </Accordion>
          <Accordion title="How It Works">
            <p>Parking is available at the studio on the day of your ceremony. Shoots typically take 3–4 hours.</p>
          </Accordion>
          <Accordion title="Cancellation Policy">
            <p>Within 7 days of booking: full refund · 7–14 days: 50% refund · After 14 days: no refund</p>
          </Accordion>
          <Accordion title="Seller Info">
            <p>Business name: {product.brand} · CEO: — · Business Reg: 000-00-00000</p>
          </Accordion>
          <div style={{ borderTop: '1px solid #e8e8e8' }} />
        </div>
      </main>

      <SnsSidebar />
      <StickyBottomBar />
    </div>
  );
}
