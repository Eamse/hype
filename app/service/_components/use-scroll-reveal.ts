import { useEffect, type RefObject } from 'react';

/**
 * root 안의 [data-offer-reveal] 요소들을 관찰해서,
 * 뷰포트에 들어오면 delay(data-offer-reveal-delay, ms)만큼 지연 후 'visible' 클래스를 붙이고,
 * 벗어나면 즉시 리셋한다 — 다시 스크롤해 들어올 때마다 애니메이션이 재생됨.
 */
export function useScrollReveal(
  rootRef: RefObject<HTMLElement | null>,
  threshold = 0.4,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('[data-offer-reveal]');
    const timerMap = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const existing = timerMap.get(target);
          if (existing) clearTimeout(existing);

          if (entry.isIntersecting) {
            const delay = Number(target.dataset.offerRevealDelay ?? 0);
            const t = window.setTimeout(
              () => target.classList.add('visible'),
              delay,
            );
            timerMap.set(target, t);
          } else {
            target.classList.remove('visible');
          }
        });
      },
      { threshold },
    );

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      timerMap.forEach((t) => clearTimeout(t));
    };
  }, [rootRef, threshold]);
}
