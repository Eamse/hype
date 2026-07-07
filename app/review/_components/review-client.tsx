'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const TABS: Record<
  'hype-wedding' | 'hype-snap',
  { label: string; value: string }[]
> = {
  'hype-wedding': [
    { label: 'Review', value: 'review' },
    { label: 'Gallery', value: 'gallery' },
  ],
  'hype-snap': [
    { label: 'Review', value: 'review' },
    { label: 'Gallery', value: 'gallery' },
  ],
};

export default function ReviewClient({
  brand,
  activeTab,
  children,
}: {
  brand: 'hype-wedding' | 'hype-snap';
  activeTab: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = TABS[brand];

  function handleTab(value: string) {
    const params = new URLSearchParams();
    if (brand === 'hype-snap') params.set('brand', 'hype-snap');
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── 탭 바 ── */}
      <div
        style={{
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 56,
          zIndex: 50,
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
          {tabs.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                onClick={() => handleTab(tab.value)}
                style={{
                  padding: '14px 24px',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#191919' : '#666',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: isActive
                    ? '2px solid #191919'
                    : '2px solid transparent',
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 컨텐츠 (서버가 내려준 그대로) ── */}
      {children}
    </div>
  );
}
