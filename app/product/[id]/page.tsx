export const revalidate = 60; // 이미지 많은 상품 상세 — 60초 캐싱

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import Accordion from './_components/accordion';
import { BackButton, StickyBottomBar } from './_components/product-actions';
import ImageGallery from './_components/image-gallery';
import WeddingDetail from './_components/wedding-detail';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) return { title: 'Not Found' };
  return {
    title: product.title,
    description: product.title,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) notFound();

  const product = await prisma.product.findUnique({
    where: { id: idNum },
    include: { images: { orderBy: { order: 'asc' } } },
  });
  if (!product) notFound();

  const isWedding =
    product.section === 'Photographers in Jeju' ||
    product.section === 'Photographers in Seoul';

  const isSnap =
    product.section === 'Casual Photoshoot in Jeju' ||
    product.section === 'Casual Photoshoot in Seoul';

  const isPackageProduct = isWedding || isSnap;
  const headerBrand = isSnap ? 'hype-snap' : 'hype-wedding';

  const weddingData = isPackageProduct
    ? await (async () => {
        const directorLinks = await prisma.productDirector.findMany({
          where: { productId: idNum },
          include: {
            director: {
              include: {
                packages: {
                  include: {
                    director: true,
                    addons: {
                      include: { addon: true },
                      orderBy: { order: 'asc' },
                    },
                    inclusions: {
                      include: { inclusion: true },
                      orderBy: { order: 'asc' },
                    },
                    partners: { include: { partner: true } },
                  },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { director: { order: 'asc' } },
        });

        const directors = directorLinks.map((l) => l.director);
        const packages = directors.flatMap((d) => d.packages);

        return { directors, packages };
      })()
    : null;

  return (
    <div className="bg-white text-[#000] min-h-screen">
      <Header brand={headerBrand} />

      <main className="pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 왼쪽: 이미지 */}
          <div className="hide-scroll lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:overflow-y-auto p-5 lg:p-16 lg:pb-24">
            <BackButton />
            <ImageGallery
              mainImageUrl={product.imageUrl}
              images={product.images}
            />
          </div>

          {/* 오른쪽: 컨텐츠 */}
          <div className="p-5 lg:px-14 lg:py-16 pb-24">
            {isPackageProduct && weddingData ? (
              <WeddingDetail
                title={product.title}
                directors={weddingData.directors}
                packages={weddingData.packages}
              />
            ) : (
              <>
                <h1 className="text-xl font-bold leading-snug mb-6">
                  {product.title}
                </h1>

                <div className="h-px bg-[#000] mb-6" />

                <div className="mb-6">
                  <Accordion title="Booking Guide">
                    <p>
                      Please book at least 2 weeks in advance. A 30% deposit is
                      required at the time of booking.
                    </p>
                  </Accordion>
                  <Accordion title="Cancellation Policy">
                    <p>
                      Within 7 days of booking: full refund · 7–14 days: 50%
                      refund · After 14 days: no refund
                    </p>
                  </Accordion>
                  <div className="border-t border-[#000]" />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <SnsSidebar />
      <StickyBottomBar productId={product.id} />
    </div>
  );
}
