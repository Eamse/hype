'use client';

import { useRouter } from 'next/navigation';
import { useBookmarks } from '@/components/bookmark-provider';

const BOOKING_FORM_URL = 'https://forms.gle/3sWqu4NED5ruJEnN9';

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? '#000' : 'none'}
      stroke="#000"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '16px 0',
        fontSize: 13,
        color: '#000',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <ChevronLeftIcon />
      Back
    </button>
  );
}

export function StickyBottomBar({
  userId,
  productId,
}: {
  userId: string | null;
  productId: number;
}) {
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const saved = bookmarkedIds.has(productId);
  const router = useRouter();

  async function handleBookmark() {
    if (!userId) {
      router.push('?auth=1');
      return;
    }
    await toggleBookmark(productId);
  }
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        borderTop: '1px solid #000',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <button
        onClick={handleBookmark}
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          border: '1px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <BookmarkIcon active={saved} />
      </button>
      <a
        href={BOOKING_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1,
          height: 48,
          borderRadius: 10,
          backgroundColor: '#000',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.5px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
        }}
      >
        Book Now
      </a>
    </div>
  );
}
