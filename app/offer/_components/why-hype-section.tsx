'use client';

import { useRef } from 'react';
import { useScrollReveal } from './use-scroll-reveal';

const ITEMS = [
  {
    title: 'Photographers',
    subtitle: "Korea's most in-demand wedding photographers",
  },
  {
    title: 'Transparency',
    subtitle: 'Everything upfront. No surprises.',
  },
  {
    title: 'On-Day Support',
    subtitle: "You won't feel lost for a second.",
  },
  {
    title: 'All-Inclusive',
    subtitle: 'One booking. Everything handled.',
  },
];

export default function WhyHypeSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef} className="offer-page">
      <div className="offer-header">
        <p data-offer-reveal className="offer-number offer-fade">
          01
        </p>
        <p data-offer-reveal className="offer-eyebrow offer-fade">
          WHY HYPE WEDDING?
        </p>
        <h2 data-offer-reveal className="offer-headline offer-fade">
          What makes us different
        </h2>
      </div>

      {ITEMS.map((item) => (
        <div key={item.title} className="offer-item">
          <h3
            data-offer-reveal
            className="offer-item-title offer-rise"
          >
            {item.title}
          </h3>
          <p
            data-offer-reveal
            data-offer-reveal-delay="150"
            className="offer-item-subtitle offer-fade"
          >
            {item.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
