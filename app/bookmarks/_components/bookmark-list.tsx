'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/product-card';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useBookmarks } from '@/components/bookmark-provider';

type Bookmark = {
  id: number;
  product: {
    id: number;
    title: string;
    imageUrl: string | null;
    section: string;
  };
};

export default function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  async function toggleSave(id: number) {
    if (!session) {
      router.push('?auth=1');
      return;
    }
    await toggleBookmark(id);
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
              isSaved={bookmarkedIds.has(bookmark.product.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
