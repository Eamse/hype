'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

// id가 있으면 같은 페이지 내 스크롤 이동, href가 있으면 다른 페이지로 이동
export type SubTab = { label: string; id?: string; href?: string };

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '14px 24px',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    color: '#000',
    whiteSpace: 'nowrap',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: active ? '2px solid #000' : '2px solid transparent',
    background: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  };
}

/** 페이지 내 섹션 스크롤 이동 또는 다른 페이지 이동을 지원하는 서브탭 바 (헤더 드롭다운 항목과 짝을 이룸) */
export default function SubTabBar({ tabs }: { tabs: SubTab[] }) {
  return (
    <Suspense fallback={null}>
      <SubTabBarInner tabs={tabs} />
    </Suspense>
  );
}

function SubTabBarInner({ tabs }: { tabs: SubTab[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollIds = tabs.map((t) => t.id).filter((id): id is string => !!id);
  const [activeId, setActiveId] = useState<string | null>(scrollIds[0] ?? null);

  useEffect(() => {
    if (scrollIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-120px 0px -70% 0px' },
    );
    scrollIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollIds.join(',')]);

  function handleClick(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function isActive(href: string): boolean {
    const [hrefPath, hrefQuery] = href.split('?');
    if (hrefPath !== pathname) return false;
    const hrefParams = new URLSearchParams(hrefQuery);
    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  return (
    <div
      style={{
        borderBottom: '1px solid silver',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 56,
        zIndex: 50,
      }}
    >
      <div
        className="sub-tab-bar-scroll"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) =>
          tab.href ? (
            <Link key={tab.label} href={tab.href} style={tabStyle(isActive(tab.href))}>
              {tab.label}
            </Link>
          ) : (
            <button
              key={tab.label}
              onClick={() => tab.id && handleClick(tab.id)}
              style={tabStyle(!!tab.id && tab.id === activeId)}
            >
              {tab.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
