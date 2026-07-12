'use client';

import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';

export default function ProductSection({
  id,
  title,
  subtitle,
  products,
  saved,
  onToggleSave,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  saved: Set<number>;
  onToggleSave: (id: number) => void;
}) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => {
        const totalPage = Math.ceil(products.length / 5);
        return prev + 1 >= totalPage ? 0 : prev + 1;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [products.length]);

  const visibleProducts = isMobile
    ? products
    : products.slice(page * 5, page * 5 + 5);
  if (products.length === 0) return null;

  return (
    <section
      id={id}
      style={{
        // maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '16px' : '40px',
        scrollMarginTop: 106,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#000' }}>{subtitle}</p>
          )}
        </div>
        <Link
          href={`/products?section=${encodeURIComponent(title)}`}
          className="text-[14px] text-[#000] flex items-center gap-1 transition-all hover:text-[#000] hover:gap-2 hover:!underline"
        >
          See All <span className="arrow-nudge">→</span>
        </Link>
      </div>

      <div
        key={page}
        className="animate-fade"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: isMobile ? 8 : 12,
        }}
      >
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isSaved={saved.has(p.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </section>
  );
}
