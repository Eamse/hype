export const revalidate = 60; // 세션 의존 없음 — 캐싱해서 DB 왕복 줄임

import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import { prisma } from '@/lib/prisma';
import { buildCommentTree } from '@/lib/comment-tree';
import CommentSection from './_components/comment-section';
import ReviewDeleteButton from './_components/review-delete-button';
import { maskName } from '@/lib/mask-name';
import { getName } from 'country-list';

type Props = { params: Promise<{ id: string }> };

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const reviewId = parseId(id);
  if (reviewId === null) return { title: 'Not Found' };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { title: true },
  });
  if (!review) return { title: 'Not Found' };

  return { title: `${review.title} | Review | HYPE WEDDING` };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const reviewId = parseId(id);
  if (reviewId === null) notFound();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      images: { orderBy: { order: 'asc' } },
      director: { select: { number: true, name: true } },
    },
  });
  if (!review) notFound();

  const rawComments = await prisma.comment.findMany({
    where: { reviewId },
    orderBy: { createdAt: 'asc' },
  });
  // fetch로 받을 때(JSON)랑 똑같은 모양으로 맞추기 위해 Date를 문자열로 변환
  const initialComments = JSON.parse(JSON.stringify(buildCommentTree(rawComments)));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <main style={{ paddingTop: 56 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>
          <div className="rounded-2xl border border-[#eee] bg-white p-6 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-[16px] font-bold text-white">
                {maskName(review.name).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide ${
                      review.location === 'jeju'
                        ? 'bg-[#eaf5ee] text-[#2D5A45]'
                        : 'bg-[#eef2fb] text-[#2b4c8c]'
                    }`}
                  >
                    {review.location}
                  </span>
                  <span className="rounded-full bg-[#f2f2f2] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-[#777]">
                    {review.productType}
                  </span>
                  <span className="text-[12px] text-[#999]">
                    {maskName(review.name)} · {getName(review.country) ?? review.country}
                    {review.director && ` · ${review.director.number} ${review.director.name}`}
                  </span>
                </div>
                <p className="text-[11px] text-[#bbb]">
                  Shot on {review.shootingDate} · Posted{' '}
                  {new Date(review.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {/* 추후 사용 예정 — 별점 표시 임시 비활성화
                  {review.rating && ` · ★ ${review.rating}`}
                  */}
                </p>
              </div>
              <ReviewDeleteButton reviewId={reviewId} authorUserId={review.userId} />
            </div>

            <h1 className="mb-5 text-[22px] font-bold leading-snug text-[#111]">
              {review.title}
            </h1>

            {review.images.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {review.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-full overflow-hidden rounded-xl"
                    style={{ aspectRatio: '1' }}
                  >
                    <Image src={img.url} alt="" fill sizes="200px" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#333]">
              {review.content}
            </p>
          </div>

          <CommentSection reviewId={reviewId} initialComments={initialComments} />
        </div>
      </main>
    </div>
  );
}
