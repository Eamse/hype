'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Magazine = {
  id: number;
  title: string;
  imageUrl: string | null;
};

export default function EditorialSection({
  magazines,
}: {
  magazines: Magazine[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  // 카드들이 화면에 들어오면 순차적으로 페이드인 + 위로 슬라이드
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.inquiry-step');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((card, idx) => {
              setTimeout(() => card.classList.add('visible'), idx * 100);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [magazines.length]);

  if (magazines.length === 0) return null;
  return (
    <section className="max-w-[1200px] mx-auto px-5 py-16">
      {/* 섹션 헤더 */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-[black] mb-2">
            From the editors
          </p>
          <h2 className="text-3xl font-bold text-[black] tracking-tight">
            Editorial
          </h2>
        </div>
        <Link
          href="/magazine"
          className="text-[11px] tracking-[2px] uppercase text-[black] border-b border-[black] pb-0.5 hover:text-[black] hover:border-[black] transition-colors"
        >
          View All
        </Link>
      </div>
      {/* 그리드 */}
      <div ref={gridRef} className="grid grid-cols-2 gap-x-8 gap-y-12">
        {magazines.map((magazine) => (
          <Link
            key={magazine.id}
            href={`/magazine/${magazine.id}`}
            className="inquiry-step group block"
          >
            {/* 이미지 */}
            <div className="relative w-full aspect-square overflow-hidden mb-4 rounded-md">
              {magazine.imageUrl ? (
                <Image
                  src={magazine.imageUrl}
                  alt={magazine.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[white] flex items-center justify-center text-[black] text-xs">
                  No Image
                </div>
              )}
              {/* hover 오버레이 */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-[12px] font-semibold tracking-wide text-white">
                  Read more <span className="arrow-nudge">→</span>
                </span>
              </div>
            </div>
            {/* 제목 */}
            <p className="text-sm font-semibold text-[black] leading-snug group-hover:underline">
              {magazine.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
