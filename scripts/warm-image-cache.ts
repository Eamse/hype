import 'dotenv/config';
import { prisma } from '@/lib/prisma';
const BASE_URL = (process.env.WARM_BASE_URL ?? 'https://hypewedding.kr').replace(/\/$/, '');
const WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const QUALITY = 75;
const CONCURRENCY = 3;
let warmed = 0;
let failed = 0;
function isR2Url(url: string): boolean {
    return url.includes('.r2.dev/') || url.includes('photo.hypewedding.kr/');
}
async function warmOne(url: string) {
    if (!isR2Url(url))
        return;
    for (const w of WIDTHS) {
        const target = `${BASE_URL}/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${QUALITY}`;
        try {
            const res = await fetch(target, {
                headers: {
                    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                },
                signal: AbortSignal.timeout(30000),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            await res.arrayBuffer();
            warmed++;
            if (warmed % 50 === 0)
                console.log(`  ...${warmed}건 처리됨`);
        }
        catch (e) {
            failed++;
            console.error(`  ❌ ${url} (w=${w}):`, e instanceof Error ? e.message : e);
        }
    }
}
async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
    let index = 0;
    async function next(): Promise<void> {
        const i = index++;
        if (i >= items.length)
            return;
        await worker(items[i]);
        return next();
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, () => next()));
}
async function main() {
    console.log(`🔥 이미지 캐시 웜업 시작 (대상: ${BASE_URL})\n`);
    const urls = new Set<string>();
    const [products, productImages, directors, packages, packageImages, magazines, magazineImages, partners, reviewImages] = await Promise.all([
        prisma.product.findMany({ select: { imageUrl: true } }),
        prisma.productImage.findMany({ select: { url: true } }),
        prisma.director.findMany({ select: { imageUrl: true } }),
        prisma.package.findMany({ select: { thumbnailUrl: true } }),
        prisma.packageImage.findMany({ select: { webUrl: true } }),
        prisma.magazine.findMany({ select: { imageUrl: true } }),
        prisma.magazineImage.findMany({ select: { url: true } }),
        prisma.partner.findMany({ select: { imageUrl: true } }),
        prisma.reviewImage.findMany({ select: { url: true } }),
    ]);
    for (const p of products)
        if (p.imageUrl)
            urls.add(p.imageUrl);
    for (const p of productImages)
        urls.add(p.url);
    for (const d of directors)
        if (d.imageUrl)
            urls.add(d.imageUrl);
    for (const p of packages)
        if (p.thumbnailUrl)
            urls.add(p.thumbnailUrl);
    for (const p of packageImages)
        urls.add(p.webUrl);
    for (const m of magazines)
        if (m.imageUrl)
            urls.add(m.imageUrl);
    for (const m of magazineImages)
        urls.add(m.url);
    for (const p of partners)
        if (p.imageUrl)
            urls.add(p.imageUrl);
    for (const r of reviewImages)
        urls.add(r.url);
    const siteConfigRows = await prisma.siteConfig.findMany({
        where: { key: { startsWith: 'images_' } },
    });
    for (const row of siteConfigRows) {
        try {
            const parsed: unknown = JSON.parse(row.value);
            if (Array.isArray(parsed))
                parsed.forEach((u) => typeof u === 'string' && urls.add(u));
        }
        catch {
        }
    }
    const targetUrls = [...urls];
    console.log(`대상 이미지: ${targetUrls.length}개 (폭 ${WIDTHS.join('/')} 각각 요청 → 총 ${targetUrls.length * WIDTHS.length}건)\n`);
    await runPool(targetUrls, warmOne);
    console.log('\n🎉 완료');
    console.log(`  성공: ${warmed}건`);
    console.log(`  실패: ${failed}건`);
}
main()
    .catch((err) => {
    console.error('❌ 실패:', err instanceof Error ? err.message : err);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
