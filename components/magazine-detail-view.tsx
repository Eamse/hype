import Image from 'next/image';
import Link from 'next/link';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';

type MagazineDetailData = {
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
  images: { id: number | string; url: string }[];
};

export default function MagazineDetailView({
  magazine,
  backHref,
}: {
  magazine: MagazineDetailData;
  backHref?: string;
}) {
  return (
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
        {backHref && (
          <Link href={backHref} style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', textDecoration: 'none', borderBottom: '1px solid #e0e0e0', paddingBottom: 2, display: 'inline-block', marginBottom: 56 }}>
            ← Magazine
          </Link>
        )}

        <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>
          {new Date(magazine.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#191919', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 40 }}>
          {magazine.title || 'Untitled'}
        </h1>

        <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: 40 }} />

        <div
          className="magazine-content"
          dangerouslySetInnerHTML={{ __html: sanitizeMagazineHtml(magazine.content) }}
        />

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
  );
}
