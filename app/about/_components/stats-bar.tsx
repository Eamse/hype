'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = {
  target: number;
  suffix: string;
  topLabel?: string; // 숫자 위에 작게 표시 ("est")
  label?: string; // 숫자 옆 굵은 라벨 ("Couples")
  sublabel: string; // 아래 설명 텍스트
};

const STATS: Stat[] = [
  { target: 70, suffix: '+', label: 'Couples', sublabel: 'In our first year' },
  {
    target: 16,
    suffix: '',
    label: 'Countries',
    sublabel: 'Chosen by couples worldwide',
  },
  {
    target: 116,
    suffix: '%',
    sublabel: 'Year-over-year revenue growth',
  },
  {
    target: 2025,
    suffix: '',
    topLabel: 'est',
    sublabel: 'Founded Jeju & Seoul, Korea',
  },
];

const DURATION = 1400;

function useCountUp(target: number, start: boolean, delay: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setValue(0); // 뷰포트를 벗어나면 리셋 — 다음에 다시 들어올 때 0부터 재생
      return;
    }
    let raf: number;
    const startTime = performance.now() + delay;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, delay]);

  return value;
}

function StatColumn({
  stat,
  start,
  delay,
}: {
  stat: Stat;
  start: boolean;
  delay: number;
}) {
  const value = useCountUp(stat.target, start, delay);

  return (
    <div className="flex-none flex flex-col items-start text-left">
      {/* 모든 컬럼에 동일한 높이를 예약해서 숫자 줄 baseline을 맞춤 */}
      <p className="text-[clamp(0.85rem,1.4vw,1rem)] font-bold italic mb-0.5 h-6 leading-6">
        {stat.topLabel ?? ' '}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold italic tracking-tight">
          {value}
          {stat.suffix}
        </span>
        {stat.label && (
          <span className="text-[clamp(1.15rem,2.3vw,1.5rem)] font-bold italic">
            {stat.label}
          </span>
        )}
      </div>
      <p className="text-[clamp(0.85rem,1.4vw,1rem)] text-gray-500 mt-2 leading-snug">
        {stat.sublabel}
      </p>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center md:flex-row md:items-center md:justify-around md:gap-x-15 md:px-25 py-20"
    >
      {STATS.flatMap((stat, idx) => [
        // 모든 항목이 같은 flex 컨테이너의 직속 형제라서 gap이 구분선 양옆에
        // 똑같이 적용됨 — 그래서 두 텍스트 사이 정중앙에 옴
        idx > 0 && (
          <span
            key={`divider-${stat.sublabel}`}
            className="hidden md:block w-px self-stretch bg-black"
          />
        ),
        <StatColumn key={stat.sublabel} stat={stat} start={visible} delay={0} />,
      ])}
    </div>
  );
}
