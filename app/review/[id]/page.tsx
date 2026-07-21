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
          <p style={{ fontSize: 12, color: '#000', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              {maskName(review.name)} · {getName(review.country) ?? review.country} · {review.shootingDate} ·{' '}
              {review.productType} · {review.location}
              {review.director && ` · ${review.director.number} ${review.director.name}`}
              {/* 추후 사용 예정 — 별점 표시 임시 비활성화
              {review.rating && ` · ★ ${review.rating}`}
              */}
            </span>
            <ReviewDeleteButton reviewId={reviewId} authorUserId={review.userId} />
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px' }}>
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
                <div key={img.id} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}>
                  <Image src={img.url} alt="" fill sizes="200px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#000', whiteSpace: 'pre-wrap' }}>
            {review.content}
          </p>

          <CommentSection reviewId={reviewId} initialComments={initialComments} />
        </div>
      </main>
    </div>
  );
}
