/**
 * 카드 그리드용 썸네일(Product.imageUrl, Package.thumbnailUrl)을
 * THUMBNAIL_RESIZE_WIDTH/QUALITY(640px/q75)로 재압축.
 *
 * /api/images 업로드 로직에 "key에 thumb 포함 시 640px로 저장" 분기를 추가했는데,
 * 그건 앞으로 새로 올리는 파일에만 적용되고 기존에 이미 올라간 썸네일들은
 * 여전히 큰 원본(1920px 등) 그대로라 실제 서빙 속도가 안 바뀜 — 이 스크립트로
 * 기존 것도 일괄 재처리함.
 *
 * - recompress-images.ts와 동일하게 URL을 덮어쓰지 않고 새 파일로 업로드 후
 *   DB를 갱신하고 옛 오브젝트를 삭제 (캐시된 옛 URL이 계속 서빙되는 문제 방지)
 *
 * 실행: npx tsx scripts/recompress-thumbnails.ts
 * 미리보기: npx tsx scripts/recompress-thumbnails.ts --dry-run
 */
import 'dotenv/config';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { uploadToR2, deleteFileFromR2 } from '@/lib/r2';
import { THUMBNAIL_RESIZE_WIDTH, THUMBNAIL_WEBP_QUALITY, SHARP_OPTIONS } from '@/lib/validate-image';

const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
if (!R2_PUBLIC_BASE_URL) throw new Error('R2_PUBLIC_BASE_URL이 설정되지 않았습니다');

const DRY_RUN = process.argv.includes('--dry-run');

let recompressedCount = 0;
let skippedCount = 0;
let failedCount = 0;
let savedBytes = 0;

function isOwnR2Url(url: string): boolean {
  return url.startsWith(R2_PUBLIC_BASE_URL + '/');
}

async function recompressOne(url: string, keyPrefix: string): Promise<string | null> {
  if (!isOwnR2Url(url)) {
    skippedCount++;
    return null;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const original = Buffer.from(await res.arrayBuffer());

    const compressed = await sharp(original, SHARP_OPTIONS)
      .resize(THUMBNAIL_RESIZE_WIDTH)
      .webp({ quality: THUMBNAIL_WEBP_QUALITY })
      .toBuffer();

    if (compressed.length >= original.length) {
      skippedCount++;
      return null;
    }

    if (DRY_RUN) {
      console.log(
        `  [dry-run] ${url} — ${(original.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`,
      );
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
    console.log(
      `  ✅ ${url.split('/').pop()} — ${(original.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`,
    );
    return newUrl;
  } catch (e) {
    failedCount++;
    console.error(`  ❌ 실패: ${url}`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — 실제 변경 없이 시뮬레이션만 합니다\n' : '🚀 썸네일 재압축 시작\n');

  const products = await prisma.product.findMany({ select: { id: true, imageUrl: true } });
  console.log(`\n▶ Product.imageUrl (${products.length}건)`);
  for (const p of products) {
    if (!p.imageUrl) continue;
    const newUrl = await recompressOne(p.imageUrl, `product_thumb_${p.id}`);
    if (newUrl) await prisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } });
  }

  const packages = await prisma.package.findMany({ select: { id: true, thumbnailUrl: true } });
  console.log(`\n▶ Package.thumbnailUrl (${packages.length}건)`);
  for (const pkg of packages) {
    if (!pkg.thumbnailUrl) continue;
    const newUrl = await recompressOne(pkg.thumbnailUrl, `package_thumb_${pkg.id}`);
    if (newUrl) await prisma.package.update({ where: { id: pkg.id }, data: { thumbnailUrl: newUrl } });
  }

  console.log('\n🎉 완료');
  console.log(`  재압축: ${recompressedCount}건`);
  console.log(`  건너뜀: ${skippedCount}건 (외부 URL/이미 작음)`);
  console.log(`  실패: ${failedCount}건`);
  console.log(`  절약된 용량: ${(savedBytes / 1024 / 1024).toFixed(1)}MB`);
}

main()
  .catch((err) => {
    console.error('❌ 실패:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
