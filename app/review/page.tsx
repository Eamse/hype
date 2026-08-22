export const revalidate = 60; // 세션 의존 없음 — 캐싱해서 DB 왕복 줄임

import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/header';
import ReviewFilters from './_components/review-filters';
import ReviewListClient from './_components/review-list-client';
import ReviewInquirySidebar from './_components/review-inquiry-sidebar';
import ReviewFeatured from './_components/review-featured';
import { prisma } from '@/lib/prisma';
import { getName } from 'country-list';
import { maskName } from '@/lib/mask-name';

export const metadata: Metadata = {
  title: 'Review | HYPE WEDDING',
  description: 'Real reviews from our clients.',
};

const ALLOWED_PRODUCT_TYPES = new Set(['wedding', 'snap']);
const ALLOWED_LOCATIONS = new Set(['jeju', 'seoul']);
const PAGE_SIZE = 12;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    brand?: string;
    productType?: string;
    location?: string;
    directorId?: string;
    page?: string;
  }>;
}) {
  const { brand, productType, location, directorId, page } = await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
  const currentPage = Number(page) || 1;

  const where = {
    ...(productType &&
      ALLOWED_PRODUCT_TYPES.has(productType) && { productType }),
    ...(location && ALLOWED_LOCATIONS.has(location) && { location }),
    ...(directorId && { directorId: Number(directorId) }),
  };

  const [reviews, totalCount, featuredReviews] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: true,
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const mapReview = (review: (typeof reviews)[number]) => ({
    id: review.id,
    name: maskName(review.name),
    country: review.country,
    countryName: getName(review.country) ?? review.country,
    productType: review.productType,
    location: review.location,
    rating: review.rating,
    title: review.title,
    content: review.content,
    shootingDate: review.shootingDate,
    isFeatured: review.isFeatured,
    commentCount: review._count.comments,
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '32px 20px 80px',
          }}
        >
          <ReviewFeatured
            reviews={featuredReviews.map((review) => ({
              id: review.id,
              name: maskName(review.name),
              country: review.country,
              productType: review.productType,
              location: review.location,
              title: review.title,
              content: review.content,
              shootingDate: review.shootingDate,
            }))}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              gap: 32,
              alignItems: 'start',
            }}
            className="review-main-grid"
          >
            <div>
              <Suspense fallback={null}>
                <ReviewFilters
                  productType={productType}
                  location={location}
                  directorId={directorId}
                />
              </Suspense>
              <ReviewListClient reviews={reviews.map(mapReview)} />

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (activeBrand === 'hype-snap') params.set('brand', 'hype-snap');
                    if (productType) params.set('productType', productType);
                    if (location) params.set('location', location);
                    if (directorId) params.set('directorId', directorId);
                    params.set('page', String(p));
                    return (
                      <a
                        key={p}
                        href={`/review?${params.toString()}`}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 4,
                          border: '1px solid #000',
                          fontWeight: p === currentPage ? 700 : 400,
                          color: p === currentPage ? '#000' : '#bbb',
                          textDecoration: 'none',
                        }}
                      >
                        {p}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <ReviewInquirySidebar />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .review-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
