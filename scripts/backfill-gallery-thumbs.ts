/**
 * ProductImage/PackageImage에 새로 추가된 thumbUrl 컬럼을 기존 행들에 채워넣는 백필 스크립트.
 *
 * 상세 갤러리 썸네일 스트립(64px)이 큰 원본(ProductImage.url 1920px, PackageImage는
 * originalUrl 3840px)을 매 요청마다 실시간으로 축소하던 게 느림의 원인이었음 —
 * 진짜 작은 파일(640px)을 새로 만들어 thumbUrl에 저장해두고, 이미 존재하는 행들은
 * 이 스크립트로 한 번에 채움. (신규 업로드/동기화는 각 라우트/스크립트에서 이미 처리)
 *
 * 실행: npx tsx scripts/backfill-gallery-thumbs.ts
 * 미리보기: npx tsx scripts/backfill-gallery-thumbs.ts --dry-run
 */
import 'dotenv/config';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';
import { THUMBNAIL_RESIZE_WIDTH, THUMBNAIL_WEBP_QUALITY, SHARP_OPTIONS } from '@/lib/validate-image';

const DRY_RUN = process.argv.includes('--dry-run');

let doneCount = 0;
let failedCount = 0;

async function makeThumb(sourceUrl: string, keyPrefix: string): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const original = Buffer.from(await res.arrayBuffer());

    const compressed = await sharp(original, SHARP_OPTIONS)
      .resize(THUMBNAIL_RESIZE_WIDTH)
      .webp({ quality: THUMBNAIL_WEBP_QUALITY })
      .toBuffer();

    if (DRY_RUN) {
      console.log(`  [dry-run] ${sourceUrl} — 썸네일 ${(compressed.length / 1024).toFixed(0)}KB 생성 예정`);
      return null;
    }

    const filename = `${keyPrefix}_${crypto.randomUUID()}.webp`;
    await uploadToR2(filename, compressed);
    return `${(process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')}/${filename}`;
  } catch (e) {
    failedCount++;
    console.error(`  ❌ 실패: ${sourceUrl}`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — 실제 변경 없이 시뮬레이션만 합니다\n' : '🚀 갤러리 썸네일 백필 시작\n');

  const productImages = await prisma.productImage.findMany({
    where: { thumbUrl: null },
    select: { id: true, url: true },
  });
  console.log(`▶ ProductImage (thumbUrl 없음: ${productImages.length}건)`);
  for (const img of productImages) {
    const thumbUrl = await makeThumb(img.url, 'product_detail_thumb');
    if (thumbUrl) {
      await prisma.productImage.update({ where: { id: img.id }, data: { thumbUrl } });
      doneCount++;
      console.log(`  ✅ ProductImage #${img.id}`);
    }
  }

  const packageImages = await prisma.packageImage.findMany({
    where: { thumbUrl: null },
    select: { id: true, webUrl: true },
  });
  console.log(`\n▶ PackageImage (thumbUrl 없음: ${packageImages.length}건)`);
  for (const img of packageImages) {
    // webUrl(1600px)이 originalUrl(3840px)보다 이미 작아서, 썸네일 생성 소스로 더 적합
    const thumbUrl = await makeThumb(img.webUrl, 'package_thumb_gallery');
    if (thumbUrl) {
      await prisma.packageImage.update({ where: { id: img.id }, data: { thumbUrl } });
      doneCount++;
      console.log(`  ✅ PackageImage #${img.id}`);
    }
  }

  console.log('\n🎉 완료');
  console.log(`  생성: ${doneCount}건`);
  console.log(`  실패: ${failedCount}건`);
}

main()
  .catch((err) => {
    console.error('❌ 실패:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
