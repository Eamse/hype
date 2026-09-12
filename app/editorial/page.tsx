export const revalidate = 60;
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import EditorialHeader from './_components/editorial-header';
import MagazineGrid from './_components/magazine-grid';
import Pagination from '@/components/pagination';
import HomeFooter from '@/app/_components/home-footer';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Editorial | HYPE WEDDING' };
const PAGE_SIZE = 9;
type Props = {
    searchParams: Promise<{
        brand?: string;
        page?: string;
    }>;
};
export default async function MagazinePage({ searchParams }: Props) {
    const { brand: brandParam, page } = await searchParams;
    const brand = brandParam === 'hype-snap' ? 'hype-snap' : 'hype-wedding';
    const currentPage = Number(page) || 1;
    const where = { published: true };
    const orderBy = [
        { isPinned: 'desc' as const },
        { createdAt: 'desc' as const },
    ];
    const [hero, totalCount, rest] = await Promise.all([
        currentPage === 1
            ? prisma.magazine.findFirst({
                where,
                orderBy,
                select: { id: true, title: true, imageUrl: true, createdAt: true },
            })
            : null,
        prisma.magazine.count({ where }),
        prisma.magazine.findMany({
            where,
            orderBy,
            skip: currentPage === 1 ? 1 : 1 + (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select: { id: true, title: true, imageUrl: true, createdAt: true },
        }),
    ]);
    const restCount = Math.max(0, totalCount - 1);
    const totalPages = Math.max(1, Math.ceil(restCount / PAGE_SIZE));
    const magazines = hero ? [hero, ...rest] : rest;
    return (<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header brand={brand}/>

      <main style={{ paddingTop: 56, flex: 1 }}>
      <section className="magazine-page-padding">
        <EditorialHeader />

        {magazines.length === 0 ? (<p style={{ color: '#000', fontSize: 14 }}>
            No stories published yet.
          </p>) : (<>
            
            {hero && (<Link href={`/editorial/${hero.id}`} style={{
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: 72,
                }}>
                <div className="magazine-hero-grid">
                  <div>
                    {hero.imageUrl ? (<Image src={hero.imageUrl} alt={hero.title} width={0} height={0} sizes="100vw" style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                    }} priority/>) : (<div style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: 13,
                    }}>
                        No Image
                      </div>)}
                  </div>
                  <div>
                    <p style={{
                    fontSize: 10,
                    letterSpacing: '3px',
                    color: '#000',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                }}>
                      Featured ·{' '}
                      {new Date(hero.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                    </p>
                    <h2 style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#000',
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                    marginBottom: 24,
                }}>
                      {hero.title}
                    </h2>
                    <span style={{
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#000',
                    borderBottom: '1px solid #000',
                    paddingBottom: 2,
                }}>
                      Read More
                    </span>
                  </div>
                </div>
              </Link>)}

            
            {rest.length > 0 && (<>
                <p style={{
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#000',
                    textAlign: 'center',
                    marginBottom: 32,
                }}>
                  Latest Stories
                </p>
                <MagazineGrid items={rest}/>
              </>)}

            
            <div style={{ marginTop: 48 }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={(p) => {
                const params = new URLSearchParams();
                if (brand === 'hype-snap')
                    params.set('brand', 'hype-snap');
                params.set('page', String(p));
                return `/editorial?${params.toString()}`;
            }}/>
            </div>
          </>)}
      </section>
      </main>
      <HomeFooter />
    </div>);
}
