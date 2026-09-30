'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
const THUMB_STEP = 72;
type ProductImage = {
    id: number;
    url: string;
    thumbUrl?: string | null;
    blurDataUrl?: string | null;
    order: number;
};
export default function ImageGallery({ mainImageUrl, mainBlurDataUrl, images, }: {
    mainImageUrl: string | null;
    mainBlurDataUrl?: string | null;
    images: ProductImage[];
}) {
    const isMobile = useIsMobile(1024);
    const allImages = [
        ...(mainImageUrl
            ? [
                {
                    id: 0,
                    url: mainImageUrl,
                    thumbUrl: null,
                    blurDataUrl: mainBlurDataUrl ?? null,
                    description: '',
                    order: -1,
                },
            ]
            : []),
        ...images,
    ];
    // 브라우저 캐시에 이미 있는 이미지는 <img>의 onLoad가 첫 페인트 전에 거의
    // 즉시 발동해서, opacity transition이 애니메이션할 시간도 없이 블러가 한
    // 프레임 번쩍였다가 뚝 끊기듯 원본으로 바뀌어 보임 — 그래서 렌더 전에
    // 캐시 여부를 동기적으로 확인해서, 캐시된 이미지는 블러 자체를 건너뜀
    function isCached(url: string): boolean {
        if (typeof window === 'undefined') return false;
        const probe = new window.Image();
        probe.src = url;
        return probe.complete;
    }
    const [selected, setSelected] = useState<string | null>(allImages[0]?.url ?? null);
    const [selectedBlur, setSelectedBlur] = useState<string | null>(allImages[0]?.blurDataUrl ?? null);
    const [mainLoaded, setMainLoaded] = useState(() => allImages[0] ? isCached(allImages[0].url) : false);
    const trackRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const first = allImages[0];
        setSelected(first?.url ?? null);
        setSelectedBlur(first?.blurDataUrl ?? null);
        setMainLoaded(first ? isCached(first.url) : false);
    }, [mainImageUrl, images]);
    function selectImage(img: { url: string; blurDataUrl?: string | null }) {
        setSelected(img.url);
        setSelectedBlur(img.blurDataUrl ?? null);
        setMainLoaded(isCached(img.url));
    }
    function scrollByStep(dir: -1 | 1) {
        const el = trackRef.current;
        if (!el)
            return;
        if (isMobile) {
            el.scrollBy({ left: dir * THUMB_STEP, behavior: 'smooth' });
        }
        else {
            el.scrollBy({ top: dir * THUMB_STEP, behavior: 'smooth' });
        }
    }
    return (<div className="flex flex-col-reverse gap-3 lg:relative lg:block">
      
      {allImages.length > 0 && (<div className="flex flex-row items-center gap-1 flex-shrink-0 lg:flex-col lg:w-16 lg:absolute lg:right-0 lg:top-0 lg:h-full">
          <button type="button" onClick={() => scrollByStep(-1)} aria-label="이전 썸네일" className="shrink-0 flex items-center justify-center bg-none p-1 cursor-pointer text-black">
            {isMobile ? <ChevronLeft size={18}/> : <ChevronUp size={18}/>}
          </button>

          <div ref={trackRef} className="hide-scroll flex flex-row gap-2 overflow-auto lg:flex-col lg:flex-1 lg:min-h-0" style={{ paddingLeft: 3, paddingRight: 3 }}>
            {allImages.map((img) => (<button key={img.id} onClick={() => selectImage(img)} className="shrink-0 rounded-lg overflow-hidden relative cursor-pointer bg-none p-0" style={{
                    width: 64,
                    height: 64,
                }}>
                <Image src={img.thumbUrl ?? img.url} alt="thumbnail" fill sizes="64px" style={{ objectFit: 'cover' }}/>
              </button>))}
          </div>

          <button type="button" onClick={() => scrollByStep(1)} aria-label="다음 썸네일" className="shrink-0 flex items-center justify-center bg-none p-1 cursor-pointer text-black">
            {isMobile ? <ChevronRight size={18}/> : <ChevronDown size={18}/>}
          </button>
        </div>)}

      
      <div className="relative overflow-hidden bg-white mx-auto w-[90%] lg:mx-0 lg:w-[calc(100%-80px)]">
        {selected ? (<>
            {selectedBlur && (<img src={selectedBlur} alt="" aria-hidden style={{
                    width: '100%', height: 'auto',
                    filter: 'blur(16px)', transform: 'scale(1.1)', opacity: mainLoaded ? 0 : 1, transition: 'opacity 0.2s ease-out',
                }}/>)}
            <Image key={selected} src={selected} alt="product" width={900} height={1200} unoptimized priority onLoad={() => setMainLoaded(true)} style={{
                    width: '100%', height: 'auto', position: selectedBlur ? 'absolute' : 'static', inset: 0,
                    opacity: selectedBlur && !mainLoaded ? 0 : 1, transition: 'opacity 0.2s ease-in',
                }}/>
          </>) : (<div className="w-full" style={{
                aspectRatio: '3/4',
                background: 'linear-gradient(110deg, rgb(236, 236, 236) 8%, rgb(221, 221, 221) 18%, rgb(236, 236, 236) 33%) 0% 0% / 200% 100%',
            }}/>)}
      </div>
    </div>);
}
