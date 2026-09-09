import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getSheetsClient, SHEET_ID } from './sheets-client';

type Partner = { name: string; instagram: string };
type Addon = { name: string; price: number | null; desc?: string };
type Pkg = {
  name: string;
  subtitle?: string;
  partners: { photographer?: Partner; hmu?: Partner; dress?: Partner; suit?: Partner; bouquet?: Partner };
  inclusiveItems: string[];
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail?: string;
  addons: Addon[];
};
type SubPhotographer = {
  number: string;
  name: string;
  instagram: string;
  packages: Pkg[];
  packages2027?: Pkg[];
};
type RawDirector = SubPhotographer & { subPhotographers?: SubPhotographer[] };
type PhotogData = { jeju: RawDirector[]; seoul: RawDirector[] };

function loadPhotographers(): PhotogData {
  const filePath = path.join(process.cwd(), 'scripts/package-new/App.jsx');
  const src = fs.readFileSync(filePath, 'utf8');
  const startMarker = 'const PHOTOGRAPHERS = {';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error('PHOTOGRAPHERS 선언을 찾을 수 없음');
  const objStart = startIdx + startMarker.length - 1; // index of the opening '{'
  // 중괄호 깊이를 세어 매칭되는 닫는 '}' 위치를 찾음 (문자열 안의 중괄호는 무시 — 이 파일엔 문자열에 '{' '}' 없음 확인됨)
  let depth = 0;
  let endIdx = -1;
  for (let i = objStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) throw new Error('PHOTOGRAPHERS 객체의 닫는 괄호를 찾을 수 없음');
  const objText = src.slice(objStart, endIdx + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${objText});`)();
}

function cleanRetouchedDetail(v: string): string {
  return v.replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function packageLetter(name: string): string {
  return name.replace('Package', '').trim();
}

async function main() {
  const data = loadPhotographers();
  const directors = await prisma.director.findMany();
  const sheets = await getSheetsClient();

  const warnings: string[] = [];
  const notes: string[] = [];

  const packageRows: string[][] = [];
  const inclusionRows: string[][] = [];
  const addonRows: string[][] = [];
  const partnerRows: string[][] = [];
  const bouquetRows: string[][] = [];

  function resolveDirector(location: 'Jeju' | 'Seoul', number: string, instagram: string, name: string) {
    const candidates = directors.filter((d) => d.location === location);
    // ground truth의 number 필드가 DB Director.number와 동일한 포맷 — 가장 신뢰할 수 있는 키
    const byNumber = candidates.find((d) => d.number === number);
    if (byNumber) return byNumber;
    const byInsta = candidates.find((d) => d.instagram === instagram);
    if (byInsta) return byInsta;
    const byName = candidates.find((d) => d.name.trim().toLowerCase() === name.trim().toLowerCase());
    return byName ?? null;
  }

  function processLeaf(sp: SubPhotographer, location: 'Jeju' | 'Seoul') {
    const director = resolveDirector(location, sp.number, sp.instagram, sp.name);
    if (!director) {
      warnings.push(`director 매칭 실패: location=${location} number=${sp.number} instagram=${sp.instagram} name=${sp.name}`);
      return;
    }
    const pkgs = sp.packages2027 ?? sp.packages;
    if (!sp.packages2027) {
      notes.push(`packages2027 없음 — packages(연도 미표기)로 대체: ${director.number} ${director.name}`);
    }

    for (const pkg of pkgs) {
      const letter = packageLetter(pkg.name);
      const packageId = `${location.toLowerCase()}-${director.number}-${letter}`;

      prismaPackageQueue.push({ packageId, director, pkg });
    }
  }

  // director/package 조회가 비동기라 먼저 큐에 모으고 순차 처리
  const prismaPackageQueue: { packageId: string; director: (typeof directors)[number]; pkg: Pkg }[] = [];

  for (const dir of data.jeju) {
    if (dir.subPhotographers?.length) dir.subPhotographers.forEach((sp) => processLeaf(sp, 'Jeju'));
    else processLeaf(dir, 'Jeju');
  }
  for (const dir of data.seoul) {
    if (dir.subPhotographers?.length) dir.subPhotographers.forEach((sp) => processLeaf(sp, 'Seoul'));
    else processLeaf(dir, 'Seoul');
  }

  for (const { packageId, director, pkg } of prismaPackageQueue) {
    const existingPkg = await prisma.package.findFirst({
      where: { directorId: director.id, name: pkg.name },
    });
    if (!existingPkg) {
      warnings.push(`기존 DB에 없는 패키지 (가격 알 수 없음, 스킵): ${packageId} name=${pkg.name}`);
      continue;
    }

    const location = packageId.split('-')[0];
    packageRows.push([
      packageId,
      director.number,
      location,
      pkg.name,
      pkg.subtitle ?? '',
      String(existingPkg.priceSNS),
      String(existingPkg.priceNoSNS),
      pkg.shootingTime,
      pkg.locations,
      pkg.originalPhotos,
      String(pkg.retouched),
      cleanRetouchedDetail(pkg.retouchedDetail ?? ''),
    ]);

    const seenInclusion = new Set<string>();
    (pkg.inclusiveItems ?? []).forEach((item) => {
      if (seenInclusion.has(item)) return;
      seenInclusion.add(item);
      inclusionRows.push([packageId, item]);
    });

    (['hmu', 'dress', 'suit'] as const).forEach((role) => {
      const p = pkg.partners?.[role];
      if (p) partnerRows.push([packageId, role, p.name, p.instagram ?? '']);
    });
    if (pkg.partners?.bouquet) {
      bouquetRows.push([packageId, pkg.partners.bouquet.name, pkg.partners.bouquet.instagram ?? '']);
    }

    const seenAddon = new Set<string>();
    for (const addon of pkg.addons ?? []) {
      if (seenAddon.has(addon.name)) continue;
      seenAddon.add(addon.name);
      const price = addon.price ?? 0; // ground truth 값 그대로 반영 (패키지 priceSNS/priceNoSNS만 기존 값 유지)
      addonRows.push([packageId, addon.name, String(price), addon.desc ?? '']);
    }
  }

  const shouldWrite = process.argv.includes('--write');
  if (shouldWrite) {
    async function writeTab(tab: string, rows: string[][]) {
      await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${tab}!A2:Z` });
      if (rows.length === 0) return;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${tab}!A2`,
        valueInputOption: 'RAW',
        requestBody: { values: rows },
      });
      console.log(`✅ ${tab}: ${rows.length}행 작성 완료`);
    }
    await writeTab('2_packages', packageRows);
    await writeTab('3_inclusions', inclusionRows);
    await writeTab('4_addons', addonRows);
    await writeTab('5_partners', partnerRows);
    await writeTab('6_bouquet', bouquetRows);
    console.log('\n🎉 시트에 반영 완료 (DB는 아직 안 건드림 — pull-sheet-to-db.ts 별도 실행 필요)');
  } else {
    console.log('\n(dry-run) --write 옵션 없이 실행되어 시트에는 반영되지 않음');
  }

  console.log('요약:', {
    packageRows: packageRows.length,
    inclusionRows: inclusionRows.length,
    addonRows: addonRows.length,
    partnerRows: partnerRows.length,
    bouquetRows: bouquetRows.length,
    warnings: warnings.length,
    notes: notes.length,
  });
  if (warnings.length) {
    console.log('\n=== 경고 ===');
    warnings.forEach((w) => console.log(' -', w));
  }
  if (notes.length) {
    console.log('\n=== 참고 ===');
    notes.forEach((n) => console.log(' -', n));
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts/.transform-appjsx-output.json'),
    JSON.stringify({ packageRows, inclusionRows, addonRows, partnerRows, bouquetRows, warnings, notes }, null, 2),
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('실패:', err);
  process.exit(1);
});
