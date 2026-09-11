import 'dotenv/config';
import { readFileSync } from 'fs';
import { prisma } from '@/lib/prisma';

function loadGroundTruth(): any {
  const src = readFileSync('scripts/package-new/App.jsx', 'utf-8');
  const start = src.indexOf('const PHOTOGRAPHERS');
  const eqIdx = src.indexOf('=', start);
  let i = src.indexOf('{', eqIdx);
  let depth = 0;
  let end = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const objText = src.slice(src.indexOf('{', eqIdx), end);
  return new Function('return (' + objText + ')')();
}

type Leaf = { number: string; name: string; instagram: string; location: 'Jeju' | 'Seoul'; packages: any[] };

function collectLeaves(data: any): Leaf[] {
  const leaves: Leaf[] = [];
  for (const location of ['jeju', 'seoul'] as const) {
    const loc = location === 'jeju' ? 'Jeju' : 'Seoul';
    for (const dir of data[location] ?? []) {
      if (dir.subPhotographers) {
        for (const sub of dir.subPhotographers) {
          leaves.push({ number: sub.number, name: sub.name, instagram: sub.instagram, location: loc, packages: sub.packages2027 ?? sub.packages ?? [] });
        }
      } else {
        leaves.push({ number: dir.number, name: dir.name, instagram: dir.instagram, location: loc, packages: dir.packages2027 ?? dir.packages ?? [] });
      }
    }
  }
  return leaves;
}

function normList(arr: string[]): string {
  return [...arr].sort().join(' | ');
}

