'use client';

import Image from 'next/image';
import Link from 'next/link';

export type Product = {
  id: number;
  title: string;
  imageUrl: string | null;
  section?: string;
  number?: string | null;
};

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? '#000' : 'none'}
      stroke={active ? '#000' : '#bbb'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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
            backgroundColor: '#000',
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
            color: '#000',
            marginBottom: 3,
            lineHeight: 1.4,
            textAlign: 'center',
            letterSpacing: '0.5px',
            // WebkitTextStroke: '0.3px #000',
          }}
        >
          {product.number ? `${product.number} ` : ''}
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
        <BookmarkIcon active={isSaved} />
      </button>
    </div>
  );
}
