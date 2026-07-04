'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Product = {
  id: number;
  title: string;
  brand: string;
  imageUrl: string | null;
  section: string;
};

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      startTransition(() => setResults([]));
      return;
    }
    startTransition(() => setLoading(true));
    const timer = setTimeout(() => {
      fetch('/api/search?q=' + query)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 검색창 헤더 */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          style={{
            flex: 1,
            fontSize: 16,
            border: 'none',
            outline: 'none',
          }}
        />
        <button
          onClick={onClose}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#191919',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          완료
        </button>
      </div>

      {/* 결과 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading && (
          <p style={{ fontSize: 14, color: '#767676' }}>검색 중...</p>
        )}
        {!loading && query && results.length === 0 && (
          <p style={{ fontSize: 14, color: '#767676' }}>검색 결과가 없어요.</p>
        )}
        {results.map((product) => (
          <div
            key={product.id}
            onClick={() => {
              router.push(`/product/${product.id}`);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: '#f0f0f0',
                flexShrink: 0,
              }}
            >
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={56}
                  height={56}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              )}
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#767676', marginBottom: 2 }}>
                {product.brand}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#191919' }}>
                {product.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
