'use client';

import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLayoutEffect, useRef, useState } from 'react';

const MARQUEE_PX_PER_SEC = 50; // 이 값만 바꾸면 전체 슬라이드 속도가 같이 조절됨

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
}) {
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 서버는 실제 화면 너비를 모르니 0 대신 데스크탑 기준 대략적인 기본값으로 시작 —
  // 그래야 새로고침 시 "0(안 보임) → 갑자기 커짐"이 아니라 "비슷한 크기로 시작 → 살짝 보정"됨
  const [containerWidth, setContainerWidth] = useState(1120);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // ResizeObserver의 첫 콜백은 한 박자 늦게(비동기로) 실행되므로,
    // 그걸 기다리지 않고 마운트되자마자 즉시(동기) 한 번 직접 측정해서 반영
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (products.length === 0) return null;

  const gap = isMobile ? 8 : 12;
  const itemsPerView = isMobile ? 2 : 5;
  // 퍼센트(%) 대신 실측 px로 카드 너비를 고정 — 상품 개수와 무관하게 항상 같은 px 크기가 되도록
  const cardWidthPx =
    containerWidth > 0
      ? (containerWidth - gap * (itemsPerView - 1)) / itemsPerView
      : 0;
  // 무한 루프처럼 보이게 리스트를 두 번 이어붙여서, 트랙을 정확히 절반(-50%)만큼 옮기면 자연스럽게 이어짐
  const trackProducts = [...products, ...products];
  const oneSetWidthPx =
    products.length * cardWidthPx + (products.length - 1) * gap;
  // "초당 몇 px 움직일지"를 고정값으로 두고, 그 속도에 맞게 걸리는 시간을 역산 — 상품 개수 달라도 속도는 항상 동일
  const durationSec = cardWidthPx > 0 ? oneSetWidthPx / MARQUEE_PX_PER_SEC : 0;

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
            className="text-[14px] text-[#000] flex items-center gap-1 transition-all hover:text-[#000] hover:gap-2 hover:!underline"
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
        <div ref={wrapperRef} style={{ overflow: 'hidden' }}>
          <div
            className="product-marquee-track"
            style={{
              display: 'flex',
              gap,
              animationDuration: `${durationSec}s`,
              animationPlayState: cardWidthPx > 0 ? 'running' : 'paused',
            }}
          >
            {trackProducts.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                style={{ flex: `0 0 ${cardWidthPx}px` }}
              >
                <ProductCard
                  product={p}
                  isSaved={saved.has(p.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
