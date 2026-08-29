'use client';

import { useRef } from 'react';
import { useScrollReveal } from './use-scroll-reveal';

const STEPS = [
  {
    step: 'STEP 01',
    title: 'Before the Shoot',
    items: [
      'Styling preparation',
      'Shoot-location confirmed with photographer',
    ],
    emphasis: false,
  },
  {
    step: 'STEP 02',
    title: 'The Day Before',
    items: ['Suit fitting', 'Itinerary confirmed'],
    emphasis: false,
  },
  {
    step: 'STEP 03',
    title: 'Shoot Day',
    items: ['Hair & Make-up for bride and groom', 'Dress fitting', 'Shoot'],
    emphasis: true,
  },
];

export default function ShootScheduleSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef, 0.3);

  return (
    <div ref={rootRef} className="offer-page">
      <div className="offer-header">
        <p data-offer-reveal className="offer-number offer-fade">
          03
        </p>
        <p data-offer-reveal className="offer-eyebrow offer-fade">
          SERVICE DETAILS
        </p>
        <h2 data-offer-reveal className="offer-headline offer-fade">
          Shoot Schedule
        </h2>
      </div>

      <div className="schedule-cards">
        {STEPS.map((s, idx) => (
          <div
            key={s.step}
            data-offer-reveal
            data-offer-reveal-delay={idx * 150}
            className={`schedule-card card-pop${s.emphasis ? ' schedule-card--emphasis' : ''}`}
          >
            <p className="schedule-card-step">{s.step}</p>
            <h3 className="schedule-card-title">{s.title}</h3>
            <ul className="schedule-card-list">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p
        data-offer-reveal
        data-offer-reveal-delay={STEPS.length * 150 + 200}
        className="schedule-cta offer-fade"
      >
        Shoot day timeline
        <span className="schedule-cta-arrow">↓</span>
      </p>
    </div>
  );
}
