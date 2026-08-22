'use client';

import { useEffect, useRef, type ReactNode } from 'react';
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
  content: ReactNode;
};

const JOURNEY_2025: JourneyItem[] = [
  {
    date: 'Feb 27',
    bold: true,
    content: 'Hype Pig founded',
  },
  {
    date: 'Apr',
    bold: true,
    content: (
      <>
        Launched first brand — <strong>Hype Wedding</strong>
      </>
    ),
  },
  {
    date: 'May',
    bold: false,
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
    bold: false,
    content: (
      <>
        Influencer collab — <strong>Meryem Gündüz, Turkey</strong>
      </>
    ),
  },
  {
    date: 'May',
    bold: true,
    content: (
      <>
        Launched second brand — <strong>Hype Snap</strong>
      </>
    ),
  },
  {
    date: 'Jun',
    bold: true,
    content: '70th client booking milestone',
  },
  {
    date: 'Jul',
    bold: true,
    content: 'Singapore Meet-up Event',
  },
];

export default function AboutClient({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  const introRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLDivElement>(null);
  const followupRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);

  // 헤드라인 → 본문1 → 본문2 → 인용구 순서로 스크롤 진입 시 순차 페이드인
  // 뷰포트를 벗어나면 리셋해서, 다시 스크롤해 들어올 때마다 재생된다.
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

  // Philosophy: 원칙 카드를 겹친 레이어처럼 순차 Pop 한다. (재진입 시 재생)
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

  // History: 각 문단은 순서대로, Part 2 전체는 옆에서 밀려 들어온다. (재진입 시 재생)
  useEffect(() => {
    const sections = [startedRef.current, followupRef.current].filter(
      (section): section is HTMLDivElement => section !== null,
    );
    const timerMap = new Map<Element, number[]>();

    const observers = sections.map((section) => {
      const targets = section.querySelectorAll<HTMLElement>(
        '[data-history-reveal]',
      );
      const observer = new IntersectionObserver(
        ([entry]) => {
          const timers = timerMap.get(section) ?? [];
          timers.forEach(clearTimeout);
          timers.length = 0;

          if (entry.isIntersecting) {
            section.classList.add('visible');
            targets.forEach((target) => {
              const delay = Number(target.dataset.historyReveal ?? 0);
              timers.push(
                window.setTimeout(() => target.classList.add('visible'), delay),
              );
            });
          } else {
            section.classList.remove('visible');
            targets.forEach((target) => target.classList.remove('visible'));
          }
          timerMap.set(section, timers);
        },
        { threshold: 0.18 },
      );
      observer.observe(section);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      timerMap.forEach((timers) => timers.forEach(clearTimeout));
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <SubTabBar tabs={SECTIONS} />

      <div
        className="about-page-content"
        style={{
          margin: '0 auto',
          paddingBottom: 120,
        }}
      >
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              scrollMarginTop: 106,
              minHeight: '50vh',
              // Story의 첫 사진은 섹션 시작 지점부터 전체 폭으로 보여준다.
              paddingTop: section.id === 'story' ? 0 : 60,
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
                      className="about-intro-number about-rise"
                    >
                      01
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="0"
                      className="about-intro-eyebrow about-rise"
                    >
                      ABOUT US
                    </p>
                    <h2
                      data-reveal
                      data-reveal-delay="0"
                      className="about-intro-title about-rise"
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
                      Based in <strong>Seoul</strong> and <strong>Jeju</strong>,
                      we bridge the gap between international couples and
                      Korea&apos;s most sought-after wedding creatives,
                      delivering a seamless, end-to-end experience with zero
                      guesswork.
                    </p>
                    <p
                      data-reveal
                      data-reveal-delay="700"
                      className="about-intro-quote about-fade-slow"
                    >
                      &quot;Bringing Korea&apos;s finest wedding
                      <br />
                      artistry to the world
                      <br />— with full transparency and zero stress.&quot;
                    </p>
                  </div>
                </div>
              </>
            ) : section.id === 'achievement' ? (
              <>
                <div className="journey-header">
                  <p className="journey-number">02</p>
                  <p className="journey-eyebrow">ACHIEVEMENT</p>
                </div>
                <StatsBar />
              </>
            ) : section.id === 'story' ? (
              <>
                {/* part 1: 텍스트 좌 / 이미지 우 — Minju */}
                <div ref={startedRef} className="how-started-layout">
                  <div className="how-started-copy">
                    <p
                      data-history-reveal="0"
                      className="how-started-number history-rise"
                    >
                      03
                    </p>
                    <p
                      data-history-reveal="100"
                      className="how-started-eyebrow history-rise"
                    >
                      HOW WE STARTED
                    </p>
                    <h2
                      data-history-reveal="220"
                      className="how-started-title history-rise"
                    >
                      It started
                      <br />
                      with a photo
                    </h2>
                    <p
                      data-history-reveal="420"
                      className="how-started-description history-rise"
                    >
                      <strong>Minju</strong> was living abroad when she flew
                      back to Korea to shoot her own pre-wedding photos. When
                      she shared the final gallery with friends overseas, the
                      reaction was instant: &quot;Wait, this is a thing? How do
                      I get this done?&quot;
                    </p>
                    <blockquote
                      data-history-reveal="600"
                      className="how-started-quote history-quote-lift"
                    >
                      <p>
                        &quot;What if I could connect global couples to the same
                        artists, the same quality, the same experience?&quot;
                      </p>
                    </blockquote>
                  </div>
                  <div className="how-started-image">
                    <Image
                      src="/about/minju.jpg"
                      alt="Minju, Co-founder"
                      fill
                      className="object-cover"
                    />
                    <div className="how-started-caption">
                      <p className="font-bold">Minju</p>
                      <p>Co-founder</p>
                    </div>
                  </div>
                </div>

                {/* part 2: 텍스트 좌 / 이미지 우 — Morgan */}
                <div
                  ref={followupRef}
                  className="how-started-followup-layout history-panel-slide"
                >
                  <div className="how-started-followup-copy">
                    <p
                      data-history-reveal="120"
                      className="how-started-followup-description history-rise"
                    >
                      She brought that idea to <strong>Morgan</strong>, who had
                      worked with Minju abroad. Both knew firsthand what
                      international couples need, and what they worry about:
                      unfamiliar vendors, language barriers, hidden costs, and
                      the fear of getting a different result from what was
                      promised.
                    </p>
                    <p
                      data-history-reveal="500"
                      className="how-started-followup-description history-rise"
                    >
                      Together they returned to Korea in 2025, flew to Jeju, and
                      met top-tier photographers face to face, building real
                      partnerships from the ground up.{' '}
                      <strong>And that&apos;s how Hype Wedding began.</strong>
                    </p>
                    <div
                      data-history-reveal="700"
                      className="how-started-goal history-rise"
                    >
                      <p>THE GOAL</p>
                      <strong>
                        Top Korean artists. Full transparency.
                        <br />
                        Zero stress.
                      </strong>
                    </div>
                  </div>
                  <div className="how-started-followup-media">
                    <div className="how-started-followup-image">
                      <Image
                        src="/about/morgan.jpg"
                        alt="Saeyoung (Morgan), Co-founder"
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: 'top',
                          transform: 'scale(1.25)',
                          transformOrigin: 'top',
                        }}
                      />
                      <div className="how-started-followup-caption">
                        <p className="font-bold">Saeyoung (Morgan)</p>
                        <p>Co-founder</p>
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
                        className="philosophy-number philosophy-pop"
                      >
                        04
                      </p>
                      <p
                        data-philosophy-reveal="80"
                        className="philosophy-eyebrow philosophy-pop"
                      >
                        PHILOSOPHY
                      </p>
                    </div>
                  </div>
                  <div className="philosophy-title-row">
                    <h2
                      data-philosophy-reveal="180"
                      className="philosophy-heading philosophy-pop"
                    >
                      What we believe in
                    </h2>
                    <p
                      data-philosophy-reveal="280"
                      className="philosophy-summary philosophy-pop"
                    >
                      Four principles that guide every decision
                    </p>
                  </div>

                  <div className="philosophy-principles">
                    <article
                      data-philosophy-reveal="420"
                      className="philosophy-principle philosophy-principle-1 philosophy-pop"
                    >
                      <h3>The Korean Edit</h3>
                      <p>
                        Korean beauty trends meet high-fashion editorial — never
                        cookie-cutter.
                      </p>
                    </article>
                    <article
                      data-philosophy-reveal="560"
                      className="philosophy-principle philosophy-principle-2 philosophy-pop"
                    >
                      <h3>Coast to Concrete</h3>
                      <p>
                        From Jeju&apos;s wild landscapes to Seoul&apos;s urban
                        grit — one country, endless contrast.
                      </p>
                    </article>
                    <article
                      data-philosophy-reveal="700"
                      className="philosophy-principle philosophy-principle-3 philosophy-pop"
                    >
                      <h3>Authenticity</h3>
                      <p>
                        We capture what&apos;s genuine — your chemistry,
                        unscripted.
                      </p>
                    </article>
                    <article
                      data-philosophy-reveal="840"
                      className="philosophy-principle philosophy-principle-4 philosophy-pop"
                    >
                      <h3>Effortless. End to End.</h3>
                      <p>
                        From first inquiry to final gallery — we handle
                        everything so you don&apos;t have to.
                      </p>
                    </article>
                  </div>
                </div>
              </>
            ) : section.id === 'history' ? (
              <>
                <div className="journey-header">
                  <p className="journey-number">05</p>
                  <p className="journey-eyebrow">HISTORY</p>
                  <h2 className="journey-heading">Our journey so far.</h2>
                  <p className="journey-subtext">
                    From a single photo shoot in Korea to an international
                    pre-wedding brand trusted by couples from 16 countries.
                  </p>
                </div>

                <JourneyPin journey2025={JOURNEY_2025} journey2026={JOURNEY_2026} />
              </>
            ) : (
              <>
                <h2
                  style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}
                >
                  {section.label}
                </h2>
                {/* TODO: {section.label} 콘텐츠 추가 */}
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
