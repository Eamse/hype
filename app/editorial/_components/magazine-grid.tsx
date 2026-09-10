'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
type MagazineItem = {
    id: number;
    title: string;
    imageUrl: string | null;
    createdAt: Date;
};
export default function MagazineGrid({ items }: {
    items: MagazineItem[];
}) {
    const gridRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = gridRef.current;
        if (!el)
            return;
        const cards = el.querySelectorAll('.inquiry-step');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    cards.forEach((card, idx) => {
                        setTimeout(() => card.classList.add('visible'), idx * 100);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [items.length]);
    return (<div ref={gridRef} className="magazine-list-grid">
      {items.map((m) => (<Link key={m.id} href={`/editorial/${m.id}`} className="inquiry-step group" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div>
            <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3/4',
                overflow: 'hidden',
                marginBottom: 12,
            }}>
              {m.imageUrl ? (<Image src={m.imageUrl} alt={m.title} fill sizes="400px" className="object-cover transition-transform duration-500 group-hover:scale-105"/>) : (<div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontSize: 13,
                }}>
                  No Image
                </div>)}
              
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-[12px] font-semibold tracking-wide text-white">
                  Read more <span className="arrow-nudge">→</span>
                </span>
              </div>
            </div>
            <p style={{
                fontSize: 10,
                letterSpacing: '2px',
                color: '#000',
                textTransform: 'uppercase',
                marginBottom: 6,
            }}>
              {new Date(m.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}
            </p>
            <p className="group-hover:underline" style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#000',
                lineHeight: 1.3,
            }}>
              {m.title}
            </p>
          </div>
        </Link>))}
    </div>);
}
