'use client';

import ProductSection from '@/components/product-section';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Product = {
  id: number;
  title: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  section?: string;
};

type Section = { title: string; subtitle?: string; products: Product[] };

export default function ProductSections({ sections }: { sections: Section[] }) {
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSaved(
            new Set(data.map((b: { productId: number }) => b.productId)),
          );
        }
      });
  }, [session]);

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
    <>
      {sections.map((s) => (
        <ProductSection
          key={s.title}
          title={s.title}
          subtitle={s.subtitle}
          products={s.products}
          saved={saved}
          onToggleSave={toggleSave}
        />
      ))}
    </>
  );
}
