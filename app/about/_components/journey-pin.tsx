'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
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
    src: '/about/history/logo/History-HYPE SNAP 로고 아이콘.png',
    alt: 'Hype Snap',
  },
};

// 사진 하이라이트 스펙 (2026-08-23 확정):
// history-02(Angel Dei), history-03(First client photoshoot), history-06(Meryem)만 하이라이트(★) —
// 정확히 해당 마일스톤에 매칭. 나머지(비하이라이트) 사진은 그 해 타임라인 순서에 맞게 앞/뒤로 배치.
// milestoneIndex는 2025 배열 기준 로컬 인덱스로 적어두고, 실제 사용 시 YEAR_BOUNDARY만큼 offset해서 합침.
const PHOTOS_2025_LOCAL: Photo[] = [
  {
    src: [
      '/about/history/History-2025-May-First influencer collab — Angel Dei, Philippines(1).jpg',
      '/about/history/History-2025-May-First influencer collab — Angel Dei, Philippines(2).jpg',
      '/about/history/History-2025-May-First influencer collab — Angel Dei, Philippines(3).jpg',
    ],
    alt: 'Angel Dei collaboration', // ★ 하이라이트
    milestoneIndex: 2,
  },
  {
    src: [
      '/about/history/History-2025-Jul-First client photoshoot(1).jpg',
      '/about/history/History-2025-Jul-First client photoshoot(2).jpg',
    ],
    alt: 'First client photoshoot', // ★ 하이라이트
    milestoneIndex: 4,
  },
];

const PHOTOS_2026_LOCAL: Photo[] = [
  {
    src: [
      '/about/history/History-2026-Apr-Influencer collab — Meryem Gündüz, Turkey(1).jpg',
      '/about/history/History-2026-Apr-Influencer collab — Meryem Gündüz, Turkey(2).jpg',
      '/about/history/History-2026-Apr-Influencer collab — Meryem Gündüz, Turkey(3).jpg',
    ],
    alt: 'Meryem Gündüz collaboration', // ★ 하이라이트
    milestoneIndex: 1,
  },
  {
    src: '/about/history/(하이라이트 처리 X)History 고객사진-First client photoshoot 다음 순서로 넣어주세요(1).jpg',
    alt: 'Hype Snap launch',
    milestoneIndex: 2,
  },
  {
    src: '/about/history/(하이라이트 처리 X)History 고객사진-First client photoshoot 다음 순서로 넣어주세요(2).jpg',
    alt: 'Singapore Meet-up Event',
    milestoneIndex: 3,
  },
  {
    src: '/about/history/(하이라이트 처리 X)History 고객사진-First client photoshoot 다음 순서로 넣어주세요(3).jpg',
    alt: '80th client booking milestone',
    milestoneIndex: 4,
  },
];

// 사진 슬롯 하나에 여러 장이 들어오면(Photo.src가 배열) — 타이머가 아니라 이 milestone
// 구간 안에서의 스크롤 진행도(0~1)에 따라 어떤 사진을 보여줄지 결정 (스크롤해야만 사진이 바뀜)
function PhotoSlideImages({
  src,
  alt,
  active,
  progress,
}: {
  src: string | string[];
  alt: string;
  active: boolean;
  /** 이 milestone 구간 안에서의 스크롤 진행도 (0~1) */
  progress: number;
}) {
  const srcs = Array.isArray(src) ? src : [src];
  const subIndex = active
    ? Math.min(srcs.length - 1, Math.floor(progress * srcs.length))
    : 0;

  return (
    <>
      {srcs.map((s, i) => (
        <Image
          key={s}
          src={s}
          alt={alt}
          fill
          className="object-cover"
          style={{
            opacity: i === subIndex ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}
    </>
  );
}

function TimelineRow({
  item,
  logo,
  active,
}: {
  item: JourneyItem;
  logo?: { src: string; alt: string };
  active: boolean;
}) {
  return (
    <div
      className={[
        'journey-timeline-item',
        active && 'journey-timeline-item--active',
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
// 현재 보여줄 연도만 opacity로 크로스페이드되어 표시됨 (unmount/pin 재걸림 없음 → 끊김 없는 전환)
function YearBlock({
  year,
  items,
  logoBadges,
  titleClassName,
  activeLocalIndex,
  isCurrentYear,
}: {
  year: string;
  items: JourneyItem[];
  logoBadges: Record<number, { src: string; alt: string }>;
  titleClassName: string;
  activeLocalIndex: number;
  isCurrentYear: boolean;
}) {
  return (
    <div
      className={
        isCurrentYear ? 'journey-year-layer active' : 'journey-year-layer'
      }
    >
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
            active={isCurrentYear && idx === activeLocalIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default function JourneyPin({
  journey2025,
  journey2026,
}: {
  journey2025: JourneyItem[];
  journey2026: JourneyItem[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const yearBoundary = journey2025.length;
  const totalItems = journey2025.length + journey2026.length;

  // 2025+2026을 합친 전체 타임라인 기준 활성 인덱스(0~totalItems-1) — 스크롤 트리거 하나로
  // 두 연도를 관통하므로, pin이 풀렸다가 다시 걸리는 전환 지점이 아예 존재하지 않음
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || totalItems <= 1) return;

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top+=100',
      end: () => `+=${window.innerHeight * (totalItems - 1) * 1.1}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const scaled = self.progress * totalItems;
        const idx = Math.min(totalItems - 1, Math.floor(scaled));
        setActiveIndex(idx);
        setProgress(scaled - idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [totalItems]);

  const isYear2026 = activeIndex >= yearBoundary;
  const activeLocalIndex2025 = isYear2026 ? yearBoundary - 1 : activeIndex;
  const activeLocalIndex2026 = isYear2026 ? activeIndex - yearBoundary : 0;

  // 두 연도 사진을 하나의 milestoneIndex 축으로 합침 (2026 쪽은 yearBoundary만큼 offset)
  const photos: Photo[] = [
    ...PHOTOS_2025_LOCAL,
    ...PHOTOS_2026_LOCAL.map((p) => ({
      ...p,
      milestoneIndex: p.milestoneIndex + yearBoundary,
    })),
  ];

  let activePhotoIndex = 0;
  for (let i = 0; i < photos.length; i++) {
    if (photos[i].milestoneIndex <= activeIndex) activePhotoIndex = i;
  }

  return (
    <div ref={wrapRef} className="journey-pin-wrap">
      <div className="journey-pin-left">
        <YearBlock
          year="2025"
          items={journey2025}
          logoBadges={LOGO_BADGES_2025}
          titleClassName="journey-year-title journey-year-title--2025"
          activeLocalIndex={activeLocalIndex2025}
          isCurrentYear={!isYear2026}
        />
        <YearBlock
          year="2026"
          items={journey2026}
          logoBadges={LOGO_BADGES_2026}
          titleClassName="journey-year-title journey-year-title--2026 journey-year-title--pin"
          activeLocalIndex={activeLocalIndex2026}
          isCurrentYear={isYear2026}
        />
      </div>
      <div className="journey-pin-right">
        <div className="journey-photo-frame">
          {photos.map((photo, idx) => (
            <div
              key={Array.isArray(photo.src) ? photo.src.join('|') : photo.src}
              className={
                idx === activePhotoIndex
                  ? 'journey-photo-slide active'
                  : 'journey-photo-slide'
              }
            >
              <PhotoSlideImages
                src={photo.src}
                alt={photo.alt}
                active={idx === activePhotoIndex}
                progress={
                  photo.milestoneIndex === activeIndex
                    ? progress
                    : photo.milestoneIndex < activeIndex
                      ? 1
                      : 0
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
