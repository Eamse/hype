'use client';

import ProductSection from '@/components/product-section';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBookmarks } from '@/components/bookmark-provider';

type Product = {
  id: number;
  title: string;
  imageUrl: string | null;
  section?: string;
};

type Section = { id?: string; title: string; subtitle?: string; products: Product[] };

export default function ProductSections({ sections }: { sections: Section[] }) {
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
    <>
      {sections.map((s) => (
        <ProductSection
          key={s.title}
          id={s.id}
          title={s.title}
          subtitle={s.subtitle}
          products={s.products}
          saved={bookmarkedIds}
          onToggleSave={toggleSave}
        />
      ))}
    </>
  );
}
