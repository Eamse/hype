'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Mail, FolderDown } from 'lucide-react';

const CONTACT_EMAIL = 'hypepig227@gmail.com';

// lucide-react엔 브랜드(Instagram) 아이콘이 없어서 직접 그림
function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// TODO: 실제 인스타그램 게시물 URL 전달받으면 photos 배열의 각 postUrl로 교체 (지금은 프로필 링크)
const INFLUENCERS = [
  {
    name: 'Angel Dei',
    country: 'Philippines',
    profileUrl: 'https://www.instagram.com/',
    photos: [
      { src: '/partnership/angel-dei-1.jpg', flex: 1 },
      { src: '/partnership/angel-dei-2.jpg', flex: 1 },
      { src: '/partnership/angel-dei-3.jpg', flex: 1.6 },
    ],
  },
  {
    name: 'Meryem Gündüz',
    country: 'Turkey',
    profileUrl: 'https://www.instagram.com/',
    photos: [
      { src: '/partnership/meryem-1.jpg', flex: 1.6 },
      { src: '/partnership/meryem-2.jpg', flex: 1 },
      { src: '/partnership/meryem-3.jpg', flex: 1 },
    ],
  },
];

const BOOKING_STEPS = [
  {
    step: '01',
    titleEn: 'Booking & Consultation',
    titleKr: '예약 및 상담',
    descEn:
      'Discuss package, shoot type, add-ons, and location — Hype Wedding translates between English and Korean',
    descKr: '희망 상품·촬영 종류·옵션·장소 협의 (하이프웨딩이 중간에서 영어·한국어 소통 번역)',
  },
  {
    step: '02',
    titleEn: 'Schedule & Confirmation',
    titleKr: '스케줄 조정 및 확정',
    descEn: 'Shoot schedule, payment, and other details are finalized',
    descKr: '촬영 스케줄 및 결제 방법 등 촬영 관련 세부 내용 결정',
  },
  {
    step: '03',
    titleEn: 'Shoot Day',
    titleKr: '촬영 진행',
    descEn: 'Shoot proceeds as planned, with an interpreter on-site',
    descKr: '사전에 협의한 내용을 바탕으로 촬영 진행 (촬영 당일 통역원 동행)',
  },
  {
    step: '04',
    titleEn: 'Delivery',
    titleKr: '결과물 전달',
    descEn: 'Raw and edited files delivered to you through your Hype Wedding contact',
    descKr: '원본, 보정본은 하이프웨딩 담당자를 통해 고객에게 전달',
  },
];

// TODO: 실제 로고 파일 전달받으면 텍스트 placeholder를 이미지로 교체
const PARTNER_LOGOS = [
  'Wedding Essentials Magazine',
  'Bridal and Breakfast',
  'Hicheed SG',
  'Bridley SG (예정)',
];

// TODO: 실제 PDF 파일 링크 전달받으면 교체
const BROCHURE_URL = '#';
const BUSINESS_INTRO_URL = '#';

// ── 스크롤 재등장 훅: 섹션 전체가 아니라 [data-reveal] 요소 각각을 개별 관찰한다.
function useReplayReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    const timers = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const existing = timers.get(target);
          if (existing) clearTimeout(existing);

          if (entry.isIntersecting) {
            const delay = Number(target.dataset.revealDelay ?? 0);
            const timer = window.setTimeout(() => target.classList.add('visible'), delay);
            timers.set(target, timer);
          } else {
            target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [ref]);
}

