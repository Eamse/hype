'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type ProductImage = {
  id: number;
  url: string;
  order: number;
};

export default function ImageGallery({
  mainImageUrl,
  images,
}: {
  mainImageUrl: string | null;
  images: ProductImage[];
}) {
  const [selected, setSelected] = useState<string | null>(mainImageUrl);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allImages = [
    ...(mainImageUrl
      ? [{ id: 0, url: mainImageUrl, description: '', order: -1 }]
      : []),
    ...images,
  ];

  // 자동슬라이드 (세로)
  useEffect(() => {
    if (allImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      const el = thumbRef.current;
      if (!el) return;
      const thumb = el.children[0] as HTMLElement | undefined;
      if (!thumb) return;
      const itemHeight = thumb.offsetHeight + 8;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        el.scrollTop = 0;
      } else {
        el.scrollBy({ top: itemHeight, behavior: 'smooth' });
      }
    }, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [allImages.length]);

  return (
    <div
      className="flex gap-3 h-full"
      style={{ display: 'flex', flexDirection: 'row-reverse' }}
    >
      {/* 왼쪽: 세로 썸네일 */}
      {allImages.length > 0 && (
        <div
          ref={thumbRef}
          className="hide-scroll flex flex-col gap-2 overflow-y-auto"
          style={{ width: 64 }}
        >
          {allImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img.url)}
              className="shrink-0 rounded-lg overflow-hidden relative cursor-pointer bg-none p-0"
              style={{
                width: 64,
                height: 64,
                outline:
                  selected === img.url
                    ? '2px solid #000'
                    : '2px solid transparent',
                outlineOffset: 2,
              }}
            >
              <Image
                src={img.url}
                alt="thumbnail"
                fill
                sizes="64px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* 오른쪽: 메인 이미지 */}
      <div
        className="relative flex-1 rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: '3/4' }}
      >
        {selected ? (
          <Image
            src={selected}
            alt="product"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(110deg, rgb(236, 236, 236) 8%, rgb(221, 221, 221) 18%, rgb(236, 236, 236) 33%) 0% 0% / 200% 100%',
            }}
          />
        )}
      </div>
    </div>
  );
}
