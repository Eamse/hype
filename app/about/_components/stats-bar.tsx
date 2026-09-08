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

// 그리드가 1열(모바일)→2열(sm)→4열(lg)로 바뀔 때, 각 항목이 실제로 그리드
// 안 어디(몇 번째 행/열)에 있는지에 따라 필요한 구분선이 다름 — 인덱스별로
// "base(1열)/sm(2열)/lg(4열)" 각 단계에서 오른쪽·아래쪽 선이 있어야 하는지
// 직접 계산해서 넣음 (범용 prop 하나로는 2x2 레이아웃의 위치를 표현 못 함)
const DIVIDER_CLASSES = [
  // idx0 (70+): 1열·2열에서는 아래 이웃과 구분(border-b), 2열에서는 오른쪽
  // 이웃과도 구분(border-r) — 4열에서는 오른쪽 선만 남기고 아래 선은 제거
  'border-b border-black pb-8 sm:border-r sm:pr-8 lg:border-b-0 lg:pb-0',
  // idx1 (16 Countries): 1열·2열에서는 아래 이웃과 구분 — 4열에서는 오른쪽
  // 이웃과 구분으로 전환
  'border-b border-black pb-8 lg:border-b-0 lg:pb-0 lg:border-r lg:pr-8',
  // idx2 (116%): 1열에서는 아래 이웃과 구분 — 2열부터는 같은 행 마지막 줄이 아니라
  // 오른쪽 이웃(2025)과 구분되므로 아래 선은 빼고 오른쪽 선을 넣음
  'border-b border-black pb-8 sm:border-b-0 sm:pb-0 sm:border-r sm:pr-8',
  // idx3 (2025): 항상 마지막이라 구분선 없음
  '',
];

function StatColumn({
  stat,
  start,
  delay,
  dividerClass,
}: {
  stat: Stat;
  start: boolean;
  delay: number;
  dividerClass: string;
}) {
  const value = useCountUp(stat.target, start, delay);
  const classes = `flex-1 min-w-0 flex flex-col items-start text-left ${dividerClass}`;

  return (
    <div className={classes}>
      {/* 모든 컬럼에 동일한 높이를 예약해서 숫자 줄 baseline을 맞춤 */}
      <p className="text-[clamp(0.85rem,1.4vw,1rem)] font-bold italic mb-0.5 h-6 leading-6">
        {stat.topLabel ?? ' '}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-[clamp(60px,3vw,96px)] font-bold italic tracking-tight">
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-15 items-center justify-items-center lg:px-25 py-20"
    >
      {STATS.map((stat, idx) => (
        <StatColumn
          key={stat.sublabel}
          stat={stat}
          start={visible}
          delay={0}
          dividerClass={DIVIDER_CLASSES[idx]}
        />
      ))}
    </div>
  );
}
