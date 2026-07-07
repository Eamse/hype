import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import ReviewClient from './_components/review-client';
import ReviewFilters from './_components/review-filters';
import { prisma } from '@/lib/prisma';
import { getName } from 'country-list';

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
    tab?: string;
    productType?: string;
    location?: string;
    directorId?: string;
    page?: string;
  }>;
}) {
  const { brand, tab, productType, location, directorId, page } =
    await searchParams;
  const activeBrand = brand === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
  const activeTab = tab === 'gallery' ? 'gallery' : 'review';
  const currentPage = Number(page) || 1;

  const where = {
    ...(productType &&
      ALLOWED_PRODUCT_TYPES.has(productType) && { productType }),
    ...(location && ALLOWED_LOCATIONS.has(location) && { location }),
    ...(directorId && { directorId: Number(directorId) }),
  };

  const [reviews, totalCount] =
    activeTab === 'review'
      ? await Promise.all([
          prisma.review.findMany({
            where,
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: { images: true },
          }),
          prisma.review.count({ where }),
        ])
      : [[], 0];

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand={activeBrand} />
      <main style={{ paddingTop: 56 }}>
        <ReviewClient brand={activeBrand} activeTab={activeTab}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '32px 20px 80px',
            }}
          >
            {activeTab === 'gallery' ? (
              <p style={{ color: '#666', fontSize: 14 }}>
                Gallery content coming soon.
              </p>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 8,
                  }}
                >
                  <Link
                    href="/review/write"
                    style={{
                      padding: '10px 18px',
                      background: '#191919',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Write a Review
                  </Link>
                </div>
                <ReviewFilters
                  productType={productType}
                  location={location}
                  directorId={directorId}
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    marginBottom: 32,
                  }}
                >
                  {reviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/review/${review.id}`}
                      style={{
                        display: 'block',
                        border: '1px solid #e8e8e8',
                        borderRadius: 8,
                        padding: 20,
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: '#666',
                          margin: '0 0 6px',
                        }}
                      >
                        {review.name} · {getName(review.country) ?? review.country} ·{' '}
                        {review.productType} · {review.location}
                        {review.rating && ` · ★ ${review.rating}`}
                      </p>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          margin: '0 0 6px',
                        }}
                      >
                        {review.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: '#444',
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
                  ))}
                  {reviews.length === 0 && (
                    <p style={{ color: '#666', fontSize: 14 }}>
                      No reviews yet.
                    </p>
                  )}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => {
                        const params = new URLSearchParams();
                        if (activeBrand === 'hype-snap')
                          params.set('brand', 'hype-snap');
                        if (productType) params.set('productType', productType);
                        if (location) params.set('location', location);
                        if (directorId) params.set('directorId', directorId);
                        params.set('page', String(p));
                        return (
                          <Link
                            key={p}
                            href={`/review?${params.toString()}`}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid #e8e8e8',
                              fontWeight: p === currentPage ? 700 : 400,
                              color: p === currentPage ? '#191919' : '#666',
                              textDecoration: 'none',
                            }}
                          >
                            {p}
                          </Link>
                        );
                      },
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ReviewClient>
      </main>
    </div>
  );
}
