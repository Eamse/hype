'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Section } from './types';
import HeroPanel from './hero-panel';
import ProductPanel from './product-panel';
import MagazinePanel from './magazine-panel';

const MENU: { id: Section; label: string; icon: string }[] = [
  { id: 'hero', label: 'Hero Image', icon: '⬛' },
  {
    id: 'Meet our Photographers in Jeju',
    label: 'Meet our Photographers in Jeju',
    icon: '✦',
  },
  {
    id: 'Meet our Photographer in Seoul',
    label: 'Meet our Photographer in Seoul',
    icon: '◈',
  },
  {
    id: 'Casual Photoshoot in Jeju',
    label: 'Casual Photoshoot in Jeju',
    icon: '▲',
  },
  {
    id: 'Casual Photoshoot in Seoul',
    label: 'Casual Photoshoot in Seoul',
    icon: '▲',
  },
  {
    id: 'Magazine',
    label: 'Magazine',
    icon: '▲',
  },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>('hero');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #191919 !important; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* 탑바 */}
      <header
        style={{
          height: 54,
          backgroundColor: '#191919',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '2px' }}>
            HYPE WEDDING
          </span>
          <span style={{ width: 1, height: 14, background: '#444' }} />
          <span style={{ fontSize: 12, color: '#aaa' }}>Admin Panel</span>
        </div>
        <Link
          href="/"
          style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}
        >
          ← Back to site
        </Link>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 */}
        <aside
          style={{
            width: 220,
            backgroundColor: '#fff',
            borderRight: '1px solid #e8e8e8',
            padding: '24px 0',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#bbb',
              letterSpacing: '1.5px',
              padding: '0 20px',
              marginBottom: 10,
            }}
          >
            SECTIONS
          </p>
          {MENU.map((m) => {
            const isActive = m.id === active;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 20px',
                  background: isActive ? '#f5f5f5' : 'transparent',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderLeft: `2.5px solid ${isActive ? '#191919' : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 12 }}>{m.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#191919' : '#555',
                  }}
                >
                  {m.label}
                </span>
              </button>
            );
          })}

          <div
            style={{ margin: '20px 20px 16px', borderTop: '1px solid #f0f0f0' }}
          />
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#bbb',
              letterSpacing: '1.5px',
              padding: '0 20px',
              marginBottom: 8,
            }}
          >
            LINKS
          </p>
          <Link
            href="/"
            style={{
              display: 'block',
              padding: '10px 20px',
              fontSize: 13,
              color: '#555',
              textDecoration: 'none',
            }}
          >
            View Site
          </Link>
        </aside>

        {/* 콘텐츠 */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '36px 44px' }}>
          {active === 'hero' && <HeroPanel />}
          {active === 'Meet our Photographers in Jeju' && (
            <ProductPanel section="Meet our Photographers in Jeju" />
          )}
          {active === 'Meet our Photographer in Seoul' && (
            <ProductPanel section="Meet our Photographer in Seoul" />
          )}
          {active === 'Casual Photoshoot in Jeju' && (
            <ProductPanel section="Casual Photoshoot in Jeju" />
          )}
          {active === 'Casual Photoshoot in Seoul' && (
            <ProductPanel section="Casual Photoshoot in Seoul" />
          )}
          {active === 'Magazine' && <MagazinePanel />}
        </main>
      </div>
    </div>
  );
}
