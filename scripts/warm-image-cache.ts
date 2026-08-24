/**
 * 배포/업로드 직후 실제 방문자가 콜드 캐시를 겪지 않도록, DB에 저장된 모든
 * 이미지를 미리 한 번씩 /_next/image로 요청해서 Next.js 서버 캐시 +
 * Cloudflare 엣지 캐시를 사전에 데워두는 스크립트.
 *
 * 실무에서 "누군가 한 명이 처음 봐서 느리게 캐시를 채우는" 자연 웜업 대신,
 * 배포 파이프라인에서 이 스크립트를 미리 돌려 첫 방문자도 항상 캐시 HIT를
 *받도록 하기 위함.
 *
 * 실행: npx tsx scripts/warm-image-cache.ts
 * (기본 대상: https://hypewedding.kr, WARM_BASE_URL 환경변수로 변경 가능)
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';

const BASE_URL = (process.env.WARM_BASE_URL ?? 'https://hypewedding.kr').replace(/\/$/, '');
// 카드 썸네일(모바일/데스크탑)과 상세 페이지 정도만 커버 — next/image의 모든 breakpoint를
// 다 데우면 과도하므로, 실제 트래픽이 몰리는 대표 폭 몇 개만 선정
const WIDTHS = [640, 1920];
const QUALITY = 75; // next/image 기본 quality와 동일하게 맞춤 (다른 quality면 별도 캐시 엔트리가 됨)
const CONCURRENCY = 3; // 약한 VPS에 과부하 주지 않도록 동시 요청 수 제한

let warmed = 0;
let failed = 0;

function isR2Url(url: string): boolean {
  return url.includes('.r2.dev/');
}

async function warmOne(url: string) {
  if (!isR2Url(url)) return;
  for (const w of WIDTHS) {
    const target = `${BASE_URL}/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${QUALITY}`;
    try {
      const res = await fetch(target);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.arrayBuffer(); // 응답을 끝까지 받아야 서버/엣지 캐시에 실제로 저장됨
      warmed++;
    } catch (e) {
      failed++;
      console.error(`  ❌ ${url} (w=${w}):`, e instanceof Error ? e.message : e);
    }
  }
}

/** CONCURRENCY만큼만 동시에 진행하는 간단한 워커 풀 */
async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let index = 0;
  async function next(): Promise<void> {
    const i = index++;
    if (i >= items.length) return;
    await worker(items[i]);
    return next();
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => next()));
}

async function main() {
  console.log(`🔥 이미지 캐시 웜업 시작 (대상: ${BASE_URL})\n`);

  const urls = new Set<string>();

  const [products, productImages, directors, packages, packageImages, magazines, magazineImages, partners, reviewImages] =
    await Promise.all([
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

  for (const p of products) if (p.imageUrl) urls.add(p.imageUrl);
  for (const p of productImages) urls.add(p.url);
  for (const d of directors) if (d.imageUrl) urls.add(d.imageUrl);
  for (const p of packages) if (p.thumbnailUrl) urls.add(p.thumbnailUrl);
  for (const p of packageImages) urls.add(p.webUrl);
  for (const m of magazines) if (m.imageUrl) urls.add(m.imageUrl);
  for (const m of magazineImages) urls.add(m.url);
  for (const p of partners) if (p.imageUrl) urls.add(p.imageUrl);
  for (const r of reviewImages) urls.add(r.url);

  const siteConfigRows = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'images_' } },
  });
  for (const row of siteConfigRows) {
    try {
      const parsed: unknown = JSON.parse(row.value);
      if (Array.isArray(parsed)) parsed.forEach((u) => typeof u === 'string' && urls.add(u));
    } catch {
      // skip
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
