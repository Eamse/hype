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
const STAGGER = 150;

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

function StatColumn({ stat, start, delay }: { stat: Stat; start: boolean; delay: number }) {
  const value = useCountUp(stat.target, start, delay);

  return (
    <div className="flex-1 px-6 last:pr-0">
      {/* 모든 컬럼에 동일한 높이를 예약해서 숫자 줄 baseline을 맞춤 */}
      <p className="text-base font-bold italic mb-0.5 h-6 leading-6">
        {stat.topLabel ?? ' '}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl md:text-6xl font-bold italic tracking-tight">
          {value}
          {stat.suffix}
        </span>
        {stat.label && (
          <span className="text-xl md:text-2xl font-bold italic">
            {stat.label}
          </span>
        )}
      </div>
      <p className="text-base text-gray-500 mt-2 leading-snug">{stat.sublabel}</p>
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
      className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black/15 py-20"
    >
      {STATS.map((stat, idx) => (
        <StatColumn
          key={stat.sublabel}
          stat={stat}
          start={visible}
          delay={idx * STAGGER}
        />
      ))}
    </div>
  );
}
