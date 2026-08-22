'use client';

import ProductSection from '@/components/product-section';

type Product = {
  id: number;
  title: string;
  imageUrl: string | null;
  section?: string;
};

type Section = {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  showAll?: boolean;
  secondsPerItem?: number;
};

export default function ProductSections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((s) => (
        <ProductSection
          key={s.title}
          id={s.id}
          title={s.title}
          subtitle={s.subtitle}
          products={s.products}
          showAll={s.showAll}
          secondsPerItem={s.secondsPerItem}
        />
      ))}
    </>
  );
}
