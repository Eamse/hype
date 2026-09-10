import { useEffect, type RefObject } from 'react';
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>, threshold = 0.4) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const targets = root.querySelectorAll<HTMLElement>('[data-offer-reveal]');
        const timerMap = new Map<Element, number>();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const existing = timerMap.get(target);
                if (existing)
                    clearTimeout(existing);
                if (entry.isIntersecting) {
                    const delay = Number(target.dataset.offerRevealDelay ?? 0);
                    const t = window.setTimeout(() => target.classList.add('visible'), delay);
                    timerMap.set(target, t);
                }
                else {
                    target.classList.remove('visible');
                }
            });
        }, { threshold });
        targets.forEach((target) => observer.observe(target));
        return () => {
            observer.disconnect();
            timerMap.forEach((t) => clearTimeout(t));
        };
    }, [rootRef, threshold]);
}
