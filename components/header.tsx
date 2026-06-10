'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import LoginModal from '@/components/login-modal';
import { useSession, signOut } from 'next-auth/react';
import { useIsMobile } from '@/hooks/useIsMobile';

const BRANDS = {
  'hype-wedding': {
    label: 'HYPE WEDDING',
    description: 'Wedding Photography',
    href: '/',
  },
  'hype-snap': {
    label: 'HYPE SNAP',
    description: 'Casual Photoshoot',
    href: '/hype-snap',
  },
} as const;

type Brand = keyof typeof BRANDS;

const NAV_LINKS: Record<Brand, { label: string; href: string }[]> = {
  'hype-wedding': [
    { label: 'Home', href: '/' },
    { label: 'Wedding', href: '/wedding' },
    { label: 'Magazine', href: '/magazine' },
    { label: 'Gallery', href: '#' },
    { label: 'Inquiry', href: '#' },
  ],
  'hype-snap': [
    { label: 'Home', href: '/hype-snap' },
    { label: 'Casual', href: '/casual' },
    { label: 'Magazine', href: '/magazine?brand=hype-snap' },
    { label: 'Gallery', href: '#' },
    { label: 'Inquiry', href: '#' },
  ],
};

const SUB_NAV: Record<Brand, { label: string; section: string }[]> = {
  'hype-wedding': [
    { label: 'Wedding in Jeju', section: 'Meet our Photographers in Jeju' },
    { label: 'Wedding in Seoul', section: 'Meet our Photographer in Seoul' },
  ],
  'hype-snap': [
    { label: 'Casual in Jeju', section: 'Casual Photoshoot in Jeju' },
    { label: 'Casual in Seoul', section: 'Casual Photoshoot in Seoul' },
  ],
};

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SubNav({ brand }: { brand: Brand }) {
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section');

  return (
    <div
      style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 99,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8e8e8',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
        }}
      >
        {SUB_NAV[brand].map(({ label, section }) => {
          const isActive = currentSection === section;
          return (
            <Link
              key={section}
              href={`/products?section=${encodeURIComponent(section)}`}
              style={{
                padding: '12px 20px',
                fontSize: 13,
                color: isActive ? '#191919' : '#555',
                borderBottom: isActive
                  ? '2px solid #191919'
                  : '2px solid transparent',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Header({
  brand = 'hype-wedding',
  showSubNav = false,
}: {
  brand?: Brand;
  showSubNav?: boolean;
}) {
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 56,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 20px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* ── Brand ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(Object.keys(BRANDS) as Brand[]).map((b, i) => (
              <div
                key={b}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                {i > 0 && (
                  <span
                    style={{ color: '#ccc', fontSize: 14, fontWeight: 300 }}
                  >
                    |
                  </span>
                )}
                <Link
                  href={BRANDS[b].href}
                  style={{
                    fontSize: isMobile ? 13 : 15,
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: brand === b ? '#191919' : '#bbb',
                    textDecoration: 'none',
                  }}
                >
                  {BRANDS[b].label}
                </Link>
              </div>
            ))}
          </div>

          {/* ── 데스크탑 Nav ── */}
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 32 }}>
              {NAV_LINKS[brand].map(({ label, href }) => {
                const active = href !== '#' && pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: '#191919',
                      position: 'relative',
                      padding: '4px 0',
                      display: 'inline-block',
                    }}
                  >
                    {label}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          right: 0,
                          height: 1.5,
                          background: '#191919',
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* ── 데스크탑 Icons / 모바일 햄버거 ── */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              color: '#191919',
            }}
          >
            {!isMobile ? (
              <>
                <button>
                  <SearchIcon />
                </button>
                <button>
                  <BookmarkIcon />
                </button>
                <button>
                  <BellIcon />
                </button>
                <button
                  onClick={() => (session ? signOut() : setLoginOpen(true))}
                >
                  <UserIcon />
                </button>
              </>
            ) : (
              <button onClick={() => setMenuOpen((v) => !v)}>
                {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            )}
          </div>
        </div>

        {showSubNav && (
          <Suspense fallback={null}>
            <SubNav brand={brand} />
          </Suspense>
        )}
      </header>

      {/* ── 모바일 드로어 메뉴 ── */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NAV_LINKS[brand].map(({ label, href }) => {
              const active = href !== '#' && pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: 22,
                    fontWeight: active ? 700 : 400,
                    color: '#191919',
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                    textDecoration: 'none',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 24,
              color: '#191919',
            }}
          >
            <button>
              <SearchIcon />
            </button>
            <button>
              <BookmarkIcon />
            </button>
            <button>
              <BellIcon />
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                if (session) {
                  signOut();
                } else {
                  setLoginOpen(true);
                }
              }}
            >
              <UserIcon />
            </button>
          </div>
        </div>
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}
