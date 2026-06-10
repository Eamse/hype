'use client';

import Image from 'next/image';
import Link from 'next/link';

export type Product = {
  id: number;
  title: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  section?: string;
};

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? '#222' : 'none'}
      stroke={active ? '#222' : '#888'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ImgBox() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(110deg, #ececec 8%, #ddd 18%, #ececec 33%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s linear infinite',
      }}
    />
  );
}

export default function ProductCard({
  product,
  isSaved,
  onToggleSave,
}: {
  product: Product;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card"
      style={{ cursor: 'pointer', display: 'block' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: 6,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          marginBottom: 8,
        }}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="card-img"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <ImgBox />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(product.id);
          }}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HeartIcon active={isSaved} />
        </button>
      </div>
      <p style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
        {product.brand}
      </p>
      <p
        className="card-title"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#191919',
          marginBottom: 3,
          lineHeight: 1.4,
        }}
      >
        {product.title}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#191919' }}>
        USD {product.price.toLocaleString()}
      </p>
    </Link>
  );
}
