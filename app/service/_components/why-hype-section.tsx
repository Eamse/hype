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
    return (<div ref={rootRef} className="offer-page">
      <div className="offer-header">
        <p id="why-us" data-offer-reveal className="offer-eyebrow type-eyebrow offer-fade">
          WHY HYPE WEDDING
        </p>
      </div>

      <div className="offer-items-grid">
        {ITEMS.map((item, idx) => {
            const rowDelay = Math.floor(idx / 2) * 200;
            return (<div key={item.title} className="offer-item">
              <h3 data-offer-reveal data-offer-reveal-delay={rowDelay} className="offer-item-title type-section-header offer-rise">
                {item.title}
              </h3>
              <p data-offer-reveal data-offer-reveal-delay={rowDelay + 150} className="offer-item-subtitle type-body offer-fade">
                {item.subtitle}
              </p>
            </div>);
        })}
      </div>
    </div>);
}
