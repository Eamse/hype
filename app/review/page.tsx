export const revalidate = 60;
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/header';
import ReviewFilters from './_components/review-filters';
import ReviewListClient from './_components/review-list-client';
import ReviewInquirySidebar from './_components/review-inquiry-sidebar';
import ReviewFeatured from './_components/review-featured';
import { FeaturedReviewsProvider } from './_components/featured-reviews-context';
import Pagination from '@/components/pagination';
import { prisma } from '@/lib/prisma';
import { getName } from 'country-list';
import { maskName } from '@/lib/mask-name';
import HomeFooter from '@/app/_components/home-footer';
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
        director: { select: { number: true, location: true } },
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        director: { select: { number: true, location: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const formatDirectorBadge = (director: { number: string; location: string | null } | null) => {
    if (!director) return null;
    const locationLabel = director.location === 'Jeju' ? 'Jeju' : 'Seoul';
    const num = director.number.replace('#', '').split('-')[0].padStart(2, '0');
    return `${locationLabel} ${num}`;
  };
  const mapReview = (review: (typeof reviews)[number]) => ({
    id: review.id,
    name: maskName(review.name),
    country: review.country,
    countryName: getName(review.country) ?? review.country,
    productType: review.productType,
    location: review.location,
    directorLabel: formatDirectorBadge(review.director),
    rating: review.rating,
    content: review.content,
    shootingDate: review.shootingDate,
    createdAt: review.createdAt.toISOString(),
    isFeatured: review.isFeatured,
    commentCount: review._count.comments,
  });
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56, flex: 1 }}>
        <section
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding:
              'clamp(40px, 4.5vw, 70px) clamp(20px, 4vw, 60px) clamp(50px, 5vw, 80px)',
          }}
        >
          <FeaturedReviewsProvider
            initialFeatured={featuredReviews.map((review) => ({
              id: review.id,
              name: maskName(review.name),
              country: review.country,
              productType: review.productType,
              location: review.location,
              directorLabel: formatDirectorBadge(review.director),
              content: review.content,
              shootingDate: review.shootingDate,
            }))}
          >
            <ReviewFeatured />

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
                <ReviewListClient
                  reviews={reviews.map(mapReview)}
                  totalCount={totalCount}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  buildHref={(p) => {
                    const params = new URLSearchParams();
                    if (activeBrand === 'hype-snap')
                      params.set('brand', 'hype-snap');
                    if (productType) params.set('productType', productType);
                    if (location) params.set('location', location);
                    if (directorId) params.set('directorId', directorId);
                    params.set('page', String(p));
                    return `/review?${params.toString()}`;
                  }}
                />
              </div>

              <ReviewInquirySidebar />
            </div>
          </FeaturedReviewsProvider>
        </section>
      </main>
      <HomeFooter />

      <style>{`
        @media (max-width: 1095px) {
          .review-main-grid {
            grid-template-columns: 1fr !important;
          }
          .review-inquiry-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
