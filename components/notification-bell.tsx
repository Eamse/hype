'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Notification = {
  id: number;
  type: string;
  reviewId: number;
  createdAt: string;
  review: { id: number; title: string };
  comment: { id: number; content: string; authorName: string } | null;
};

function BellIcon() {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function NotificationBell({
  open,
  onToggle,
  onClose,
}: {
  // 헤더의 계정 드롭다운과 동시에 열리지 않도록, 열림 상태를 header.tsx가 관리함
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []));
  }, [session]);

  if (!session) return null;

  const count = notifications.length;
  const badgeText = count > 99 ? '99+' : String(count);

  async function handleClickItem(n: Notification) {
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    onClose();
    router.push(`/review/${n.reviewId}`);
    await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' });
  }

  async function handleMarkAllRead() {
    setNotifications([]);
    await fetch('/api/notifications', { method: 'PATCH' });
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        aria-label={
          count > 0 ? `Notifications (${count} unread)` : 'Notifications'
        }
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <BellIcon />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -8,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              padding: '0 4px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 12,
            width: 320,
            maxHeight: 360,
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #000',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #000',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              Notifications
            </span>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#000',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {count === 0 ? (
            <p
              style={{
                padding: '24px 16px',
                fontSize: 13,
                color: '#000',
                textAlign: 'center',
              }}
            >
              No new notifications.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickItem(n)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #fff',
                  cursor: 'pointer',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: '##000',
                    fontWeight: 600,
                    margin: '0 0 4px',
                  }}
                >
                  {n.comment?.authorName ?? 'Someone'} left a{' '}
                  {n.type === 'reply' ? 'reply' : 'comment'}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#000',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.review.title}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