export default function PartnershipClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useReplayReveal(heroRef);
  useReplayReveal(portfolioRef);
  useReplayReveal(processRef);
  useReplayReveal(pressRef);
  useReplayReveal(storyRef);

  return (
    <>
      {/* ── 1. Business Collaboration (Hero) ── */}
      <section ref={heroRef} className="partnership-hero">
        <h1
          className="partnership-hero-title-en partnership-fade"
          data-reveal
          data-reveal-delay="0"
        >
          Business Collaboration
        </h1>
        <p
          className="partnership-hero-title-kr partnership-fade"
          data-reveal
          data-reveal-delay="100"
        >
          비즈니스 협업
        </p>
        <p
          className="partnership-subcopy-en partnership-fade"
          data-reveal
          data-reveal-delay="240"
        >
          One photo, endless stories to tell. We connect couples from around the world
          with Korea&apos;s most talented photographers — bridging language and
          distance, every step of the way.
        </p>
        <p
          className="partnership-subcopy-kr partnership-fade"
          data-reveal
          data-reveal-delay="300"
        >
          사진 한 장에 담기는 무한한 이야기. 전 세계 커플과 한국 최고의 작가님들을
          잇습니다. 언어와 거리의 장벽 없이, 처음부터 끝까지.
        </p>
        <div
          className="partnership-contact partnership-fade"
          data-reveal
          data-reveal-delay="440"
        >
          <Mail size={18} strokeWidth={1.8} />
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </section>

      {/* ── 2. Influencer Portfolio ── */}
      <section ref={portfolioRef} className="partnership-section">
        <p className="partnership-eyebrow partnership-fade" data-reveal data-reveal-delay="0">
          INFLUENCER PORTFOLIO
        </p>
        <h2 className="partnership-heading partnership-fade" data-reveal data-reveal-delay="80">
          Creators we&apos;ve worked with
        </h2>
        <p className="partnership-heading-kr partnership-fade" data-reveal data-reveal-delay="140">
          우리와 함께한 크리에이터
        </p>
        <p className="partnership-subcopy-en partnership-fade" data-reveal data-reveal-delay="220">
          Tap a photo to view it on Instagram
        </p>
        <p className="partnership-subcopy-kr partnership-fade" data-reveal data-reveal-delay="260">
          사진을 누르면 인스타그램 게시물로 연결됩니다
        </p>

        {INFLUENCERS.map((influencer, groupIdx) => (
          <div key={influencer.name} className="partnership-influencer-group">
            <p
              className="partnership-influencer-name partnership-fade"
              data-reveal
              data-reveal-delay={`${groupIdx * 80}`}
            >
              {influencer.name}, {influencer.country}
            </p>
            <div className="partnership-photo-row">
              {influencer.photos.map((photo, photoIdx) => (
                <a
                  key={photo.src}
                  href={influencer.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partnership-photo partnership-rise"
                  style={{ flex: photo.flex }}
                  data-reveal
                  data-reveal-delay={`${groupIdx * 80 + photoIdx * 120 + 100}`}
                >
                  <Image
                    src={photo.src}
                    alt={`${influencer.name} photoshoot`}
                    fill
                    className="object-cover"
                  />
                  <span className="partnership-photo-overlay">
                    <InstagramIcon size={22} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── 3. Booking Process ── */}
      <section ref={processRef} className="partnership-section">
        <p className="partnership-eyebrow partnership-fade" data-reveal data-reveal-delay="0">
          BOOKING PROCESS
        </p>
        <h2 className="partnership-heading partnership-fade" data-reveal data-reveal-delay="80">
          How we work with you
        </h2>
        <p className="partnership-heading-kr partnership-fade" data-reveal data-reveal-delay="140">
          예약 진행 방식
        </p>
        <p className="partnership-subcopy-en partnership-fade" data-reveal data-reveal-delay="220">
          No English needed for our partners, no Korean needed for our clients, we
          bridge every conversation.
        </p>
        <p className="partnership-subcopy-kr partnership-fade" data-reveal data-reveal-delay="260">
          모든 대화를 하이프웨딩이 이어드립니다.
        </p>

        <div className="partnership-steps-grid">
          {BOOKING_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className="partnership-step-box partnership-rise"
              data-reveal
              data-reveal-delay={`${360 + idx * 120}`}
            >
              <p className="partnership-step-label">STEP {s.step}</p>
              <p className="partnership-step-title-en">{s.titleEn}</p>
              <p className="partnership-step-title-kr">{s.titleKr}</p>
              <p className="partnership-step-desc-en">{s.descEn}</p>
              <p className="partnership-step-desc-kr">{s.descKr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Partners & Press ── */}
      <section ref={pressRef} className="partnership-section">
        <p className="partnership-eyebrow partnership-fade" data-reveal data-reveal-delay="0">
          PARTNERS &amp; PRESS
        </p>
        <h2 className="partnership-heading partnership-fade" data-reveal data-reveal-delay="80">
          Where you&apos;ll find us
        </h2>
        <p className="partnership-heading-kr partnership-fade" data-reveal data-reveal-delay="140">
          하이프웨딩을 만날 수 있는 곳
        </p>

        <div className="partnership-logo-grid">
          {PARTNER_LOGOS.map((name, idx) => (
            <div
              key={name}
              className="partnership-logo-box partnership-rise"
              data-reveal
              data-reveal-delay={`${240 + idx * 100}`}
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Get the full story ── */}
      <section ref={storyRef} className="partnership-section partnership-section--last">
        <p className="partnership-eyebrow partnership-fade" data-reveal data-reveal-delay="0">
          GET THE FULL STORY
        </p>
        <h2 className="partnership-heading partnership-fade" data-reveal data-reveal-delay="80">
          Learn more about us
        </h2>
        <p className="partnership-heading-kr partnership-fade" data-reveal data-reveal-delay="140">
          더 알아보기
        </p>

        <div className="partnership-doc-buttons">
          <a
            href={BROCHURE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="partnership-doc-btn partnership-doc-btn--filled partnership-rise"
            data-reveal
            data-reveal-delay="240"
          >
            <FolderDown size={22} strokeWidth={1.8} />
            <span>
              <span className="partnership-doc-btn-en">Hype Wedding Brochure</span>
              <span className="partnership-doc-btn-kr">하이프웨딩 브로슈어</span>
            </span>
          </a>
          <a
            href={BUSINESS_INTRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="partnership-doc-btn partnership-doc-btn--outline partnership-rise"
            data-reveal
            data-reveal-delay="340"
          >
            <FolderDown size={22} strokeWidth={1.8} />
            <span>
              <span className="partnership-doc-btn-en">Business Introduction</span>
              <span className="partnership-doc-btn-kr">비즈니스 소개서</span>
            </span>
          </a>
        </div>

        <div
          className="partnership-contact--footer partnership-fade"
          data-reveal
          data-reveal-delay="480"
        >
          <p className="partnership-contact-title">Contact</p>
          <div className="partnership-contact-row">
            <Mail size={18} strokeWidth={1.8} />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
      </section>
    </>
  );
}
