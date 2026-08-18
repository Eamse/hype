import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { getSheetsClient, SHEET_ID } from './sheets-client';

type Partner = { name: string; instagram: string };
type Addon = { name: string; price: number | null; desc?: string };
type Pkg = {
  packageId?: string;
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
  addons: Addon[];
  partners: {
    hmu?: Partner;
    dress?: Partner;
    suit?: Partner;
    bouquet?: Partner;
  };
};
type RawDirector = {
  number: string;
  name: string;
  instagram: string;
  packages: Pkg[];
  subPhotographers?: RawDirector[];
};
type PhotogData = { jeju: RawDirector[]; seoul: RawDirector[] };

const data: PhotogData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'prisma/photographers.json'),
    'utf8',
  ),
);

const directorRows: string[][] = [];
const packageRows: string[][] = [];
const inclusionRows: string[][] = [];
const addonRows: string[][] = [];
const partnerRows: string[][] = [];
const bouquetRows: string[][] = [];

function packageLetter(name: string): string {
  return name.replace('Package', '').trim();
}

function processLeaf(dir: RawDirector, location: 'jeju' | 'seoul') {
  directorRows.push([dir.number, dir.name, dir.instagram, location]);
  dir.packages.forEach((pkg) => {
    const letter = packageLetter(pkg.name);
    const packageId = letter
      ? `${location}-${dir.number}-${letter}`
      : `${location}-${dir.number}`;
    packageRows.push([
      packageId,
      dir.number,
      location,
      pkg.name,
      pkg.subtitle ?? '',
      String(pkg.priceSNS),
      String(pkg.priceNoSNS),
      pkg.shootingTime,
      pkg.locations,
      pkg.originalPhotos,
      String(pkg.retouched),
      pkg.retouchedDetail ?? '',
    ]);
    pkg.inclusiveItems.forEach((item) => inclusionRows.push([packageId, item]));
    pkg.addons.forEach((a) =>
      addonRows.push([
        packageId,
        a.name,
        a.price === null ? '' : String(a.price),
        a.desc ?? '',
      ]),
    );
    (['hmu', 'dress', 'suit'] as const).forEach((role) => {
      const p = pkg.partners[role];
      if (p) partnerRows.push([packageId, role, p.name, p.instagram]);
    });
    if (pkg.partners.bouquet) {
      bouquetRows.push([
        packageId,
        pkg.partners.bouquet.name,
        pkg.partners.bouquet.instagram,
      ]);
    }
  });
}

function processRegion(directors: RawDirector[], location: 'jeju' | 'seoul') {
  directors.forEach((dir) => {
    if (dir.subPhotographers?.length) {
      dir.subPhotographers.forEach((sp) => processLeaf(sp, location));
    } else {
      processLeaf(dir, location);
    }
  });
}

processRegion(data.jeju, 'jeju');
processRegion(data.seoul, 'seoul');

async function writeTab(
  sheets: ReturnType<typeof google.sheets>,
  tab: string,
  rows: string[][],
) {
  if (rows.length === 0) return;
  // 이전 실행 때 남은 행이 새 데이터보다 많으면 뒷부분이 안 지워지고 남으므로, 먼저 전체를 비운다
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`✅ ${tab}: ${rows.length}행 작성 완료`);
}

async function main() {
  const sheets = await getSheetsClient();

  await writeTab(sheets, '1_directors', directorRows);
  await writeTab(sheets, '2_packages', packageRows);
  await writeTab(sheets, '3_inclusions', inclusionRows);
  await writeTab(sheets, '4_addons', addonRows);
  await writeTab(sheets, '5_partners', partnerRows);
  await writeTab(sheets, '6_bouquet', bouquetRows);

  console.log('\n🎉 전체 완료!');
}

main().catch((err) => {
  console.error('❌ 실패:', err.message);
  process.exit(1);
});
