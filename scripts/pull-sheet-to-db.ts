import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { getSheetsClient, SHEET_ID } from './sheets-client';

async function readTab(
  sheets: Awaited<ReturnType<typeof getSheetsClient>>,
  tab: string,
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2:Z`, // 헤더(1행) 제외하고 데이터만
  });
  return (res.data.values ?? []) as string[][];
}
async function main() {
  const sheets = await getSheetsClient();

  const directorRows = await readTab(sheets, '1_directors');
  for (const row of directorRows) {
    await upsertDirector(row);
  }
  console.log(`directors: ${directorRows.length}건 처리 완료`);

  const packageRows = await readTab(sheets, '2_packages');
  for (const row of packageRows) {
    await upsertPackage(row);
  }
  console.log(`packages: ${packageRows.length}건 처리 완료`);

  const inclusionsByPackage = groupByPackageId(await readTab(sheets, '3_inclusions'));
  for (const [packageId, rows] of inclusionsByPackage) {
    await syncInclusions(packageId, rows);
  }
  console.log(`inclusions: ${inclusionsByPackage.size}개 패키지 동기화 완료`);

  const addonsByPackage = groupByPackageId(await readTab(sheets, '4_addons'));
  for (const [packageId, rows] of addonsByPackage) {
    await syncAddons(packageId, rows);
  }
  console.log(`addons: ${addonsByPackage.size}개 패키지 동기화 완료`);

  // partners를 먼저 돌려서 이 패키지의 기존 연결을 지운 다음, bouquet은 지우지 않고 이어서 추가함
  // (둘 다 PackagePartner 테이블을 같이 쓰기 때문에 순서가 중요함)
  const partnersByPackage = groupByPackageId(await readTab(sheets, '5_partners'));
  for (const [packageId, rows] of partnersByPackage) {
    await syncPartners(packageId, rows);
  }
  console.log(`partners: ${partnersByPackage.size}개 패키지 동기화 완료`);

  const bouquetByPackage = groupByPackageId(await readTab(sheets, '6_bouquet'));
  for (const [packageId, rows] of bouquetByPackage) {
    if (!partnersByPackage.has(packageId)) {
      // partners 탭에 이 패키지 행이 아예 없었으면 syncPartners가 안 돌았으니, 기존 연결을 여기서 지워줌
      const pkgDbId = packageIdMap.get(packageId);
      if (pkgDbId) await prisma.packagePartner.deleteMany({ where: { packageId: pkgDbId } });
    }
    await syncBouquet(packageId, rows);
  }
  console.log(`bouquet: ${bouquetByPackage.size}개 패키지 동기화 완료`);
}

async function upsertDirector(row: string[]) {
  const [number, name, instagram, location] = row;
  const existing = await prisma.director.findFirst({
    where: { number, location },
  });
  if (existing) {
    await prisma.director.update({
      where: { id: existing.id },
      data: { name, instagram },
    });
  } else {
    await prisma.director.create({
      data: { number, location, name, instagram },
    });
  }
}

// packageId("jeju-#3-A") -> DB의 Package.id 매핑. inclusions/addons/partners/bouquet 탭에서
// 이 packageId로 참조하니까, upsertPackage가 끝날 때마다 여기 채워둠.
const packageIdMap = new Map<string, number>();

async function upsertPackage(row: string[]) {
  const [
    packageId,
    directorNumber,
    location,
    name,
    subtitle,
    priceSNS,
    priceNoSNS,
    shootingTime,
    locations,
    originalPhotos,
    retouched,
    retouchedDetail,
  ] = row;
  const director = await prisma.director.findFirst({
    where: { number: directorNumber, location },
  });
  if (!director) {
    console.error(`director 못 찾음: ${directorNumber} ${location}`);
    return;
  }
  const data = {
    directorId: director.id,
    name,
    subtitle: subtitle || null,
    priceSNS: Number(priceSNS),
    priceNoSNS: Number(priceNoSNS),
    shootingTime,
    locations,
    originalPhotos,
    retouched: Number(retouched),
    retouchedDetail: retouchedDetail || null,
  };
  const existing = await prisma.package.findFirst({
    where: { directorId: director.id, name },
  });
  const pkg = existing
    ? await prisma.package.update({ where: { id: existing.id }, data })
    : await prisma.package.create({ data });
  packageIdMap.set(packageId, pkg.id);
}

// packageId로 시작하는 행들을 묶어줌. 예: rows.filter(r => r[0] === packageId)를 매번 하면
// 느리니까, packageId 기준으로 미리 그룹핑.
function groupByPackageId(rows: string[][]): Map<string, string[][]> {
  const map = new Map<string, string[][]>();
  for (const row of rows) {
    const packageId = row[0];
    const list = map.get(packageId) ?? [];
    list.push(row);
    map.set(packageId, list);
  }
  return map;
}

async function syncInclusions(packageId: string, rows: string[][]) {
  const pkgDbId = packageIdMap.get(packageId);
  if (!pkgDbId) return;

  // 기존 연결 전부 지우고, 시트에 적힌 대로 다시 만듦 — 항목이 늘었는지 줄었는지 일일이
  // 비교하는 대신, "이 패키지의 inclusion 목록은 시트가 진실"로 취급.
  await prisma.packageInclusion.deleteMany({ where: { packageId: pkgDbId } });

  for (const [, item] of rows) {
    let inclusion = await prisma.inclusion.findFirst({ where: { name: item } });
    if (!inclusion) {
      inclusion = await prisma.inclusion.create({ data: { name: item } });
    }
    await prisma.packageInclusion.create({
      data: { packageId: pkgDbId, inclusionId: inclusion.id },
    });
  }
}

async function syncAddons(packageId: string, rows: string[][]) {
  const pkgDbId = packageIdMap.get(packageId);
  if (!pkgDbId) return;

  await prisma.packageAddon.deleteMany({ where: { packageId: pkgDbId } });

  for (const [, name, price, desc] of rows) {
    let addon = await prisma.addon.findFirst({ where: { name } });
    if (!addon) {
      addon = await prisma.addon.create({
        data: { name, price: price ? Number(price) : 0, desc: desc || null },
      });
    } else {
      await prisma.addon.update({
        where: { id: addon.id },
        data: { price: price ? Number(price) : 0, desc: desc || null },
      });
    }
    await prisma.packageAddon.create({
      data: { packageId: pkgDbId, addonId: addon.id },
    });
  }
}

async function findOrCreatePartner(role: string, name: string, instagram: string) {
  let partner = await prisma.partner.findFirst({ where: { role, name } });
  if (!partner) {
    partner = await prisma.partner.create({ data: { role, name, instagram: instagram || null } });
  } else {
    await prisma.partner.update({ where: { id: partner.id }, data: { instagram: instagram || null } });
  }
  return partner;
}

async function syncPartners(packageId: string, rows: string[][]) {
  const pkgDbId = packageIdMap.get(packageId);
  if (!pkgDbId) return;

  await prisma.packagePartner.deleteMany({ where: { packageId: pkgDbId } });

  for (const [, role, name, instagram] of rows) {
    const partner = await findOrCreatePartner(role, name, instagram);
    await prisma.packagePartner.create({
      data: { packageId: pkgDbId, partnerId: partner.id },
    });
  }
}

async function syncBouquet(packageId: string, rows: string[][]) {
  const pkgDbId = packageIdMap.get(packageId);
  if (!pkgDbId) return;

  // bouquet은 role="bouquet"인 Partner라서 partners와 같은 연결 테이블(PackagePartner)을 씀 —
  // syncPartners에서 이미 이 packageId의 연결을 다 지웠으므로 지우지 않고 그대로 이어서 생성만 함.
  for (const [, name, instagram] of rows) {
    const partner = await findOrCreatePartner('bouquet', name, instagram);
    await prisma.packagePartner.create({
      data: { packageId: pkgDbId, partnerId: partner.id },
    });
  }
}

main().catch((err) => {
  console.error('❌ 실패:', err.message);
  process.exit(1);
});
