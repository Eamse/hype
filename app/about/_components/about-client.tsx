'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import SubTabBar from '@/components/sub-tab-bar';
import StatsBar from './stats-bar';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'history', label: 'History' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'achievement', label: 'Achievement' },
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
  useEffect(() => {
    const el = introRef.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            targets.forEach((target) => {
              const delay = Number(target.dataset.revealDelay ?? 0);
              setTimeout(() => target.classList.add('visible'), delay);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Philosophy: 원칙 카드를 겹친 레이어처럼 순차 Pop 한다.
  useEffect(() => {
    const section = philosophyRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section
          .querySelectorAll<HTMLElement>('[data-philosophy-reveal]')
          .forEach((target) => {
            const delay = Number(target.dataset.philosophyReveal ?? 0);
            window.setTimeout(() => target.classList.add('visible'), delay);
          });
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // History: 각 문단은 순서대로, Part 2 전체는 옆에서 밀려 들어온다.
  useEffect(() => {
    const sections = [startedRef.current, followupRef.current].filter(
      (section): section is HTMLDivElement => section !== null,
    );
    const observers = sections.map((section) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          section.classList.add('visible');
          section
            .querySelectorAll<HTMLElement>('[data-history-reveal]')
            .forEach((target) => {
              const delay = Number(target.dataset.historyReveal ?? 0);
              window.setTimeout(() => target.classList.add('visible'), delay);
            });
          observer.disconnect();
        },
        { threshold: 0.18 },
      );
      observer.observe(section);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
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
              // History의 첫 사진은 섹션 시작 지점부터 전체 폭으로 보여준다.
              paddingTop: section.id === 'history' ? 0 : 60,
              borderBottom: '1px solid #000',
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
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute top-30 left-25 text-white">
                      <p className="text-sm tracking-[3px]">01</p>
                      <p className="text-2xl font-bold tracking-wide">
                        ABOUT US
                      </p>
                    </div>
                  </div>

                  {/* 우측 55% 텍스트 */}
                  <div ref={introRef} className="about-intro-copy">
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
                      Korean pre-wedding — from award-winning photographers to
                      top-tier hair, makeup, and styling — so all you have to do
                      is show up and be yourselves.
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
                      &quot;Bringing Korea&apos;s finest wedding artistry to the
                      world — with full transparency and zero stress.&quot;
                    </p>
                  </div>
                </div>
                <StatsBar />
              </>
            ) : section.id === 'history' ? (
              <>
                {/* part 1: 텍스트 좌 / 이미지 우 — Minju */}
                <div ref={startedRef} className="how-started-layout">
                  <div className="how-started-copy">
                    <p
                      data-history-reveal="0"
                      className="how-started-number history-rise"
                    >
                      02
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
                      Co-founder <strong>Minju</strong>, while living abroad,
                      flew back to Korea to shoot her own pre-wedding with her
                      fiancé. When she shared them overseas, the response was
                      instant:{' '}
                      <strong>&quot;How do I get this done?&quot;</strong>
                    </p>
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
                      She brought the idea to <strong>Morgan</strong>, who had
                      spent years abroad herself. Both knew firsthand what
                      international couples need — and what they worry about.
                    </p>
                    <blockquote
                      data-history-reveal="300"
                      className="how-started-quote history-quote-lift"
                    >
                      <p>
                        &quot;Transparency isn&apos;t a feature — it&apos;s how
                        we operate.&quot;
                      </p>
                    </blockquote>
                    <p
                      data-history-reveal="500"
                      className="how-started-followup-description history-rise"
                    >
                      Together they returned to Korea in 2025, flew to Jeju, and
                      met top-tier photographers face to face — building real
                      partnerships from the ground up.
                    </p>
                    <div
                      data-history-reveal="700"
                      className="how-started-goal history-rise"
                    >
                      <p>THE GOAL</p>
                      <strong>
                        Same quality, same artists, fully transparent — minus
                        the stress.
                      </strong>
                    </div>
                  </div>
                  <div className="how-started-followup-media">
                    <div className="how-started-followup-image">
                      <Image
                        src="/about/morgan.JPG"
                        alt="Saeyoung (Morgan), Co-founder"
                        fill
                        className="object-cover"
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
              <div ref={philosophyRef} className="philosophy-content">
                <div className="philosophy-intro">
                  <div>
                    <p
                      data-philosophy-reveal="0"
                      className="philosophy-number philosophy-pop"
                    >
                      03
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
                      From first inquiry to final gallery — we handle everything
                      so you don&apos;t have to.
                    </p>
                  </article>
                </div>
              </div>
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
