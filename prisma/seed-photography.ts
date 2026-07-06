/**
 * 웨딩 포토그래피 데이터 시드 스크립트
 * prisma/photographers.json에서 데이터를 읽어 DB에 일괄 등록
 *
 * 실행: npx tsx prisma/seed-photography.ts
 */
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

// ── JSON 파일에서 PHOTOGRAPHERS 데이터 로드 ──────────────────────────────────
function loadPhotographers(): PhotogData {
  const filePath = path.join(__dirname, 'photographers.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as PhotogData;
}

type RawPackage = {
  name: string;
  subtitle?: string;
  priceSNS: number;
  priceNoSNS: number;
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail?: string;
  inclusiveItems: string[];
  addons: { name: string; price: number | null; desc?: string }[];
  partners: {
    hmu?: { name: string; instagram: string };
    dress?: { name: string; instagram: string };
    suit?: { name: string; instagram: string };
  };
};

type RawDirector = {
  number: string;
  name: string;
  instagram: string;
  packages: RawPackage[];
  subPhotographers?: RawDirector[];
};

type PhotogData = { jeju: RawDirector[]; seoul: RawDirector[] };

type LeafDirector = RawDirector & { location: 'Jeju' | 'Seoul' };

// 모든 leaf 디렉터 수집 (subPhotographers 있으면 그 자식들, 없으면 본인)
function collectDirectors(data: PhotogData): LeafDirector[] {
  const result: LeafDirector[] = [];
  for (const [key, location] of [['jeju', 'Jeju'], ['seoul', 'Seoul']] as const) {
    for (const p of data[key]) {
      if (p.subPhotographers && p.subPhotographers.length > 0) {
        for (const sp of p.subPhotographers) result.push({ ...sp, location });
      } else {
        result.push({ ...p, location });
      }
    }
  }
  return result;
}

// ── 메인 ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('📦 hype-wedding-packages.jsx 데이터 로드 중...');
  const data = loadPhotographers();
  const directors = collectDirectors(data);
  console.log(`✅ ${directors.length}명 디렉터, 총 ${directors.reduce((s, d) => s + d.packages.length, 0)}개 패키지 발견`);

  // ── 기존 데이터 초기화 ──
  console.log('\n🗑️  기존 데이터 초기화...');
  await prisma.packagePartner.deleteMany({});
  await prisma.packageAddon.deleteMany({});
  await prisma.packageInclusion.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.director.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.addon.deleteMany({});
  await prisma.inclusion.deleteMany({});
  // Casual/Snap 상품은 이 시드가 다루지 않으므로 Photographers 섹션만 정리
  await prisma.product.deleteMany({
    where: { section: { in: ['Photographers in Jeju', 'Photographers in Seoul'] } },
  });

  // ── 1. Inclusions 수집 및 생성 ──
  const inclusionNames = new Set<string>();
  for (const dir of directors)
    for (const pkg of dir.packages)
      for (const item of pkg.inclusiveItems)
        inclusionNames.add(item);

  const inclusionMap = new Map<string, number>();
  let order = 0;
  for (const name of inclusionNames) {
    const inc = await prisma.inclusion.create({ data: { name, order: order++ } });
    inclusionMap.set(name, inc.id);
  }
  console.log(`\n✅ Inclusions: ${inclusionMap.size}개 생성`);

  // ── 2. Addons 수집 및 생성 (이름 기준 dedup, null price → 0) ──
  const addonByName = new Map<string, { price: number; desc: string | null }>();
  for (const dir of directors)
    for (const pkg of dir.packages)
      for (const a of pkg.addons)
        if (!addonByName.has(a.name))
          addonByName.set(a.name, { price: a.price ?? 0, desc: a.desc ?? null });

  const addonMap = new Map<string, number>();
  order = 0;
  for (const [name, { price, desc }] of addonByName) {
    const a = await prisma.addon.create({ data: { name, price, desc, order: order++ } });
    addonMap.set(name, a.id);
  }
  console.log(`✅ Addons: ${addonMap.size}개 생성`);

  // ── 3. Partners 수집 및 생성 (role+name 기준 dedup) ──
  const pKey = (role: string, name: string) => `${role}:${name}`;
  const partnerByKey = new Map<string, { role: string; name: string; instagram: string | null }>();
  for (const dir of directors) {
    for (const pkg of dir.packages) {
      const { hmu, dress, suit } = pkg.partners;
      if (hmu) partnerByKey.set(pKey('hmu', hmu.name), { role: 'hmu', name: hmu.name, instagram: hmu.instagram });
      if (dress) partnerByKey.set(pKey('dress', dress.name), { role: 'dress', name: dress.name, instagram: dress.instagram });
      if (suit) partnerByKey.set(pKey('suit', suit.name), { role: 'suit', name: suit.name, instagram: suit.instagram });
    }
  }

  const partnerMap = new Map<string, number>();
  order = 0;
  for (const [key, { role, name, instagram }] of partnerByKey) {
    const p = await prisma.partner.create({ data: { role, name, instagram, order: order++ } });
    partnerMap.set(key, p.id);
  }
  console.log(`✅ Partners: ${partnerMap.size}개 생성`);

  // ── 4. Directors + Packages + 연결 ──
  console.log('\n📸 Directors & Packages 등록 중...');
  const directorIdByNumber = new Map<string, number>();
  let dirOrder = 0;
  for (const dir of directors) {
    const director = await prisma.director.create({
      data: {
        number: dir.number,
        name: dir.name,
        location: dir.location,
        instagram: dir.instagram || null,
        order: dirOrder++,
      },
    });
    directorIdByNumber.set(dir.number, director.id);

    let pkgOrder = 0;
    for (const pkg of dir.packages) {
      const createdPkg = await prisma.package.create({
        data: {
          director: { connect: { id: director.id } },
          name: pkg.name,
          subtitle: pkg.subtitle ?? null,
          priceSNS: pkg.priceSNS ?? 0,
          priceNoSNS: pkg.priceNoSNS ?? 0,
          shootingTime: pkg.shootingTime,
          locations: pkg.locations,
          originalPhotos: pkg.originalPhotos,
          retouched: pkg.retouched,
          retouchedDetail: pkg.retouchedDetail ?? null,
          order: pkgOrder++,
        },
      });

      // Inclusions 연결
      for (const item of pkg.inclusiveItems) {
        const incId = inclusionMap.get(item);
        if (incId) await prisma.packageInclusion.create({ data: { packageId: createdPkg.id, inclusionId: incId } });
      }

      // Addons 연결
      for (const a of pkg.addons) {
        const addonId = addonMap.get(a.name);
        if (addonId) await prisma.packageAddon.create({ data: { packageId: createdPkg.id, addonId } });
      }

      // Partners 연결
      const { hmu, dress, suit } = pkg.partners;
      for (const [partner, role] of [[hmu, 'hmu'], [dress, 'dress'], [suit, 'suit']] as const) {
        if (partner) {
          const pId = partnerMap.get(pKey(role, partner.name));
          if (pId) await prisma.packagePartner.create({ data: { packageId: createdPkg.id, partnerId: pId } });
        }
      }
    }

    console.log(`  ✓ ${dir.number} ${dir.name} — ${dir.packages.length}개 패키지`);
  }

  // ── 5. Products(스튜디오 단위) + ProductDirector 연결 ──
  console.log('\n🏢 Products 등록 중...');
  for (const [key, section] of [
    ['jeju', 'Photographers in Jeju'],
    ['seoul', 'Photographers in Seoul'],
  ] as const) {
    for (const [i, top] of data[key].entries()) {
      const subs = top.subPhotographers && top.subPhotographers.length > 0 ? top.subPhotographers : [top];
      const directorIds = subs.map((s) => directorIdByNumber.get(s.number)!);

      const product = await prisma.product.create({
        data: { title: top.name, section, order: i },
      });
      await prisma.productDirector.createMany({
        data: directorIds.map((directorId) => ({ productId: product.id, directorId })),
      });
      console.log(`  ✓ ${top.number} ${top.name} — 작가 ${directorIds.length}명 연결`);
    }
  }

  console.log('\n🎉 시드 완료!');
}

main()
  .catch((e) => { console.error('❌ 시드 실패:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

