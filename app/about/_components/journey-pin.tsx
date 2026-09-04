'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';

export type JourneyItem = {
  date: string;
  bold: boolean;
  // 하이라이트 애니메이션 없이 항상 굵게만 표시하고 싶을 때
  staticBold?: boolean;
  content: ReactNode;
};

type Photo = {
  src: string;
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

const PHOTOS_2025_LOCAL: Photo[] = [
  {
    src: '/about/history/history-2025-angel-dei-1.jpg',
    alt: 'Hype Wedding launched',
    milestoneIndex: 1,
  },
  {
    src: '/about/history/history-2025-angel-dei-2.jpg',
    alt: 'Angel Dei collaboration',
    milestoneIndex: 2,
  },
  {
    src: '/about/history/history-2025-angel-dei-3.jpg',
    alt: 'Featured in Wedding Essentials Magazine',
    milestoneIndex: 3,
  },
  {
    src: '/about/history/history-2025-first-client-photoshoot-1.jpg',
    alt: 'First client photoshoot',
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
    alt: 'Meryem Gündüz collaboration',
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
}: {
  item: JourneyItem;
  logo?: { src: string; alt: string };
}) {
  return (
    <div className="journey-timeline-item">
      <div className="journey-timeline-row">
        <span className="journey-dot" />
        <p className="journey-date">{item.date}</p>
        <p
          className={[
            'journey-milestone',
            (item.bold || item.staticBold) && 'journey-milestone--static-bold',
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

function YearBlock({
  year,
  items,
  logoBadges,
  titleRef,
  titleClassName,
}: {
  year: string;
  items: JourneyItem[];
  logoBadges: Record<number, { src: string; alt: string }>;
  titleRef: (el: HTMLParagraphElement | null) => void;
  titleClassName: string;
}) {
  return (
    <div className="journey-year-layer">
      <div className="journey-timeline">
        <p ref={titleRef} className={titleClassName}>
          {year}
        </p>
        {items.map((item, idx) => (
          <TimelineRow key={idx} item={item} logo={logoBadges[idx]} />
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
  const yearBoundary = journey2025.length;
  const photos = buildPhotos(yearBoundary);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [is2025InView, setIs2025InView] = useState(false);
  const [is2026InView, setIs2026InView] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const title2025Ref = useRef<HTMLParagraphElement | null>(null);

  // 사진은 스크롤 위치와 무관하게 섹션이 보이는 동안 자동으로 순환 슬라이드됨
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || photos.length <= 1) return;
    let intervalId: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          intervalId = window.setInterval(() => {
            setActivePhotoIndex((prev) => (prev + 1) % photos.length);
          }, 2600);
        } else if (intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(wrap);
    return () => {
      observer.disconnect();
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [photos.length]);

  // "2025" 타이틀이 화면 위쪽 가까이(더 스크롤해서 올라온 뒤)까지 왔을 때만 키컬러로 전환 —
  // 감지 밴드를 화면 상단 쪽으로 둬서 더 내려야(스크롤해야) 발동함.
  useEffect(() => {
    const el = title2025Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIs2025InView(entry.isIntersecting),
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "2026"은 자기 위치와 무관하게 "2025가 화면(뷰포트) 밖으로 완전히 나갔는지"만 보고
  // 즉시 전환됨 — 밴드가 아니라 실제 뷰포트(top=0 기준) 자체를 관찰해서, 화면을 벗어나는
  // 정확한 순간(top<0로 넘어가는 시점)에만 콜백이 발생하도록 별도 관찰자로 분리함.
  useEffect(() => {
    const el = title2025Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIs2026InView(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="journey-pin-wrap">
      <div className="journey-pin-left">
        <YearBlock
          year="2025"
          items={journey2025}
          logoBadges={LOGO_BADGES_2025}
          titleRef={(el) => {
            title2025Ref.current = el;
          }}
          titleClassName={[
            'journey-year-title',
            'journey-year-title--2025',
            is2025InView && 'journey-year-title--keycolor',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <YearBlock
          year="2026"
          items={journey2026}
          logoBadges={LOGO_BADGES_2026}
          titleRef={() => {}}
          titleClassName={[
            'journey-year-title',
            'journey-year-title--2026',
            is2026InView && 'journey-year-title--keycolor',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      <div className="journey-pin-right">
        <div className="journey-photo-frame">
          {photos.map((photo, idx) => (
            <div
              key={photo.src}
              className={
                idx === activePhotoIndex
                  ? 'journey-photo-slide active'
                  : 'journey-photo-slide'
              }
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
