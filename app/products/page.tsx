'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import { isProductArray, type Product } from '@/lib/is-product-array';
import { useIsMobile } from '@/hooks/useIsMobile';

function ProductsContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const [products, setProducts] = useState<Product[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const brand = section?.includes('Casual') ? 'hype-snap' : 'hype-wedding';
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!section) return;
    const controller = new AbortController();

    fetch(`/api/products?section=${encodeURIComponent(section)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (isProductArray(data)) setProducts(data);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') console.error(e);
      });

    return () => controller.abort();
  }, [section]);

  function toggleSave(id: number) {
    setSaved((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Header brand={brand} showSubNav />
      <main
        style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '100px 16px 60px' : '130px 40px 60px' }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          {section ?? 'All Products'}
        </h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>
          {products.length} products
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 8 : 12,
          }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isSaved={saved.has(p.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
