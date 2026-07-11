'use client';

import { useState, useEffect, startTransition, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import LoginModal from '@/components/login-modal';
import SearchModal from '@/components/search-modal';
import HeaderActionButtons from '@/components/header-action-buttons';
import { useBookmarks } from '@/components/bookmark-provider';
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
      href: '/wedding',
      dropdown: [
        { label: 'What We Offer', href: '/wedding' },
        { label: 'Packages & Pricing', href: '/wedding' },
        {
          label: '• Wedding in Jeju',
          href: '/products?section=Photographers%20in%20Jeju',
          indent: true,
        },
        {
          label: '• Wedding in Seoul',
          href: '/products?section=Photographers%20in%20Seoul',
          indent: true,
        },
      ],
    },

    { label: 'Editional', href: '/magazine' },
    { label: 'Reviews', href: '/review' },
    {
      label: 'Contact',
      href: '/contact',
      dropdown: [
        { label: 'Customer Inquiry', href: '/cutomer' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Vendor Partnership', href: '/partnership' },
      ],
    },
  ],
  'hype-snap': [
    { label: 'Home', href: '/hype-snap' },
    { label: 'About Us', href: '/about?brand=hype-snap' },
    {
      label: 'Service',
      href: '/casual',
      dropdown: [
        { label: 'What We Offer', href: '/casual' },
        { label: 'Packages & Pricing', href: '/casual' },
        {
          label: '• Casual in Jeju',
          href: '/products?section=Casual%20Photoshoot%20in%20Jeju',
          indent: true,
        },
        {
          label: '• Casual in Seoul',
          href: '/products?section=Casual%20Photoshoot%20in%20Seoul',
          indent: true,
        },
      ],
    },

    { label: 'Editional', href: '/magazine?brand=hype-snap' },
    { label: 'Reviews', href: '/review?brand=hype-snap' },
    {
      label: 'Contact',
      href: '/contact?brand=hype-snap',
      dropdown: [
        { label: 'Customer Inquiry', href: '/cutomer' },
        { label: 'FAQ', href: '/faq?brand=hype-snap' },
        { label: 'Vendor Partnership', href: '/partnership?brand=hype-snap' },
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
        fontSize: hovered ? 15 : 14,
        fontWeight: 400,
        color: '#191919',
        textDecoration: hovered ? 'underline' : 'none',
        whiteSpace: 'nowrap',
        transition: 'font-size 0.15s',
        paddingLeft: indent ? 16 : 0,
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

export default function Header({ brand = 'hype-wedding' }: { brand?: Brand }) {
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const { bookmarkedIds } = useBookmarks();
  const bookmarkCount = bookmarkedIds.size;
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const openNav = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoveredNav(label);
  };
  const closeNav = () => {
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

  function handleSignClick() {
    if (session) {
      signOut();
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } else {
      setLoginOpen(true);
    }
  }

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
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: active ? 600 : 400,
                                color: '#191919',
                                padding: '4px 0',
                                cursor: 'default',
                              }}
                            >
                              {label}
                            </span>
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
                  {/* 드롭다운 */}
                  {hoveredNav !== null && (
                    <div
                      onMouseEnter={() => {
                        if (closeTimer.current)
                          clearTimeout(closeTimer.current);
                      }}
                      onMouseLeave={closeNav}
                      style={{
                        position: 'fixed',
                        top: 56,
                        left: 0,
                        right: 0,
                        zIndex: 99,
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #e8e8e8',
                        padding: '12px 0 24px',
                      }}
                    >
                      <div style={{ position: 'relative', height: 130 }}>
                        {allDropdownGroups.map((group) => {
                          const el = navItemRefs.current.get(group.label);
                          const left = el ? el.getBoundingClientRect().left : 0;
                          return (
                            <div
                              key={group.label}
                              style={{
                                position: 'absolute',
                                left: left - 20,
                                top: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 14,
                              }}
                            >
                              {group.dropdown!.map(
                                ({ label: dLabel, href: dHref, indent }) => (
                                  <DropdownLink
                                    key={dLabel}
                                    href={dHref}
                                    label={dLabel}
                                    indent={indent}
                                  />
                                ),
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
              color: '#191919',
              marginBottom: 28,
            }}
          >
            <HeaderActionButtons
              session={session}
              bookmarkCount={bookmarkCount}
              showBell={false}
              onSearchClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              onBookmarkClick={() => {
                setMenuOpen(false);
                session ? router.push('/bookmarks') : setLoginOpen(true);
              }}
              onSignClick={() => {
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
                  <div
                    key={label}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
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
                        color: '#191919',
                        padding: '16px 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '-0.3px',
                        textAlign: 'left',
                      }}
                    >
                      {label}
                      <span style={{ fontSize: 16, color: '#666' }}>
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
                            onClick={() => {
                              setMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }}
                            style={{
                              fontSize: 15,
                              color: '#555',
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
            backgroundColor: '#191919',
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
    </>
  );
}
