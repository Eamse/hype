import Image from 'next/image';
import Link from 'next/link';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';
import { secondaryButtonStyle } from '@/lib/button-style';
type MagazineDetailData = {
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
  images: {
    id: number | string;
    url: string;
  }[];
};
export default function MagazineDetailView({
  magazine,
  backHref,
  editHref,
}: {
  magazine: MagazineDetailData;
  backHref?: string;
  editHref?: string;
}) {
  return (
    <div className="magazine-detail-grid">
      <div className="magazine-detail-right">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-[#666] no-underline hover:text-[#111]"
            style={{ marginBottom: 56 }}
          >
            ← Back
          </Link>
        )}

        <p
          style={{
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 16,
          }}
        >
          {new Date(magazine.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#000',
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              margin: 0,
            }}
          >
            {magazine.title || 'Untitled'}
          </h1>
          {editHref && (
            <Link
              href={editHref}
              style={{ ...secondaryButtonStyle, flexShrink: 0, marginTop: 6 }}
            >
              Edit
            </Link>
          )}
        </div>

        <div style={{ borderTop: '1px solid #000', marginBottom: 40 }} />

        <div
          className="magazine-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeMagazineHtml(magazine.content),
          }}
        />

        {magazine.images.length > 0 && (
          <div
            style={{
              marginTop: 64,
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {magazine.images.map((img) => (
              <Image
                key={img.id}
                src={img.url}
                alt={magazine.title}
                width={0}
                height={0}
                sizes="50vw"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
