'use client';

import { useEffect, useState } from 'react';
import { Section } from './types';

type Stats = {
  useCount: number;
  product: { section: string; _count: { id: number } }[];
  recentProducts: {
    id: number;
    title: string;
    imageUrl: string | null;
    section: string;
    createdAt: string;
  }[];
};

type GaRangeStat = { activeUsers: number; pageViews: number };

type GaSummary = {
  today: GaRangeStat;
  last7Days: GaRangeStat;
  last30Days: GaRangeStat;
  allTime: GaRangeStat;
};

type GaDailyPoint = { date: string; activeUsers: number; pageViews: number };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** 라벨 옆에 붙이는 "!" 아이콘 — 호버하면 설명 툴팁 표시 */
function InfoMark({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', marginLeft: 6 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#5a5a5a',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
        }}
      >
        !
      </span>
      {show && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '140%',
            transform: 'translateY(-50%)',
            background: '#222',
            color: '#fff',
            fontSize: 11,
            fontWeight: 400,
            lineHeight: 1.4,
            padding: '8px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export default function DashboardPanel({
  onNavigation,
  isMobile,
}: {
  onNavigation: (section: Section) => void;
  isMobile: boolean;
}) {
  const [state, setState] = useState<Stats | null>(null);
  const [ga, setGa] = useState<GaSummary | null>(null);
  const [gaError, setGaError] = useState(false);
  const [daily, setDaily] = useState<GaDailyPoint[] | null>(null);
  const [dailyError, setDailyError] = useState(false);

  // 날짜 범위 직접 검색
  const [searchStart, setSearchStart] = useState(daysAgoStr(30));
  const [searchEnd, setSearchEnd] = useState(todayStr());
  const [searchResult, setSearchResult] = useState<GaRangeStat | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  function runSearch() {
    setSearching(true);
    setSearchError(false);
    fetch(`/api/admin/analytics?startDate=${searchStart}&endDate=${searchEnd}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSearchResult(data.range))
      .catch(() => setSearchError(true))
      .finally(() => setSearching(false));
  }

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setState(data));

    fetch('/api/admin/analytics')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setGa(data))
      .catch(() => setGaError(true));

    fetch('/api/admin/analytics?daily=14')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setDaily(data.daily))
      .catch(() => setDailyError(true));
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
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#5a5a5a',
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
            color: '#000',
            letterSpacing: '-0.3px',
          }}
        >
          Dashboard
        </h2>
        <p style={{ fontSize: 12, color: '#000', marginTop: 4 }}>
          Get a quick overview of your site.
        </p>
      </div>

      {!state ? (
        <div style={{ color: '#000', fontSize: 13, padding: '24px 0' }}>
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
                background: '#000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 4px 20px rgba(172,172,172,0.3)',
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
                border: '1px solid #000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
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
                  color: '#000',
                  lineHeight: 1,
                }}
              >
                {totalProducts}
              </p>
              <p style={{ fontSize: 11, color: '#000', marginTop: 8 }}>
                전체 등록 상품
              </p>
            </div>

            {/* 포토그래퍼 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
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
                  color: '#000',
                  lineHeight: 1,
                }}
              >
                {photographerCount}
              </p>
              <p style={{ fontSize: 11, color: '#000', marginTop: 8 }}>
                제주 + 서울
              </p>
            </div>

            {/* 캐쥬얼 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
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
                  color: '#000',
                  lineHeight: 1,
                }}
              >
                {casualCount}
              </p>
              <p style={{ fontSize: 11, color: '#000', marginTop: 8 }}>
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
                border: '1px solid #000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: 280,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
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
                  color: '#000',
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                방문자 통계
                <InfoMark text="조회는 페이지뷰 수. 한 사람이 여러 페이지를 보면 그만큼 늘어나요 (방문자 수와 다름)" />
              </p>
              {gaError ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 180,
                    color: '#000',
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
                  <p style={{ fontSize: 12, color: '#000' }}>
                    Google Analytics 데이터를 불러오지 못했습니다
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    height: 180,
                    justifyContent: 'center',
                  }}
                >
                  {(
                    [
                      ['오늘', ga?.today],
                      ['최근 7일', ga?.last7Days],
                      ['최근 30일', ga?.last30Days],
                      ['전체 누적', ga?.allTime],
                    ] as const
                  ).map(([label, data]) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #ebebeb',
                        paddingBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#000' }}>
                        {label}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 12,
                        }}
                      >
                        <span>
                          <strong
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: '#5a5a5a',
                            }}
                          >
                            {ga ? data?.activeUsers : '···'}
                          </strong>
                          <span style={{ fontSize: 11, color: '#000' }}>
                            {' '}
                            방문자
                          </span>
                        </span>
                        <span>
                          <strong
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: '#000',
                            }}
                          >
                            {ga ? data?.pageViews : '···'}
                          </strong>
                          <span style={{ fontSize: 11, color: '#000' }}>
                            {' '}
                            조회
                          </span>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 날짜 범위 직접 검색 */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #ebebeb',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: '#5a5a5a',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginBottom: 10,
                  }}
                >
                  기간 직접 조회
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="date"
                    value={searchStart}
                    onChange={(e) => setSearchStart(e.target.value)}
                    style={{
                      fontSize: 12,
                      padding: '6px 8px',
                      border: '1px solid #000',
                      borderRadius: 6,
                      color: '#000',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#000' }}>~</span>
                  <input
                    type="date"
                    value={searchEnd}
                    onChange={(e) => setSearchEnd(e.target.value)}
                    style={{
                      fontSize: 12,
                      padding: '6px 8px',
                      border: '1px solid #000',
                      borderRadius: 6,
                      color: '#000',
                    }}
                  />
                  <button
                    onClick={runSearch}
                    disabled={searching}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#5a5a5a',
                      color: '#fff',
                      cursor: searching ? 'default' : 'pointer',
                      opacity: searching ? 0.6 : 1,
                    }}
                  >
                    {searching ? '조회 중...' : '조회'}
                  </button>
                </div>

                {searchError && (
                  <p style={{ fontSize: 12, color: '#6a6a6a', marginTop: 10 }}>
                    조회 실패 — 기간을 확인해주세요
                  </p>
                )}

                {searchResult && !searchError && (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      gap: 20,
                    }}
                  >
                    <span>
                      <strong
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#5a5a5a',
                        }}
                      >
                        {searchResult.activeUsers}
                      </strong>
                      <span style={{ fontSize: 11, color: '#000' }}>
                        {' '}
                        방문자
                      </span>
                    </span>
                    <span>
                      <strong
                        style={{ fontSize: 20, fontWeight: 800, color: '#000' }}
                      >
                        {searchResult.pageViews}
                      </strong>
                      <span style={{ fontSize: 11, color: '#000' }}> 조회</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽 - 최근 등록 상품 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #000',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                minHeight: 280,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
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
                  color: '#000',
                  marginBottom: 24,
                }}
              >
                최근 등록 상품
              </p>
              {!state?.recentProducts?.length ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 180,
                    color: '#000',
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
                  <p style={{ fontSize: 12, color: '#000' }}>
                    등록된 상품이 없습니다
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    height: 180,
                    overflowY: 'auto',
                  }}
                >
                  {state.recentProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        onNavigation(
                          p.section.includes('Casual')
                            ? 'Casual Photoshoot'
                            : 'Photographers',
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#ebebeb',
                          position: 'relative',
                        }}
                      >
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#000',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.title}
                        </p>
                        <p style={{ fontSize: 11, color: '#000' }}>
                          {p.section} ·{' '}
                          {new Date(p.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 방문자 통계 그래프 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #000',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: '#5a5a5a',
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: 4,
              }}
            >
              VISITOR TREND
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#000',
                marginBottom: 24,
              }}
            >
              최근 14일 방문자 추이
            </p>

            {dailyError ? (
              <p
                style={{
                  fontSize: 12,
                  color: '#000',
                  padding: '40px 0',
                  textAlign: 'center',
                }}
              >
                그래프 데이터를 불러오지 못했습니다
              </p>
            ) : !daily ? (
              <p
                style={{
                  fontSize: 12,
                  color: '#000',
                  padding: '40px 0',
                  textAlign: 'center',
                }}
              >
                불러오는 중...
              </p>
            ) : (
              <VisitorChart data={daily} />
            )}
          </div>

          {/* 하단 테이블 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #000',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #fff',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: '#5a5a5a',
                  fontWeight: 700,
                  letterSpacing: '2px',
                }}
              >
                PRODUCTS BY SECTION
              </p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff' }}>
                  <th
                    style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: 11,
                      color: '#000',
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
                      color: '#000',
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
                        color: '#000',
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
                    onClick={() =>
                      onNavigation(
                        p.section.includes('Casual')
                          ? 'Casual Photoshoot'
                          : 'Photographers',
                      )
                    }
                    style={{
                      borderTop: i > 0 ? '1px solid #fff' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <td
                      style={{
                        padding: '16px 24px',
                        fontSize: 13,
                        color: '#000',
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
                        color: '#5a5a5a',
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
                              background: '#ebebeb',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${totalProducts > 0 ? (p._count.id / totalProducts) * 100 : 0}%`,
                                background:
                                  '#000',
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: '#000',
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

/** 일별 방문자 수 추이를 라인+영역 그래프로 그림 (외부 차트 라이브러리 없이 순수 SVG) */
function VisitorChart({ data }: { data: GaDailyPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p
        style={{
          fontSize: 12,
          color: '#000',
          padding: '40px 0',
          textAlign: 'center',
        }}
      >
        표시할 데이터가 없습니다
      </p>
    );
  }

  const width = 800;
  const height = 220;
  const paddingLeft = 36;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartWidth = width - paddingLeft;
  const chartHeight = height - paddingBottom - paddingTop;

  const rawMax = Math.max(...data.map((d) => d.activeUsers), 1);
  // 눈금이 딱 떨어지는 값이 되도록 최댓값을 살짝 올림 (예: 3 -> 4, 27 -> 30)
  const maxValue = Math.ceil(rawMax / 4) * 4 || 4;

  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    x: paddingLeft + i * stepX,
    y: paddingTop + chartHeight - (d.activeUsers / maxValue) * chartHeight,
    d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="visitorAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7f7f7f" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#7f7f7f" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 가로 그리드 라인 + y축 눈금 라벨 */}
        {gridLevels.map((level) => {
          const y = paddingTop + chartHeight - level * chartHeight;
          const value = Math.round(maxValue * level);
          return (
            <g key={level}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width}
                y2={y}
                stroke="#eee"
                strokeDasharray={level === 0 ? undefined : '3 3'}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fontSize={9}
                textAnchor="end"
                fill="#999"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* 영역 채우기 + 라인 */}
        <path d={areaPath} fill="url(#visitorAreaFill)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#7f7f7f"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hovered && (
          <line
            x1={hovered.x}
            y1={paddingTop}
            x2={hovered.x}
            y2={paddingTop + chartHeight}
            stroke="#ccc"
            strokeDasharray="3 3"
          />
        )}

        {points.map(({ x, y, d }, i) => {
          const isHovered = hoverIndex === i;
          return (
            <g key={d.date}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 4.5 : 3}
                fill="#7f7f7f"
                stroke="#fff"
                strokeWidth={isHovered ? 1.5 : 0}
              />
              {/* 실제 점보다 크게 잡은 투명 원 — 호버 히트 영역 확보 */}
              <circle
                cx={x}
                cy={y}
                r={10}
                fill="transparent"
                pointerEvents="all"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() =>
                  setHoverIndex((cur) => (cur === i ? null : cur))
                }
              />
              <text
                x={x}
                y={height - 6}
                fontSize={9}
                textAnchor="middle"
                fill="#666"
              >
                {`${d.date.split('-')[1]}/${d.date.split('-')[2]}`}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: `${(hovered.x / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: '#222',
            color: '#fff',
            fontSize: 11,
            padding: '6px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {`${hovered.d.date.split('-')[1]}/${hovered.d.date.split('-')[2]} · 방문자 ${hovered.d.activeUsers}명 · 조회 ${hovered.d.pageViews}회`}
        </div>
      )}
    </div>
  );
}
