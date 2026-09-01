'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type JourneyItem = {
  date: string;
  // 스크롤로 활성화될 때 커지고 색이 바뀌는 "하이라이트" 대상 여부
  bold: boolean;
  // 하이라이트 애니메이션 없이 항상 굵게만 표시하고 싶을 때
  staticBold?: boolean;
  content: ReactNode;
};

type Photo = {
  // 사진 1장이면 문자열, 같은 자리에서 여러 장을 순환시키고 싶으면 배열로
  src: string | string[];
  alt: string;
  // 전체(2025+2026 합친) 타임라인 안에서의 인덱스 — 2026 항목은 2025 개수만큼 offset됨
  milestoneIndex: number;
};

// milestoneIndex → 타임라인 텍스트 옆에 붙는 작은 원형 로고 배지 (연도별 로컬 인덱스 기준)
const LOGO_BADGES_2025: Record<number, { src: string; alt: string }> = {
  0: { src: '/about/history/history-01-founded.png', alt: 'Hype Pig' },
  1: { src: '/about/history/history-02-hype-wedding.png', alt: 'Hype Wedding' },
};
const LOGO_BADGES_2026: Record<number, { src: string; alt: string }> = {
  2: {
    src: '/about/history/logo/history-hype-snap-icon.png',
    alt: 'Hype Snap',
  },
};

// 사진 하이라이트 스펙 (2026-08-23 확정):
// history-02(Angel Dei), history-03(First client photoshoot), history-06(Meryem)만 하이라이트(★) —
// 정확히 해당 마일스톤에 매칭. 나머지(비하이라이트) 사진은 그 해 타임라인 순서에 맞게 앞/뒤로 배치.
// milestoneIndex는 2025 배열 기준 로컬 인덱스로 적어두고, 실제 사용 시 YEAR_BOUNDARY만큼 offset해서 합침.
// 사진이 여러 장(3장 등) 몰려있으면 그 마일스톤 구간만 스크롤이 오래 걸려서 부자연스러워
// 기존 파일(신규 촬영/추가 없음)만 재분배해서 마일스톤마다 1장씩 배치.
// 2025는 파일 5장 vs 마일스톤 6개라 'Feb 27 founded'는 대응할 사진이 없어 그대로 비워둠.
const PHOTOS_2025_LOCAL: Photo[] = [
  {
    src: '/about/history/history-2025-angel-dei-1.jpg',
    alt: 'Hype Wedding launched',
    milestoneIndex: 1,
  },
  {
    src: '/about/history/history-2025-angel-dei-2.jpg',
    alt: 'Angel Dei collaboration', // ★ 하이라이트
    milestoneIndex: 2,
  },
  {
    src: '/about/history/history-2025-angel-dei-3.jpg',
    alt: 'Featured in Wedding Essentials Magazine',
    milestoneIndex: 3,
  },
  {
    src: '/about/history/history-2025-first-client-photoshoot-1.jpg',
    alt: 'First client photoshoot', // ★ 하이라이트
    milestoneIndex: 4,
  },
  {
    src: '/about/history/history-2025-first-client-photoshoot-2.jpg',
    alt: 'Featured in Bridal and Breakfast',
    milestoneIndex: 5,
  },
];

const PHOTOS_2026_LOCAL: Photo[] = [
  {
    src: '/about/history/history-2026-meryem-gunduz-1.jpg',
    alt: 'First international exhibition, Singapore',
    milestoneIndex: 0,
  },
  {
    src: '/about/history/history-2026-meryem-gunduz-2.jpg',

    alt: 'Meryem Gündüz collaboration', // ★ 하이라이트
    milestoneIndex: 1,
  },
  {
    src: '/about/history/history-2026-hype-snap-launch.jpg',
    alt: 'Hype Snap launch',
    milestoneIndex: 2,
  },
  {
    src: '/about/history/history-2026-singapore-meetup.jpg',
    alt: 'Singapore Meet-up Event',
    milestoneIndex: 3,
  },
  {
    src: '/about/history/history-2026-80th-booking.jpg',
    alt: '80th client booking milestone',
    milestoneIndex: 4,
  },
];

// 두 연도 사진을 하나의 milestoneIndex 축으로 합침 (2026 쪽은 yearBoundary만큼 offset)
function buildPhotos(yearBoundary: number): Photo[] {
  return [
    ...PHOTOS_2025_LOCAL,
    ...PHOTOS_2026_LOCAL.map((p) => ({
      ...p,
      milestoneIndex: p.milestoneIndex + yearBoundary,
    })),
  ];
}

