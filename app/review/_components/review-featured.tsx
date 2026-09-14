'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { countryFlag } from '@/lib/country-flag';
type FeaturedReview = {
  id: number;
  name: string;
  country: string;
  productType: string;
  location: string;
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
export default function ReviewFeatured({
  reviews,
}: {
  reviews: FeaturedReview[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReplayReveal(ref);
  const { data: session } = useSession();
  const router = useRouter();
  const isModerator = session?.user?.role === 'master';
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const visibleReviews = reviews.filter((r) => !removed.has(r.id));
  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === visibleReviews.length
        ? new Set()
        : new Set(visibleReviews.map((r) => r.id)),
    );
  }
  function handleUnfeatureSelected() {
    const ids = [...selected];
    setRemoved((prev) => new Set([...prev, ...ids]));
    setSelected(new Set());
    Promise.all(
      ids.map((id) =>
        fetch(`/api/reviews/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured: false }),
        }),
      ),
    ).then(() => router.refresh());
  }
  return (
    <div ref={ref} style={{ marginBottom: 48 }}>
      <h1
        className="review-fade type-hero-display"
        data-reveal
        data-reveal-delay="80"
        style={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '46px 0 10px 0',
        }}
      >
        Review
      </h1>
      <p
        className="review-fade type-body"
        data-reveal
        data-reveal-delay="140"
        style={{ color: '#555', marginBottom: 28 }}
      >
        Real stories from real couples
      </p>

      {visibleReviews.length > 0 && (
        <>
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

          {isModerator && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#000', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected.size === visibleReviews.length && visibleReviews.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                전체선택
              </label>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={handleUnfeatureSelected}
                  style={{
                    fontSize: 12,
                    padding: '4px 14px',
                    background: '#fff',
                    color: '#000',
                    border: '1px solid #000',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {`선택한 ${selected.size}개 Featured 해제`}
                </button>
              )}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
            className="review-featured-grid"
          >
            {visibleReviews.map((review, i) => (
              <div
                key={review.id}
                className="review-rise"
                data-reveal
                data-reveal-delay={`${260 + i * 100}`}
                style={{
                  position: 'relative',
                  border: '1px solid #ddd',
                }}
              >
                {isModerator && (
                  <label
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(review.id)}
                      onChange={() => toggleSelect(review.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                  </label>
                )}
                <Link
                  href={`/review/${review.id}`}
                  style={{
                    display: 'block',
                    padding: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <Badge label={review.location} tone="location" />
                  <Badge label={review.productType} tone="product" />
                </div>
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
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export function Badge({
  label,
  tone,
}: {
  label: string;
  tone: 'location' | 'product';
}) {
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
