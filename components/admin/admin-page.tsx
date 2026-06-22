'use client';

import { useState, useEffect, Suspense } from 'react';
import React from 'react';
import Link from 'next/link';
import { type Section } from './types';
import DashboardPanel from './dashboard-panel';
import HeroPanel from './hero-panel';
import ProductPanel from './product-panel';
import MagazinePanel from './magazine-panel';
import { useRouter, useSearchParams } from 'next/navigation';

const IconDashboard = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconImage = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconCamera = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconMapPin = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconBook = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const MENU: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { id: 'hero', label: 'Hero Image', icon: <IconImage /> },
  {
    id: 'Meet our Photographers in Jeju',
    label: 'Photographers · Jeju',
    icon: <IconCamera />,
  },
  {
    id: 'Meet our Photographer in Seoul',
    label: 'Photographers · Seoul',
    icon: <IconCamera />,
  },
  {
    id: 'Casual Photoshoot in Jeju',
    label: 'Casual · Jeju',
    icon: <IconMapPin />,
  },
  {
    id: 'Casual Photoshoot in Seoul',
    label: 'Casual · Seoul',
    icon: <IconMapPin />,
  },
  { id: 'Magazine', label: 'Magazine', icon: <IconBook /> },
];

export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = (searchParams.get('tab') as Section) ?? 'dashboard';
  const setActive = (section: Section) => {
    router.push(`/admin?tab=${encodeURIComponent(section)}`);
  };
  const [admin, setAdmin] = useState<{ loginId: string; role: string } | null>(
    null,
  );
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  };

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => setAdmin(data));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5e6e8 0%, #e8d5d8 30%, #d4b8c7 60%, #c9a0b4 100%)',
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #c9956a !important; box-shadow: 0 0 0 3px rgba(201,149,106,0.18) !important; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        .admin-menu-btn:hover { background: rgba(201,149,106,0.12) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(180,120,140,0.35); border-radius: 4px; }
      `}</style>

      {/* 정적 하트 데코 */}
      {[
        { top: '8%',  left: '4%',   size: 32, color: 'rgba(220,60,100,0.5)'  },
        { top: '15%', right: '6%',  size: 20, color: 'rgba(200,80,130,0.45)' },
        { top: '65%', left: '3%',   size: 26, color: 'rgba(230,90,140,0.5)'  },
        { top: '72%', right: '5%',  size: 40, color: 'rgba(180,40,90,0.45)'  },
        { top: '42%', right: '2%',  size: 16, color: 'rgba(215,70,115,0.5)'  },
        { top: '3%',  left: '48%',  size: 13, color: 'rgba(240,100,150,0.45)'},
        { top: '52%', left: '1%',   size: 18, color: 'rgba(190,50,95,0.5)'   },
        { top: '88%', left: '38%',  size: 14, color: 'rgba(225,80,125,0.45)' },
        { top: '30%', left: '7%',   size: 11, color: 'rgba(210,60,110,0.4)'  },
        { top: '80%', right: '15%', size: 22, color: 'rgba(200,70,120,0.45)' },
      ].map((h, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: h.top,
            left: 'left' in h ? h.left : undefined,
            right: 'right' in h ? h.right : undefined,
            width: h.size,
            height: h.size,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill={h.color} xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      ))}

      {/* 대각선 라인 패턴 */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(184,134,90,0.12) 40px, rgba(184,134,90,0.12) 41px)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 80px, rgba(201,149,106,0.07) 80px, rgba(201,149,106,0.07) 81px)`, pointerEvents: 'none', zIndex: 0 }} />

      {/* 정적 블러 오브 */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(210,120,150,0.55) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,130,80,0.45) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(70px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '35%', left: '60%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,140,170,0.5) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 0 }} />

      {/* 탑바 */}
      <header
        style={{
          height: 64,
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(201,149,106,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            onClick={() => setActive('dashboard')}
            style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '2.5px',
              color: '#3a1a2a',
              cursor: 'pointer',
            }}
          >
            HYPE WEDDING
          </span>
          <span style={{ width: 1, height: 16, background: 'rgba(180,120,140,0.3)' }} />
          <span
            style={{
              fontSize: 10,
              color: '#c9956a',
              letterSpacing: '2px',
              fontWeight: 700,
            }}
          >
            ADMIN
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: 13,
            color: '#e05555',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            border: '1px solid rgba(220,80,80,0.25)',
            borderRadius: 8,
            background: 'rgba(220,80,80,0.07)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* 사이드바 */}
        <aside
          style={{
            width: 240,
            backgroundColor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(201,149,106,0.2)',
            padding: '24px 0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {admin && (
            <div
              style={{
                margin: '0 16px 24px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 10,
                border: '1px solid rgba(201,149,106,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c9956a, #b8865a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a' }}>
                  {admin.loginId}님 환영해용 🩷
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: '#c9956a',
                    marginTop: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {admin.role}
                </p>
              </div>
            </div>
          )}
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#b08898',
              letterSpacing: '2px',
              padding: '0 16px',
              marginBottom: 8,
            }}
          >
            SECTIONS
          </p>

          {MENU.map((m, i) => {
            const isActive = m.id === active;
            return (
              <React.Fragment key={m.id}>
                {i > 0 && (
                  <div
                    style={{
                      margin: '0 16px',
                      height: 1,
                      background: 'rgba(180,120,140,0.15)',
                    }}
                  />
                )}
                <button
                  className="admin-menu-btn"
                  onClick={() => setActive(m.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    background: isActive ? 'rgba(201,149,106,0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? '#c9956a' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      color: isActive ? '#c9956a' : '#b08898',
                      display: 'flex',
                    }}
                  >
                    {m.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#3a1a2a' : '#7a5060',
                      letterSpacing: '0.1px',
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}

          <div
            style={{ margin: '16px 16px', borderTop: '1px solid rgba(180,120,140,0.2)' }}
          />

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#b08898',
              letterSpacing: '2px',
              padding: '0 16px',
              marginBottom: 8,
            }}
          >
            LINKS
          </p>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              fontSize: 14,
              color: '#7a5060',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 13, color: '#b08898' }}>↗</span>
            View Site
          </Link>
        </aside>

        {/* 콘텐츠 */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '36px 44px',
          }}
        >
          <div
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, #c9956a, #e8b88a, #c9956a, transparent)',
              marginBottom: 36,
              opacity: 0.6,
            }}
          />
          {active === 'dashboard' && (
            <DashboardPanel onNavigation={setActive} />
          )}
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
