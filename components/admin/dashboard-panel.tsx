'use client';

import { useEffect, useState } from 'react';
import { Section } from './types';

type Stats = {
  useCount: number;
  product: { section: string; _count: { id: number } }[];
};

export default function DashboardPanel({
  onNavigation,
  isMobile,
}: {
  onNavigation: (section: Section) => void;
  isMobile: boolean;
}) {
  const [state, setState] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setState(data));
  }, []);

  const totalProducts =
    state?.product?.reduce((acc, p) => acc + p._count.id, 0) ?? 0;

  const photographerCount =
    state?.product
      ?.filter((p) => p.section.includes('Photographer'))
      .reduce((acc, p) => acc + p._count.id, 0) ?? 0;

  const casualCount =
    state?.product
      ?.filter((p) => p.section.includes('Casual'))
      .reduce((acc, p) => acc + p._count.id, 0) ?? 0;

  const SECTION_LABELS: Record<string, string> = {
    'Photographers in Jeju': 'Photographers · Jeju',
    'Photographers in Seoul': 'Photographers · Seoul',
    'Casual Photoshoot in Jeju': 'Casual · Jeju',
    'Casual Photoshoot in Seoul': 'Casual · Seoul',
    Magazine: 'Magazine',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#7a5520',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          OVERVIEW
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.3px',
          }}
        >
          Dashboard
        </h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Get a quick overview of your site.
        </p>
      </div>

      {!state ? (
        <div style={{ color: '#aaa', fontSize: 13, padding: '24px 0' }}>
          Loading...
        </div>
      ) : (
        <>
          {/* 상단 4개 카드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(2, 1fr)'
                : 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {/* 회원 수 */}
            <div
              style={{
                background: 'linear-gradient(135deg, #c9a96e, #b8965a)',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 4px 20px rgba(201,169,110,0.3)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: 12,
                }}
              >
                MEMBERS
              </p>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {state.useCount}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: 8,
                }}
              >
                총 가입 회원
              </p>
            </div>

            {/* 전체 상품 수 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: 12,
                }}
              >
                TOTAL PRODUCTS
              </p>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#1a1a1a',
                  lineHeight: 1,
                }}
              >
                {totalProducts}
              </p>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                전체 등록 상품
              </p>
            </div>

            {/* 포토그래퍼 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: 12,
                }}
              >
                PHOTOGRAPHERS
              </p>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#1a1a1a',
                  lineHeight: 1,
                }}
              >
                {photographerCount}
              </p>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                제주 + 서울
              </p>
            </div>

            {/* 캐쥬얼 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  marginBottom: 12,
                }}
              >
                CASUAL
              </p>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#1a1a1a',
                  lineHeight: 1,
                }}
              >
                {casualCount}
              </p>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                제주 + 서울
              </p>
            </div>
          </div>

          {/* 중단 좌우 섹션 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
              gap: 16,
            }}
          >
            {/* 왼쪽 - 방문자 그래프 (추후 Google Console 연동) */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: 280,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: 4,
                }}
              >
                VISITOR STATS
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 24,
                }}
              >
                방문자 통계
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 180,
                  color: '#ddd',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <p style={{ fontSize: 12, color: '#ccc' }}>
                  Google Search Console 연동 예정
                </p>
              </div>
            </div>

            {/* 오른쪽 - 최근 등록 상품 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: 280,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  marginBottom: 4,
                }}
              >
                RECENT PRODUCTS
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 24,
                }}
              >
                최근 등록 상품
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 180,
                  color: '#ddd',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p style={{ fontSize: 12, color: '#ccc' }}>데이터 연동 예정</p>
              </div>
            </div>
          </div>

          {/* 하단 테이블 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #ede8de',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f5f2ec',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#7a5520',
                  fontWeight: 700,
                  letterSpacing: '2px',
                }}
              >
                PRODUCTS BY SECTION
              </p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf7f2' }}>
                  <th
                    style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: 11,
                      color: '#aaa',
                      fontWeight: 600,
                      letterSpacing: '1px',
                    }}
                  >
                    SECTION
                  </th>
                  <th
                    style={{
                      padding: '12px 24px',
                      textAlign: 'right',
                      fontSize: 11,
                      color: '#aaa',
                      fontWeight: 600,
                      letterSpacing: '1px',
                    }}
                  >
                    COUNT
                  </th>
                  {!isMobile && (
                    <th
                      style={{
                        padding: '12px 24px',
                        textAlign: 'right',
                        fontSize: 11,
                        color: '#aaa',
                        fontWeight: 600,
                        letterSpacing: '1px',
                      }}
                    >
                      RATIO
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {state?.product?.map((p, i) => (
                  <tr
                    key={p.section}
                    onClick={() => onNavigation(p.section as Section)}
                    style={{
                      borderTop: i > 0 ? '1px solid #f5f2ec' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <td
                      style={{
                        padding: '16px 24px',
                        fontSize: 13,
                        color: '#1a1a1a',
                        fontWeight: 500,
                      }}
                    >
                      {SECTION_LABELS[p.section] ?? p.section}
                    </td>
                    <td
                      style={{
                        padding: '16px 24px',
                        textAlign: 'right',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#7a5520',
                      }}
                    >
                      {p._count.id}
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 80,
                              height: 6,
                              background: '#f0ebe0',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${totalProducts > 0 ? (p._count.id / totalProducts) * 100 : 0}%`,
                                background:
                                  'linear-gradient(90deg, #c9a96e, #b8965a)',
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: '#aaa',
                              minWidth: 32,
                            }}
                          >
                            {totalProducts > 0
                              ? Math.round((p._count.id / totalProducts) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
