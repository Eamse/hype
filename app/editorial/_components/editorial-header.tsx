'use client';

import { useEffect, useRef } from 'react';
import MagazineMasterActions from './magazine-master-actions';

// 리뷰 페이지와 동일한 스크롤 재등장 훅 — 화면에 들어올 때마다 다시 페이드인됨
function useReplayReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    const timers = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const existing = timers.get(target);
          if (existing) clearTimeout(existing);

          if (entry.isIntersecting) {
            const delay = Number(target.dataset.revealDelay ?? 0);
            const timer = window.setTimeout(
              () => target.classList.add('visible'),
              delay,
            );
            timers.set(target, timer);
          } else {
            target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [ref]);
}

export default function EditorialHeader() {
  const ref = useRef<HTMLDivElement>(null);
  useReplayReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      <div>
        <p
          className="inquiry-fade"
          data-reveal
          data-reveal-delay="0"
          style={{
            fontSize: 15,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          Hype Wedding
        </p>
        <h1
          className="inquiry-rise"
          data-reveal
          data-reveal-delay="120"
          style={{
            fontSize: 'clamp(46px, 34.4px + 3.1vw, 84px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#000',
            margin: '0 0 10px',
          }}
        >
          Editorial
        </h1>
        <p
          className="inquiry-fade"
          data-reveal
          data-reveal-delay="220"
          style={{ fontSize: 19, color: '#555' }}
        >
          Stories from behind the lens
        </p>
      </div>
      <MagazineMasterActions />
    </div>
  );
}
