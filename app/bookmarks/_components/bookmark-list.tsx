'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/product-card';
import { useIsMobile } from '@/hooks/useIsMobile';

type Bookmark = {
  id: number;
  product: {
    id: number;
    title: string;
    brand: string;
    price: number;
    imageUrl: string | null;
    section: string;
  };
};

export default function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [saved, setSaved] = useState(
    new Set(bookmarks.map((b) => b.product.id)),
  );
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  async function toggleSave(id: number) {
    if (!session) {
      router.push('?auth=1');
      return;
    }
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ productId: id }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    setSaved((prev) => {
      const n = new Set(prev);
      if (data.bookmarked) n.add(id);
      else n.delete(id);
      return n;
    });
  }
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '80px 16px 32px' : '80px 40px 40px',
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Saved</h1>
      {bookmarks.length === 0 ? (
        <p style={{ color: '#767676', fontSize: 14 }}>저장된 상품이 없어요.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? 8 : 12,
          }}
        >
          {bookmarks.map((bookmark) => (
            <ProductCard
              key={bookmark.id}
              product={bookmark.product}
              isSaved={saved.has(bookmark.product.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
