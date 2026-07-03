'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect, useRef } from 'react';

// ── Google Form URLs ──────────────────────────────────────────────
const WEDDING_FORM_URL = 'https://forms.gle/oJu6ZPBdhiLWaELDA'; // 웨딩
const SNAP_FORM_URL = 'https://forms.gle/3sWqu4NED5ruJEnN9'; // 스냅

const STEPS = [
  {
    icon: <InquiryIcon />,
    title: 'Submit your Inquiry',
    bullets: [
      'Fill out inquiry form',
      'Tell us preferred dates',
      'Receive initial info',
    ],
  },
  {
    icon: <ConsultIcon />,
    title: 'Free Consultation',
    tag: 'Optional',
    bullets: ['Discuss your vision', 'Review portfolios', 'Get detailed quote'],
  },
  {
    icon: <ContractIcon />,
    title: 'Booking Confirmation',
    bullets: ['Sign contract', 'Pay 70% deposit', 'Get confirmation'],
  },
  {
    icon: <PrepIcon />,
    title: 'Pre-Shoot Preparation',
    bullets: [
      'Final consultation',
      'Confirm weather plans',
      'Share detailed schedule',
      'Complete payment (1 week before)',
    ],
  },
  {
    icon: <CameraIcon />,
    title: 'Shoot Day & Delivery',
    bullets: [
      'Professional shoot',
      'Edited photos in 8-9 weeks',
      'Download via shared cloud',
      'Complete payment (1 week before)',
    ],
  },
];

// ── 아이콘 ────────────────────────────────────────────────────────
function InquiryIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#191919"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function ConsultIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#191919"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ContractIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#191919"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="9 16 11 18 15 14" />
    </svg>
  );
}
function PrepIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#191919"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#191919"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#bbb"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── 스텝 카드 ─────────────────────────────────────────────────────
function StepCard({
  step,
  num,
}: {
  step: (typeof STEPS)[number];
  num: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {step.icon}
        {step.tag && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#888',
            }}
          >
            ({step.tag})
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: '#191919',
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        STEP {num} | {step.title}
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 auto',
          width: 'fit-content',
        }}
      >
        {step.bullets.map((b) => (
          <li
            key={b}
            style={{
              fontSize: 16,
              color: '#555',
              lineHeight: 1.9,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ marginTop: 3, flexShrink: 0 }}>•</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────
export default function InquiryClient() {
  const isMobile = useIsMobile();

  // B) 타이핑 효과
  const FULL_TEXT = 'INQUIRY';
  const [typed, setTyped] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTyped(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) clearInterval(timer);
    }, 110);
    return () => clearInterval(timer);
  }, []);

  // D) 버튼 hover
  const [hovered, setHovered] = useState<'wedding' | 'snap' | null>(null);

  // A) 히어로 섹션 fade-up
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.inquiry-fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  // A+C) 스텝 섹션 순차 등장
  const stepsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.inquiry-step');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((card, idx) => {
              setTimeout(() => card.classList.add('visible'), idx * 150);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const row1 = STEPS.slice(0, 3);
  const row2 = STEPS.slice(3, 5);

  return (
    <>
      {/* ── 히어로 ── */}
      <section
        ref={heroRef}
        style={{
          minHeight: isMobile ? '20vh' : '30vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isMobile ? '60px 24px' : '40px',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        {/* 서브 레이블 */}
        <p
          className="inquiry-fade-up"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#767676',
            marginBottom: 20,
            animationDelay: '0.1s',
          }}
        >
          Book Your Session
        </p>

        {/* B) 타이핑 타이틀 */}
        <h1
          style={{
            fontSize: isMobile ? 48 : 80,
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#191919',
            lineHeight: 1,
            marginBottom: 20,
            minWidth: isMobile ? 240 : 420,
          }}
        >
          {typed}
          <span
            className="cursor-blink"
            style={{
              display: 'inline-block',
              width: 3,
              height: isMobile ? 44 : 72,
              backgroundColor: '#191919',
              marginLeft: 4,
              verticalAlign: 'middle',
            }}
          />
        </h1>

        {/* <p
          className="inquiry-fade-up"
          style={{
            fontSize: isMobile ? 14 : 16,
            color: '#777',
            lineHeight: 1.7,
            maxWidth: 480,
            marginBottom: 48,
            animationDelay: '0.8s',
          }}
        >
          Choose your session type and fill out the form.
          <br />
          We will be in touch within 1–2 business days.
        </p> */}

        {/* D) hover 버튼 */}
        <div
          className="inquiry-fade-up"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16,
            width: isMobile ? '100%' : 'auto',
            animationDelay: '1s',
          }}
        >
          <a
            href={WEDDING_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered('wedding')}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: isMobile ? '18px 32px' : '20px 48px',
              backgroundColor: hovered === 'wedding' ? '#fff' : '#191919',
              color: hovered === 'wedding' ? '#191919' : '#fff',
              border: '1.5px solid #191919',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderRadius: 4,
              textDecoration: 'none',
              width: isMobile ? '100%' : 'auto',
              transition: 'background-color 0.25s ease, color 0.25s ease',
            }}
          >
            HYPE WEDDING
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href={SNAP_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered('snap')}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: isMobile ? '18px 32px' : '20px 48px',
              backgroundColor: hovered === 'snap' ? '#191919' : '#fff',
              color: hovered === 'snap' ? '#fff' : '#191919',
              border: '1.5px solid #191919',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderRadius: 4,
              textDecoration: 'none',
              width: isMobile ? '100%' : 'auto',
              transition: 'background-color 0.25s ease, color 0.25s ease',
            }}
          >
            HYPE SNAP
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          backgroundColor: '#f5f5f5',
          padding: isMobile ? '20px 24px 80px' : '20px 60px 100px',
        }}
      >
        <p
          className="inquiry-fade-up"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#767676',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          Booking Process
        </p>
        <h2
          className="inquiry-fade-up"
          style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: 800,
            color: '#191919',
            textAlign: 'center',
            letterSpacing: '-0.5px',
            animationDelay: '0.15s',
          }}
        >
          How It Works
        </h2>

        {/* C) 스텝 순차 등장 */}
        <div ref={stepsRef} style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* 1행 */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: isMobile ? 40 : 0,
              marginBottom: isMobile ? 0 : 60,
            }}
          >
            {row1.map((step, idx) => (
              <div
                key={step.title}
                className="inquiry-step"
                style={{
                  display: 'flex',
                  // flex: 1,
                  alignItems: 'flex-start',

                  minWidth: 0,
                  transitionDelay: `${idx * 0.15}s`,
                }}
              >
                <StepCard step={step} num={idx + 1} />
                {idx < row1.length - 1 && !isMobile && (
                  <div
                    style={{ flexShrink: 0, paddingTop: 20, margin: '0 8px' }}
                  >
                    <ChevronRight />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2행 */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-evenly',
              gap: isMobile ? 40 : 0,
              marginTop: isMobile ? 40 : 0,
            }}
          >
            {row2.map((step, idx) => (
              <div
                key={step.title}
                className="inquiry-step"
                style={{
                  display: 'flex',
                  // flex: isMobile ? 1 : '0 0 calc(33.33% + 28px)',
                  alignItems: 'flex-start',
                  minWidth: 0,
                  transitionDelay: `${(idx + 3) * 0.15}s`,
                }}
              >
                <StepCard step={step} num={idx + 4} />
                {idx < row2.length - 1 && !isMobile && (
                  <div
                    style={{ flexShrink: 0, paddingTop: 20, margin: '0 8px' }}
                  >
                    <ChevronRight />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
