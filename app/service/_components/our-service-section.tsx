'use client';

import { useRef, type ReactNode } from 'react';
import { useScrollReveal } from './use-scroll-reveal';

type ServiceColumn = {
  title: string;
  tagline: ReactNode;
  bulleted: boolean;
  items: { text: string; note?: string }[];
  footnote?: string;
};

const SERVICES: ServiceColumn[] = [
  {
    title: 'Photography',
    tagline: (
      <>
        Korea&apos;s most sought-after photographers,
        <br />
        in Jeju and Seoul&apos;s most iconic spots
      </>
    ),
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
    tagline: 'Complete styling — nothing to prepare',
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
    tagline: 'Full English support, every step of the way',
    bulleted: true,
    items: [
      { text: 'Interpreter & stylist on shoot day' },
      { text: 'Private van on shoot day' },
      { text: 'Lunch & snacks will be prepared on shoot day' },
      { text: 'Planning from inquiry to final edits delivery' },
    ],
  },
  {
    title: 'Add-ons',
    tagline: 'Make it even more yours',
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
const TAGLINE_OFFSET = 150;
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
            <p
              id="service-details"
              data-offer-reveal
              className="offer-number offer-fade"
            >
              02
            </p>
            <p data-offer-reveal className="offer-eyebrow offer-fade">
              OUR SERVICES
            </p>
          </>
        )}
        {!showHeader && (
          <h2 data-offer-reveal className="offer-headline offer-fade">
            Our Service
          </h2>
        )}
      </div>

      <div className="service-grid">
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
                {service.title}
              </h3>
              <p
                data-offer-reveal
                data-offer-reveal-delay={base + TAGLINE_OFFSET}
                className="service-col-tagline offer-fade"
              >
                &quot;{service.tagline}&quot;
              </p>
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
                      <div className="service-col-note">{item.note}</div>
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
