'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function HeroCarousel({
  images,
  children,
}: {
  images: string[];
  children?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [images.length, paused, next]);

  if (images.length === 0) return null;

  return (
    <section
      className="hero-carousel"
      style={{ position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: '#000' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((url, idx) => (
        <div
          key={url}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <Image
            src={url}
            alt={`hero-${idx}`}
            fill
            priority={idx === 0}
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ))}

      {/* 라인 인디케이터 */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 6,
            width: '60%',
            maxWidth: 300,
          }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                flex: 1,
                height: 2,
                background: idx === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* 왼쪽 하단 오버레이 콘텐츠 (예: D-day 배너) — 떠 있는 카드 형태 */}
      {children && (
        <div
          style={{
            position: 'absolute',
            left: 24,
            bottom: 24,
            zIndex: 3,
            maxWidth: 'calc(100% - 48px)',
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
