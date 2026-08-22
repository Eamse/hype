'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

// ── Google Form URLs ──────────────────────────────────────────────
const WEDDING_FORM_URL = 'https://forms.gle/oJu6ZPBdhiLWaELDA'; // 웨딩
const SNAP_FORM_URL = 'https://forms.gle/3sWqu4NED5ruJEnN9'; // 스냅

// ── 스크롤 재등장 훅: 섹션 전체가 아니라 [data-reveal] 요소 각각을 개별 관찰한다.
// 섹션이 뷰포트보다 커서 "섹션 전체 threshold" 방식으로는 진입/이탈이 제대로 안 잡히기 때문.
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

export default function InquiryClient() {
  const ctaRef = useRef<HTMLDivElement>(null);
  useReplayReveal(ctaRef);

  return (
    <section ref={ctaRef} className="inquiry-cta">
      <p className="inquiry-eyebrow inquiry-fade" data-reveal data-reveal-delay="0">
        YOUR NEXT STEP
      </p>
      <h2 className="inquiry-heading inquiry-fade" data-reveal data-reveal-delay="200">
        Start your Inquiry
      </h2>
      <p className="inquiry-cta-body inquiry-fade" data-reveal data-reveal-delay="320">
        Choose your session type and fill out the form.
        <br />
        We will be in touch within 1–2 business days.
      </p>
      <div className="inquiry-cta-buttons">
        <a
          href={WEDDING_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inquiry-btn inquiry-btn--filled inquiry-rise"
          data-reveal
          data-reveal-delay="440"
        >
          HYPE WEDDING
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
        <a
          href={SNAP_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inquiry-btn inquiry-btn--outline inquiry-rise"
          data-reveal
          data-reveal-delay="440"
        >
          HYPE SNAP
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}
