'use client';

import Image from 'next/image';
import type { Session } from 'next-auth';
import NotificationBell from '@/components/notification-bell';

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
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
      width="22"
      height="22"
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

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
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

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

/** 헤더 검색/북마크/알림/로그인·아웃 버튼 — 데스크탑 헤더 + 모바일 드로어 양쪽에서 공용 */
export default function HeaderActionButtons({
  session,
  bookmarkCount,
  showBell,
  onSearchClick,
  onBookmarkClick,
  onSignClick,
}: {
  session: Session | null;
  bookmarkCount: number;
  showBell: boolean;
  onSearchClick: () => void;
  onBookmarkClick: () => void;
  onSignClick: () => void;
}) {
  return (
    <>
      <button onClick={onSearchClick} aria-label="Search" style={iconBtnStyle}>
        <SearchIcon />
      </button>
      <button
        onClick={onBookmarkClick}
        aria-label="Bookmarks"
        style={{ ...iconBtnStyle, position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <BookmarkIcon />
        {bookmarkCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {bookmarkCount}
          </span>
        )}
      </button>
      {showBell && <NotificationBell />}
      <button
        onClick={onSignClick}
        aria-label={session ? 'Sign out' : 'Sign in'}
        style={{ ...iconBtnStyle, display: 'flex', alignItems: 'center' }}
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="profile"
            width={28}
            height={28}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : session ? (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {(session.user?.name ?? session.user?.email)?.charAt(0).toUpperCase() ?? '?'}
          </div>
        ) : (
          <UserIcon />
        )}
      </button>
    </>
  );
}
