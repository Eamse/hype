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

export default function AboutClient({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  const introRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);
  const minjuPhotoRef = useRef<HTMLDivElement>(null);
  const [minjuCaptionLeft, setMinjuCaptionLeft] = useState<number | null>(null);
  const morganPhotoRef = useRef<HTMLDivElement>(null);
  const [morganCaptionLeft, setMorganCaptionLeft] = useState<number | null>(null);

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

  // History: 문단들이 순서대로 아래에서 떠오르며 등장 (재진입 시 재생)
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

  useEffect(() => {
    function recompute() {
      const container = minjuPhotoRef.current;
      const img = container?.querySelector('img');
      if (!container || !img || !img.naturalWidth || !img.naturalHeight) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const renderedWidth = img.naturalWidth * scale;
      setMinjuCaptionLeft(cw - renderedWidth + 16);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  useEffect(() => {
    function recompute() {
      const container = morganPhotoRef.current;
      const img = container?.querySelector('img');
      if (!container || !img || !img.naturalWidth || !img.naturalHeight) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const renderedWidth = img.naturalWidth * scale;
      setMorganCaptionLeft(cw - renderedWidth + 16);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
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
              // 섹션 사이 간격 — 사이트 다른 페이지(.partnership-section 등)와 같은
              // clamp(64px, 7vw, 100px) 패턴의 2배. 마지막 섹션은 다음 섹션이 없어서 생략
              paddingBottom:
                i < SECTIONS.length - 1
                  ? 'clamp(128px, 14vw, 200px)'
                  : undefined,
            }}
          >
            {section.id === 'introduction' ? (
              <>
                <div className="about-intro-layout">
                  {/* 좌측 이미지 */}
                  <div className="about-intro-image">
                    <Image
                      src="/about/jeju-and-you.jpg"
                      alt="Hype Wedding"
                      fill
                      className="object-cover"
                      // style={{ objectPosition: 'center', transform: 'scale(1.15) translateY(-8%)' }}
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  {/* 우측 55% 텍스트 */}
                  <div ref={introRef} className="about-intro-copy">
                    <p
                      data-reveal
                      data-reveal-delay="0"
                      className="about-section-number about-rise"
                    >
                      01
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="0"
                      className="about-section-eyebrow about-rise"
                    >
                      ABOUT US
                    </p>
                    <h2
                      data-reveal
                      data-reveal-delay="0"
                      className="about-section-title about-section-title-1 about-rise"
                    >
                      Your story deserves Korea&apos;s finest
                    </h2>
                    <p
                      data-reveal
                      data-reveal-delay="200"
                      className="about-intro-body about-fade"
                    >
                      <strong>Hype Wedding</strong> curates every detail of your
                      Korean pre-wedding — from Korea&apos;s leading
                      photographers to top-tier hair, makeup, and styling — so
                      all you have to do is show up and be yourselves.
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="400"
                      className="about-intro-body about-fade"
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
                      className="about-intro-quote about-fade-slow"
                    >
                      &quot;K-Wedding, to the World&apos;
                      <br />
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="900"
                      className="about-intro-body about-fade"
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
                  <p className="about-section-number">02</p>
                  <p className="about-section-eyebrow">ACHIEVEMENT</p>
                </div>
                <StatsBar />
              </>
            ) : section.id === 'story' ? (
              <>
                <div ref={startedRef}>
                  {/* 텍스트/사진 각각 한 컬럼으로 통합 — 마진값을 한 섹션에서 공유 관리 */}
                  <div className="how-started-layout">
                    <div className="how-started-copy">
                      <p
                        data-history-reveal="0"
                        className="about-section-number history-rise"
                      >
                        03
                      </p>
                      <p
                        data-history-reveal="100"
                        className="about-section-eyebrow history-rise"
                      >
                        HOW WE STARTED
                      </p>
                      <h2
                        data-history-reveal="220"
                        className="about-section-title about-section-title-3 history-rise"
                      >
                        It started with a photo
                      </h2>
                      <p
                        data-history-reveal="420"
                        className="how-started-description history-rise"
                      >
                        <strong>Minju</strong> was living abroad when she flew
                        back to Korea to shoot her own pre-wedding photos. When
                        she shared the final gallery with friends overseas, the
                        reaction was instant: &quot;Wait, this is a thing? How
                        do I get this done?&quot;
                      </p>
                      <blockquote
                        data-history-reveal="600"
                        className="how-started-quote history-quote-lift"
                      >
                        <p>
                          &quot;What if I could connect global couples to the
                          same artists, the same quality, the same
                          experience?&quot;
                        </p>
                      </blockquote>
                      <p
                        data-history-reveal="750"
                        className="how-started-description history-rise"
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
                        className="how-started-description history-rise"
                      >
                        Together they returned to Korea in 2025, flew to Jeju,
                        and met top-tier photographers face to face, building
                        real partnerships from the ground up.{' '}
                        <strong>And that&apos;s how Hype Wedding began.</strong>
                      </p>
                      <div
                        data-history-reveal="1050"
                        className="how-started-goal history-rise"
                      >
                        <p>THE GOAL</p>
                        <strong>
                          Top Korean artists. Full transparency, Zero stress
                        </strong>
                      </div>
                    </div>
                    <div className="how-started-photos">
                      <div
                        ref={minjuPhotoRef}
                        className="how-started-photo how-started-photo-minju"
                      >
                        <Image
                          src="/about/minju.jpg"
                          alt="Minju, Co-founder"
                          fill
                          className="object-contain object-right-bottom"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            const container = minjuPhotoRef.current;
                            if (!container) return;
                            const cw = container.clientWidth;
                            const ch = container.clientHeight;
                            const scale = Math.min(
                              cw / img.naturalWidth,
                              ch / img.naturalHeight,
                            );
                            setMinjuCaptionLeft(
                              cw - img.naturalWidth * scale + 16,
                            );
                          }}
                        />
                        <div
                          className="how-started-photo-caption"
                          style={
                            minjuCaptionLeft !== null
                              ? { left: minjuCaptionLeft }
                              : undefined
                          }
                        >
                          <p className="font-bold">Minju (Emily)</p>
                          <p>Co-founder</p>
                        </div>
                      </div>
                      <div
                        ref={morganPhotoRef}
                        className="how-started-photo how-started-photo-morgan"
                      >
                        <Image
                          src="/about/morgan-.jpg"
                          alt="Saeyoung (Morgan), Co-founder"
                          fill
                          className="object-contain object-right-bottom"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            const container = morganPhotoRef.current;
                            if (!container) return;
                            const cw = container.clientWidth;
                            const ch = container.clientHeight;
                            const scale = Math.min(
                              cw / img.naturalWidth,
                              ch / img.naturalHeight,
                            );
                            setMorganCaptionLeft(
                              cw - img.naturalWidth * scale + 16,
                            );
                          }}
                        />
                        <div
                          className="how-started-photo-caption"
                          style={
                            morganCaptionLeft !== null
                              ? { left: morganCaptionLeft }
                              : undefined
                          }
                        >
                          <p className="font-bold">Saeyoung (Morgan)</p>
                          <p>Co-founder</p>
                        </div>
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
                        data-philosophy-reveal="0"
                        className="about-section-number philosophy-pop"
                      >
                        04
                      </p>
                      <p
                        data-philosophy-reveal="80"
                        className="about-section-eyebrow philosophy-pop"
                      >
                        PHILOSOPHY
                      </p>
                    </div>
                  </div>
                  <div className="philosophy-title-row">
                    <h2
                      data-philosophy-reveal="180"
                      className="about-section-title about-section-title-4 philosophy-title-tight philosophy-pop"
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
                          width={1200}
                          height={1002}
                          className="philosophy-deco-korean-combined"
                        />
                      </div>
                      <h3>The Korean Edit</h3>
                      <p>
                        Korean beauty trends meet high-fashion
                        <br />
                        editorial — never cookie-cutter.
                      </p>
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
                          width={1200}
                          height={2055}
                          className="philosophy-deco-coast-combined"
                        />
                        <Image
                          src="/about/philosophy/4-philosophy-coast-to-concrete-1.webp"
                          alt=""
                          width={800}
                          height={800}
                          className="philosophy-deco-plane"
                        />
                      </div>
                      <h3>Coast to Concrete</h3>
                      <p>
                        From Jeju&apos;s wild landscapes to Seoul&apos;s urban
                        <br />
                        grit — one country, endless contrast.
                      </p>
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
                          width={1200}
                          height={1133}
                          className="philosophy-deco-authenticity-combined"
                        />
                        <Image
                          src="/about/philosophy/4-philosophy-authenticity-1.webp"
                          alt=""
                          width={800}
                          height={800}
                          className="philosophy-deco-strip"
                        />
                      </div>
                      <h3>Authenticity</h3>
                      <p>
                        We capture what&apos;s genuine —
                        <br />
                        your chemistry, unscripted.
                      </p>
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
                          src="/about/philosophy/gramophone-with-heart-and-musicnote.webp"
                          alt=""
                          width={1200}
                          height={907}
                          className="philosophy-deco-effortless-combined"
                        />
                      </div>
                      <h3>Effortless, End to End</h3>
                      <p>
                        From first inquiry to final gallery —
                        <br />
                        we handle everything so you don&apos;t have to.
                      </p>
                    </article>
                  </div>
                </div>
              </>
            ) : section.id === 'history' ? (
              <>
                <div className="journey-header">
                  <p className="about-section-number">05</p>
                  <p className="about-section-eyebrow">HISTORY</p>
                  <h2 className="about-section-title about-section-title-5">
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
