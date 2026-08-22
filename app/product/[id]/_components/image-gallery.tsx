'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isMobile = useIsMobile(1024); // lg 브레이크포인트와 맞춤

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
  const [trackSize, setTrackSize] = useState(0);

  // 갤러리 소스가 바뀌면(예: 패키지/작가 전환) 선택된 큰 이미지도 새 목록 기준으로 리셋
  useEffect(() => {
    setSelected(allImages[0]?.url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageUrl, images]);

  // 데스크탑: 썸네일 목록을 두 번 이어붙여 무한 루프처럼 보이게 하고, 실제 높이(gap 포함)를
  // 측정해 정확히 그 거리만큼 계속 흐르도록 함 — 매 N초마다 점프하는 대신 끊김 없이 스크롤됨.
  // 모바일: 이미지 아래로 내려가는 가로 스크롤 목록이라 자동 애니메이션 없이 손으로 스와이프.
  useLayoutEffect(() => {
    if (isMobile) return;
    const el = trackRef.current;
    if (!el) return;
    setTrackSize(el.scrollHeight / 2);
  }, [allImages.length, isMobile]);

  const canLoop = !isMobile && allImages.length > 1;

  return (
    <div className="flex flex-col-reverse gap-3 lg:h-full lg:flex-row-reverse">
      {/* 썸네일 목록 — 모바일: 메인 이미지 아래 가로 스크롤 / 데스크탑: 오른쪽 세로 자동 스크롤 */}
      {allImages.length > 0 && (
        <div className="hide-scroll flex-shrink-0 overflow-x-auto lg:w-16 lg:overflow-hidden">
          <div
            ref={trackRef}
            className={`flex flex-row gap-2 lg:flex-col ${canLoop ? 'gallery-thumb-track' : ''}`}
            style={
              {
                ...(canLoop && {
                  '--thumb-scroll-distance': `${trackSize}px`,
                  animationDuration: `${Math.max(trackSize / 20, 4)}s`,
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

      {/* 메인 이미지 */}
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
