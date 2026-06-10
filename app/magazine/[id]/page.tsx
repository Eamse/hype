import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const magazine = await prisma.magazine.findUnique({
    where: { id: Number(id), published: true },
  });
  if (!magazine) return { title: 'Not Found' };
  return {
    title: magazine.title,
    description: magazine.content.slice(0, 160),
  };
}

export default async function MagazineDetailPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) notFound();

  const magazine = await prisma.magazine.findUnique({
    where: { id: idNum, published: true },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  if (!magazine) notFound();

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, sans-serif" }}>
      <Header brand="hype-wedding" />

      <div className="magazine-detail-grid">
        {/* 왼쪽 — 메인 이미지 */}
        <div className="magazine-detail-left">
          {magazine.imageUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              <Image src={magazine.imageUrl} alt={magazine.title} fill sizes="50vw" style={{ objectFit: 'cover' }} priority />
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>
              No Image
            </div>
          )}
        </div>

        {/* 오른쪽 — 제목 + 본문 + 상세 이미지 */}
        <div className="magazine-detail-right">
          <Link href="/magazine" style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', textDecoration: 'none', borderBottom: '1px solid #e0e0e0', paddingBottom: 2, display: 'inline-block', marginBottom: 56 }}>
            ← Magazine
          </Link>

          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>
            {new Date(magazine.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#191919', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 40 }}>
            {magazine.title}
          </h1>

          <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: 40 }} />

          <div style={{ fontSize: 15, lineHeight: 2, color: '#444', whiteSpace: 'pre-wrap', letterSpacing: '0.1px' }}>
            {magazine.content}
          </div>

          {/* 상세 이미지들 */}
          {magazine.images.length > 0 && (
            <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 32 }}>
              {magazine.images.map((img) => (
                <Image
                  key={img.id}
                  src={img.url}
                  alt={magazine.title}
                  width={0}
                  height={0}
                  sizes="50vw"
                  style={{ width: '60%', height: 'auto', display: 'block' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
