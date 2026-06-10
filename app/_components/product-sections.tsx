'use client';

import { useState } from 'react';
import ProductSection from '@/components/product-section';

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

  function toggleSave(id: number) {
    setSaved((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
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
