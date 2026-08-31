import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;
const clientEmail = process.env.GA_CLIENT_EMAIL;
// .env는 개행을 \n 리터럴 문자로 저장하므로, 실제 개행으로 복원해야 키가 유효함
const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

let client: BetaAnalyticsDataClient | null = null;

function getClient() {
  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error('GA_PROPERTY_ID / GA_CLIENT_EMAIL / GA_PRIVATE_KEY가 설정되지 않았습니다');
  }
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  }
  return client;
}

type RangeStat = { activeUsers: number; pageViews: number };

export type GaSummary = {
  today: RangeStat;
  last7Days: RangeStat;
  last30Days: RangeStat;
  // GA4는 속성을 만들기 이전 데이터가 없으므로, 아주 이른 날짜를 시작일로 주면
  // 실제로는 "데이터가 쌓이기 시작한 시점부터 지금까지"로 자동 clamp됨
  allTime: RangeStat;
};

async function runRangeReport(
  startDate: string,
  endDate: string,
): Promise<RangeStat> {
  const analyticsClient = getClient();
  const [result] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
  });
  const row = result.rows?.[0];
  return {
    activeUsers: Number(row?.metricValues?.[0]?.value ?? 0),
    pageViews: Number(row?.metricValues?.[1]?.value ?? 0),
  };
}

/** 오늘 / 최근 7일 / 최근 30일 / 전체 누적 방문자 수·페이지뷰 요약 */
export async function getGaSummary(): Promise<GaSummary> {
  const [today, last7Days, last30Days, allTime] = await Promise.all([
    runRangeReport('today', 'today'),
    runRangeReport('7daysAgo', 'today'),
    runRangeReport('30daysAgo', 'today'),
    runRangeReport('2015-08-14', 'today'), // GA4 최초 출시일 — 사실상 "전체 기간"
  ]);
  return { today, last7Days, last30Days, allTime };
}

/** 직접 지정한 기간(YYYY-MM-DD)의 방문자 수·페이지뷰 조회 */
export async function getGaRange(
  startDate: string,
  endDate: string,
): Promise<RangeStat> {
  return runRangeReport(startDate, endDate);
}

export type GaDailyPoint = { date: string; activeUsers: number; pageViews: number };

/** 최근 N일간 일별 방문자 수·페이지뷰 (그래프용, 날짜 오름차순) */
export async function getGaDaily(days: number): Promise<GaDailyPoint[]> {
  const analyticsClient = getClient();
  const [result] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });

  const byDate = new Map<string, { activeUsers: number; pageViews: number }>();
  for (const row of result.rows ?? []) {
    const raw = row.dimensionValues?.[0]?.value ?? ''; // YYYYMMDD
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    byDate.set(date, {
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
      pageViews: Number(row.metricValues?.[1]?.value ?? 0),
    });
  }

  // GA는 트래픽이 있었던 날짜만 row로 돌려주므로(신규 속성이면 대부분 날짜가 통째로 빠짐),
  // 그래프가 항상 요청한 일수만큼 고르게 그려지도록 빈 날짜는 0으로 채워서 반환
  const points: GaDailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const found = byDate.get(date);
    points.push({
      date,
      activeUsers: found?.activeUsers ?? 0,
      pageViews: found?.pageViews ?? 0,
    });
  }
  return points;
}
