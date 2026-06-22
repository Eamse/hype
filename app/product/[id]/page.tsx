export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import SnsSidebar from '@/components/sns-sidebar';
import Accordion from './_components/accordion';
import { BackButton, StickyBottomBar } from './_components/product-actions';
import ImageGallery from './_components/image-gallery';
import type { Metadata } from 'next';
import { auth } from '@/auth';

type Props = { params: Promise<{ id: string }> };

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4dd9d9"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) return { title: 'Not Found' };
  return {
    title: `${product.title} — ${product.brand}`,
    description: `${product.brand}의 ${product.title}. ₩${product.price.toLocaleString()}`,
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

  const relatedProducts = await prisma.product.findMany({
    where: { section: product.section, id: { not: product.id } },
    take: 10,
    orderBy: { order: 'asc' },
  });

  const session = await auth();

  return (
    <div className="bg-white text-[#191919] min-h-screen">
      <Header />

      <main className="pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ── 왼쪽: 이미지 (데스크탑 sticky) ── */}
          <div className="hide-scroll lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:overflow-y-auto p-5 lg:p-16 lg:pb-24">
            <BackButton />
            <ImageGallery
              mainImageUrl={product.imageUrl}
              images={product.images}
            />
          </div>

          {/* ── 오른쪽: 컨텐츠 ── */}
          <div className="p-5 lg:px-14 lg:py-16 pb-24">
            {/* Brand / Title / Price */}
            <p className="text-xs text-[#aaa] mb-1">{product.brand}</p>
            <h1 className="text-xl font-bold leading-snug mb-2">
              {product.title}
            </h1>
            <p className="text-lg font-bold mb-6">
              ₩{product.price.toLocaleString()}
            </p>

            <div className="h-px bg-[#f0f0f0] mb-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-2">
                  About This Product
                </h2>
                <p className="text-sm text-[#555] leading-loose">
                  {product.description}
                </p>
              </div>
            )}

            {/* What's Included */}
            {product.inclusions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-3">
                  What&apos;s Included
                </h2>
                <div className="flex flex-col gap-2">
                  {product.inclusions.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#f0fffe] border border-[#c8f5f5] flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-sm text-[#333]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[#f0f0f0] mb-6" />

            {/* Brand Card */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3">Brand</h2>
              <div className="border border-[#e8e8e8] rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f0f0f0] shrink-0 overflow-hidden" />
                <div>
                  <p className="text-sm font-semibold mb-0.5">
                    {product.brand}
                  </p>
                  <p className="text-xs text-[#aaa]">
                    Gangnam, Seoul · Wedding Studio
                  </p>
                </div>
                <button className="ml-auto text-xs font-semibold text-[#191919] border border-[#e0e0e0] rounded-md px-3 py-1.5 shrink-0 bg-transparent cursor-pointer">
                  View Brand
                </button>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-3">
                  More from This Brand
                </h2>
                <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
                  {relatedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="shrink-0 w-36 block"
                    >
                      <div className="w-36 h-36 rounded-lg overflow-hidden bg-[#f0f0f0] mb-1.5 relative">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.title}
                            fill
                            sizes="144px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#e8e8e8]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#aaa] mb-0.5">
                        {p.brand}
                      </p>
                      <p className="text-xs font-medium text-[#191919] leading-snug">
                        {p.title}
                      </p>
                      <p className="text-xs font-bold mt-0.5">
                        ₩{p.price.toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[#f0f0f0] mb-1" />

            {/* Accordion */}
            <div className="mb-6">
              <Accordion title="Booking Guide">
                <p>
                  Please book at least 2 weeks in advance. A 30% deposit is
                  required at the time of booking. Refunds may be restricted
                  once a booking is confirmed.
                </p>
              </Accordion>
              <Accordion title="How It Works">
                <p>
                  Parking is available at the studio on the day of your
                  ceremony. Shoots typically take 3–4 hours.
                </p>
              </Accordion>
              <Accordion title="Cancellation Policy">
                <p>
                  Within 7 days of booking: full refund · 7–14 days: 50% refund
                  · After 14 days: no refund
                </p>
              </Accordion>
              <Accordion title="Seller Info">
                <p>
                  Business name: {product.brand} · CEO: — · Business Reg:
                  000-00-00000
                </p>
              </Accordion>
              <div className="border-t border-[#e8e8e8]" />
            </div>
          </div>
        </div>
      </main>

      <SnsSidebar />
      <StickyBottomBar
        userId={session?.user?.id ?? null}
        productId={product.id}
      />
    </div>
  );
}
