'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const isMobile = useIsMobile();
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
    <section style={{ margin: '0 auto', padding: isMobile ? 16 : 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <h2 className="text-3xl font-bold text-[black] tracking-tight">
            Editorial
          </h2>
        </div>
        <Link
          href="/editorial"
          className="text-[14px] text-[black] flex items-center gap-1 transition-all hover:text-[black] hover:gap-2 hover:underline"
        >
          See All <span className="arrow-nudge">→</span>
        </Link>
      </div>

      <div ref={gridRef} className="grid grid-cols-3 gap-x-8 gap-y-12">
        {magazines.map((magazine) => (
          <Link
            key={magazine.id}
            href={`/editorial/${magazine.id}`}
            className="inquiry-step group block"
          >
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

              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-[12px] font-semibold tracking-wide text-white">
                  Read more <span className="arrow-nudge">→</span>
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-[black] leading-snug group-hover:underline">
              {magazine.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
