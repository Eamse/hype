import 'dotenv/config';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { DEFAULT_RESIZE_WIDTH, DEFAULT_WEBP_QUALITY, SHARP_OPTIONS, } from '@/lib/validate-image';
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
if (!R2_PUBLIC_BASE_URL)
    throw new Error('R2_PUBLIC_BASE_URL이 설정되지 않았습니다');
const DRY_RUN = process.argv.includes('--dry-run');
let recompressedCount = 0;
let skippedCount = 0;
let failedCount = 0;
let savedBytes = 0;
function isHeroUrl(url: string): boolean {
    const filename = url.split('/').pop() ?? '';
    return filename.toLowerCase().startsWith('hero');
}
function isOwnR2Url(url: string): boolean {
    return url.startsWith(R2_PUBLIC_BASE_URL + '/');
}
async function recompressOne(url: string, keyPrefix: string): Promise<string | null> {
    if (!isOwnR2Url(url)) {
        skippedCount++;
        return null;
    }
    if (isHeroUrl(url)) {
        skippedCount++;
        return null;
    }
    try {
        const res = await fetch(url);
        if (!res.ok)
            throw new Error(`fetch failed: ${res.status}`);
        const original = Buffer.from(await res.arrayBuffer());
        const compressed = await sharp(original, SHARP_OPTIONS)
            .resize(DEFAULT_RESIZE_WIDTH)
            .webp({ quality: DEFAULT_WEBP_QUALITY })
            .toBuffer();
        if (compressed.length >= original.length) {
            skippedCount++;
            return null;
        }
        if (DRY_RUN) {
            console.log(`  [dry-run] ${url} — ${(original.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`);
            recompressedCount++;
            savedBytes += original.length - compressed.length;
            return null;
        }
        const newFilename = `${keyPrefix}_${crypto.randomUUID()}.webp`;
        await uploadToR2(newFilename, compressed);
        const newUrl = `${R2_PUBLIC_BASE_URL}/${newFilename}`;
        await deleteFileFromR2(url);
        recompressedCount++;
        savedBytes += original.length - compressed.length;
        console.log(`  ✅ ${url.split('/').pop()} — ${(original.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`);
        return newUrl;
    }
    catch (e) {
        failedCount++;
        console.error(`  ❌ 실패: ${url}`, e instanceof Error ? e.message : e);
        return null;
    }
}
async function processSingleUrlField<T extends {
    id: number | string;
}>(label: string, rows: (T & Record<string, unknown>)[], field: string, keyPrefix: string, update: (id: T['id'], url: string) => Promise<unknown>) {
    console.log(`\n▶ ${label} (${rows.length}건)`);
    for (const row of rows) {
        const url = row[field] as string | null;
        if (!url)
            continue;
        const newUrl = await recompressOne(url, keyPrefix);
        if (newUrl)
            await update(row.id, newUrl);
    }
}
async function main() {
    console.log(DRY_RUN ? '🔍 DRY RUN — 실제 변경 없이 시뮬레이션만 합니다\n' : '🚀 이미지 재압축 시작\n');
    const products = await prisma.product.findMany({ select: { id: true, imageUrl: true } });
    await processSingleUrlField('Product.imageUrl', products, 'imageUrl', 'product_thumb', (id, url) => prisma.product.update({ where: { id: id as number }, data: { imageUrl: url } }));
    const productImages = await prisma.productImage.findMany({ select: { id: true, url: true } });
    await processSingleUrlField('ProductImage.url', productImages, 'url', 'product_detail', (id, url) => prisma.productImage.update({ where: { id: id as number }, data: { url } }));
    const directors = await prisma.director.findMany({ select: { id: true, imageUrl: true } });
    await processSingleUrlField('Director.imageUrl', directors, 'imageUrl', 'director', (id, url) => prisma.director.update({ where: { id: id as number }, data: { imageUrl: url } }));
    const packages = await prisma.package.findMany({ select: { id: true, thumbnailUrl: true } });
    await processSingleUrlField('Package.thumbnailUrl', packages, 'thumbnailUrl', 'package_thumb', (id, url) => prisma.package.update({ where: { id: id as number }, data: { thumbnailUrl: url } }));
    const packageImages = await prisma.packageImage.findMany({ select: { id: true, webUrl: true } });
    await processSingleUrlField('PackageImage.webUrl', packageImages, 'webUrl', 'package_web', (id, url) => prisma.packageImage.update({ where: { id: id as number }, data: { webUrl: url } }));
    const magazines = await prisma.magazine.findMany({ select: { id: true, imageUrl: true } });
    await processSingleUrlField('Magazine.imageUrl', magazines, 'imageUrl', 'magazine_thumb', (id, url) => prisma.magazine.update({ where: { id: id as number }, data: { imageUrl: url } }));
    const magazineImages = await prisma.magazineImage.findMany({ select: { id: true, url: true } });
    await processSingleUrlField('MagazineImage.url', magazineImages, 'url', 'magazine_body', (id, url) => prisma.magazineImage.update({ where: { id: id as number }, data: { url } }));
    const partners = await prisma.partner.findMany({ select: { id: true, imageUrl: true } });
    await processSingleUrlField('Partner.imageUrl', partners, 'imageUrl', 'partner', (id, url) => prisma.partner.update({ where: { id: id as number }, data: { imageUrl: url } }));
    const reviewImages = await prisma.reviewImage.findMany({ select: { id: true, url: true } });
    await processSingleUrlField('ReviewImage.url', reviewImages, 'url', 'review', (id, url) => prisma.reviewImage.update({ where: { id: id as number }, data: { url } }));
    const siteConfigRows = await prisma.siteConfig.findMany({
        where: { key: { startsWith: 'images_' } },
    });
    console.log(`\n▶ SiteConfig images_* (${siteConfigRows.length}건)`);
    for (const row of siteConfigRows) {
        const logicalKey = row.key.slice('images_'.length);
        if (logicalKey.toLowerCase().startsWith('hero')) {
            console.log(`  ⏭️  ${row.key} — 히어로 키라 건너뜀`);
            continue;
        }
        let urls: string[];
        try {
            const parsed: unknown = JSON.parse(row.value);
            urls = Array.isArray(parsed) ? (parsed as string[]) : [];
        }
        catch {
            continue;
        }
        const newUrls: string[] = [];
        for (const url of urls) {
            const newUrl = await recompressOne(url, logicalKey);
            newUrls.push(newUrl ?? url);
        }
        if (!DRY_RUN && newUrls.some((u, i) => u !== urls[i])) {
            await prisma.siteConfig.update({
                where: { key: row.key },
                data: { value: JSON.stringify(newUrls) },
            });
        }
    }
    console.log('\n🎉 완료');
    console.log(`  재압축: ${recompressedCount}건`);
    console.log(`  건너뜀: ${skippedCount}건 (히어로/외부 URL/이미 작음)`);
    console.log(`  실패: ${failedCount}건`);
    console.log(`  절약된 용량: ${(savedBytes / 1024 / 1024).toFixed(1)}MB`);
}
main()
    .catch((err) => {
    console.error('❌ 실패:', err instanceof Error ? err.message : err);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
