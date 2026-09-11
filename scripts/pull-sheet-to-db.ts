import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { getSheetsClient, SHEET_ID } from './sheets-client';
async function readTab(sheets: Awaited<ReturnType<typeof getSheetsClient>>, tab: string): Promise<string[][]> {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tab}!A2:Z`,
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
    const partnersByPackage = groupByPackageId(await readTab(sheets, '5_partners'));
    for (const [packageId, rows] of partnersByPackage) {
        await syncPartners(packageId, rows);
    }
    console.log(`partners: ${partnersByPackage.size}개 패키지 동기화 완료`);
    const bouquetByPackage = groupByPackageId(await readTab(sheets, '6_bouquet'));
    for (const [packageId, rows] of bouquetByPackage) {
        if (!partnersByPackage.has(packageId)) {
            const pkgDbId = packageIdMap.get(packageId);
            if (pkgDbId)
                await prisma.packagePartner.deleteMany({ where: { packageId: pkgDbId } });
        }
        await syncBouquet(packageId, rows);
    }
    console.log(`bouquet: ${bouquetByPackage.size}개 패키지 동기화 완료`);
}
function normalizeLocation(location: string): string {
    return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
}
async function upsertDirector(row: string[]) {
    const [number, name, instagram, rawLocation] = row;
    const location = normalizeLocation(rawLocation);
    const existing = await prisma.director.findFirst({
        where: { number, location },
    });
    if (existing) {
        await prisma.director.update({
            where: { id: existing.id },
            data: { name, instagram },
        });
    }
    else {
        await prisma.director.create({
            data: { number, location, name, instagram },
        });
    }
}
const packageIdMap = new Map<string, number>();
const packageOrderByDirector = new Map<number, number>();

async function upsertPackage(row: string[]) {
    const [packageId, directorNumber, rawLocation, name, subtitle, priceSNS, priceNoSNS, shootingTime, locations, originalPhotos, retouched, retouchedDetail,] = row;
    const location = normalizeLocation(rawLocation);
    const director = await prisma.director.findFirst({
        where: { number: directorNumber, location },
    });
    if (!director) {
        console.error(`director 못 찾음: ${directorNumber} ${location}`);
        return;
    }
    // 시트에 등장하는 순서를 그대로 order로 씀 — director별로 0부터 순서대로 매김
    const order = packageOrderByDirector.get(director.id) ?? 0;
    packageOrderByDirector.set(director.id, order + 1);

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
        order,
    };
    const existing = await prisma.package.findFirst({
        where: { directorId: director.id, name },
    });
    const pkg = existing
        ? await prisma.package.update({ where: { id: existing.id }, data })
        : await prisma.package.create({ data });
    packageIdMap.set(packageId, pkg.id);
}
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
    if (!pkgDbId)
        return;
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
    if (!pkgDbId)
        return;
    await prisma.packageAddon.deleteMany({ where: { packageId: pkgDbId } });
    for (const [, name, price, desc] of rows) {
        const priceNum = price ? Number(price) : 0;
        const descVal = desc || null;
        // 같은 이름이라도 가격/설명이 다르면 별도 variant Addon으로 취급 (PackagePartner의 displayName 패턴과 동일)
        let addon = await prisma.addon.findFirst({ where: { displayName: name, price: priceNum, desc: descVal } })
            ?? await prisma.addon.findFirst({ where: { name, displayName: null, price: priceNum, desc: descVal } });
        if (!addon) {
            const existingCount = await prisma.addon.count({ where: { OR: [{ name }, { displayName: name }] } });
            addon = await prisma.addon.create({
                data: {
                    name: existingCount > 0 ? `${name} (버전 ${existingCount + 1})` : name,
                    displayName: existingCount > 0 ? name : null,
                    price: priceNum,
                    desc: descVal,
                },
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
    }
    else {
        await prisma.partner.update({ where: { id: partner.id }, data: { instagram: instagram || null } });
    }
    return partner;
}
async function syncPartners(packageId: string, rows: string[][]) {
    const pkgDbId = packageIdMap.get(packageId);
    if (!pkgDbId)
        return;
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
    if (!pkgDbId)
        return;
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
