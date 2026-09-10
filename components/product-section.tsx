'use client';
import ProductCard, { type Product } from '@/components/product-card';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';
export default function ProductSection({ id, title, subtitle, products, showAll = false, }: {
    id?: string;
    title: string;
    subtitle?: string;
    products: Product[];
    showAll?: boolean;
    secondsPerItem?: number;
}) {
    const isMobile = useIsMobile();
    const itemsPerView = isMobile ? 2 : 5;
    const totalPages = Math.max(1, Math.ceil(products.length / itemsPerView));
    const [index, setIndex] = useState(0);
    const [withTransition, setWithTransition] = useState(true);
    useEffect(() => {
        if (showAll || totalPages <= 1)
            return;
        const timer = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 5000);
        return () => clearInterval(timer);
    }, [totalPages, showAll]);
    useEffect(() => {
        if (index !== totalPages)
            return;
        const timeout = setTimeout(() => {
            setWithTransition(false);
            setIndex(0);
        }, 600);
        return () => clearTimeout(timeout);
    }, [index, totalPages]);
    useEffect(() => {
        if (withTransition)
            return;
        const frame = requestAnimationFrame(() => setWithTransition(true));
        return () => cancelAnimationFrame(frame);
    }, [withTransition]);
    useEffect(() => {
        setWithTransition(false);
        setIndex(0);
    }, [totalPages]);
    if (products.length === 0)
        return null;
    const pages = showAll
        ? []
        : Array.from({ length: totalPages }, (_, i) => products.slice(i * itemsPerView, i * itemsPerView + itemsPerView));
    const slides = totalPages > 1 ? [...pages, pages[0]] : pages;
    const slideCount = slides.length;
    return (<section id={id} style={{
            margin: '0 auto',
            padding: isMobile ? '16px' : '40px',
            scrollMarginTop: 106,
        }}>
      <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 14,
        }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
            {title}
          </h2>
          {subtitle && (<p style={{ fontSize: 12, color: '#000' }}>{subtitle}</p>)}
        </div>
        {!showAll && (<Link href={`/products?section=${encodeURIComponent(title)}`} className="text-[14px] text-[black] flex items-center gap-1 transition-all hover:text-[black] hover:gap-2 hover:underline">
            See All <span className="arrow-nudge">→</span>
          </Link>)}
      </div>

      {showAll ? (<div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                gap: isMobile ? 8 : 12,
            }}>
          {products.map((p) => (<ProductCard key={p.id} product={p}/>))}
        </div>) : (<div style={{ overflow: 'hidden' }}>
          <div style={{
                display: 'flex',
                width: `${slideCount * 100}%`,
                transform: `translateX(-${index * (100 / slideCount)}%)`,
                transition: withTransition ? 'transform 0.6s ease' : 'none',
            }}>
            {slides.map((pageProducts, i) => (<div key={i} style={{
                    flex: `0 0 ${100 / slideCount}%`,
                    boxSizing: 'border-box',
                    padding: `0 ${isMobile ? 4 : 6}px`,
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? 'repeat(2, 1fr)'
                        : 'repeat(5, 1fr)',
                    gap: isMobile ? 8 : 12,
                }}>
                {pageProducts.map((p) => (<ProductCard key={p.id} product={p}/>))}
              </div>))}
          </div>
        </div>)}
    </section>);
}
