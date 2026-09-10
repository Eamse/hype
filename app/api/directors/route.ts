import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
const LOCATION_MAP: Record<string, string> = { jeju: 'Jeju', seoul: 'Seoul' };
export async function GET(request: NextRequest) {
    const location = request.nextUrl.searchParams.get('location');
    if (location && !LOCATION_MAP[location]) {
        return NextResponse.json({ error: 'invalid location' }, { status: 400 });
    }
    const directors = await prisma.director.findMany({
        where: location ? { location: LOCATION_MAP[location] } : undefined,
        orderBy: { order: 'asc' },
        select: { id: true, number: true, name: true, location: true },
    });
    return NextResponse.json(directors);
}
