export const revalidate = 60;
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import { prisma } from '@/lib/prisma';
import { buildCommentTree } from '@/lib/comment-tree';
import CommentSection from './_components/comment-section';
import ReviewDeleteButton from './_components/review-delete-button';
import { maskName } from '@/lib/mask-name';
import { getName } from 'country-list';
import HomeFooter from '@/app/_components/home-footer';
type Props = {
  params: Promise<{
    id: string;
  }>;
};
function formatDirectorLabel(director: {
  number: string;
  location: string | null;
}) {
  const locationLabel = director.location === 'Jeju' ? 'Jeju' : 'Seoul';
  const num = director.number.replace('#', '').split('-')[0].padStart(2, '0');
  return `${locationLabel} ${num}`;
}
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
    select: { id: true },
  });
  if (!review) return { title: 'Not Found' };
  return { title: 'Review | HYPE WEDDING' };
}
export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const reviewId = parseId(id);
  if (reviewId === null) notFound();
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      images: { orderBy: { order: 'asc' } },
      director: { select: { number: true, location: true, name: true } },
    },
  });
  if (!review) notFound();
  const rawComments = await prisma.comment.findMany({
    where: { reviewId },
    orderBy: { createdAt: 'asc' },
  });
  const initialComments = JSON.parse(
    JSON.stringify(buildCommentTree(rawComments)),
  );
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <main style={{ paddingTop: 56 }}>
        <div
          style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}
        >
          <Link
            href="/review"
            className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-[#666] no-underline hover:text-[#111]"
          >
            ← Back to Reviews
          </Link>
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
                        ? 'bg-[#e3f5ef] text-[#146a53]'
                        : 'bg-[#eef1f8] text-[#33456b]'
                    }`}
                  >
                    {review.location}
                  </span>
                  <span
                    className={`rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide ${
                      review.productType === 'snap'
                        ? 'bg-[#fbf3e3] text-[#8c6a1f]'
                        : 'bg-[#f8eef2] text-[#8c2b56]'
                    }`}
                  >
                    {review.productType}
                  </span>
                  <span className="text-[12px] text-[#999]">
                    {maskName(review.name)} ·{' '}
                    {getName(review.country) ?? review.country}
                    {review.director &&
                      ` · ${formatDirectorLabel(review.director)} ${review.director.name}`}
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
                </p>
              </div>
              <ReviewDeleteButton
                reviewId={reviewId}
                authorUserId={review.userId}
              />
            </div>

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
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="200px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#333]">
              {review.content}
            </p>
          </div>

          <CommentSection
            reviewId={reviewId}
            initialComments={initialComments}
          />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
