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

const SECTION_COLOR: Record<SearchResult['type'], { bg: string; text: string }> = {
  product: { bg: '#eaf5ee', text: '#2d5a45' },
  magazine: { bg: '#eef2fb', text: '#2b4c8c' },
  review: { bg: '#fbeeef', text: '#9c3b45' },
};

function detailHref(item: SearchResult): string {
  if (item.type === 'product') return `/product/${item.id}`;
  if (item.type === 'magazine') return `/editorial/${item.id}`;
  return `/review/${item.id}`;
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ResultThumb({ item }: { item: SearchResult }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        width: 52,
        height: 52,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        background: '#f2f2f2',
      }}
    >
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="52px"
          style={{ objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

function SectionBadge({ type }: { type: SearchResult['type'] }) {
  const c = SECTION_COLOR[type];
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        color: c.text,
        background: c.bg,
        padding: '3px 9px',
        borderRadius: 999,
        marginBottom: 10,
      }}
    >
      {SECTION_LABEL[type]}
    </span>
  );
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(20,20,20,0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
      className="search-overlay"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="search-card"
      >
        {/* 검색창 헤더 */}
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f4f4f4',
              borderRadius: 12,
              padding: '12px 14px',
              minWidth: 0,
            }}
          >
            <span style={{ color: '#888', display: 'flex', flexShrink: 0 }}>
              <SearchIcon />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, photographers, reviews, editorial"
              style={{
                flex: 1,
                fontSize: 15,
                border: 'none',
                outline: 'none',
                color: '#000',
                background: 'transparent',
                minWidth: 0,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear"
                style={{
                  fontSize: 12,
                  color: '#aaa',
                  background: '#e4e4e4',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#666',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              padding: '4px 2px',
            }}
          >
            Cancel
          </button>
        </div>

        {/* 결과 목록 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {!query && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '48px 0 40px',
                color: '#c2c2c2',
              }}
            >
              <SearchIcon />
              <p style={{ fontSize: 13, color: '#aaa' }}>
                Start typing to search HYPE WEDDING
              </p>
            </div>
          )}

          {loading && (
            <p style={{ fontSize: 13, color: '#999', padding: '20px 0' }}>Searching...</p>
          )}
          {!loading && query && results.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '40px 0',
                color: '#bbb',
              }}
            >
              <p style={{ fontSize: 13 }}>No results for &quot;{query}&quot;</p>
            </div>
          )}
          {!loading &&
            groups.map((group) => (
              <div key={group.type} style={{ marginTop: 18 }}>
                <SectionBadge type={group.type} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {group.items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        router.push(detailHref(item));
                        onClose();
                      }}
                      className="search-result-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 8px',
                        borderRadius: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <ResultThumb item={item} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#111',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: '#999',
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="search-result-arrow" style={{ color: '#ccc', flexShrink: 0, display: 'flex' }}>
                        <ArrowIcon />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
