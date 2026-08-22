'use client';

import { useState } from 'react';
import { BackButton } from './product-actions';
import ImageGallery from './image-gallery';
import WeddingDetail from './wedding-detail';
import Accordion from './accordion';

type ProductImage = { id: number; url: string; order: number };

export default function ProductGalleryLayout({
  product,
  section,
  isPackageProduct,
  weddingData,
}: {
  product: { id: number; title: string; imageUrl: string | null; images: ProductImage[] };
  section?: string;
  isPackageProduct: boolean;
  weddingData: {
    directors: React.ComponentProps<typeof WeddingDetail>['directors'];
    packages: React.ComponentProps<typeof WeddingDetail>['packages'];
  } | null;
}) {
  // 패키지 소속 작가의 사진(activeDirectorId 기준) — 있으면 이 갤러리가 메인 이미지 자리를 대체함
  const [packageImages, setPackageImages] = useState<
    { id: number; webUrl: string; originalUrl: string }[]
  >([]);

  const hasPackageImages = packageImages.length > 0;
  // 메인 갤러리는 확대해서 보는 영역이라 압축본(webUrl) 대신 고화질 원본(originalUrl)을 씀
  const galleryImages: ProductImage[] = hasPackageImages
    ? packageImages.map((img, order) => ({ id: img.id, url: img.originalUrl, order }))
    : product.images;
  const galleryMainUrl = hasPackageImages ? null : product.imageUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* 왼쪽: 이미지 */}
      <div className="hide-scroll lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:overflow-y-auto p-5 mb-6 lg:mb-0 lg:p-16 lg:pb-24">
        <BackButton />
        <ImageGallery mainImageUrl={galleryMainUrl} images={galleryImages} />
      </div>

      {/* 오른쪽: 컨텐츠 */}
      <div className="p-5 lg:px-14 lg:py-16 pb-24">
        {isPackageProduct && weddingData ? (
          <WeddingDetail
            productId={product.id}
            title={product.title}
            section={section}
            packages={weddingData.packages}
            directors={weddingData.directors}
            onActiveImagesChange={setPackageImages}
          />
        ) : (
          <>
            <h1 className="text-xl font-bold leading-snug mb-6">{product.title}</h1>

            <div className="h-px bg-[black] mb-6" />

            <div className="mb-6">
              <Accordion title="Booking Guide">
                <p>
                  Please book at least 2 weeks in advance. A 30% deposit is required at
                  the time of booking.
                </p>
              </Accordion>
              <Accordion title="Cancellation Policy">
                <p>
                  Within 7 days of booking: full refund · 7–14 days: 50% refund · After
                  14 days: no refund
                </p>
              </Accordion>
              <div className="border-t border-[black]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
