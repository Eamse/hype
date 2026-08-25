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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
};

/** 헤더 검색/북마크/알림/로그인·아웃 버튼 — 데스크탑 헤더 + 모바일 드로어 양쪽에서 공용 */
export default function HeaderActionButtons({
  session,
  showBell,
  showSns = true,
  onSearchClick,
  onSignClick,
}: {
  session: Session | null;
  showBell: boolean;
  // 모바일 드로어는 하단에 SNS 아이콘 목록이 따로 있어서 중복되므로 숨김
  showSns?: boolean;
  onSearchClick: () => void;
  onSignClick: () => void;
}) {
  return (
    <>
      {showSns && (
        <>
          <a
            href="https://www.instagram.com/hypewedd_ing/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={iconBtnStyle}
          >
            <Image
              src="/icons/sns/instagram.svg"
              alt="Instagram"
              width={23}
              height={23}
              style={{ objectFit: 'contain', maxWidth: 'none' }}
            />
          </a>
          <a
            href="https://www.tiktok.com/@hypewedd_ing?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            style={iconBtnStyle}
          >
            <Image
              src="/icons/sns/tiktok.svg"
              alt="TikTok"
              width={35}
              height={35}
              style={{ objectFit: 'contain', maxWidth: 'none' }}
            />
          </a>
        </>
      )}
      <button onClick={onSearchClick} aria-label="Search" style={iconBtnStyle}>
        <SearchIcon />
      </button>
      {showBell && <NotificationBell />}
      <button
        onClick={onSignClick}
        aria-label={session ? 'Signed in' : 'Sign in'}
        style={iconBtnStyle}
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
            {(session.user?.name ?? session.user?.email)
              ?.charAt(0)
              .toUpperCase() ?? '?'}
          </div>
        ) : (
          <UserIcon />
        )}
      </button>
    </>
  );
}