async function main() {
  const gt = loadGroundTruth();
  const leaves = collectLeaves(gt);
  const realIssues: string[] = [];
  let doubleChecked = 0;

  for (const leaf of leaves) {
    const director = await prisma.director.findFirst({ where: { number: leaf.number, location: leaf.location } });
    if (!director) { realIssues.push(`[${leaf.location} ${leaf.number}] director 없음`); continue; }
    if (director.name !== leaf.name) realIssues.push(`[${leaf.location} ${leaf.number}] 작가명: DB="${director.name}" GT="${leaf.name}"`);
    else doubleChecked++;
    if ((director.instagram ?? '') !== (leaf.instagram ?? '')) realIssues.push(`[${leaf.location} ${leaf.number}] 작가 인스타: DB="${director.instagram}" GT="${leaf.instagram}"`);
    else doubleChecked++;

    const pd = await prisma.productDirector.findFirst({ where: { directorId: director.id }, include: { product: true } });
    if (pd) {
      const knownOverride = (leaf.location === 'Jeju' && leaf.number.startsWith('#10')) || (leaf.location === 'Seoul' && leaf.number === '#3');
      if (pd.product.title !== leaf.name && !knownOverride) {
        realIssues.push(`[${leaf.location} ${leaf.number}] 상품명(Product.title): DB="${pd.product.title}" GT="${leaf.name}"`);
      } else doubleChecked++;
    }

    const dbPkgs = await prisma.package.findMany({
      where: { directorId: director.id },
      include: {
        addons: { include: { addon: true } },
        inclusions: { include: { inclusion: true } },
        partners: { include: { partner: true } },
      },
      orderBy: { order: 'asc' },
    });

    const gtNames = leaf.packages.map((p) => p.name);
    const dbNames = dbPkgs.map((p) => p.name);
    if (normList(gtNames) !== normList(dbNames)) {
      realIssues.push(`[${leaf.location} ${leaf.number}] 패키지 구성: DB=[${dbNames.join(',')}] GT=[${gtNames.join(',')}]`);
    } else doubleChecked++;

    for (const gtPkg of leaf.packages) {
      const dbPkg = dbPkgs.find((p) => p.name === gtPkg.name);
      if (!dbPkg) continue;
      const tag = `[${leaf.location} ${leaf.number} ${gtPkg.name}]`;
      const locationsOverride = leaf.location === 'Jeju' && leaf.number.startsWith('#10');

      const checks: { field: string; db: any; gt: any; skip?: boolean }[] = [
        { field: 'shootingTime', db: dbPkg.shootingTime, gt: gtPkg.shootingTime },
        { field: 'locations', db: dbPkg.locations, gt: gtPkg.locations, skip: locationsOverride },
        { field: 'originalPhotos', db: dbPkg.originalPhotos, gt: gtPkg.originalPhotos },
        { field: 'retouched', db: dbPkg.retouched, gt: gtPkg.retouched },
        { field: 'retouchedDetail', db: dbPkg.retouchedDetail ?? '', gt: gtPkg.retouchedDetail ?? '' },
        { field: 'priceSNS', db: dbPkg.priceSNS, gt: gtPkg.priceSNS },
      ];
      for (const c of checks) {
        if (c.skip) continue;
        if (c.db !== c.gt) realIssues.push(`❌ ${tag} ${c.field}: DB=${JSON.stringify(c.db)} GT=${JSON.stringify(c.gt)}`);
        else doubleChecked++;
      }
      if (gtPkg.priceNoSNS !== null) {
        if (dbPkg.priceNoSNS !== gtPkg.priceNoSNS) realIssues.push(`❌ ${tag} priceNoSNS: DB=${dbPkg.priceNoSNS} GT=${gtPkg.priceNoSNS}`);
        else doubleChecked++;
      }

      const gtPartners: Record<string, { name: string; instagram: string }> = gtPkg.partners ?? {};
      const dbPartnersByRole: Record<string, { name: string; instagram: string | null }[]> = {};
      for (const pp of dbPkg.partners) {
        const role = pp.partner.role;
        (dbPartnersByRole[role] ??= []).push({ name: pp.partner.displayName ?? pp.partner.name, instagram: pp.partner.instagram });
      }
      for (const [role, gp] of Object.entries(gtPartners)) {
        if (role === 'photographer') continue;
        const dbList = dbPartnersByRole[role] ?? [];
        const nameMatch = dbList.filter((d) => d.name === gp.name);
        if (nameMatch.length === 0) {
          realIssues.push(`❌ ${tag} partner[${role}] 이름 없음: DB=${JSON.stringify(dbList)} GT=${JSON.stringify(gp)}`);
          continue;
        }
        const igMatch = nameMatch.find((d) => (d.instagram ?? '') === (gp.instagram ?? ''));
        if (!igMatch) {
          const isKnownKSalon = gp.name === 'K Salon';
          if (!isKnownKSalon) realIssues.push(`❌ ${tag} partner[${role}] 인스타: DB=${JSON.stringify(nameMatch)} GT=${JSON.stringify(gp)}`);
        } else doubleChecked++;
      }
      for (const [role, list] of Object.entries(dbPartnersByRole)) {
        if (!gtPartners[role]) {
          const isKnownKSalonAddition = role === 'hmu' && list.some((l) => l.name === 'K Salon');
          if (!isKnownKSalonAddition) realIssues.push(`❌ ${tag} DB에만 있는 partner role[${role}]: ${JSON.stringify(list)}`);
        }
      }

      const gtIncl = gtPkg.inclusiveItems ?? [];
      const dbIncl = dbPkg.inclusions.map((i) => i.inclusion.name);
      if (normList(gtIncl) !== normList(dbIncl)) {
        const missing = gtIncl.filter((x: string) => !dbIncl.includes(x));
        const extra = dbIncl.filter((x: string) => !gtIncl.includes(x));
        const knownAddonRemoval = leaf.location === 'Jeju' && leaf.number === '#5' && gtPkg.name === 'Package B';
        if (!knownAddonRemoval || missing.length || extra.length > 1) {
          realIssues.push(`❌ ${tag} inclusions: 누락=${JSON.stringify(missing)} 초과=${JSON.stringify(extra)}`);
        } else doubleChecked++;
      } else doubleChecked++;

      const gtAddons = gtPkg.addons ?? [];
      const dbAddons = dbPkg.addons.map((a) => ({ name: a.addon.displayName ?? a.addon.name, price: a.addon.price, desc: a.addon.desc ?? '' }));
      const gtAddonNames = gtAddons.map((a: any) => a.name);
      const dbAddonNames = dbAddons.map((a) => a.name);
      const isKnownAddonRemoval = leaf.location === 'Jeju' && leaf.number === '#5' && gtPkg.name === 'Package B';
      const isKnownAddonRemoval2 = leaf.location === 'Seoul' && leaf.number === '#2' && gtPkg.name === 'Package B';
      if (normList(gtAddonNames) !== normList(dbAddonNames)) {
        const missing = gtAddonNames.filter((x: string) => !dbAddonNames.includes(x));
        const extra = dbAddonNames.filter((x: string) => !gtAddonNames.includes(x));
        if ((isKnownAddonRemoval || isKnownAddonRemoval2) && missing.length === 1 && extra.length === 0) {
          doubleChecked++;
        } else {
          realIssues.push(`❌ ${tag} addons: 누락=${JSON.stringify(missing)} 초과=${JSON.stringify(extra)}`);
        }
      } else {
        for (const ga of gtAddons) {
          const da = dbAddons.find((x) => x.name === ga.name);
          if (!da) continue;
          const gtPrice = ga.price ?? 0;
          if (da.price !== gtPrice) realIssues.push(`❌ ${tag} addon["${ga.name}"] price: DB=${da.price} GT=${gtPrice}`);
          else doubleChecked++;
        }
      }
    }
  }

  console.log(`=== 실제 확인 필요 항목 (${realIssues.length}건) ===`);
  realIssues.forEach((x) => console.log(x));
  console.log(`\n일치 확인 ${doubleChecked}건`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
