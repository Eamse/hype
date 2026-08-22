export const revalidate = 60; // 이미지 많은 상품 상세 — 60초 캐싱

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import ProductGalleryLayout from './_components/product-gallery-layout';
import type { Metadata } from 'next';
import { cache } from 'react';

type Props = { params: Promise<{ id: string }> };
const getProduct = cache((id: number) =>
  prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  }),
);
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
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

  const [product, directorLinks] = await Promise.all([
    getProduct(Number(idNum)),
    prisma.productDirector.findMany({
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
                images: { orderBy: { order: 'asc' } },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { director: { order: 'asc' } },
    }),
  ]);

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
        const directors = directorLinks.map((l) => l.director);
        // 가격은 로그인한 사용자에게만 별도 인증 API(/api/products/[id]/pricing)로 내려줌 —
        // 여기서 실제 금액을 클라이언트 props로 보내면 비로그인 사용자도 페이지 소스에서 그대로 볼 수 있음
        const packages = directors.flatMap((d) =>
          d.packages.map((pkg) => ({
            ...pkg,
            priceSNS: 0,
            priceNoSNS: 0,
            hasPriceSNS: pkg.priceSNS > 0,
            hasPriceNoSNS: pkg.priceNoSNS > 0,
            // SNS 동의/비동의 구분 없이 가격이 하나뿐인 작가(Rosemarry Snap 등) —
            // Agree/Decline 두 컬럼 대신 "Package Price" 한 컬럼으로 합쳐서 보여줌
            isSinglePrice: pkg.priceSNS > 0 && pkg.priceSNS === pkg.priceNoSNS,
          })),
        );

        return { directors, packages };
      })()
    : null;

  return (
    <div className="bg-white text-[black] min-h-screen">
      <Header brand={headerBrand} />

      <main className="pt-14">
        <ProductGalleryLayout
          product={product}
          section={product.section}
          isPackageProduct={isPackageProduct}
          weddingData={weddingData}
        />
      </main>

      <SnsSidebar />
    </div>
  );
}
