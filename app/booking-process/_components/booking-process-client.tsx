'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Step = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
};

const STEPS: Step[] = [
  {
    icon: '/booking-process/01-send-your-plan.svg',
    title: 'Send Your Plan',
    description: 'DM WhatsApp · Inquiry form · 1:1 consultation',
  },
  {
    icon: '/booking-process/02-choose-package.svg',
    title: 'Choose Package',
    description: 'We match you with the right photographer',
  },
  {
    icon: '/booking-process/03-sign-contract.svg',
    title: 'Sign Contract',
    description: 'Full terms outlined',
    badge: 'Secure Date',
  },
  {
    icon: '/booking-process/04-pay-deposit.svg',
    title: 'Pay Deposit',
    description:
      '70% deposit to lock in your date within 7 days of the contract signing date',
  },
  {
    icon: '/booking-process/05-planning-and-coordination.svg',
    title: 'Planning & Coordination',
    description: 'We coordinate every detail for you',
  },
  {
    icon: '/booking-process/06-settle-balance.svg',
    title: 'Settle Balance',
    description:
      '30% remaining balance due 7 days prior to the scheduled photoshoot date',
  },
  {
    icon: '/booking-process/07-shoot-and-final-edits.svg',
    title: 'Shoot & Final Edits',
    description:
      'All raw images in 2 weeks. Final edits in 8–9 weeks from selection date.',
  },
];

// ── 스텝 한 개 (아이콘 → 번호 점 → 타이틀 → 설명) ────────────────────
function StepColumn({ step, num }: { step: Step; num: number }) {
  return (
    <div className="inquiry-step-col">
      {step.badge && (
        <span
          className="inquiry-step-badge inquiry-fade"
          data-reveal
          data-reveal-delay={`${(num - 1) * 120 + 260}`}
        >
          {step.badge}
        </span>
      )}
      <div
        className="inquiry-step-icon inquiry-rise"
        data-reveal
        data-reveal-delay={`${(num - 1) * 120}`}
      >
        <Image src={step.icon} alt="" width={36} height={36} />
      </div>
      <div
        className="inquiry-step-dot inquiry-rise"
        data-reveal
        data-reveal-delay={`${(num - 1) * 120 + 60}`}
      >
        {num}
      </div>
      <p
        className="inquiry-step-title inquiry-fade"
        data-reveal
        data-reveal-delay={`${(num - 1) * 120 + 200}`}
      >
        {step.title}
      </p>
      <p
        className="inquiry-step-desc inquiry-fade"
        data-reveal
        data-reveal-delay={`${(num - 1) * 120 + 260}`}
      >
        {step.description}
      </p>
    </div>
  );
}

function StepRow({ steps, startNum }: { steps: Step[]; startNum: number }) {
  return (
    <div className="inquiry-step-row">
      <div className="inquiry-step-line" />
      {steps.map((step, idx) => (
        <StepColumn key={step.title + idx} step={step} num={startNum + idx} />
      ))}
    </div>
  );
}

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
            const timer = window.setTimeout(
              () => target.classList.add('visible'),
              delay,
            );
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

export default function BookingProcessClient() {
  const processRef = useRef<HTMLDivElement>(null);
  useReplayReveal(processRef);
  const searchParams = useSearchParams();
  const brand = searchParams.get('brand');
  const inquiryHref = brand ? `/inquiry?brand=${brand}` : '/inquiry';

  const row1 = STEPS.slice(0, 3);
  const row2 = STEPS.slice(3, 7);

  return (
    <section ref={processRef} className="inquiry-process">
      <p
        className="inquiry-eyebrow inquiry-fade"
        data-reveal
        data-reveal-delay="0"
      >
        LET&apos;S GET STARTED!
      </p>
      <h2
        className="inquiry-heading inquiry-fade"
        data-reveal
        data-reveal-delay="80"
      >
        How to book your slot
      </h2>

      <div className="inquiry-steps">
        <StepRow steps={row1} startNum={1} />
        <StepRow steps={row2} startNum={4} />
      </div>

      <div className="booking-process-actions">
        <Link
          href={inquiryHref}
          className="booking-process-cta"
          // className="booking-process-cta inquiry-rise"
          // data-reveal
          // data-reveal-delay="500"
        >
          Inquiry Now
        </Link>
        <Link
          href="https://calendar.app.google/xekeS5Pgykh9qidHA"
          className="booking-process-cta"
        >
          Book Online Meeting
        </Link>
      </div>
    </section>
  );
}
