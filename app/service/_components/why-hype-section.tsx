'use client';

import { useRef } from 'react';
import { useScrollReveal } from './use-scroll-reveal';

const ITEMS = [
  {
    title: 'Photographers',
    subtitle: "Korea's most in-demand wedding photographers",
  },
  {
    title: 'On-Day Support',
    subtitle: "You won't feel lost for a second",
  },
  {
    title: 'Transparency',
    subtitle: 'Everything upfront, No surprises',
  },
  {
    title: 'All-Inclusive',
    subtitle: 'One booking, Everything handled',
  },
];

export default function WhyHypeSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef} className="offer-page">
      <div className="offer-header">
        <p id="why-us" data-offer-reveal className="offer-number offer-fade">
          01
        </p>
        <p data-offer-reveal className="offer-eyebrow offer-fade">
          WHY HYPE WEDDING?
        </p>
        <h2 data-offer-reveal className="offer-headline offer-fade">
          What makes us different
        </h2>
      </div>

      <div className="offer-items-grid">
        {ITEMS.map((item, idx) => {
          // 2열 그리드라 같은 행(0,1행)끼리 같이 등장하고, 다음 행은 그 뒤에 이어서 등장
          const rowDelay = Math.floor(idx / 2) * 200;
          return (
            <div key={item.title} className="offer-item">
              <h3
                data-offer-reveal
                data-offer-reveal-delay={rowDelay}
                className="offer-item-title offer-rise"
              >
                {item.title}
              </h3>
              <p
                data-offer-reveal
                data-offer-reveal-delay={rowDelay + 150}
                className="offer-item-subtitle offer-fade"
              >
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
