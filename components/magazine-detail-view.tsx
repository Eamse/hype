import Image from 'next/image';
import Link from 'next/link';
import { sanitizeMagazineHtml } from '@/lib/magazine-sanitize';
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
export default function MagazineDetailView({ magazine, backHref, }: {
    magazine: MagazineDetailData;
    backHref?: string;
}) {
    return (<div className="magazine-detail-grid">
      
      <div className="magazine-detail-right">
        {backHref && (<Link href={backHref} style={{
                fontSize: 10,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#000',
                textDecoration: 'none',
                borderBottom: '1px solid #000',
                paddingBottom: 2,
                display: 'inline-block',
                marginBottom: 56,
            }}>
            ← Magazine
          </Link>)}

        <p style={{
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 16,
        }}>
          {new Date(magazine.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}
        </p>
        <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#000',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            marginBottom: 40,
        }}>
          {magazine.title || 'Untitled'}
        </h1>

        <div style={{ borderTop: '1px solid #000', marginBottom: 40 }}/>

        <div className="magazine-content" dangerouslySetInnerHTML={{
            __html: sanitizeMagazineHtml(magazine.content),
        }}/>

        
        {magazine.images.length > 0 && (<div style={{
                marginTop: 64,
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
            }}>
            {magazine.images.map((img) => (<Image key={img.id} src={img.url} alt={magazine.title} width={0} height={0} sizes="50vw" style={{ width: '100%', height: 'auto', display: 'block' }}/>))}
          </div>)}
      </div>
    </div>);
}
