'use client';

import ProductCard, { type Product } from '@/components/product-card';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBookmarks } from '@/components/bookmark-provider';

export default function ProductsGrid({ products }: { products: Product[] }) {
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const { data: session } = useSession();
  const router = useRouter();

  async function toggleSave(id: number) {
    if (!session) {
      router.push('?auth=1');
      return;
    }
    await toggleBookmark(id);
  }
  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          isSaved={bookmarkedIds.has(p.id)}
          onToggleSave={toggleSave}
        />
      ))}
    </div>
  );
}
