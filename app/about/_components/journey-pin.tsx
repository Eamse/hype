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
  // 해당 연도 배열(journey2025 또는 journey2026) 안에서의 인덱스
  milestoneIndex: number;
};

// milestoneIndex → 타임라인 텍스트 옆에 붙는 작은 원형 로고 배지
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
const PHOTOS_2025: Photo[] = [
  // {
  //   src: '/about/history/history-03b-angel-dei.jpg',
  //   alt: 'Hype Wedding history',
  //   milestoneIndex: 0,
  // },
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
  // {
  //   src: '/about/history/history-04b-first-shoot.jpg',
  //   alt: 'Hype Wedding history',
  //   milestoneIndex: 5,
  // },
];

const PHOTOS_2026: Photo[] = [
  // {
  //   src: '/about/history/history-05b-meryem.jpg',
  //   alt: 'Hype Wedding history',
  //   milestoneIndex: 0,
  // },
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
                fill
                className="object-cover"
              />
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function JourneyYearPin({
  year,
  items,
  photos,
  logoBadges,
  titleClassName,
}: {
  year: string;
  items: JourneyItem[];
  photos: Photo[];
  logoBadges: Record<number, { src: string; alt: string }>;
  titleClassName: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // pin 구간 길이는 사진 개수가 아니라 타임라인 항목 수 기준 — 사진(2025는 2장)만 기준으로
  // 잡으면 구간이 너무 짧아서 급하게 끝나버림. 항목 수(2025는 6개)로 잡으면 텍스트 읽는
  // 속도에 맞춰 훨씬 여유로워짐. 사진은 그 안에서 milestoneIndex 기준으로 순서대로 전환.
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  // 현재 activeMilestoneIndex 구간 안에서의 스크롤 진행도(0~1) — 한 milestone에
  // 사진이 여러 장 걸려있을 때 스크롤에 따라 그 안에서 사진을 전환하는 데 사용
  const [milestoneProgress, setMilestoneProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || items.length <= 1) return;

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top+=106',
      end: () => `+=${window.innerHeight * (items.length - 1) * 1.1}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1, // 연속으로 붙어있는 pin 섹션 사이 전환 시 튀는 현상 완화
      fastScrollEnd: true, // 빠른 스크롤로 트리거 경계를 확 지나칠 때 애니메이션이 튀지 않게 함
      onUpdate: (self) => {
        const scaled = self.progress * items.length;
        const idx = Math.min(items.length - 1, Math.floor(scaled));
        setActiveMilestoneIndex(idx);
        setMilestoneProgress(scaled - idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [items.length]);

  // 현재 활성 타임라인 항목 이전(또는 같은) milestoneIndex를 가진 사진 중 가장 가까운 것을 표시
  let activeIndex = 0;
  for (let i = 0; i < photos.length; i++) {
    if (photos[i].milestoneIndex <= activeMilestoneIndex) activeIndex = i;
  }

  return (
    <div ref={wrapRef} className="journey-pin-wrap">
      <div className="journey-pin-left">
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
              active={idx === activeMilestoneIndex}
            />
          ))}
        </div>
      </div>
      <div className="journey-pin-right">
        <div className="journey-photo-frame">
          {photos.map((photo, idx) => (
            <div
              key={Array.isArray(photo.src) ? photo.src.join('|') : photo.src}
              className={
                idx === activeIndex
                  ? 'journey-photo-slide active'
                  : 'journey-photo-slide'
              }
            >
              <PhotoSlideImages
                src={photo.src}
                alt={photo.alt}
                active={idx === activeIndex}
                progress={
                  photo.milestoneIndex === activeMilestoneIndex
                    ? milestoneProgress
                    : photo.milestoneIndex < activeMilestoneIndex
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

export default function JourneyPin({
  journey2025,
  journey2026,
}: {
  journey2025: JourneyItem[];
  journey2026: JourneyItem[];
}) {
  return (
    <>
      <JourneyYearPin
        year="2025"
        items={journey2025}
        photos={PHOTOS_2025}
        logoBadges={LOGO_BADGES_2025}
        titleClassName="journey-year-title journey-year-title--2025"
      />
      <JourneyYearPin
        year="2026"
        items={journey2026}
        photos={PHOTOS_2026}
        logoBadges={LOGO_BADGES_2026}
        titleClassName="journey-year-title journey-year-title--2026 journey-year-title--pin"
      />
    </>
  );
}
