export const revalidate = 60; // 이미지 많은 매거진 목록 — 60초 캐싱

import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import MagazineMasterActions from './_components/magazine-master-actions';
import MagazineGrid from './_components/magazine-grid';
import HomeFooter from '@/app/_components/home-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editorial | HYPE WEDDING' };

type Props = { searchParams: Promise<{ brand?: string }> };

export default async function MagazinePage({ searchParams }: Props) {
  const { brand: brandParam } = await searchParams;
  const brand = brandParam === 'hype-snap' ? 'hype-snap' : 'hype-wedding';

  const magazines = await prisma.magazine.findMany({
    where: { published: true },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, imageUrl: true, createdAt: true },
  });

  const [hero, ...rest] = magazines;

  return (
    <div>
      <Header brand={brand} />

      <div className="magazine-page-padding">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 8,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#000',
                marginBottom: 12,
              }}
            >
              Hype Wedding
            </p>
            <h1
              className="inquiry-heading"
              style={{
                fontWeight: 800,
                color: '#000',
                letterSpacing: '-0.5px',
              }}
            >
              Editorial
            </h1>
          </div>
          <MagazineMasterActions />
        </div>

        {magazines.length === 0 ? (
          <p style={{ color: '#000', fontSize: 14 }}>
            아직 게시된 글이 없습니다.
          </p>
        ) : (
          <>
            {/* 히어로 */}
            <Link
              href={`/editorial/${hero.id}`}
              style={{
                textDecoration: 'none',
                display: 'block',
                marginBottom: 72,
              }}
            >
              <div className="magazine-hero-grid">
                <div>
                  {hero.imageUrl ? (
                    <Image
                      src={hero.imageUrl}
                      alt={hero.title}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                      priority
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: 13,
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: '3px',
                      color: '#000',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                    }}
                  >
                    Featured ·{' '}
                    {new Date(hero.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: '#000',
                      lineHeight: 1.2,
                      letterSpacing: '-0.5px',
                      marginBottom: 24,
                    }}
                  >
                    {hero.title}
                  </h2>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: '#000',
                      borderBottom: '1px solid #000',
                      paddingBottom: 2,
                    }}
                  >
                    Read More
                  </span>
                </div>
              </div>
            </Link>

            {/* Latest Stories */}
            {rest.length > 0 && (
              <>
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#000',
                    textAlign: 'center',
                    marginBottom: 32,
                  }}
                >
                  Latest Stories
                </p>
                <MagazineGrid items={rest} />
              </>
            )}
          </>
        )}
      </div>
      <HomeFooter />
    </div>
  );
}
