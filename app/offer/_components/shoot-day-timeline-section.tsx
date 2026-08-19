'use client';

import { useRef } from 'react';
import { useScrollReveal } from './use-scroll-reveal';

const SUMMER_TIMES = [
  '10:30AM',
  '1:50PM',
  '3:30PM',
  '5:00PM',
  '6:30PM',
  '7:30PM',
];
const WINTER_TIMES = [
  '8:30AM',
  '12:50PM',
  '1:30PM',
  '3:00PM',
  '4:30PM',
  '6:30PM',
];

const BOXES = [
  {
    title: 'Preparation Session',
    desc: 'Hair, make-up, dress & suit fitting. Bouquet delivered to shop.',
  },
  { title: 'Travel to 1st shoot spot', desc: '' },
  {
    title: '1st Shoot',
    desc: '4–5 hrs total, incl. travel and outfit changes.',
  },
  { title: '2nd Shoot', desc: '' },
  { title: '3rd Shoot / Sunset', desc: '' },
  {
    title: 'Finish!',
    desc: 'Interpreter returns the rental suit.',
    finish: true,
  },
];

const FOOTNOTES = [
  'Interpreter and stylist accompany throughout the shoot.',
  'Pickup & drop-off included within our service area. (Only Jeju applicable)',
  'Shoots reschedule in case of inclement weather, with advance notice.',
];

// 위쪽(봄여름) 점 → 박스 → 아래쪽(가을겨울) 점 순서로 좌→우 시차 등장
const DOT_STAGGER = 80;
const SUMMER_DOTS_END = (SUMMER_TIMES.length - 1) * DOT_STAGGER;
const BOX_BASE = SUMMER_DOTS_END + 200;
const BOX_STAGGER = 100;
const BOX_END = BOX_BASE + (BOXES.length - 1) * BOX_STAGGER;
const WINTER_BASE = BOX_END + 200;

export default function ShootDayTimelineSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef, 0.15);

  return (
    <div ref={rootRef} className="offer-page">
      <div className="timeline-wrap">
        {/* 상단: Spring–Summer */}
        <div className="timeline-row">
          <p
            data-offer-reveal
            data-offer-reveal-delay={0}
            className="timeline-label timeline-label--summer offer-fade"
          >
            Spring–Summer
            <span className="timeline-label-sub"> (Mar–Aug)</span>
          </p>
          {SUMMER_TIMES.map((t, idx) => (
            <p
              key={t}
              data-offer-reveal
              data-offer-reveal-delay={idx * DOT_STAGGER}
              className="timeline-time offer-fade"
            >
              {t}
            </p>
          ))}
        </div>

        <div className="timeline-line-row">
          <div className="timeline-connector-line" />
          {SUMMER_TIMES.map((t, idx) => (
            <div
              key={t}
              className="timeline-dot-cell"
              style={{ gridColumn: idx + 2 }}
            >
              <span
                data-offer-reveal
                data-offer-reveal-delay={idx * DOT_STAGGER}
                className="timeline-dot offer-fade"
              />
            </div>
          ))}
        </div>

        {/* 중앙: 6개 스텝 박스 */}
        <div className="timeline-boxes">
          <div />
          {BOXES.map((box, idx) => (
            <div
              key={box.title}
              data-offer-reveal
              data-offer-reveal-delay={BOX_BASE + idx * BOX_STAGGER}
              className={`timeline-box${box.finish ? ' timeline-box--finish card-pop' : ' offer-rise'}`}
            >
              <p className="timeline-box-title">{box.title}</p>
              {box.desc && <p className="timeline-box-desc">{box.desc}</p>}
            </div>
          ))}
        </div>

        <div className="timeline-line-row">
          <div className="timeline-connector-line timeline-connector-line--winter" />
          {WINTER_TIMES.map((t, idx) => (
            <div
              key={t}
              className="timeline-dot-cell"
              style={{ gridColumn: idx + 2 }}
            >
              <span
                data-offer-reveal
                data-offer-reveal-delay={WINTER_BASE + idx * DOT_STAGGER}
                className="timeline-dot timeline-dot--winter offer-fade"
              />
            </div>
          ))}
        </div>

        {/* 하단: Fall–Winter */}
        <div className="timeline-row">
          <p
            data-offer-reveal
            data-offer-reveal-delay={WINTER_BASE}
            className="timeline-label timeline-label--winter offer-fade"
          >
            Fall–Winter
            <span className="timeline-label-sub"> (Sep–Feb)</span>
          </p>
          {WINTER_TIMES.map((t, idx) => (
            <p
              key={t}
              data-offer-reveal
              data-offer-reveal-delay={WINTER_BASE + idx * DOT_STAGGER}
              className="timeline-time timeline-time--winter offer-fade"
            >
              {t}
            </p>
          ))}
        </div>

        <ul className="timeline-footnotes">
          {FOOTNOTES.map((f) => (
            <li key={f}>* {f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
