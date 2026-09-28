'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import { type Section } from './types';
import DashboardPanel from './dashboard-panel';
import HeroPanel from './hero-panel';
import UserPanel from './user-panel';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountsPanel from './accounts-panel';
import MyAccountPanel from './my-account-panel';
import AuditLogPanel from './audit-log-panel';
import ProductFullPanel from './product-full-panel';
import { ADMIN_PANEL_PATH } from '@/lib/admin-paths';
const IconDashboard = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>);
const IconImage = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>);
const IconUser = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>);
const IconCamera = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>);
const IconMapPin = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>);
const IconSettings = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65
   0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0                   
  1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 
  1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4  
  0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65
   1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>);
const IconLog = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>);
const IconUsers = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>);
const MENU: {
    id: Section;
    label: string;
    icon: React.ReactNode;
}[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { id: 'hero-wedding', label: 'Hero · Wedding', icon: <IconImage /> },
    { id: 'hero-snap', label: 'Hero · Snap', icon: <IconImage /> },
    {
        id: 'Photographers',
        label: 'Photographers (Wedding)',
        icon: <IconCamera />,
    },
    {
        id: 'Casual Photoshoot',
        label: 'Casual Photoshoot (Snap)',
        icon: <IconMapPin />,
    },
    { id: 'users', label: 'Members', icon: <IconUsers /> },
    { id: 'accounts', label: 'Account Setting', icon: <IconSettings /> },
    { id: 'audit-log', label: 'Audit Log', icon: <IconLog /> },
    { id: 'my-account', label: 'My Account', icon: <IconSettings /> },
];
export default function AdminPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const active = (searchParams.get('tab') as Section) ?? 'dashboard';
    const setActive = (section: Section) => {
        router.push(`${ADMIN_PANEL_PATH}?tab=${encodeURIComponent(section)}`);
    };
    const [admin, setAdmin] = useState<{
        loginId: string;
        role: string;
    } | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const logout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
        router.replace('/gatekeeper-7f3k9');
    };
    useEffect(() => {
        // 어드민 세션(JWT 쿠키)이 만료된 채로 등록/수정 등을 시도하면 API가 401을 주는데,
        // 각 패널이 이걸 그냥 "저장 실패"처럼 일반 에러로 보여줘서 원인을 알 수 없었음.
        // 모든 /api/admin/* 요청을 가로채서 401이면 세션 만료 모달을 띄우도록 함.
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            const input = args[0];
            const url = typeof input === 'string'
                ? input
                : input instanceof Request
                    ? input.url
                    : input.toString();
            if (response.status === 401 &&
                url.includes('/api/admin/') &&
                !url.includes('/api/admin/login') &&
                !url.includes('/api/admin/me')) {
                setSessionExpired(true);
            }
            return response;
        };
        return () => {
            window.fetch = originalFetch;
        };
    }, []);
    useEffect(() => {
        fetch('/api/admin/me')
            .then((res) => res.json())
            .then((data) => {
            setAdmin(data);
            if (data?.role !== 'master' && active === 'accounts') {
                router.replace(`${ADMIN_PANEL_PATH}?tab=dashboard`);
            }
        });
    }, [active, router]);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return (<div style={{
            minHeight: '100vh',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus { border-color: #888 !important; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        .admin-menu-btn:hover { background: rgba(160,160,160,0.12) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(140,140,140,0.35); border-radius: 4px; }
      `}</style>

      
      <header style={{
            height: 56,
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isMobile && (<button onClick={() => setIsMobileOpen(true)} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#252525',
                padding: 4,
            }}>
              ☰
            </button>)}
          <span onClick={() => setActive('dashboard')} style={{
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '2.5px',
            color: '#252525',
            cursor: 'pointer',
        }}>
            HYPE WEDDING
          </span>
          <span style={{
            width: 1,
            height: 16,
            background: 'rgba(140,140,140,0.3)',
        }}/>

          <span style={{
            fontSize: 10,
            color: '#a0a0a0',
            letterSpacing: '2px',
            fontWeight: 700,
        }}>
            ADMIN
          </span>
        </div>
        <button onClick={logout} style={{
            fontSize: 12,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            border: 'none',
            borderRadius: 3,
            background: '#000',
            cursor: 'pointer',
            fontWeight: 600,
        }}>
          Logout
        </button>
      </header>

      <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
        }}>
        
        <aside style={{
            width: 220,
            backgroundColor: '#fff',
            borderRight: '1px solid #e0e0e0',
            padding: '20px 0',
            flexShrink: 0,
            display: isMobile && !isMobileOpen ? 'none' : 'flex',
            flexDirection: 'column',
            ...(isMobile && {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100dvh',
                zIndex: 100,
            }),
        }}>
          {isMobile && (<div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(160,160,160,0.2)',
                marginBottom: 8,
            }}>
              <span style={{
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '2px',
                color: '#252525',
            }}>
                MENU
              </span>
              <button onClick={() => setIsMobileOpen(false)} style={{
                background: 'rgba(122,122,122,0.08)',
                border: '1px solid rgba(122,122,122,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                color: '#7f7f7f',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                ✕
              </button>
            </div>)}
          {admin && (<div style={{
                margin: '0 16px 24px',
                padding: '12px 14px',
                background: '#f5f5f5',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#252525' }}>
                  {admin.loginId}님 환영합니다.
                </p>
                <p style={{
                fontSize: 11,
                color: '#a0a0a0',
                marginTop: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
            }}>
                  Role: {admin.role}
                </p>
              </div>
            </div>)}
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#969696',
            letterSpacing: '2px',
            padding: '0 16px',
            marginBottom: 8,
        }}>
            SECTIONS
          </p>

          
          <div style={{
            margin: '0 16px',
            height: 1,
            background: 'rgba(140,140,140,0.15)',
        }}/>

          
          {MENU.filter((m) => m.id !== 'accounts' || admin?.role === 'master').map((m, i) => {
            const isActive = m.id === active;
            return (<React.Fragment key={m.id}>
                {i >= 0 && (<div style={{
                        margin: '0 16px',
                        height: 1,
                        background: 'rgba(140,140,140,0.15)',
                    }}/>)}
                <button className="admin-menu-btn" onClick={() => setActive(m.id)} style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    background: isActive
                        ? 'rgba(160,160,160,0.15)'
                        : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? '#a0a0a0' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s',
                }}>
                  <span style={{
                    color: isActive ? '#a0a0a0' : '#969696',
                    display: 'flex',
                }}>
                    {m.icon}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#252525' : '#5e5e5e',
                    letterSpacing: '0.1px',
                }}>
                    {m.label}
                  </span>
                </button>
              </React.Fragment>);
        })}

          <div style={{
            margin: '16px 16px',
            borderTop: '1px solid rgba(140,140,140,0.2)',
        }}/>

          <p style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#969696',
            letterSpacing: '2px',
            padding: '0 16px',
            marginBottom: 8,
        }}>
            LINKS
          </p>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            fontSize: 14,
            color: '#5e5e5e',
            textDecoration: 'none',
        }}>
            <span style={{ fontSize: 13, color: '#969696' }}>↗</span>
            View Site
          </Link>
        </aside>
        {isMobile && isMobileOpen && (<div onClick={() => setIsMobileOpen(false)} style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 99,
            }}/>)}

        
        <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
        }}>
          {active === 'dashboard' && (<DashboardPanel onNavigation={setActive} isMobile={isMobile}/>)}
          {active === 'hero-wedding' && <HeroPanel brand="wedding"/>}
          {active === 'hero-snap' && <HeroPanel brand="snap"/>}
          {active === 'Photographers' && (<ProductFullPanel fixedCategory="wedding"/>)}
          {active === 'Casual Photoshoot' && (<ProductFullPanel fixedCategory="snap"/>)}
          {active === 'users' && <UserPanel />}
          {active === 'accounts' && <AccountsPanel />}
          {active === 'audit-log' && <AuditLogPanel />}
          {active === 'my-account' && <MyAccountPanel />}
        </main>
      </div>

      {sessionExpired && (<div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 4,
            padding: '32px 28px',
            width: 320,
            textAlign: 'center',
        }}>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              세션이 종료되었습니다.
            </p>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
              보안을 위해 일정 시간이 지나면 자동으로 로그아웃돼요. 다시 로그인해주세요.
            </p>
            <button onClick={() => router.replace('/gatekeeper-7f3k9')} style={{
            padding: '10px 0',
            width: '100%',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
        }}>
              다시 로그인
            </button>
          </div>
        </div>)}
    </div>);
}
