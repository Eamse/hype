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
  bold: boolean;
  content: ReactNode;
};

type Photo = {
  src: string;
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
  2: { src: '/about/history/history-06-hype-snap.png', alt: 'Hype Snap' },
};

// 원본 스펙: 하이라이트 3개(★)만 사진 확정, 나머지 비하이라이트 슬롯은 추후 전달 예정이라 아직 비움
const PHOTOS_2025: Photo[] = [
  {
    src: '/about/history/history-03-angel-dei.jpg',
    alt: 'Angel Dei collaboration',
    milestoneIndex: 2,
  },
  {
    src: '/about/history/history-04-first-shoot.jpg',
    alt: 'First client photoshoot',
    milestoneIndex: 4,
  },
];

// TODO: 2026 나머지 마일스톤 사진 받으면 교체 — 지금은 pin 시퀀스 테스트용으로 기존 사진을 임시로 채워둠
const PHOTOS_2026: Photo[] = [
  {
    src: '/about/history/history-01-founded.png',
    alt: '(테스트용 임시 이미지)',
    milestoneIndex: 0,
  },
  {
    src: '/about/history/history-05-meryem.jpg',
    alt: 'Meryem Gündüz collaboration',
    milestoneIndex: 1,
  },
  {
    src: '/about/history/history-03-angel-dei.jpg',
    alt: '(테스트용 임시 이미지)',
    milestoneIndex: 2,
  },
  {
    src: '/about/history/history-04-first-shoot.jpg',
    alt: '(테스트용 임시 이미지)',
    milestoneIndex: 4,
  },
];

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
      className={
        active
          ? 'journey-timeline-item journey-timeline-item--active'
          : 'journey-timeline-item'
      }
    >
      <span className="journey-dot" />
      <p className="journey-date">{item.date}</p>
      <p
        className={
          item.bold ? 'journey-milestone journey-milestone--bold' : 'journey-milestone'
        }
      >
        {item.content}
        {logo && (
          <span className="journey-logo-badge">
            <Image src={logo.src} alt={logo.alt} fill className="object-cover" />
          </span>
        )}
      </p>
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || photos.length <= 1) return;

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top+=106',
      end: () => `+=${window.innerHeight * (photos.length - 1) * 0.9}`,
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const idx = Math.min(
          photos.length - 1,
          Math.floor(self.progress * photos.length),
        );
        setActiveIndex(idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [photos.length]);

  const activeMilestoneIndex = photos[activeIndex]?.milestoneIndex ?? -1;

  return (
    <div ref={wrapRef} className="journey-pin-wrap">
      <div className="journey-pin-left">
        <div className={year === '2026' ? 'journey-timeline journey-timeline--2026' : 'journey-timeline'}>
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
              key={photo.src}
              className={
                idx === activeIndex ? 'journey-photo-slide active' : 'journey-photo-slide'
              }
            >
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
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
