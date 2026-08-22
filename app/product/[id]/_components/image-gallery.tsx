'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  const allImages = [
    ...(mainImageUrl
      ? [{ id: 0, url: mainImageUrl, description: '', order: -1 }]
      : []),
    ...images,
  ];

  const [selected, setSelected] = useState<string | null>(
    allImages[0]?.url ?? null,
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);

  // 갤러리 소스가 바뀌면(예: 패키지/작가 전환) 선택된 큰 이미지도 새 목록 기준으로 리셋
  useEffect(() => {
    setSelected(allImages[0]?.url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageUrl, images]);

  // 썸네일 목록을 두 번 이어붙여 무한 루프처럼 보이게 하고, 실제 높이(gap 포함)를 측정해
  // 정확히 그 거리만큼 계속 흐르도록 함 — 매 N초마다 점프하는 대신 끊김 없이 스크롤됨
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setTrackHeight(el.scrollHeight / 2);
  }, [allImages.length]);

  const canLoop = allImages.length > 1;

  return (
    <div
      className="flex gap-3 h-full"
      style={{ display: 'flex', flexDirection: 'row-reverse' }}
    >
      {/* 왼쪽: 세로 썸네일 — 끊김 없이 계속 흐르는 자동 스크롤 */}
      {allImages.length > 0 && (
        <div
          className="hide-scroll overflow-hidden"
          style={{ width: 64 }}
        >
          <div
            ref={trackRef}
            className={canLoop ? 'gallery-thumb-track' : undefined}
            style={
              {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                ...(canLoop && {
                  '--thumb-scroll-distance': `${trackHeight}px`,
                  animationDuration: `${Math.max(trackHeight / 20, 4)}s`,
                }),
              } as React.CSSProperties
            }
          >
            {(canLoop ? [...allImages, ...allImages] : allImages).map(
              (img, i) => (
                <button
                  key={`${img.id}-${i}`}
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
              ),
            )}
          </div>
        </div>
      )}

      {/* 오른쪽: 메인 이미지 */}
      <div
        className="relative flex-1 rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: '4/5' }}
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
