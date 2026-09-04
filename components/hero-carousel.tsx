'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 스와이프로 슬라이드를 넘기는 데 필요한 최소 드래그 거리(px) — 이보다 짧으면 클릭/오탐으로 간주
const SWIPE_THRESHOLD = 50;

export default function HeroCarousel({
  images,
  children,
}: {
  images: string[];
  children?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const isDragging = useRef(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [images.length, paused, next]);

  if (images.length === 0) return null;

  // 힌트를 커서 위치로 직접 이동 — React state로 하면 mousemove마다 리렌더가 발생해
  // 느려지므로, ref를 통해 DOM에 transform만 명령형으로 적용
  const moveHintTo = (e: React.PointerEvent | React.MouseEvent) => {
    const section = sectionRef.current;
    const hint = hintRef.current;
    if (!section || !hint) return;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 손 커서 옆에 살짝 띄워서 텍스트가 커서 끝에 가리지 않게 함
    hint.style.transform = `translate(${x + -33}px, ${y + -35}px)`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (images.length <= 1) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    setPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    moveHintTo(e);
    if (!isDragging.current || dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    dragStartX.current = null;
    if (dragDeltaX.current > SWIPE_THRESHOLD) {
      prev();
    } else if (dragDeltaX.current < -SWIPE_THRESHOLD) {
      next();
    }
    dragDeltaX.current = 0;
    setPaused(false);
  };

  return (
    <section
      ref={sectionRef}
      className="hero-carousel"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        touchAction: 'pan-y',
        cursor: images.length > 1 ? 'grab' : undefined,
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        setPaused(true);
        moveHintTo(e);
        if (hintRef.current) hintRef.current.style.opacity = '1';
      }}
      onMouseLeave={() => {
        setPaused(false);
        endDrag();
        if (hintRef.current) hintRef.current.style.opacity = '0';
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
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
            fetchPriority={idx === 0 ? 'high' : undefined}
            loading={idx === 0 ? 'eager' : undefined}
            sizes="100vw"
            draggable={false}
            style={{ objectFit: 'cover', pointerEvents: 'none' }}
          />
        </div>
      ))}
      {/* 좌우 스와이프 가능 힌트 — 커서 위치를 그대로 따라다니는 커스텀 커서 */}
      {images.length > 1 && (
        <div
          ref={hintRef}
          className="hero-carousel-swipe-hint"
          aria-hidden="true"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      )}

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
                background:
                  idx === current
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* 하단 중앙 오버레이 콘텐츠 (예: D-day 배너) — 떠 있는 카드 형태 */}
      {children && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 60,
            transform: 'translateX(-50%)',
            zIndex: 3,
            maxWidth: 'calc(100% - 48px)',
            display: 'flex',
            gap: 24,
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