function TimelineRow({
  item,
  logo,
  itemRef,
}: {
  item: JourneyItem;
  logo?: { src: string; alt: string };
  itemRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={itemRef}
      className={[
        'journey-timeline-item',
        item.bold && 'journey-timeline-item--highlight',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="journey-timeline-row">
        <span className="journey-dot" />
        <p className="journey-date">{item.date}</p>
        <p
          className={[
            'journey-milestone',
            item.bold && 'journey-milestone--bold',
            item.staticBold && 'journey-milestone--static-bold',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {item.content}
          {logo && (
            <span className="journey-logo-badge">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={70}
                height={70}
                className="object-cover"
              />
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// 연도 하나 분량의 타임라인 목록 — 두 연도가 이 컴포넌트로 각각 렌더링되고,
// 현재 보여줄 연도만 opacity로 크로스페이드되어 표시됨 (unmount/pin 재걸림 없음 → 끊김 없는 전환).
// 활성 상태(activeIndex/isCurrentYear)는 React state가 아니라 스크롤 콜백에서 ref를 통해
// DOM에 직접 반영되므로, 스크롤할 때마다 이 트리 전체가 리렌더되지 않음.
function YearBlock({
  year,
  items,
  logoBadges,
  titleClassName,
  layerRef,
  itemRefs,
}: {
  year: string;
  items: JourneyItem[];
  logoBadges: Record<number, { src: string; alt: string }>;
  titleClassName: string;
  layerRef: (el: HTMLDivElement | null) => void;
  itemRefs: (el: HTMLDivElement | null, idx: number) => void;
}) {
  return (
    <div ref={layerRef} className="journey-year-layer">
      <div
        className={
          year === '2026'
            ? 'journey-timeline journey-timeline--2026'
            : 'journey-timeline'
        }
      >
        <p className={titleClassName}>{year}</p>
        {items.map((item, idx) => (
          <TimelineRow
            key={idx}
            item={item}
            logo={logoBadges[idx]}
            itemRef={(el) => itemRefs(el, idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default function JourneyPin({
  id,
  journey2025,
  journey2026,
}: {
  id?: string;
  journey2025: JourneyItem[];
  journey2026: JourneyItem[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // 트리거 기준점을 헤더가 아니라 실제 사진 영역으로 잡기 위한 ref
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const yearBoundary = journey2025.length;
  const totalItems = journey2025.length + journey2026.length;

  const photos = buildPhotos(yearBoundary);

  // 스크롤할 때마다 바뀌는 값들은 전부 ref로만 들고, DOM을 직접 건드림(React state 재렌더 없음) —
  // pin 걸린 상태에서 매 스크롤 프레임마다 컴포넌트 트리가 리렌더되면 GSAP의 스크롤 스크럽과
  // 타이밍이 어긋나서 버벅이는 원인이 되기 때문.
  const yearLayerRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const timelineItemRefs = useRef<(HTMLDivElement | null)[][]>([[], []]);
  const photoSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const photoImageRefs = useRef<(HTMLElement | null)[][]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || totalItems <= 1) return;

    const applyState = (activeIndex: number, progress: number) => {
      const isYear2026 = activeIndex >= yearBoundary;
      const activeLocalIndex2025 = isYear2026 ? yearBoundary - 1 : activeIndex;
      const activeLocalIndex2026 = isYear2026 ? activeIndex - yearBoundary : 0;

      // 연도 레이어 전환
      yearLayerRefs.current.forEach((el, i) => {
        if (!el) return;
        const isCurrent = i === (isYear2026 ? 1 : 0);
        el.classList.toggle('active', isCurrent);
      });

      // 타임라인 행 하이라이트
      [0, 1].forEach((yearIdx) => {
        const activeLocal =
          yearIdx === 0 ? activeLocalIndex2025 : activeLocalIndex2026;
        const isCurrentYear = yearIdx === (isYear2026 ? 1 : 0);
        timelineItemRefs.current[yearIdx]?.forEach((el, idx) => {
          if (!el) return;
          el.classList.toggle(
            'journey-timeline-item--active',
            isCurrentYear && idx === activeLocal,
          );
        });
      });

      // 사진 슬라이드 전환 + 슬라이드 안 서브 이미지(있으면) 진행도
      let activePhotoIndex = 0;
      for (let i = 0; i < photos.length; i++) {
        if (photos[i].milestoneIndex <= activeIndex) activePhotoIndex = i;
      }
      photoSlideRefs.current.forEach((el, idx) => {
        if (!el) return;
        el.classList.toggle('active', idx === activePhotoIndex);
      });

      photos.forEach((photo, photoIdx) => {
        const srcs = Array.isArray(photo.src) ? photo.src : [photo.src];
        if (srcs.length <= 1) return;
        const isActive = photoIdx === activePhotoIndex;
        const localProgress =
          photo.milestoneIndex === activeIndex
            ? progress
            : photo.milestoneIndex < activeIndex
              ? 1
              : 0;
        const subIndex = isActive
          ? Math.min(srcs.length - 1, Math.floor(localProgress * srcs.length))
          : 0;
        photoImageRefs.current[photoIdx]?.forEach((imgEl, i) => {
          if (!imgEl) return;
          imgEl.style.opacity = i === subIndex ? '1' : '0';
        });
      });
    };

    const trigger = ScrollTrigger.create({
      // 트리거 기준을 헤더가 아니라 실제 사진 영역(2025 이미지 쪽)으로 잡음 —
      // pin 자체는 여전히 wrap(텍스트+사진 두 컬럼) 전체에 걸림
      trigger: photoFrameRef.current ?? wrap,
      pin: wrap,
      start: 'top top+=100',
      end: () => `+=${window.innerHeight * (totalItems - 1) * 1.1}`,
      scrub: 0.6,
      anticipatePin: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const scaled = self.progress * totalItems;
        const idx = Math.min(totalItems - 1, Math.floor(scaled));
        applyState(idx, scaled - idx);
      },
    });

    // 초기 상태 반영
    applyState(0, 0);

    // 이미지 로드 등으로 마운트 직후 레이아웃이 살짝 바뀌면 pin 시작 위치 계산이 어긋남.
    // 그렇다고 refresh를 아무 때나 부르면, 사용자가 이미 pin에 들어와 스크롤 중인 순간에
    // 위치가 재계산되면서 오히려 진행도가 튀어버림 — 그래서 pin이 "활성화되지 않은 동안"에만
    // (=아직 이 섹션에 도달하기 전) 페이지 레이아웃 변화를 감지해 refresh하도록 가드를 둠.
    const resizeObserver = new ResizeObserver(() => {
      if (!trigger.isActive) ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    return () => {
      trigger.kill();
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, yearBoundary]);

  return (
    <div
      ref={wrapRef}
      id={id}
      className="journey-pin-wrap"
      style={{ scrollMarginTop: 106 }}
    >
      <div className="journey-pin-left">
        <YearBlock
          year="2025"
          items={journey2025}
          logoBadges={LOGO_BADGES_2025}
          titleClassName="journey-year-title journey-year-title--2025"
          layerRef={(el) => {
            yearLayerRefs.current[0] = el;
          }}
          itemRefs={(el, idx) => {
            timelineItemRefs.current[0][idx] = el;
          }}
        />
        <YearBlock
          year="2026"
          items={journey2026}
          logoBadges={LOGO_BADGES_2026}
          titleClassName="journey-year-title journey-year-title--2026 journey-year-title--pin"
          layerRef={(el) => {
            yearLayerRefs.current[1] = el;
          }}
          itemRefs={(el, idx) => {
            timelineItemRefs.current[1][idx] = el;
          }}
        />
      </div>
      <div className="journey-pin-right">
        <div ref={photoFrameRef} className="journey-photo-frame">
          {photos.map((photo, idx) => {
            const srcs = Array.isArray(photo.src) ? photo.src : [photo.src];
            return (
              <div
                key={srcs.join('|')}
                ref={(el) => {
                  photoSlideRefs.current[idx] = el;
                }}
                className="journey-photo-slide"
              >
                {srcs.map((s, i) => (
                  <Image
                    key={s}
                    ref={(el) => {
                      if (!photoImageRefs.current[idx]) {
                        photoImageRefs.current[idx] = [];
                      }
                      photoImageRefs.current[idx][i] = el;
                    }}
                    src={s}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    style={{
                      opacity: i === 0 ? 1 : 0,
                      transition: 'opacity 0.6s ease',
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
