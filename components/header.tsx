'use client';

import { useState, useEffect, startTransition, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import LoginModal from '@/components/login-modal';
import SearchModal from '@/components/search-modal';
import ComingSoonModal from './coming-soon-modal';
import HeaderActionButtons from '@/components/header-action-buttons';
import { useBookmarks } from '@/components/bookmark-provider';
import { useSession, signOut } from 'next-auth/react';
import { useIsMobile } from '@/hooks/useIsMobile';

const BRANDS = {
  'hype-wedding': {
    label: 'HYPE WEDDING',
    description: 'Wedding Photography',
    href: '/',
    comingSoon: false,
  },
  'hype-snap': {
    label: 'HYPE SNAP',
    description: 'Casual Photoshoot',
    href: '/hype-snap',
    comingSoon: true,
  },
} as const;

type Brand = keyof typeof BRANDS;

const NAV_LINKS: Record<
  Brand,
  {
    label: string;
    href: string;
    dropdown?: { label: string; href: string; indent?: boolean }[];
  }[]
> = {
  'hype-wedding': [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    {
      label: 'Service',
      href: '/offer',
      dropdown: [
        { label: 'What We Offer', href: '/offer' },
        { label: 'Packages', href: '/packages' },
        {
          label: '• Jeju',
          href: '/products?section=Photographers%20in%20Jeju',
          indent: true,
        },
        {
          label: '• Seoul',
          href: '/products?section=Photographers%20in%20Seoul',
          indent: true,
        },
      ],
    },

    { label: 'Editorial', href: '/magazine' },
    { label: 'Reviews', href: '/review' },
    {
      label: 'Inquiry',
      href: '/inquiry',
      dropdown: [
        { label: 'Inquiry', href: '/inquiry' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Partnership', href: '/partnership' },
      ],
    },
  ],
  'hype-snap': [
    { label: 'Home', href: '/hype-snap' },
    { label: 'About Us', href: '/about?brand=hype-snap' },
    {
      label: 'Service',
      href: '/offer?brand=hype-snap',
      dropdown: [
        { label: 'What We Offer', href: '/offer?brand=hype-snap' },
        { label: 'Packages', href: '/packages?brand=hype-snap' },
        {
          label: '• Jeju',
          href: '/products?section=Casual%20Photoshoot%20in%20Jeju',
          indent: true,
        },
        {
          label: '• Seoul',
          href: '/products?section=Casual%20Photoshoot%20in%20Seoul',
          indent: true,
        },
      ],
    },

    { label: 'Editorial', href: '/magazine?brand=hype-snap' },
    { label: 'Reviews', href: '/review?brand=hype-snap' },
    {
      label: 'Inquiry',
      href: '/inquiry?brand=hype-snap',
      dropdown: [
        { label: 'Inquiry', href: '/inquiry?brand=hype-snap' },
        { label: 'FAQ', href: '/faq?brand=hype-snap' },
        { label: 'Partnership', href: '/partnership?brand=hype-snap' },
      ],
    },
  ],
};

function DropdownLink({
  href,
  label,
  indent,
}: {
  href: string;
  label: string;
  indent?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        padding: '14px 22px',
        fontSize: hovered ? 14 : 13,
        fontWeight: 700,
        color: '#2D5A45',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
        backgroundColor: hovered ? '#f7f7f7' : 'transparent',
        borderLeft: hovered ? '3px solid #2D5A45' : '3px solid transparent',
        transition:
          'background-color 0.15s, font-size 0.15s, border-color 0.15s',
        paddingLeft: (indent ? 28 : 22) - 3,
      }}
    >
      {label}
    </Link>
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
function HomeNavIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function ReviewNavIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </svg>
  );
}
function BookmarkNavIcon() {
  return (
    <svg
      width="20"
      height="20"
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

export default function Header(props: { brand?: Brand }) {
  return (
    <Suspense fallback={<div style={{ height: 56 }} />}>
      <HeaderInner {...props} />
    </Suspense>
  );
}

function HeaderInner({ brand = 'hype-wedding' }: { brand?: Brand }) {
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [comingSoonBrand, setComingSoonBrand] = useState<Brand | null>(null); // 커스텀 "Coming Soon" 팝업용
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const { bookmarkedIds } = useBookmarks();
  const bookmarkCount = bookmarkedIds.size;
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const openNav = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoveredNav(label);
  };
  const closeNav = () => {
    // TODO: 스타일링 끝나면 주석 해제
    closeTimer.current = setTimeout(() => setHoveredNav(null), 150);
  };
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (searchParams.get('auth') === '1') {
      startTransition(() => setLoginOpen(true));
    }
  }, [searchParams]);

  // 모바일 드로어 메뉴 — 클릭 즉시 닫으면 새 페이지가 로드되는 동안 이전 화면이 잠깐 노출됨.
  // 대신 pathname이 실제로 바뀐 시점(=이동이 끝난 시점)에 닫아서 그 틈을 없앰.
  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  function handleSignout() {
    signOut();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }
  function handleSignClick() {
    if (session) {
      setProfileMenuOpen((v) => !v);
    } else {
      setLoginOpen(true);
    }
  }
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          borderBottom: '1px solid white',
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
                    style={{ color: '#000', fontSize: 14, fontWeight: 300 }}
                  >
                    |
                  </span>
                )}
                <Link
                  href={BRANDS[b].href}
                  onClick={(e) => {
                    if (BRANDS[b].comingSoon) {
                      e.preventDefault();
                      setComingSoonBrand(b);
                    }
                  }}
                  style={{
                    fontSize: isMobile ? 13 : 15,
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: brand === b ? '#000' : '#bbb',
                    textDecoration: 'none',
                    cursor: BRANDS[b].comingSoon ? 'default' : 'pointer',
                  }}
                >
                  {BRANDS[b].label}
                </Link>
              </div>
            ))}
          </div>

          {/* ── 데스크탑 Nav ── */}
          {!isMobile &&
            (() => {
              const allDropdownGroups = NAV_LINKS[brand].filter(
                (i) => i.dropdown,
              );
              return (
                <div onMouseLeave={closeNav}>
                  <nav style={{ display: 'flex', gap: 32 }}>
                    {NAV_LINKS[brand].map(({ label, href, dropdown }) => {
                      const active = href !== '#' && pathname === href;

                      if (dropdown) {
                        return (
                          <div
                            key={label}
                            ref={(el) => {
                              if (el) navItemRefs.current.set(label, el);
                            }}
                            onMouseEnter={() => openNav(label)}
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <Link
                              href={href}
                              style={{
                                position: 'relative',
                                fontSize: 14,
                                fontWeight: active ? 600 : 'bold',
                                color:
                                  hoveredNav === label ? '#2D5A45' : '#000',
                                padding: '4px 0',
                                display: 'inline-block',
                                textDecoration: 'none',
                                transition: 'color 0.15s',
                              }}
                            >
                              {label}
                              {(hoveredNav !== null
                                ? hoveredNav === label
                                : active) && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: -2,
                                    left: 0,
                                    right: 0,
                                    height: 1.5,
                                    background:
                                      hoveredNav === label ? '#2D5A45' : '#000',
                                  }}
                                />
                              )}
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={label}
                          href={href}
                          onMouseEnter={() => openNav(label)}
                          style={{
                            fontSize: 14,
                            fontWeight: active ? 600 : 'bold',
                            color: hoveredNav === label ? '#2D5A45' : '#000',
                            position: 'relative',
                            padding: '4px 0',
                            display: 'inline-block',
                            transition: 'color 0.15s',
                          }}
                        >
                          {label}
                          {(hoveredNav !== null
                            ? hoveredNav === label
                            : active) && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: -2,
                                left: 0,
                                right: 0,
                                height: 1.5,
                                background:
                                  hoveredNav === label ? '#2D5A45' : '#000',
                              }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  {/* 드롭다운 — 호버 중인 메뉴 하나만, 너비는 내용에 맞게 */}
                  {hoveredNav !== null &&
                    allDropdownGroups
                      .filter((group) => group.label === hoveredNav)
                      .map((group) => {
                        const el = navItemRefs.current.get(group.label);
                        const left = el ? el.getBoundingClientRect().left : 0;
                        return (
                          <div
                            key={group.label}
                            className="header-dropdown"
                            onMouseEnter={() => {
                              if (closeTimer.current)
                                clearTimeout(closeTimer.current);
                            }}
                            onMouseLeave={closeNav}
                            style={{
                              position: 'fixed',
                              top: 47,
                              left,
                              width: 'fit-content',
                              minWidth: 180,
                              zIndex: 99,
                              backgroundColor: '#fff',
                              borderRadius: 6,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            {group.dropdown!.map(
                              ({ label: dLabel, href: dHref, indent }, i) => (
                                <div
                                  key={dLabel}
                                  style={{
                                    borderTop:
                                      i === 0 ? 'none' : '1px solid #eee',
                                  }}
                                >
                                  <DropdownLink
                                    href={dHref}
                                    label={dLabel}
                                    indent={indent}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        );
                      })}
                </div>
              );
            })()}

          {/* ── 데스크탑 Icons / 모바일 햄버거 ── */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              color: '#000',
            }}
            ref={containerRef}
          >
            {!isMobile ? (
              <HeaderActionButtons
                session={session}
                bookmarkCount={bookmarkCount}
                showBell
                onSearchClick={() => setSearchOpen(true)}
                onBookmarkClick={() =>
                  session ? router.push('/bookmarks') : setLoginOpen(true)
                }
                onSignClick={handleSignClick}
              />
            ) : (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            )}
            {profileMenuOpen && !isMobile && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 12,
                  width: 160,
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                  zIndex: 300,
                }}
              >
                <div
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push('/account');
                  }}
                  style={{
                    padding: '12px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Change my Profile
                </div>
                <div
                  onClick={() => {
                    setProfileMenuOpen(false);
                    handleSignout();
                  }}
                  style={{
                    padding: '12px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderTop: '1px solid #eee',
                  }}
                >
                  Sign out
                </div>
              </div>
            )}
          </div>
        </div>
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
            padding: '24px 24px 32px',
          }}
        >
          {/* 상단: 아이콘 */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              color: '#000',
              marginBottom: 28,
            }}
          >
            <HeaderActionButtons
              session={session}
              bookmarkCount={bookmarkCount}
              showBell
              onSearchClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              onBookmarkClick={() => {
                setMenuOpen(false);
                session ? router.push('/bookmarks') : setLoginOpen(true);
              }}
              onSignClick={() => {
                if (session) return;
                setMenuOpen(false);
                handleSignClick();
              }}
            />
          </div>

          {/* 중단: 네비 링크 */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NAV_LINKS[brand].map(({ label, href, dropdown }) => {
              const active = href !== '#' && pathname === href;
              const isOpen = openMobileDropdown === label;

              if (dropdown) {
                return (
                  <div key={label} style={{ borderBottom: '1px solid #000' }}>
                    <button
                      onClick={() =>
                        setOpenMobileDropdown(isOpen ? null : label)
                      }
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 22,
                        fontWeight: active ? 700 : 400,
                        color: '#000',
                        padding: '16px 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '-0.3px',
                        textAlign: 'left',
                      }}
                    >
                      {label}
                      <span style={{ fontSize: 16, color: '#000' }}>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0,
                          paddingBottom: 12,
                        }}
                      >
                        {dropdown.map(({ label: dLabel, href: dHref }) => (
                          <Link
                            key={dLabel}
                            href={dHref}
                            onClick={() => setOpenMobileDropdown(null)}
                            style={{
                              fontSize: 15,
                              color: '#000',
                              padding: '10px 0 10px 16px',
                              textDecoration: 'none',
                            }}
                          >
                            {dLabel}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontSize: 22,
                    fontWeight: active ? 700 : 400,
                    color: '#000',
                    padding: '16px 0',
                    borderBottom: '1px solid #000',
                    textDecoration: 'none',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {session && (
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 14,
                color: '#000',
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignout();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 14,
                  color: '#000',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
              <span style={{ color: '#bbb' }}>|</span>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: 14,
                  color: '#000',
                  textDecoration: 'none',
                }}
              >
                Change my Profile
              </Link>
            </div>
          )}

          {/* 하단: SNS */}
          <div style={{ marginTop: 24, display: 'flex', gap: 20 }}>
            {[
              {
                href: 'https://www.instagram.com/hypewedd_ing/',
                label: 'Instagram',
                src: '/instagram.png',
                size: 28,
              },
              {
                href: 'https://www.tiktok.com/@hypewedd_ing',
                label: 'TikTok',
                src: '/tik-tok-.png',
                size: 36,
              },
              {
                href: 'https://www.xiaohongshu.com/user/profile/68bd1504000000001900e6ce',
                label: 'Xiaohongshu',
                src: '/xiaohounshu.png',
                size: 36,
              },
            ].map(({ href, label, src, size }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Image
                  src={src}
                  alt={label}
                  width={size}
                  height={size}
                  style={{ objectFit: 'contain' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {comingSoonBrand && (
        <ComingSoonModal
          brand={comingSoonBrand}
          onClose={() => setComingSoonBrand(null)}
        />
      )}

      {loginOpen && (
        <LoginModal
          onClose={() => {
            setLoginOpen(false);
            router.replace(pathname);
          }}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          You have been logged out.
        </div>
      )}

      {/* ── 모바일 전용 하단 네비게이션 ── */}
      {isMobile && !menuOpen && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 150,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 56,
            backgroundColor: '#fff',
            borderTop: '1px solid #eee',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
          }}
        >
          {(
            [
              { label: 'Home', href: '/', icon: <HomeNavIcon /> },
              { label: 'Review', href: '/review', icon: <ReviewNavIcon /> },
              {
                label: 'Saved',
                icon: <BookmarkNavIcon />,
                onClick: () =>
                  session ? router.push('/bookmarks') : setLoginOpen(true),
              },
              {
                label: 'Menu',
                icon: <HamburgerIcon />,
                onClick: () => setMenuOpen(true),
              },
            ] as const
          ).map((item) => {
            const active = 'href' in item && pathname === item.href;
            const style: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              color: active ? '#000' : '#999',
              background: 'none',
              border: 'none',
              textDecoration: 'none',
              cursor: 'pointer',
            };
            const content = (
              <>
                {item.icon}
                <span style={{ fontSize: 10 }}>{item.label}</span>
              </>
            );
            return 'href' in item ? (
              <Link key={item.label} href={item.href} style={style}>
                {content}
              </Link>
            ) : (
              <button key={item.label} onClick={item.onClick} style={style}>
                {content}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
