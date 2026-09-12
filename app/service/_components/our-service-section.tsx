'use client';
import { useRef } from 'react';
import { useScrollReveal } from './use-scroll-reveal';
type ServiceColumn = {
  title: string;
  bulleted: boolean;
  items: {
    text: string;
    note?: string;
    noteAccent?: boolean;
  }[];
  footnote?: string;
};
const SERVICES: ServiceColumn[] = [
  {
    title: 'Photography',
    bulleted: true,
    items: [
      { text: '4–5 hrs · 3–4 locations' },
      { text: '1,000+ original photos' },
      { text: '30+ final edits' },
      { text: 'Free weather rescheduling (one-time)' },
    ],
  },
  {
    title: 'Styling',
    bulleted: true,
    items: [
      { text: 'Hair & Make-up for bride and groom' },
      { text: 'Designer Dresses' },
      { text: 'Tailored Suits' },
      { text: 'Fresh bouquet' },
      { text: 'Full accessories' },
    ],
  },
  {
    title: 'Support',
    bulleted: true,
    items: [
      {
        text: 'Planning from inquiry to final edits delivery',
        note: 'On shoot day ↓',
        noteAccent: true,
      },
      { text: 'Interpreter & stylist on shoot day' },
      { text: 'Private van on shoot day' },
      { text: 'Lunch & snacks will be prepared on shoot day' },
    ],
  },
  {
    title: 'Add-ons',
    bulleted: true,
    items: [
      { text: 'Videography' },
      { text: 'Indoor studio session' },
      { text: 'Additional styling' },
    ],
    footnote: '*Airfare & accommodation not included',
  },
];
const COL_STAGGER = 150;
const TITLE_OFFSET = 0;
const LIST_OFFSET = 300;
export default function OurServiceSection({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef, 0.2);
  return (
    <div ref={rootRef} className="offer-page">
      <div className="offer-header">
        {showHeader && (
          <>
            <p id="service-details" data-offer-reveal className="offer-eyebrow type-eyebrow offer-fade">
              OUR SERVICES
            </p>
          </>
        )}
        {!showHeader && (
          <h2 data-offer-reveal className="offer-headline type-subheadline offer-fade">
            Our Service
          </h2>
        )}
      </div>

      <div className="service-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-15 gap-y-10 items-stretch justify-items-stretch lg:px-2">
        {SERVICES.map((service, idx) => {
          const base = idx * COL_STAGGER;
          return (
            <div key={service.title} className="service-col">
              {idx > 0 && (
                <span
                  data-offer-reveal
                  data-offer-reveal-delay={Math.max(base - 50, 0)}
                  className="service-divider offer-fade"
                />
              )}
              <h3
                data-offer-reveal
                data-offer-reveal-delay={base + TITLE_OFFSET}
                className="service-col-title offer-rise"
              >
                <span className="service-col-title-badge type-body-large-service-col">{service.title}</span>
              </h3>
              <ul
                data-offer-reveal
                data-offer-reveal-delay={base + LIST_OFFSET}
                className={`service-col-list offer-fade${service.bulleted ? ' bulleted' : ''}`}
              >
                {service.items.map((item) => (
                  <li key={item.text}>
                    {item.text.startsWith('H&MU') ? (
                      <>
                        <u>H&MU</u>
                        {item.text.slice('H&MU'.length)}
                      </>
                    ) : (
                      item.text
                    )}
                    {item.note && (
                      <div
                        className={`service-col-note${item.noteAccent ? ' service-col-note--accent' : ''}`}
                      >
                        {item.note}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {service.footnote && (
                <p
                  data-offer-reveal
                  data-offer-reveal-delay={base + LIST_OFFSET + 100}
                  className="service-col-note offer-fade"
                  style={{ marginTop: 5 }}
                >
                  {service.footnote}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
