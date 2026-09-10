'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
export type JourneyItem = {
    date: string;
    bold: boolean;
    staticBold?: boolean;
    content: ReactNode;
};
type Photo = {
    src: string;
    alt: string;
    milestoneIndex: number;
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
        src: '/about/history/history-2025-first-client-photoshoot-2.jpg',
        alt: 'Featured in Bridal and Breakfast',
        milestoneIndex: 4,
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
];
function buildPhotos(yearBoundary: number): Photo[] {
    return [
        ...PHOTOS_2025_LOCAL,
        ...PHOTOS_2026_LOCAL.map((p) => ({
            ...p,
            milestoneIndex: p.milestoneIndex + yearBoundary,
        })),
    ];
}
function TimelineRow({ item }: {
    item: JourneyItem;
}) {
    return (<div className="journey-timeline-item">
      <div className="journey-timeline-row">
        <span className="journey-dot"/>
        <p className="journey-date">{item.date}</p>
        <p className={[
            'journey-milestone',
            (item.bold || item.staticBold) && 'journey-milestone--static-bold',
        ]
            .filter(Boolean)
            .join(' ')}>
          {item.content}
        </p>
      </div>
    </div>);
}
function YearBlock({ year, items, titleRef, titleClassName, }: {
    year: string;
    items: JourneyItem[];
    titleRef: (el: HTMLParagraphElement | null) => void;
    titleClassName: string;
}) {
    return (<div className="journey-year-layer">
      <div className="journey-timeline">
        <p ref={titleRef} className={titleClassName}>
          {year}
        </p>
        {items.map((item, idx) => (<TimelineRow key={idx} item={item}/>))}
      </div>
    </div>);
}
export default function JourneyPin({ journey2025, journey2026, }: {
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
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap || photos.length <= 1)
            return;
        let intervalId: number | undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                intervalId = window.setInterval(() => {
                    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
                }, 2600);
            }
            else if (intervalId !== undefined) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        }, { threshold: 0.15 });
        observer.observe(wrap);
        return () => {
            observer.disconnect();
            if (intervalId !== undefined)
                clearInterval(intervalId);
        };
    }, [photos.length]);
    useEffect(() => {
        const el = title2025Ref.current;
        if (!el)
            return;
        const observer = new IntersectionObserver(([entry]) => setIs2025InView(entry.isIntersecting), { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const el = title2025Ref.current;
        if (!el)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            setIs2026InView(!entry.isIntersecting && entry.boundingClientRect.top < 106);
        }, { rootMargin: '-106px 0px 0px 0px', threshold: 0 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return (<div ref={wrapRef} className="journey-pin-wrap">
      <div className="journey-pin-left">
        <YearBlock year="2025" items={journey2025} titleRef={(el) => {
            title2025Ref.current = el;
        }} titleClassName={[
            'journey-year-title',
            'journey-year-title--2025',
            is2025InView && 'journey-year-title--keycolor',
        ]
            .filter(Boolean)
            .join(' ')}/>
        <YearBlock year="2026" items={journey2026} titleRef={() => { }} titleClassName={[
            'journey-year-title',
            'journey-year-title--2026',
            is2026InView && 'journey-year-title--keycolor',
        ]
            .filter(Boolean)
            .join(' ')}/>
      </div>
      <div className="journey-pin-right">
        <div className="journey-photo-frame">
          {photos.map((photo, idx) => (<div key={photo.src} className={idx === activePhotoIndex
                ? 'journey-photo-slide active'
                : 'journey-photo-slide'}>
              <Image src={photo.src} alt={photo.alt} fill className="object-cover"/>
            </div>))}
        </div>
      </div>
    </div>);
}
