'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import { type Section } from './types';
import DashboardPanel from './dashboard-panel';
import HeroPanel from './hero-panel';
import ProductPanel from './product-panel';
import MagazinePanel from './magazine-panel';
import { useRouter } from 'next/navigation';

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
  const [active, setActive] = useState<Section>('dashboard');
  const [admin, setAdmin] = useState<{ loginId: string; role: string } | null>(
    null,
  );
  const router = useRouter();
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
        backgroundColor: '#f9f8f6',
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #c9a96e !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12) !important; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        .admin-menu-btn:hover { background: #faf7f2 !important; }
      `}</style>

      {/* 탑바 */}
      <header
        style={{
          height: 100,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e8e0d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          flexShrink: 0,
          boxShadow: '0 1px 0 rgba(201,169,110,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '2.5px',
              color: '#1a1a1a',
            }}
          >
            HYPE WEDDING
          </span>
          <span style={{ width: 1, height: 18, background: '#ddd' }} />
          <span
            style={{
              fontSize: 14,
              color: '#c9a96e',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          >
            ADMIN
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: 14,
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            border: '1px solid #fecaca',
            borderRadius: 8,
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 */}
        <aside
          style={{
            width: 250,
            backgroundColor: '#fff',
            borderRight: '1px solid #e8e0d0',
            padding: '28px 0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {admin && (
            <div
              style={{
                margin: '0 20px 24px',
                padding: '14px 16px',
                background: '#faf7f2',
                borderRadius: 10,
                border: '1px solid red',
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
                  background: 'linear-gradient(135deg, #c9a96e, #b8965a)',
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
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                  {admin.loginId}님 환영해용 🩷
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: '#c9a96e',
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
              fontSize: 11,
              fontWeight: 700,
              color: '#c9a96e',
              letterSpacing: '2px',
              padding: '0 20px',
              marginBottom: 12,
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
                      margin: '0 20px',
                      height: 1,
                      background: '#f0ebe0',
                    }}
                  />
                )}
                <button
                  className="admin-menu-btn"
                  onClick={() => setActive(m.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '18px 20px',
                    background: isActive ? '#faf7f2' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? '#c9a96e' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      color: isActive ? '#c9a96e' : '#bbb',
                      display: 'flex',
                    }}
                  >
                    {m.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#1a1a1a' : '#777',
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
            style={{ margin: '0 20px 16px', borderTop: '1px solid #f0ebe0' }}
          />

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#c9a96e',
              letterSpacing: '2px',
              padding: '0 20px',
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
              padding: '10px 20px',
              fontSize: 15,
              color: '#777',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 13, color: '#bbb' }}>↗</span>
            View Site
          </Link>
        </aside>

        {/* 콘텐츠 */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px 48px',
            backgroundColor: '#f9f8f6',
          }}
        >
          {/* 콘텐츠 상단 골드 라인 */}
          <div
            style={{
              height: 2,
              background: 'linear-gradient(90deg, #c9a96e, #e8d5a3, #c9a96e)',
              borderRadius: 2,
              marginBottom: 36,
              opacity: 0.5,
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
