'use client';

import ProductCard, { type Product } from '@/components/product-card';

export default function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
