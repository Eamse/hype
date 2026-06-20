'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TABS: Record<
  'hype-wedding' | 'hype-snap',
  { label: string; value: string }[]
> = {
  'hype-wedding': [
    { label: 'Philosophy', value: 'philosophy' },
    { label: 'Story', value: 'story' },
    { label: 'Our Work', value: 'our-work' },
    { label: 'History', value: 'history' },
    { label: 'Mission', value: 'mission' },
    { label: 'Service', value: 'service' },
  ],
  'hype-snap': [
    { label: 'Philosophy', value: 'philosophy' },
    { label: 'Story', value: 'story' },
    { label: 'Our Work', value: 'our-work' },
    { label: 'History', value: 'history' },
    { label: 'Mission', value: 'mission' },
    { label: 'Service', value: 'service' },
  ],
};

export default function AboutClient({
  brand,
  initialTab,
}: {
  brand: 'hype-wedding' | 'hype-snap';
  initialTab?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = TABS[brand];
  const defaultTab =
    tabs.find((t) => t.value === initialTab)?.value ?? tabs[0].value;
  const [activeTab, setActiveTab] = useState(defaultTab);

  function handleTab(value: string) {
    setActiveTab(value);
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
                  color: isActive ? '#191919' : '#888',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: isActive ? '2px solid #191919' : '2px solid transparent',
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

      {/* ── 컨텐츠 ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 20px 120px',
        }}
      >
        {/* TODO: 어바웃 컨텐츠 추가 */}
        <p style={{ color: '#999', fontSize: 14 }}>
          {tabs.find((t) => t.value === activeTab)?.label} 소개 들어갈 자리
        </p>
      </div>
    </div>
  );
}
