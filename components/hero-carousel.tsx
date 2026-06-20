'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroCarousel({ images }: { images: string[] }) {
  const [heroImages] = useState<string[]>(images);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroPaused = useRef(false);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const id = setInterval(() => {
      const el = heroRef.current;
      if (heroPaused.current || !el) return;
      const firstItem = el.children[0] as HTMLElement | undefined;
      if (!firstItem) return;
      const itemWidth = firstItem.offsetWidth + 8;
      const moveBy = itemWidth * 2;
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half - moveBy) {
        el.scrollLeft = 0;
      }
      el.scrollBy({ left: moveBy, behavior: 'smooth' });
    }, 2500);
    return () => clearInterval(id);
  }, [heroImages]);

  if (heroImages.length === 0) return null;

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '10px 20px',
        overflow: 'hidden',
      }}
    >
      <div
        ref={heroRef}
        className="hide-scroll"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        }}
        onMouseEnter={() => {
          heroPaused.current = true;
        }}
        onMouseLeave={() => {
          heroPaused.current = false;
        }}
        onTouchStart={() => {
          heroPaused.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            heroPaused.current = false;
          }, 2000);
        }}
      >
        {[...heroImages, ...heroImages].map((url, idx) => (
          <div
            className="lg:w-[calc(25%-6px)] w-[calc(50%-4px)]"
            key={idx}
            style={{
              flexShrink: 0,
              aspectRatio: '3/4',

              // borderRadius: 8,// 추후 수정
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#e8e8e8',
              scrollSnapAlign: 'start',
            }}
          >
            <Image
              src={url}
              alt={`hero-${idx}`}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
