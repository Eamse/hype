'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelection } from '@/components/admin/use-selection';
import BulkActions from '@/components/admin/bulk-actions';
import { countryFlag } from '@/lib/country-flag';
import { Badge } from './review-featured';
function useReplayReveal(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
        const timers = new Map<Element, number>();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const existing = timers.get(target);
                if (existing)
                    clearTimeout(existing);
                if (entry.isIntersecting) {
                    const delay = Number(target.dataset.revealDelay ?? 0);
                    const timer = window.setTimeout(() => target.classList.add('visible'), delay);
                    timers.set(target, timer);
                }
                else {
                    target.classList.remove('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
        targets.forEach((target) => observer.observe(target));
        return () => {
            observer.disconnect();
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, deps);
}
type ReviewRow = {
    id: number;
    name: string;
    country: string;
    countryName: string;
    productType: string;
    location: string;
    rating: number | null;
    title: string;
    content: string;
    shootingDate: string;
    isFeatured: boolean;
    commentCount: number;
};
function ReviewCard({ review, index }: {
    review: ReviewRow;
    index: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.content.length > 160;
    return (<Link href={`/review/${review.id}`} onClick={(e) => {
            if (expanded && isLong)
                e.preventDefault();
        }} className="review-rise" data-reveal data-reveal-delay={`${(index % 6) * 60}`} style={{
            display: 'block',
            border: '1px solid #eee',
            padding: 20,
            textDecoration: 'none',
            color: 'inherit',
        }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <Badge label={review.location} tone="location"/>
        <Badge label={review.productType} tone="product"/>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{review.title}</h3>
      <p style={{
            fontSize: 13,
            color: '#555',
            lineHeight: 1.6,
            margin: '0 0 6px',
            ...(expanded
                ? {}
                : {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }),
        }}>
        {review.content}
      </p>
      {isLong && (<button type="button" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded((v) => !v);
            }} style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 12,
                fontWeight: 600,
                color: '#2d5a45',
                cursor: 'pointer',
                marginBottom: 10,
            }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>)}
      <p style={{ fontSize: 12, color: '#888', margin: '10px 0 6px' }}>
        Shoot date: {review.shootingDate}
      </p>
      <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
        {review.name} {countryFlag(review.country)}
      </p>
    </Link>);
}
export default function ReviewListClient({ reviews }: {
    reviews: ReviewRow[];
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const isModerator = session?.user?.role === 'master';
    const [deleted, setDeleted] = useState<Set<number>>(new Set());
    const [featured, setFeatured] = useState<Map<number, boolean>>(() => new Map(reviews.map((r) => [r.id, r.isFeatured])));
    const visibleReviews = reviews
        .filter((r) => !deleted.has(r.id))
        .map((r) => ({ ...r, isFeatured: featured.get(r.id) ?? r.isFeatured }));
    const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(visibleReviews);
    const listRef = useRef<HTMLDivElement>(null);
    useReplayReveal(listRef, [visibleReviews.length]);
    async function handleBulkDelete() {
        await Promise.all([...selectedIds].map((id) => fetch(`/api/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: null }),
        })));
        setDeleted((prev) => new Set([...prev, ...selectedIds]));
        clearSelection();
        router.refresh();
    }
    async function handleSetFeatured(isFeatured: boolean) {
        const ids = [...selectedIds];
        await Promise.all(ids.map((id) => fetch(`/api/reviews/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured }),
        })));
        setFeatured((prev) => {
            const next = new Map(prev);
            ids.forEach((id) => next.set(id, isFeatured));
            return next;
        });
        clearSelection();
        router.refresh();
    }
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
      <p style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.06em',
            margin: '4px 0 0',
        }}>
        ALL REVIEWS
      </p>

      {isModerator && (<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <BulkActions total={visibleReviews.length} selectedCount={selectedIds.size} allSelected={selectedIds.size === visibleReviews.length && visibleReviews.length > 0} onToggleAll={toggleAll} onDeleteSelected={handleBulkDelete}/>
          {selectedIds.size > 0 && (<>
              <button onClick={() => handleSetFeatured(true)} style={{
                    fontSize: 12,
                    padding: '4px 14px',
                    background: '#2d5a45',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                }}>
                Featured로 지정
              </button>
              <button onClick={() => handleSetFeatured(false)} style={{
                    fontSize: 12,
                    padding: '4px 14px',
                    background: '#fff',
                    color: '#000',
                    border: '1px solid #000',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                }}>
                Featured 해제
              </button>
            </>)}
        </div>)}

      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visibleReviews.map((review, index) => (<div key={review.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {isModerator && (<input type="checkbox" checked={selectedIds.has(review.id)} onChange={() => toggleSelect(review.id)} style={{ marginTop: 24, flexShrink: 0 }}/>)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <ReviewCard review={review} index={index}/>
            </div>
          </div>))}
      </div>

      {visibleReviews.length === 0 && (<p style={{ color: '#000', fontSize: 14 }}>No reviews yet.</p>)}
    </div>);
}
