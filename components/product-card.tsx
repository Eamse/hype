'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
export type Product = {
    id: number;
    title: string;
    imageUrl: string | null;
    section?: string;
    number?: string | null;
};
function ImgBox() {
    return (<div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(110deg, #ececec 8%, #ddd 18%, #ececec 33%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s linear infinite',
        }}/>);
}
export default function ProductCard({ product }: {
    product: Product;
}) {
    const [loaded, setLoaded] = useState(false);
    return (<Link href={`/product/${product.id}`} className="product-card" style={{ cursor: 'pointer', display: 'block' }}>
      <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/5',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 8,
        }}>
        {product.imageUrl ? (<>
            {!loaded && (<div style={{ position: 'absolute', inset: 0 }}>
                <ImgBox />
              </div>)}
            <Image src={product.imageUrl} alt={product.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="card-img" style={{
                objectFit: 'cover',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }} onLoad={() => setLoaded(true)}/>
          </>) : (<ImgBox />)}
      </div>
      <p className="card-title" style={{
            fontSize: 14,
            color: '#000',
            marginBottom: 3,
            lineHeight: 1.4,
            textAlign: 'center',
            letterSpacing: '0.5px',
        }}>
        {product.number}
      </p>
    </Link>);
}
