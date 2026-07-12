'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SearchResult = {
  type: 'product' | 'magazine' | 'review';
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

const SECTION_LABEL: Record<SearchResult['type'], string> = {
  product: 'Products',
  magazine: 'Editorial',
  review: 'Reviews',
};

function detailHref(item: SearchResult): string {
  if (item.type === 'product') return `/product/${item.id}`;
  if (item.type === 'magazine') return `/magazine/${item.id}`;
  return `/review/${item.id}`;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
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

  const groups: { type: SearchResult['type']; items: SearchResult[] }[] = (
    ['product', 'magazine', 'review'] as const
  )
    .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

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
          borderBottom: '1px solid #000',
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
            color: '#000',
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
        {loading && <p style={{ fontSize: 14, color: '#000' }}>검색 중...</p>}
        {!loading && query && results.length === 0 && (
          <p style={{ fontSize: 14, color: '#000' }}>검색 결과가 없어요.</p>
        )}
        {!loading &&
          groups.map((group) => (
            <div key={group.type} style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#bbb',
                  margin: '0 0 8px',
                }}
              >
                {SECTION_LABEL[group.type]}
              </p>
              {group.items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    router.push(detailHref(item));
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid #000',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 6,
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={56}
                        height={56}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#000', marginBottom: 2 }}>
                      {item.subtitle}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#000' }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
