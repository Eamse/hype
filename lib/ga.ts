import { BetaAnalyticsDataClient } from '@google-analytics/data';
const propertyId = process.env.GA_PROPERTY_ID;
const clientEmail = process.env.GA_CLIENT_EMAIL;
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
type RangeStat = {
    activeUsers: number;
    pageViews: number;
};
export type GaSummary = {
    today: RangeStat;
    last7Days: RangeStat;
    last30Days: RangeStat;
    allTime: RangeStat;
};
async function runRangeReport(startDate: string, endDate: string): Promise<RangeStat> {
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
export async function getGaSummary(): Promise<GaSummary> {
    const [today, last7Days, last30Days, allTime] = await Promise.all([
        runRangeReport('today', 'today'),
        runRangeReport('7daysAgo', 'today'),
        runRangeReport('30daysAgo', 'today'),
        runRangeReport('2015-08-14', 'today'),
    ]);
    return { today, last7Days, last30Days, allTime };
}
export async function getGaRange(startDate: string, endDate: string): Promise<RangeStat> {
    return runRangeReport(startDate, endDate);
}
export type GaDailyPoint = {
    date: string;
    activeUsers: number;
    pageViews: number;
};
export async function getGaDaily(days: number): Promise<GaDailyPoint[]> {
    const analyticsClient = getClient();
    const [result] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
    });
    const byDate = new Map<string, {
        activeUsers: number;
        pageViews: number;
    }>();
    for (const row of result.rows ?? []) {
        const raw = row.dimensionValues?.[0]?.value ?? '';
        const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
        byDate.set(date, {
            activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
            pageViews: Number(row.metricValues?.[1]?.value ?? 0),
        });
    }
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
