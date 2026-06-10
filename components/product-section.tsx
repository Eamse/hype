'use client';

import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function ProductSection({
  title,
  subtitle,
  products,
  saved,
  onToggleSave,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  saved: Set<number>;
  onToggleSave: (id: number) => void;
}) {
  const isMobile = useIsMobile();
  if (products.length === 0) return null;

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 32px' : '0 40px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: '#999' }}>{subtitle}</p>}
        </div>
        <Link href={`/products?section=${encodeURIComponent(title)}`} style={{ fontSize: 12, color: '#999', borderBottom: '1px solid #ccc' }}>
          See All
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 12 }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} isSaved={saved.has(p.id)} onToggleSave={onToggleSave} />
        ))}
      </div>
    </section>
  );
}
