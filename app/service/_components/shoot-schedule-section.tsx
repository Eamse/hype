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
    {
        step: 'STEP 04',
        title: 'Delivery',
        items: [
            'All raw images in 2 weeks',
            'Final edits in 8-9 weeks from selection date',
        ],
        emphasis: false,
    },
];
export default function ShootScheduleSection() {
    const rootRef = useRef<HTMLDivElement>(null);
    useScrollReveal(rootRef, 0.3);
    return (<div ref={rootRef} className="offer-page">
      <div className="offer-header">
        <p id="shoot-timeline" data-offer-reveal className="offer-eyebrow type-eyebrow offer-fade">
          PRE-WEDDING SHOOT TIMELINE
        </p>
      </div>

      <div className="schedule-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-15 gap-y-10 items-stretch justify-items-stretch lg:px-2">
        {STEPS.map((s, idx) => (<div key={s.step} data-offer-reveal data-offer-reveal-delay={idx * 150} className={`schedule-card card-pop${s.emphasis ? ' schedule-card--emphasis' : ''}`}>
            <p className="schedule-card-step">{s.step}</p>
            <h3 className="schedule-card-title type-body-large-schedule">{s.title}</h3>
            <ul className="schedule-card-list">
              {s.items.map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </div>))}
      </div>

      <p data-offer-reveal data-offer-reveal-delay={STEPS.length * 150 + 200} className="schedule-cta type-body-large-schedule offer-fade">
        Shoot day Schedule
        <span className="schedule-cta-arrow">↓</span>
      </p>
    </div>);
}
