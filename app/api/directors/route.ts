import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
const LOCATION_MAP: Record<string, string> = { jeju: 'Jeju', seoul: 'Seoul' };
const ALLOWED_CATEGORIES = new Set(['wedding', 'snap']);
export async function GET(request: NextRequest) {
    const location = request.nextUrl.searchParams.get('location');
    const category = request.nextUrl.searchParams.get('category');
    if (location && !LOCATION_MAP[location]) {
        return NextResponse.json({ error: 'invalid location' }, { status: 400 });
    }
    if (category && !ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'invalid category' }, { status: 400 });
    }
    const directors = await prisma.director.findMany({
        where: {
            ...(location && { location: LOCATION_MAP[location] }),
            ...(category && { category }),
        },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            number: true,
            name: true,
            location: true,
            category: true,
            products: { select: { product: { select: { title: true } } }, take: 1 },
        },
    });
    // 스튜디오 하나에 서브 디렉터(#1-1, #1-2 등)가 여러 명 있을 수 있는데,
    // 리뷰 작성 시 선택지에는 스튜디오당 하나(첫 번째)만 대표로 노출.
    // 대표 이름은 서브 디렉터 개인 이름("Main Director" 등)이 아니라
    // 연결된 상품(Product)의 실제 스튜디오 브랜드명을 우선 사용
    // wedding/snap 카테고리는 서로 번호가 겹칠 수 있어(#1 등) 키에 category도 포함
    const seenStudios = new Set<string>();
    const dedupedDirectors = directors
        .filter((d) => {
            const studioKey = `${d.category}-${d.location}-${d.number.split('-')[0]}`;
            if (seenStudios.has(studioKey))
                return false;
            seenStudios.add(studioKey);
            return true;
        })
        .map(({ products, ...d }) => ({
            ...d,
            name: products[0]?.product.title ?? d.name,
        }));
    return NextResponse.json(dedupedDirectors);
}
