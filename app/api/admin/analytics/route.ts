import { NextRequest, NextResponse } from 'next/server';
import { getAdminId } from '@/lib/admin-auth';
import { getGaSummary, getGaRange, getGaDaily } from '@/lib/ga';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export async function GET(request: NextRequest) {
    const admin = await getAdminId(request);
    if (!admin) {
        return NextResponse.json({ message: 'Admin not found' }, { status: 401 });
    }
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');
    const dailyParam = request.nextUrl.searchParams.get('daily');
    try {
        if (dailyParam) {
            const days = Math.min(Math.max(Number(dailyParam) || 14, 1), 90);
            const daily = await getGaDaily(days);
            return NextResponse.json({ daily });
        }
        if (startDate && endDate) {
            if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
                return NextResponse.json({ message: 'startDate/endDate는 YYYY-MM-DD 형식이어야 합니다' }, { status: 400 });
            }
            const range = await getGaRange(startDate, endDate);
            return NextResponse.json({ range });
        }
        const summary = await getGaSummary();
        return NextResponse.json(summary);
    }
    catch (e) {
        console.error('[GET /api/admin/analytics]', e);
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 });
    }
}
