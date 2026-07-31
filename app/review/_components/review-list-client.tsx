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
  commentCount: number;
};

function CommentCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-[#999]">
      💬 {count}
    </span>
  );
}

function ReviewMeta({ review }: { review: ReviewRow }) {
  const locationStyle =
    review.location === 'jeju'
      ? 'bg-[#eaf5ee] text-[#2D5A45]'
      : 'bg-[#eef2fb] text-[#2b4c8c]';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide ${locationStyle}`}
      >
        {review.location}
      </span>
      <span className="rounded-full bg-[#f2f2f2] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-[#777]">
        {review.productType}
      </span>
      <span className="text-[12px] text-[#999]">
        {review.name} · {review.countryName}
        {/* 추후 사용 예정 — 별점 표시 임시 비활성화
        {review.rating && ` · ★ ${review.rating}`}
        */}
      </span>
    </div>
  );
}

/** 우수 리뷰 하이라이트 스트립용 카드 — 가로 스크롤, 큰따옴표 장식 */
function FeaturedCard({ review }: { review: ReviewRow }) {
  return (
    <Link
      href={`/review/${review.id}`}
      className="group relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e8d9b0] bg-gradient-to-b from-[#fdf9ef] to-white p-6 text-inherit no-underline transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(201,169,110,0.25)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-3 right-3 select-none text-[80px] font-serif leading-none text-[#c9a96e]/15"
      >
        &rdquo;
      </span>
      <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#c9a96e] px-2.5 py-[3px] text-[10px] font-bold text-white">
        ✦ 우수 리뷰
      </span>
      <div className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-[15px] font-bold text-white">
        {review.name.charAt(0).toUpperCase()}
      </div>
      <h3 className="mb-1.5 text-[16px] font-bold text-[#111] transition-colors group-hover:text-[#2D5A45]">
        {review.title}
      </h3>
      <p
        className="mb-3 flex-1 text-[13px] leading-[1.6] text-[#555]"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.content}
      </p>
      <div className="flex items-center justify-between gap-2 border-t border-[#f0e4c4] pt-3">
        <ReviewMeta review={review} />
        <CommentCount count={review.commentCount} />
      </div>
    </Link>
  );
}

/** 일반 리뷰 그리드용 카드 */
function GridCard({ review }: { review: ReviewRow }) {
  return (
    <Link
      href={`/review/${review.id}`}
      className="group relative flex flex-1 min-w-0 items-start gap-4 overflow-hidden rounded-xl border border-[#eee] bg-white p-5 text-inherit no-underline transition-all duration-200 hover:-translate-y-[2px] hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 right-4 select-none text-[72px] font-serif leading-none text-black/[0.04]"
      >
        &rdquo;
      </span>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-[16px] font-bold text-white ring-4 ring-[#f7f7f7]">
        {review.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2">
          <ReviewMeta review={review} />
        </div>
        <h3 className="mb-1.5 text-[16px] font-bold text-[#111] transition-colors group-hover:text-[#2D5A45]">
          {review.title}
        </h3>
        <p
          className="text-[14px] leading-[1.6] text-[#555]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {review.content}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f2f2f2] pt-2.5">
          <CommentCount count={review.commentCount} />
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2D5A45] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Read review <span className="arrow-nudge">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

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

  const featuredReviews = visibleReviews.filter((r) => r.isFeatured);
  const regularReviews = visibleReviews.filter((r) => !r.isFeatured);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
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

      {featuredReviews.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#8a6d1e]">
            ✦ Featured Reviews
          </h2>
          <div className="hide-scroll -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
            {featuredReviews.map((review) => (
              <div key={review.id} className="flex shrink-0 items-start gap-2">
                {isModerator && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    className="mt-6 shrink-0"
                  />
                )}
                <FeaturedCard review={review} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {regularReviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3">
            {isModerator && (
              <input
                type="checkbox"
                checked={selectedIds.has(review.id)}
                onChange={() => toggleSelect(review.id)}
                style={{ marginTop: 24, flexShrink: 0 }}
              />
            )}
            <GridCard review={review} />
          </div>
        ))}
      </div>

      {visibleReviews.length === 0 && (
        <p style={{ color: '#000', fontSize: 14 }}>No reviews yet.</p>
      )}
    </div>
  );
}
