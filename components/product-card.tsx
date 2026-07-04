'use client';

import Image from 'next/image';
import Link from 'next/link';

export type Product = {
  id: number;
  title: string;
  imageUrl: string | null;
  section?: string;
};

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? '#ef4444' : 'none'}
      stroke={active ? '#ef4444' : '#888'}
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
    <div style={{ position: 'relative' }}>
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
        </div>
        <p
          className="card-title"
          style={{
            fontSize: 14,
            color: '#191919',
            marginBottom: 3,
            lineHeight: 1.4,
            textAlign: 'center',
            letterSpacing: '0.5px',
            // WebkitTextStroke: '0.3px #191919',
          }}
        >
          {product.title}
        </p>
      </Link>
      <button
        onClick={() => onToggleSave(product.id)}
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
          border: 'none',
          cursor: 'pointer',
          zIndex: 1,
        }}
      >
        <HeartIcon active={isSaved} />
      </button>
    </div>
  );
}
