'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelection } from '@/components/admin/use-selection';
import BulkActions from '@/components/admin/bulk-actions';

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
  isFeatured: boolean;
};

export default function ReviewListClient({ reviews }: { reviews: ReviewRow[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const isModerator = session?.user?.role === 'master';
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const [featured, setFeatured] = useState<Map<number, boolean>>(
    () => new Map(reviews.map((r) => [r.id, r.isFeatured])),
  );
  const visibleReviews = reviews
    .filter((r) => !deleted.has(r.id))
    .map((r) => ({ ...r, isFeatured: featured.get(r.id) ?? r.isFeatured }));
  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(visibleReviews);

  async function handleBulkDelete() {
    await Promise.all(
      [...selectedIds].map((id) =>
        fetch(`/api/reviews/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: null }),
        }),
      ),
    );
    setDeleted((prev) => new Set([...prev, ...selectedIds]));
    clearSelection();
    router.refresh();
  }

  async function handleSetFeatured(isFeatured: boolean) {
    const ids = [...selectedIds];
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/reviews/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured }),
        }),
      ),
    );
    setFeatured((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => next.set(id, isFeatured));
      return next;
    });
    clearSelection();
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
      {isModerator && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BulkActions
            total={visibleReviews.length}
            selectedCount={selectedIds.size}
            allSelected={selectedIds.size === visibleReviews.length && visibleReviews.length > 0}
            onToggleAll={toggleAll}
            onDeleteSelected={handleBulkDelete}
          />
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => handleSetFeatured(true)}
                style={{
                  fontSize: 12,
                  padding: '4px 14px',
                  background: '#c9a96e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                우수 리뷰로 지정
              </button>
              <button
                onClick={() => handleSetFeatured(false)}
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
                우수 리뷰 해제
              </button>
            </>
          )}
        </div>
      )}
      {visibleReviews.map((review) => (
        <div
          key={review.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            border: '1px solid #000',
            borderRadius: 8,
            padding: 20,
          }}
        >
          {isModerator && (
            <input
              type="checkbox"
              checked={selectedIds.has(review.id)}
              onChange={() => toggleSelect(review.id)}
              style={{ marginTop: 3, flexShrink: 0 }}
            />
          )}
          <Link
            href={`/review/${review.id}`}
            style={{ display: 'block', flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
          >
            <p style={{ fontSize: 12, color: '#000', margin: '0 0 6px' }}>
              {review.isFeatured && (
                <span
                  style={{
                    display: 'inline-block',
                    marginRight: 8,
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#8a6d1e',
                    background: '#fdf3d9',
                  }}
                >
                  우수 리뷰
                </span>
              )}
              {review.name} · {review.countryName} · {review.productType} · {review.location}
              {/* 추후 사용 예정 — 별점 표시 임시 비활성화
              {review.rating && ` · ★ ${review.rating}`}
              */}
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{review.title}</h3>
            <p
              style={{
                fontSize: 14,
                color: '#000',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {review.content}
            </p>
          </Link>
        </div>
      ))}
      {visibleReviews.length === 0 && (
        <p style={{ color: '#000', fontSize: 14 }}>No reviews yet.</p>
      )}
    </div>
  );
}
