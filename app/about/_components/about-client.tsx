'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import SubTabBar from '@/components/sub-tab-bar';
import StatsBar from './stats-bar';
import JourneyPin from './journey-pin';
const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'achievement', label: 'Achievement' },
  { id: 'story', label: 'Story' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'history', label: 'History' },
];
type JourneyItem = {
  date: string;
  bold: boolean;
  staticBold?: boolean;
  content: ReactNode;
};
const JOURNEY_2025: JourneyItem[] = [
  {
    date: 'Feb 27',
    bold: false,
    content: 'Hype Pig founded',
  },
  {
    date: 'Apr',
    bold: false,
    content: (
      <>
        Launched first brand — <strong>Hype Wedding</strong>
      </>
    ),
  },
  {
    date: 'May',
    bold: true,
    content: (
      <>
        First influencer collab — <strong>Angel Dei</strong>, Philippines
      </>
    ),
  },
  {
    date: 'May',
    bold: false,
    content: (
      <>
        Featured in <strong>Wedding Essentials Magazine</strong>, Philippines
      </>
    ),
  },
  {
    date: 'Jul',
    bold: true,
    content: 'First client photoshoot',
  },
  {
    date: 'Oct',
    bold: false,
    content: (
      <>
        Featured in <strong>Bridal and Breakfast</strong>, Philippines
      </>
    ),
  },
];
const JOURNEY_2026: JourneyItem[] = [
  {
    date: 'Mar',
    bold: false,
    content: (
      <>
        First int&apos;l exhibition — <strong>Hitcheed Fair, Singapore</strong>
      </>
    ),
  },
  {
    date: 'Apr',
    bold: true,
    content: (
      <>
        Influencer collab — <strong>Meryem Gündüz, Turkey</strong>
      </>
    ),
  },
  {
    date: 'May',
    bold: false,
    content: (
      <>
        Launched second brand — <strong>Hype Snap</strong>
      </>
    ),
  },
  {
    date: 'Jul',
    bold: false,
    staticBold: true,
    content: 'Singapore Meet-up Event',
  },
  {
    date: 'Aug',
    bold: false,
    content: (
      <>
        <strong>80th client booking</strong> milestone
      </>
    ),
  },
];
const STARTED_PHOTOS = [
  {
    src: '/about/minju.jpg',
    alt: 'Minju, Co-founder',
    name: 'Minju (Emily)',
    captionPosition: 'bottom-right',
  },
  {
    src: '/about/morgan-.jpg',
    alt: 'Saeyoung (Morgan), Co-founder',
    name: 'Saeyoung (Morgan)',
    captionPosition: 'top-left',
  },
] as const;
export default function AboutClient({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  const introRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);
  const startedPhotosRef = useRef<HTMLDivElement>(null);
  const [activeStartedPhoto, setActiveStartedPhoto] = useState(0);
  useEffect(() => {
    const wrap = startedPhotosRef.current;
    if (!wrap) return;
    let intervalId: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          intervalId = window.setInterval(() => {
            setActiveStartedPhoto((prev) => (prev + 1) % STARTED_PHOTOS.length);
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
  }, []);
  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        timers.forEach(clearTimeout);
        timers.length = 0;
        if (entry.isIntersecting) {
          targets.forEach((target) => {
            const delay = Number(target.dataset.revealDelay ?? 0);
            timers.push(
              setTimeout(() => target.classList.add('visible'), delay),
            );
          });
        } else {
          targets.forEach((target) => target.classList.remove('visible'));
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    const section = philosophyRef.current;
    if (!section) return;
    const targets = section.querySelectorAll<HTMLElement>(
      '[data-philosophy-reveal]',
    );
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        timers.forEach(clearTimeout);
        timers.length = 0;
        if (entry.isIntersecting) {
          targets.forEach((target) => {
            const delay = Number(target.dataset.philosophyReveal ?? 0);
            timers.push(
              window.setTimeout(() => target.classList.add('visible'), delay),
            );
          });
        } else {
          targets.forEach((target) => target.classList.remove('visible'));
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    const section = startedRef.current;
    if (!section) return;
    const targets = section.querySelectorAll<HTMLElement>(
      '[data-history-reveal]',
    );
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        timers.forEach(clearTimeout);
        timers.length = 0;
        if (entry.isIntersecting) {
          targets.forEach((target) => {
            const delay = Number(target.dataset.historyReveal ?? 0);
            timers.push(
              window.setTimeout(() => target.classList.add('visible'), delay),
            );
          });
        } else {
          targets.forEach((target) => target.classList.remove('visible'));
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div style={{ minHeight: '100vh' }}>
      <SubTabBar tabs={SECTIONS} />

      <div
        className="about-page-content"
        style={{
          margin: '0 auto',
        }}
      >
        {SECTIONS.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              scrollMarginTop: 106,
              minHeight: '100vh',
              paddingBottom:
                i < SECTIONS.length - 1
                  ? 'clamp(128px, 14vw, 200px)'
                  : undefined,
            }}
          >
            {section.id === 'introduction' ? (
              <>
                <div className="about-intro-layout">
                  <div className="about-intro-image">
                    <Image
                      src="/about/jeju-and-you.jpg"
                      alt="Hype Wedding"
                      fill
                      className="object-cover"
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div ref={introRef} className="about-intro-copy">
                    <p
                      data-reveal
                      data-reveal-delay="0"
                      className="about-section-eyebrow type-eyebrow about-rise"
                    >
                      ABOUT US
                    </p>
                    <h2
                      data-reveal
                      data-reveal-delay="0"
                      className="about-section-title about-section-title-1 type-subheadline-intro about-rise"
                    >
                      Your story deserves Korea&apos;s finest
                    </h2>
                    <p
                      data-reveal
                      data-reveal-delay="200"
                      className="about-intro-body type-body about-fade"
                    >
                      <strong>Hype Wedding</strong> curates every detail of your
                      Korean pre-wedding — from Korea&apos;s leading
                      photographers to top-tier hair, makeup, and styling — so
                      all you have to do is show up and be yourselves.
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="400"
                      className="about-intro-body type-body about-fade"
                    >
                      Based in{' '}
                      <strong style={{ color: 'rgb(45, 90, 69)' }}>
                        Seoul
                      </strong>{' '}
                      and{' '}
                      <strong style={{ color: 'rgb(45, 90, 69)' }}>Jeju</strong>
                      , we bridge the gap between international couples and
                      Korea&apos;s most sought-after wedding creatives,
                      delivering a seamless, end-to-end experience with zero
                      guesswork.
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="700"
                      className="about-intro-quote type-body-large about-fade-slow"
                    >
                      &quot;K-Wedding, to the World&apos;
                      <br />
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="900"
                      className="about-intro-body type-body about-fade"
                    >
                      In 2026, we launched <strong>Hype Snap</strong>, expanding
                      beyond pre-wedding photography to offer casual snaps for
                      couples, families, and friends. As we continue to expand
                      our services, we’re growing our presence in global markets
                      and reaching more clients around the world.
                    </p>
                  </div>
                </div>
              </>
            ) : section.id === 'achievement' ? (
              <>
                <div className="journey-header">
                  <p className="about-section-eyebrow type-eyebrow">
                    ACHIEVEMENT
                  </p>
                </div>
                <StatsBar />
              </>
            ) : section.id === 'story' ? (
              <>
                <div ref={startedRef}>
                  <div className="how-started-layout">
                    <div className="how-started-copy">
                      <p
                        data-history-reveal="100"
                        className="about-section-eyebrow type-eyebrow history-rise"
                      >
                        HOW WE STARTED
                      </p>
                      <h2
                        data-history-reveal="220"
                        className="about-section-title about-section-title-3 type-subheadline history-rise"
                      >
                        It started with a photo
                      </h2>
                      <p
                        data-history-reveal="420"
                        className="how-started-description type-body history-rise"
                      >
                        <strong>Minju</strong> was living abroad when she flew
                        back to Korea to shoot her own pre-wedding photos. When
                        she shared the final gallery with friends overseas, the
                        reaction was instant: &quot;Wait, this is a thing? How
                        do I get this done?&quot;
                      </p>
                      <blockquote
                        data-history-reveal="600"
                        className="how-started-quote type-body-large history-quote-lift"
                      >
                        <p>
                          &quot;What if I could connect global couples to the
                          same artists, the same quality, the same
                          experience?&quot;
                        </p>
                      </blockquote>
                      <p
                        data-history-reveal="750"
                        className="how-started-description type-body history-rise"
                      >
                        She brought that idea to <strong>Morgan</strong>, who
                        had worked with Minju abroad. Both knew firsthand what
                        international couples need, and what they worry about:
                        unfamiliar vendors, language barriers, hidden costs, and
                        the fear of getting a different result from what was
                        promised.
                      </p>
                      <p
                        data-history-reveal="900"
                        className="how-started-description type-body history-rise"
                      >
                        Together they returned to Korea in 2025, flew to Jeju,
                        and met top-tier photographers face to face, building
                        real partnerships from the ground up.{' '}
                        <strong>And that&apos;s how Hype Wedding began.</strong>
                      </p>
                    </div>
                    <div className="how-started-photos" ref={startedPhotosRef}>
                      {STARTED_PHOTOS.map((photo, idx) => (
                        <div
                          key={photo.src}
                          className={
                            idx === activeStartedPhoto
                              ? 'how-started-photo-slide active'
                              : 'how-started-photo-slide'
                          }
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                          />
                          <div
                            className={`how-started-photo-caption how-started-photo-caption-${photo.captionPosition} type-caption`}
                          >
                            <p className="font-bold">{photo.name}</p>
                            <p>Co-founder</p>
                          </div>
                        </div>
                      ))}
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          bottom: '20px',
                          transform: 'translateX(-50%)',
                          zIndex: 3,
                          display: 'flex',
                          gap: '6px',
                          width: '60%',
                          maxWidth: '100px',
                        }}
                      >
                        {STARTED_PHOTOS.map((photo, idx) => (
                          <div
                            key={photo.src}
                            className={
                              idx === activeStartedPhoto
                                ? 'how-started-photo-dot active'
                                : 'how-started-photo-dot'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="the-goal">
                    <p
                      data-history-reveal="1050"
                      className="the-goal-label type-eyebrow history-rise"
                    >
                      THE GOAL
                    </p>
                    <div className="the-goal-row">
                      <div className="the-goal-item">
                        <p
                          data-history-reveal="1200"
                          className="the-goal-word history-rise"
                        >
                          Top
                        </p>
                        <p
                          data-history-reveal="1350"
                          className="the-goal-rest history-rise"
                        >
                          Korean Artists
                        </p>
                      </div>
                      <div className="the-goal-item">
                        <p
                          data-history-reveal="1200"
                          className="the-goal-word history-rise"
                        >
                          Full
                        </p>
                        <p
                          data-history-reveal="1350"
                          className="the-goal-rest history-rise"
                        >
                          Transparency
                        </p>
                      </div>
                      <div className="the-goal-item">
                        <p
                          data-history-reveal="1200"
                          className="the-goal-word history-rise"
                        >
                          Zero
                        </p>
                        <p
                          data-history-reveal="1350"
                          className="the-goal-rest history-rise"
                        >
                          Stress
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : section.id === 'philosophy' ? (
              <>
                <div ref={philosophyRef} className="philosophy-content">
                  <div className="philosophy-intro">
                    <div>
                      <p
                        data-philosophy-reveal="80"
                        className="about-section-eyebrow type-eyebrow philosophy-pop"
                      >
                        PHILOSOPHY
                      </p>
                    </div>
                  </div>
                  <div className="philosophy-title-row">
                    <h2
                      data-philosophy-reveal="180"
                      className="about-section-title about-section-title-4 type-subheadline philosophy-title-tight philosophy-pop"
                    >
                      What we believe in
                    </h2>
                  </div>

                  <div className="philosophy-principles">
                    <article
                      data-philosophy-reveal="420"
                      className="philosophy-principle philosophy-principle-1 philosophy-pop"
                    >
                      <div
                        className="philosophy-deco philosophy-deco-korean"
                        aria-hidden="true"
                      >
                        <Image
                          src="/about/philosophy/flowers-and-lip.webp"
                          alt=""
                          width={590}
                          height={493}
                          className="philosophy-deco-korean-combined"
                        />
                      </div>
                      <div className="philosophy-principle-text">
                        <h3 className="type-section-header">The Korean Edit</h3>
                        <p className="type-body">
                          Korean beauty trends meet high-fashion
                          <br />
                          editorial — never cookie-cutter.
                        </p>
                      </div>
                    </article>
                    <article
                      data-philosophy-reveal="560"
                      className="philosophy-principle philosophy-principle-2 philosophy-pop"
                    >
                      <div
                        className="philosophy-deco philosophy-deco-coast"
                        aria-hidden="true"
                      >
                        <Image
                          src="/about/philosophy/map-with-pointers.webp"
                          alt=""
                          width={554}
                          height={949}
                          className="philosophy-deco-coast-combined"
                        />
                        <Image
                          src="/about/philosophy/4-philosophy-coast-to-concrete-1.webp"
                          alt=""
                          width={400}
                          height={400}
                          className="philosophy-deco-plane"
                        />
                      </div>
                      <div className="philosophy-principle-text">
                        <h3 className="type-section-header">
                          Coast to Concrete
                        </h3>
                        <p className="type-body">
                          From Jeju&apos;s wild landscapes to Seoul&apos;s urban
                          <br />
                          grit — one country, endless contrast.
                        </p>
                      </div>
                    </article>
                    <article
                      data-philosophy-reveal="700"
                      className="philosophy-principle philosophy-principle-3 philosophy-pop"
                    >
                      <div
                        className="philosophy-deco philosophy-deco-authenticity"
                        aria-hidden="true"
                      >
                        <Image
                          src="/about/philosophy/camera.webp"
                          alt=""
                          width={640}
                          height={604}
                          className="philosophy-deco-authenticity-combined"
                        />
                        <Image
                          src="/about/philosophy/4-philosophy-authenticity-1.webp"
                          alt=""
                          width={574}
                          height={574}
                          className="philosophy-deco-strip"
                        />
                      </div>
                      <div className="philosophy-principle-text">
                        <h3 className="type-section-header">Authenticity</h3>
                        <p className="type-body">
                          We capture what&apos;s genuine —
                          <br />
                          your chemistry, unscripted.
                        </p>
                      </div>
                    </article>
                    <article
                      data-philosophy-reveal="840"
                      className="philosophy-principle philosophy-principle-4 philosophy-pop"
                    >
                      <div
                        className="philosophy-deco philosophy-deco-effortless"
                        aria-hidden="true"
                      >
                        <Image
                          src="/about/philosophy/gramophone-and-musicnote.webp"
                          alt=""
                          width={900}
                          height={927}
                          className="philosophy-deco-effortless-combined"
                        />
                      </div>
                      <div className="philosophy-principle-text">
                        <h3 className="type-section-header">
                          Effortless, End to End
                        </h3>
                        <p className="type-body">
                          From first inquiry to final gallery —
                          <br />
                          we handle everything so you don&apos;t have to.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </>
            ) : section.id === 'history' ? (
              <>
                <div className="journey-header">
                  <p className="about-section-eyebrow type-eyebrow">HISTORY</p>
                  <h2 className="about-section-title about-section-title-5 type-subheadline">
                    Our journey so far
                  </h2>
                </div>

                <JourneyPin
                  journey2025={JOURNEY_2025}
                  journey2026={JOURNEY_2026}
                />
              </>
            ) : (
              <>
                <h2
                  style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}
                >
                  {section.label}
                </h2>
                <p style={{ color: '#000', fontSize: 14 }}>
                  {brand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'}{' '}
                  {section.label} 콘텐츠 들어갈 자리
                </p>
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
