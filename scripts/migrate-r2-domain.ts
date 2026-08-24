/**
 * DB에 저장된 이미지 URL의 호스트를 예전 R2 기본 도메인(pub-xxxx.r2.dev)에서
 * 새 커스텀 도메인(photo.hypewedding.kr)으로 일괄 치환.
 *
 * r2.dev는 Cloudflare가 테스트/개발용으로만 쓰라고 명시한 도메인이라 해외에서
 * 불안정했음(필리핀에서 이미지 깨짐 확인). R2 버킷에 photo.hypewedding.kr
 * 커스텀 도메인을 연결했고(같은 버킷, 같은 오브젝트를 가리킴), 파일 자체는
 * 옮길 필요 없이 DB의 URL 문자열만 호스트를 바꿔주면 됨.
 *
 * 실행: npx tsx scripts/migrate-r2-domain.ts
 * 미리보기: npx tsx scripts/migrate-r2-domain.ts --dry-run
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';

const OLD_HOST = 'pub-ba784eb2bec14ac984de128566a0665e.r2.dev';
const NEW_HOST = 'photo.hypewedding.kr';
const DRY_RUN = process.argv.includes('--dry-run');

let changedCount = 0;

function migrate(url: string | null): string | null {
  if (!url || !url.includes(OLD_HOST)) return null;
  return url.replace(`https://${OLD_HOST}`, `https://${NEW_HOST}`);
}

async function migrateField<T extends { id: number | string }>(
  label: string,
  rows: (T & Record<string, unknown>)[],
  fields: string[],
  update: (id: T['id'], data: Record<string, string>) => Promise<unknown>,
) {
  console.log(`\n▶ ${label} (${rows.length}건)`);
  for (const row of rows) {
    const data: Record<string, string> = {};
    for (const field of fields) {
      const newUrl = migrate(row[field] as string | null);
      if (newUrl) data[field] = newUrl;
    }
    if (Object.keys(data).length === 0) continue;

    changedCount++;
    if (DRY_RUN) {
      console.log(`  [dry-run] #${row.id}:`, data);
      continue;
    }
    await update(row.id, data);
    console.log(`  ✅ #${row.id}`);
  }
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — 실제 변경 없이 시뮬레이션만 합니다\n' : '🚀 R2 도메인 마이그레이션 시작\n');

  await migrateField(
    'Product.imageUrl',
    await prisma.product.findMany({ select: { id: true, imageUrl: true } }),
    ['imageUrl'],
    (id, data) => prisma.product.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'ProductImage.url/thumbUrl',
    await prisma.productImage.findMany({ select: { id: true, url: true, thumbUrl: true } }),
    ['url', 'thumbUrl'],
    (id, data) => prisma.productImage.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'Director.imageUrl',
    await prisma.director.findMany({ select: { id: true, imageUrl: true } }),
    ['imageUrl'],
    (id, data) => prisma.director.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'Package.thumbnailUrl',
    await prisma.package.findMany({ select: { id: true, thumbnailUrl: true } }),
    ['thumbnailUrl'],
    (id, data) => prisma.package.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'PackageImage.webUrl/originalUrl/thumbUrl',
    await prisma.packageImage.findMany({
      select: { id: true, webUrl: true, originalUrl: true, thumbUrl: true },
    }),
    ['webUrl', 'originalUrl', 'thumbUrl'],
    (id, data) => prisma.packageImage.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'Magazine.imageUrl',
    await prisma.magazine.findMany({ select: { id: true, imageUrl: true } }),
    ['imageUrl'],
    (id, data) => prisma.magazine.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'MagazineImage.url',
    await prisma.magazineImage.findMany({ select: { id: true, url: true } }),
    ['url'],
    (id, data) => prisma.magazineImage.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'Partner.imageUrl',
    await prisma.partner.findMany({ select: { id: true, imageUrl: true } }),
    ['imageUrl'],
    (id, data) => prisma.partner.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'ReviewImage.url',
    await prisma.reviewImage.findMany({ select: { id: true, url: true } }),
    ['url'],
    (id, data) => prisma.reviewImage.update({ where: { id: id as number }, data }),
  );

  await migrateField(
    'HeroImage.url',
    await prisma.heroImage.findMany({ select: { id: true, url: true } }),
    ['url'],
    (id, data) => prisma.heroImage.update({ where: { id: id as number }, data }),
  );

  // SiteConfig의 images_* 키(배열)
  const siteConfigRows = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'images_' } },
  });
  console.log(`\n▶ SiteConfig images_* (${siteConfigRows.length}건)`);
  for (const row of siteConfigRows) {
    let urls: string[];
    try {
      const parsed: unknown = JSON.parse(row.value);
      urls = Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      continue;
    }
    const newUrls = urls.map((u) => migrate(u) ?? u);
    if (newUrls.every((u, i) => u === urls[i])) continue;

    changedCount++;
    if (DRY_RUN) {
      console.log(`  [dry-run] ${row.key}:`, newUrls);
      continue;
    }
    await prisma.siteConfig.update({
      where: { key: row.key },
      data: { value: JSON.stringify(newUrls) },
    });
    console.log(`  ✅ ${row.key}`);
  }

  console.log('\n🎉 완료');
  console.log(`  ${DRY_RUN ? '변경 예정' : '변경'}: ${changedCount}건`);
}

main()
  .catch((err) => {
    console.error('❌ 실패:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
