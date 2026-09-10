'use client';
import { useEffect, useRef, useState } from 'react';
type Stat = {
  target: number;
  suffix: string;
  topLabel?: string;
  label?: string;
  sublabel: string;
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
      setValue(0);
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, delay]);
  return value;
}
const DIVIDER_CLASSES = [
  'border-b border-black pb-8 lg:border-b-0 lg:pb-0 lg:px-8',
  'border-b border-black pb-8 lg:border-b-0 lg:pb-0 lg:px-8',
  'border-b border-black pb-8 sm:border-b-0 sm:pb-0 lg:px-8',
  'lg:px-8',
];
function StatColumn({
  stat,
  start,
  delay,
  dividerClass,
  showDivider,
}: {
  stat: Stat;
  start: boolean;
  delay: number;
  dividerClass: string;
  showDivider: boolean;
}) {
  const value = useCountUp(stat.target, start, delay);
  const classes = `relative flex-1 min-w-0 flex flex-col items-center text-center ${dividerClass}`;
  return (
    <div className={classes}>
      {showDivider && (
        <span className="hidden lg:block absolute top-0 bottom-0 right-[-30px] w-px bg-black" />
      )}
      <div className="inline-flex flex-col items-center">
        <div className="h-[clamp(1.5rem,2.7vw,2rem)] w-full flex items-end">
          <span
            className={`text-[clamp(1.15rem,2.3vw,1.5rem)] font-bold italic leading-none mb-[-10px] ${stat.topLabel ? '' : 'invisible'}`}
          >
            {stat.topLabel ?? 'x'}
          </span>
        </div>
        <div className="flex items-baseline gap-2 self-start">
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-15 items-center justify-items-center lg:justify-items-stretch lg:px-2 py-20"
    >
      {STATS.map((stat, idx) => (
        <StatColumn
          key={stat.sublabel}
          stat={stat}
          start={visible}
          delay={0}
          dividerClass={DIVIDER_CLASSES[idx]}
          showDivider={idx < STATS.length - 1}
        />
      ))}
    </div>
  );
}
