'use client';

import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';

export default function ProductSection({
  id,
  title,
  subtitle,
  products,
  saved,
  onToggleSave,
  showAll = false,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  saved: Set<number>;
  onToggleSave: (id: number) => void;
  /** true면 슬라이드 없이 전체 상품을 그리드로 한 번에 보여줌 */
  showAll?: boolean;
  secondsPerItem?: number;
}) {
  const isMobile = useIsMobile();
  const itemsPerView = isMobile ? 2 : 5;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerView));
  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  useEffect(() => {
    if (showAll || totalPages <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [totalPages, showAll]);

  // index가 totalPages(= 복제해둔 첫 페이지)에 도달하면, 슬라이드가 끝난 뒤
  // 애니메이션 없이 진짜 0번 페이지로 순간이동시켜 무한 루프처럼 보이게 함
  useEffect(() => {
    if (index !== totalPages) return;
    const timeout = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, 600);
    return () => clearTimeout(timeout);
  }, [index, totalPages]);

  useEffect(() => {
    if (withTransition) return;
    const frame = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(frame);
  }, [withTransition]);

  // itemsPerView가 바뀌면(예: 리사이즈로 모바일↔데스크탑 전환) totalPages/slideCount도
  // 바뀌므로, 이전 index가 새 범위를 벗어나 빈 화면이 보이지 않도록 0으로 리셋
  useEffect(() => {
    setWithTransition(false);
    setIndex(0);
  }, [totalPages]);

  if (products.length === 0) return null;

  const pages = showAll
    ? []
    : Array.from({ length: totalPages }, (_, i) =>
        products.slice(i * itemsPerView, i * itemsPerView + itemsPerView),
      );
  // 마지막에 첫 페이지를 하나 더 복제해서 이어붙임 (끊김 없는 순환을 위한 트릭)
  const slides = totalPages > 1 ? [...pages, pages[0]] : pages;
  const slideCount = slides.length;

  return (
    <section
      id={id}
      style={{
        // maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '16px' : '40px',
        scrollMarginTop: 106,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#000' }}>{subtitle}</p>
          )}
        </div>
        {!showAll && (
          <Link
            href={`/products?section=${encodeURIComponent(title)}`}
            className="text-[14px] text-[black] flex items-center gap-1 transition-all hover:text-[black] hover:gap-2 hover:underline"
          >
            See All <span className="arrow-nudge">→</span>
          </Link>
        )}
      </div>

      {showAll ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
            gap: isMobile ? 8 : 12,
          }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isSaved={saved.has(p.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: `${slideCount * 100}%`,
              transform: `translateX(-${index * (100 / slideCount)}%)`,
              transition: withTransition ? 'transform 0.6s ease' : 'none',
            }}
          >
            {slides.map((pageProducts, i) => (
              <div
                key={i}
                style={{
                  flex: `0 0 ${100 / slideCount}%`,
                  boxSizing: 'border-box',
                  padding: `0 ${isMobile ? 4 : 6}px`,
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? 'repeat(2, 1fr)'
                    : 'repeat(5, 1fr)',
                  gap: isMobile ? 8 : 12,
                }}
              >
                {pageProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isSaved={saved.has(p.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
