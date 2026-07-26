'use client';

import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function ProductSection({
  id,
  title,
  subtitle,
  products,
  saved,
  onToggleSave,
  showAll = false,
  secondsPerItem = 2,
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

  if (products.length === 0) return null;

  const itemsPerView = isMobile ? 2 : 5;
  // 퍼센트 기반이라 JS로 화면 크기를 잴 필요가 없음 — 새로고침 시 깜빡임(작아졌다 커짐) 자체가 안 생김
  const cardWidthPercent = 100 / itemsPerView;
  // 무한 루프처럼 보이게 리스트를 두 번 이어붙임. 트랙 자신의 박스 너비는 컨테이너 너비(=100%)로
  // 고정되어 있고 카드들만 그 밖으로 넘쳐 흐르는 구조라서, "-50%"가 아니라 "카드 1개 너비% × 상품 개수"만큼
  // 옮겨야 정확히 원본 리스트 1개 분량만큼 이동해 이어붙인 지점이 보이지 않음 (globals.css의 productMarquee 참고)
  const trackProducts = [...products, ...products];
  const durationSec = products.length * secondsPerItem;
  const marqueeShiftPercent = products.length * cardWidthPercent;

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
        <div style={{ overflow: 'hidden' }}>
          <div
            className="product-marquee-track"
            style={
              {
                display: 'flex',
                animationDuration: `${durationSec}s`,
                '--marquee-shift': `${marqueeShiftPercent}%`,
              } as React.CSSProperties
            }
          >
            {trackProducts.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                style={{
                  flex: `0 0 ${cardWidthPercent}%`,
                  padding: `0 ${isMobile ? 4 : 6}px`,
                  boxSizing: 'border-box',
                }}
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
