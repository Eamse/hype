import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Magazine' };

type Props = { searchParams: Promise<{ brand?: string }> };

export default async function MagazinePage({ searchParams }: Props) {
  const { brand: brandParam } = await searchParams;
  const brand = brandParam === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  const magazines = await prisma.magazine.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, imageUrl: true, createdAt: true },
  });

  const [hero, ...rest] = magazines;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, sans-serif" }}>
      <Header brand={brand} />

      <div className="magazine-page-padding">
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>
          Hype Wedding
        </p>
        <h1 className="magazine-page-title" style={{ fontWeight: 800, color: '#191919', marginBottom: 24, letterSpacing: '-0.5px' }}>
          Magazine
        </h1>
        <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: 48 }} />

        {magazines.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 14 }}>아직 게시된 글이 없습니다.</p>
        ) : (
          <>
            {/* 히어로 */}
            <Link href={`/magazine/${hero.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 72 }}>
              <div className="magazine-hero-grid">
                <div>
                  {hero.imageUrl ? (
                    <Image src={hero.imageUrl} alt={hero.title} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block' }} priority />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '3px', color: '#aaa', textTransform: 'uppercase', marginBottom: 16 }}>
                    Featured · {new Date(hero.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 style={{ fontSize: 32, fontWeight: 800, color: '#191919', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 24 }}>
                    {hero.title}
                  </h2>
                  <span style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#191919', borderBottom: '1px solid #191919', paddingBottom: 2 }}>
                    Read More
                  </span>
                </div>
              </div>
            </Link>

            {/* Latest Stories */}
            {rest.length > 0 && (
              <>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', textAlign: 'center', marginBottom: 32 }}>
                  Latest Stories
                </p>
                <div className="magazine-list-grid">
                  {rest.map((m) => (
                    <Link key={m.id} href={`/magazine/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', marginBottom: 12 }}>
                          {m.imageUrl ? (
                            <Image src={m.imageUrl} alt={m.title} fill sizes="400px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>
                              No Image
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>
                          {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#191919', lineHeight: 1.3 }}>
                          {m.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
