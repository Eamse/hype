'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

const THUMB_STEP = 72; // 썸네일(64px) + gap(8px) — 화살표 클릭 시 한 칸씩 이동

type ProductImage = {
  id: number;
  url: string;
  thumbUrl?: string | null;
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
      ? [
          {
            id: 0,
            url: mainImageUrl,
            thumbUrl: null,
            description: '',
            order: -1,
          },
        ]
      : []),
    ...images,
  ];

  const [selected, setSelected] = useState<string | null>(
    allImages[0]?.url ?? null,
  );
  const trackRef = useRef<HTMLDivElement>(null);

  // 갤러리 소스가 바뀌면(예: 패키지/작가 전환) 선택된 큰 이미지도 새 목록 기준으로 리셋
  useEffect(() => {
    setSelected(allImages[0]?.url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageUrl, images]);

  // 위/아래(모바일은 좌/우) 화살표로 한 칸씩 수동 스크롤. 터치/휠 스크롤도 그대로 가능.
  function scrollByStep(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    if (isMobile) {
      el.scrollBy({ left: dir * THUMB_STEP, behavior: 'smooth' });
    } else {
      el.scrollBy({ top: dir * THUMB_STEP, behavior: 'smooth' });
    }
  }

  return (
    // 데스크톱(lg)에서는 이 wrapper가 position:relative 기준점이 됨 —
    // 썸네일 컬럼을 absolute로 오른쪽에 붙여서, flex stretch 없이
    // height:100%만으로 이미지 높이를 정확히 따라가게 함 (flex는 "내용물 최소 높이"
    // 때문에 stretch가 제대로 안 먹혔음. absolute는 그 계산 자체에서 빠지므로 확실함)
    <div className="flex flex-col-reverse gap-3 lg:relative lg:block">
      {/* 썸네일 목록 — 모바일: 메인 이미지 아래 가로 스크롤 / 데스크탑: 오른쪽에 절대 위치로 오버레이 */}
      {allImages.length > 0 && (
        <div className="flex flex-row items-center gap-1 flex-shrink-0 lg:flex-col lg:w-16 lg:absolute lg:right-0 lg:top-0 lg:h-full">
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            aria-label="이전 썸네일"
            className="shrink-0 flex items-center justify-center bg-none p-1 cursor-pointer text-black"
          >
            {isMobile ? <ChevronLeft size={18} /> : <ChevronUp size={18} />}
          </button>

          <div
            ref={trackRef}
            className="hide-scroll flex flex-row gap-2 overflow-auto lg:flex-col lg:flex-1 lg:min-h-0"
            style={{ paddingLeft: 3, paddingRight: 3 }}
          >
            {allImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelected(img.url)}
                className="shrink-0 rounded-lg overflow-hidden relative cursor-pointer bg-none p-0"
                style={{
                  width: 64,
                  height: 64,
                }}
              >
                <Image
                  src={img.thumbUrl ?? img.url}
                  alt="thumbnail"
                  fill
                  sizes="64px"
                  style={{ objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByStep(1)}
            aria-label="다음 썸네일"
            className="shrink-0 flex items-center justify-center bg-none p-1 cursor-pointer text-black"
          >
            {isMobile ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      )}

      {/* 메인 이미지 — 데스크톱에서는 오른쪽에 썸네일(64px) 자리를 남겨두도록 폭을 줄임.
          모든 사진이 같은 원본 비율(3:4)이라고 가정하고, fill 대신 원본 크기를 그대로
          width/height로 줘서 브라우저가 비율을 알아서 계산하게 함 */}
      <div
        className="relative overflow-hidden bg-white mx-auto w-[90%] lg:mx-0 lg:w-[calc(100%-80px)]"
      >
        {selected ? (
          <Image
            src={selected}
            alt="product"
            width={900}
            height={1200}
            unoptimized
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <div
            className="w-full"
            style={{
              aspectRatio: '3/4',
              background:
                'linear-gradient(110deg, rgb(236, 236, 236) 8%, rgb(221, 221, 221) 18%, rgb(236, 236, 236) 33%) 0% 0% / 200% 100%',
            }}
          />
        )}
      </div>
    </div>
  );
}
