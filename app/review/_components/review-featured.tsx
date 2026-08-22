'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { countryFlag } from '@/lib/country-flag';

type FeaturedReview = {
  id: number;
  name: string;
  country: string;
  productType: string;
  location: string;
  title: string;
  content: string;
  shootingDate: string;
};

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
            const timer = window.setTimeout(() => target.classList.add('visible'), delay);
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

export default function ReviewFeatured({ reviews }: { reviews: FeaturedReview[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReplayReveal(ref);

  if (reviews.length === 0) return null;

  return (
    <div ref={ref} style={{ marginBottom: 48 }}>
      <p
        className="review-fade"
        data-reveal
        data-reveal-delay="0"
        style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}
      >
        WHAT THEY&apos;RE SAYING
      </p>
      <h1
        className="review-fade"
        data-reveal
        data-reveal-delay="80"
        style={{
          fontSize: 'clamp(40px, 5.5vw, 64px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0 0 10px',
        }}
      >
        Review
      </h1>
      <p
        className="review-fade"
        data-reveal
        data-reveal-delay="140"
        style={{ fontSize: 19, color: '#555', marginBottom: 28 }}
      >
        Real stories from real couples
      </p>

      <p
        className="review-fade"
        data-reveal
        data-reveal-delay="200"
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#2d5a45',
          letterSpacing: '0.06em',
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        FEATURED REVIEW
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(reviews.length, 3)}, 1fr)`,
          gap: 16,
        }}
        className="review-featured-grid"
      >
        {reviews.map((review, i) => (
          <Link
            key={review.id}
            href={`/review/${review.id}`}
            className="review-rise"
            data-reveal
            data-reveal-delay={`${260 + i * 100}`}
            style={{
              display: 'block',
              border: '1px solid #ddd',
              padding: 20,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <Badge label={review.location} tone="location" />
              <Badge label={review.productType} tone="product" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{review.title}</h3>
            <p
              style={{
                fontSize: 13,
                color: '#555',
                lineHeight: 1.6,
                margin: '0 0 14px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {review.content}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px' }}>
              Shoot date: {review.shootingDate}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {review.name} {countryFlag(review.country)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Badge({ label, tone }: { label: string; tone: 'location' | 'product' }) {
  const style =
    tone === 'location'
      ? { background: '#eaf5ee', color: '#2d5a45' }
      : { background: '#eef2fb', color: '#2b4c8c' };
  return (
    <span
      style={{
        ...style,
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </span>
  );
}
