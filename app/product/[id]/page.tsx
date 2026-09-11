export const revalidate = 60;
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import ProductGalleryLayout from './_components/product-gallery-layout';
import HomeFooter from '@/app/_components/home-footer';
import type { Metadata } from 'next';
import { cache } from 'react';
type Props = {
    params: Promise<{
        id: string;
    }>;
};
const getProduct = cache((id: number) => prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
}));
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(Number(id));
    if (!product)
        return { title: 'Not Found' };
    return {
        title: product.title,
        description: product.title,
    };
}
export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0)
        notFound();
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
                                partners: {
                                    include: {
                                        partner: {
                                            include: { instagramAccounts: { orderBy: { order: 'asc' } } },
                                        },
                                    },
                                },
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
    if (!product)
        notFound();
    const isWedding = product.section === 'Photographers in Jeju' ||
        product.section === 'Photographers in Seoul';
    const isSnap = product.section === 'Casual Photoshoot in Jeju' ||
        product.section === 'Casual Photoshoot in Seoul';
    const isPackageProduct = isWedding || isSnap;
    const headerBrand = isSnap ? 'hype-snap' : 'hype-wedding';
    const weddingData = isPackageProduct
        ? await (async () => {
            const directors = directorLinks.map((l) => l.director);
            const packages = directors.flatMap((d) => d.packages.map((pkg) => ({
                ...pkg,
                priceSNS: 0,
                priceNoSNS: 0,
                hasPriceSNS: pkg.priceSNS > 0,
                hasPriceNoSNS: pkg.priceNoSNS > 0,
                isSinglePrice: pkg.isSinglePrice,
            })));
            return { directors, packages };
        })()
        : null;
    return (<div className="bg-white text-[black] min-h-screen flex flex-col">
      <Header brand={headerBrand}/>

      <main className="pt-14 flex-1">
        <ProductGalleryLayout product={product} section={product.section} isPackageProduct={isPackageProduct} weddingData={weddingData}/>
      </main>
      <HomeFooter />
    </div>);
}
