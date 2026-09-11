import 'dotenv/config';
import { readFileSync } from 'fs';
import { prisma } from '@/lib/prisma';

// step2(Addon 구조 재구성) 이후 실행. 오늘 로컬에서 적용한 나머지 데이터 수정사항을 프로덕션에 동일하게 반영.

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
type Leaf = { number: string; location: 'Jeju' | 'Seoul'; packages: any[] };
function collectLeaves(data: any): Leaf[] {
  const leaves: Leaf[] = [];
  for (const location of ['jeju', 'seoul'] as const) {
    const loc = location === 'jeju' ? 'Jeju' : 'Seoul';
    for (const dir of data[location] ?? []) {
      if (dir.subPhotographers) {
        for (const sub of dir.subPhotographers) {
          leaves.push({ number: sub.number, location: loc, packages: sub.packages2027 ?? sub.packages ?? [] });
        }
      } else {
        leaves.push({ number: dir.number, location: loc, packages: dir.packages2027 ?? dir.packages ?? [] });
      }
    }
  }
  return leaves;
}

async function updatePkg(location: 'Jeju' | 'Seoul', dirNumber: string, pkgName: string, data: Record<string, unknown>) {
  const dir = await prisma.director.findFirst({ where: { number: dirNumber, location } });
  if (!dir) { console.log(`  director 없음: ${location} ${dirNumber}`); return; }
  const pkg = await prisma.package.findFirst({ where: { directorId: dir.id, name: pkgName } });
  if (!pkg) { console.log(`  package 없음: ${location} ${dirNumber} ${pkgName}`); return; }
  await prisma.package.update({ where: { id: pkg.id }, data });
  console.log(`  ${location} ${dirNumber} ${pkgName} 수정 완료`);
}

async function main() {
  const gt = loadGroundTruth();
  const leaves = collectLeaves(gt);

  // 1) Jeju #4-2 가격 2027년 값으로 재동기화
  const d42 = await prisma.director.findFirst({ where: { number: '#4-2', location: 'Jeju' } });
  if (d42) {
    const leaf = leaves.find((l) => l.number === '#4-2' && l.location === 'Jeju')!;
    for (const gtPkg of leaf.packages) {
      const dbPkg = await prisma.package.findFirst({ where: { directorId: d42.id, name: gtPkg.name } });
      if (dbPkg && dbPkg.priceSNS !== gtPkg.priceSNS) {
        await prisma.package.update({ where: { id: dbPkg.id }, data: { priceSNS: gtPkg.priceSNS, priceNoSNS: gtPkg.priceSNS } });
        console.log(`Jeju #4-2 ${gtPkg.name} price -> ${gtPkg.priceSNS}`);
      }
    }
  }

  // 2) retouchedDetail 줄바꿈 복구 (안전 매칭만)
  let rdFixed = 0;
  for (const leaf of leaves) {
    const director = await prisma.director.findFirst({ where: { number: leaf.number, location: leaf.location } });
    if (!director) continue;
    for (const gtPkg of leaf.packages) {
      const dbPkg = await prisma.package.findFirst({ where: { directorId: director.id, name: gtPkg.name } });
      if (!dbPkg) continue;
      const gtDetail: string = gtPkg.retouchedDetail ?? '';
      const dbDetail = dbPkg.retouchedDetail ?? '';
      if (dbDetail === gtDetail) continue;
      const gtFlattened = gtDetail.replace(/\s*\n\s*/g, ' ').trim();
      if (dbDetail.trim() === gtFlattened) {
        await prisma.package.update({ where: { id: dbPkg.id }, data: { retouchedDetail: gtDetail } });
        rdFixed++;
      }
    }
  }
  console.log(`retouchedDetail 줄바꿈 복구: ${rdFixed}건`);

  // 3) Jeju #6 Package A 가격 수정
  const d6 = await prisma.director.findFirst({ where: { number: '#6', location: 'Jeju' } });
  if (d6) {
    const pkg = await prisma.package.findFirst({ where: { directorId: d6.id, name: 'Package A' } });
    if (pkg) {
      await prisma.package.update({ where: { id: pkg.id }, data: { priceNoSNS: 2625 } });
      console.log('Jeju #6 Package A priceNoSNS -> 2625');
    }
  }

  // 4) Jeju #10 locations 문구
  const locFixes: Record<string, string> = {
    '#10-1': '3 sites(outdoor)',
    '#10-2': '4 sites(outdoor)',
    '#10-3': '4 sites(1 Indoor + 3 Outdoor)',
  };
  for (const [num, loc] of Object.entries(locFixes)) {
    const d = await prisma.director.findFirst({ where: { number: num, location: 'Jeju' } });
    if (!d) continue;
    const res = await prisma.package.updateMany({ where: { directorId: d.id }, data: { locations: loc } });
    console.log(`Jeju ${num} locations -> "${loc}" (${res.count}건)`);
  }

  // 5) Jeju #5 Package B: Dress Line Upgrade addon 삭제
  const d5 = await prisma.director.findFirst({ where: { number: '#5', location: 'Jeju' } });
  if (d5) {
    const pkgB = await prisma.package.findFirst({ where: { directorId: d5.id, name: 'Package B' } });
    const addon = await prisma.addon.findFirst({ where: { OR: [{ name: 'Dress Line Upgrade' }, { displayName: 'Dress Line Upgrade' }] } });
    if (pkgB && addon) {
      const res = await prisma.packageAddon.deleteMany({ where: { packageId: pkgB.id, addonId: addon.id } });
      console.log(`Jeju #5 Package B: Dress Line Upgrade 삭제 (${res.count}건)`);
    }
  }

  // 6) K Salon HMU 지역별 분리
  const oldHmu = await prisma.partner.findFirst({ where: { role: 'hmu', name: 'K Salon' } });
  if (oldHmu) {
    const jejuHmu = await prisma.partner.create({ data: { role: 'hmu', name: 'K Salon (Jeju)', displayName: 'K Salon', instagram: '@why__brush / @k__salon' } });
    const seoulHmu = await prisma.partner.create({ data: { role: 'hmu', name: 'K Salon (Seoul)', displayName: 'K Salon', instagram: '@why__brush / @ksalon_seoul' } });
    const links = await prisma.packagePartner.findMany({ where: { partnerId: oldHmu.id }, include: { package: { include: { director: true } } } });
    for (const link of links) {
      const newId = link.package.director.location === 'Jeju' ? jejuHmu.id : seoulHmu.id;
      await prisma.packagePartner.update({ where: { packageId_partnerId: { packageId: link.packageId, partnerId: oldHmu.id } }, data: { partnerId: newId } });
    }
    await prisma.partner.delete({ where: { id: oldHmu.id } });
    console.log(`HMU K Salon 분리 완료 (${links.length}건)`);
  } else {
    console.log('HMU K Salon 없음 (이미 분리됐거나 없음) - Seoul 누락분 HMU 채우기는 아래에서 처리');
  }

  // 6-1) Seoul 패키지 중 HMU 없는 곳에 K Salon (Seoul) 채우기
  {
    const seoulHmu = await prisma.partner.findFirst({ where: { role: 'hmu', name: 'K Salon (Seoul)' } })
      ?? await prisma.partner.findFirst({ where: { role: 'hmu', name: 'K Salon' } });
    if (seoulHmu) {
      const seoulPkgs = await prisma.package.findMany({ where: { director: { location: 'Seoul' } }, include: { partners: { include: { partner: true } }, director: true } });
      for (const p of seoulPkgs) {
        const hasHmu = p.partners.some((x) => x.partner.role === 'hmu');
        if (!hasHmu) {
          await prisma.packagePartner.create({ data: { packageId: p.id, partnerId: seoulHmu.id } });
          console.log(`Seoul ${p.director.number} ${p.name}: HMU(K Salon) 추가`);
        }
      }
    }
  }

  // 7) Seoul #1 Misang Snap Package B 삭제
  const s1 = await prisma.director.findFirst({ where: { number: '#1', location: 'Seoul' } });
  if (s1) {
    const pkgB = await prisma.package.findFirst({ where: { directorId: s1.id, name: 'Package B' } });
    if (pkgB) {
      await prisma.packageAddon.deleteMany({ where: { packageId: pkgB.id } });
      await prisma.packageInclusion.deleteMany({ where: { packageId: pkgB.id } });
      await prisma.packagePartner.deleteMany({ where: { packageId: pkgB.id } });
      await prisma.package.delete({ where: { id: pkgB.id } });
      console.log('Seoul #1 Package B 삭제 완료');
    }
  }

  // 8) K Salon Dress 지역별 분리
  const oldDress = await prisma.partner.findFirst({ where: { role: 'dress', name: 'K Salon' } });
  if (oldDress) {
    const jejuDress = await prisma.partner.create({ data: { role: 'dress', name: 'K Salon (Jeju)', displayName: 'K Salon', instagram: '@k__salon / @k__salon_dress' } });
    const seoulDress = await prisma.partner.create({ data: { role: 'dress', name: 'K Salon (Seoul)', displayName: 'K Salon', instagram: '@ksalon_seoul' } });
    const links = await prisma.packagePartner.findMany({ where: { partnerId: oldDress.id }, include: { package: { include: { director: true } } } });
    for (const link of links) {
      const newId = link.package.director.location === 'Jeju' ? jejuDress.id : seoulDress.id;
      await prisma.packagePartner.update({ where: { packageId_partnerId: { packageId: link.packageId, partnerId: oldDress.id } }, data: { partnerId: newId } });
    }
    await prisma.partner.delete({ where: { id: oldDress.id } });
    console.log(`Dress K Salon 분리 완료 (${links.length}건)`);
  }

  // 9) Jeju #3 Package A Suit 파트너 수정
  {
    const d3 = await prisma.director.findFirst({ where: { number: '#3', location: 'Jeju' } });
    const pkg = d3 && await prisma.package.findFirst({ where: { directorId: d3.id, name: 'Package A' } });
    if (pkg) {
      const suitLink = await prisma.packagePartner.findFirst({ where: { packageId: pkg.id, partner: { role: 'suit' } }, include: { partner: true } });
      if (suitLink && suitLink.partner.name.includes('K Salon')) {
        let hespoke = await prisma.partner.findFirst({ where: { role: 'suit', name: 'Hespoke Suit' } });
        if (!hespoke) hespoke = await prisma.partner.create({ data: { role: 'suit', name: 'Hespoke Suit', instagram: '@hespokesuit' } });
        await prisma.packagePartner.update({ where: { packageId_partnerId: { packageId: pkg.id, partnerId: suitLink.partnerId } }, data: { partnerId: hespoke.id } });
        console.log('Jeju #3 Package A Suit -> Hespoke Suit');
      }
    }
  }

  // 10) Jeju #10 상품명, Seoul #3 작가명/상품명
  const jeju10Product = await prisma.product.findFirst({ where: { title: 'Jeju Fairytale' } });
  if (jeju10Product) { await prisma.product.update({ where: { id: jeju10Product.id }, data: { title: 'Jeju Fairy Tale' } }); console.log('Jeju #10 상품명 -> Jeju Fairy Tale'); }
  const deriz = await prisma.director.findFirst({ where: { number: '#3', location: 'Seoul' } });
  if (deriz && deriz.name !== 'De.riz') {
    await prisma.director.update({ where: { id: deriz.id }, data: { name: 'De.riz' } });
    const pd = await prisma.productDirector.findFirst({ where: { directorId: deriz.id }, include: { product: true } });
    if (pd) await prisma.product.update({ where: { id: pd.productId }, data: { title: 'De.riz' } });
    console.log('Seoul #3 작가명/상품명 -> De.riz');
  }

  // 11) Seoul 패키지 세부 수정
  await updatePkg('Seoul', '#1', 'Package A', { name: 'Package(Outdoor+Indoor)', locations: '2 sites', locationsDetail: '1 Outdoor site + 1 Indoor studio' });
  await updatePkg('Seoul', '#2', 'Package A', { name: 'Package A(Outdoor+Indoor)', locations: '2-3 sites', locationsDetail: '1-2 Outdoor sites + 1 Indoor Studio' });
  await updatePkg('Seoul', '#2', 'Package B', { name: 'Package B(Outdoor)', locations: '2-3 sites', locationsDetail: 'Outdoor sites only' });
  {
    const dir = await prisma.director.findFirst({ where: { number: '#2', location: 'Seoul' } });
    const pkg = dir && await prisma.package.findFirst({ where: { directorId: dir.id, name: 'Package B(Outdoor)' } });
    if (pkg) {
      const addons = await prisma.packageAddon.findMany({ where: { packageId: pkg.id }, include: { addon: true } });
      const target = addons.find((a) => (a.addon.displayName ?? a.addon.name) === 'Studio Photography Addition');
      if (target) {
        await prisma.packageAddon.delete({ where: { packageId_addonId: { packageId: pkg.id, addonId: target.addonId } } });
        console.log('Seoul #2 Package B: Studio Photography Addition 삭제');
      }
    }
  }
  await updatePkg('Seoul', '#3', 'Package A', { retouchedDetail: 'Customer Selected: 20', shootingTimeDetail: 'Up to 2 outfits' });
  await updatePkg('Seoul', '#3', 'Package B', { retouchedDetail: 'Customer Selected: 30', shootingTimeDetail: 'Up to 3 outfits' });
  await updatePkg('Seoul', '#4', 'Package A', { locations: '2 sites', locationsDetail: '1 Indoor studio + 1 Outdoor site', originalPhotos: '800+' });
  await updatePkg('Seoul', '#4', 'Package B', { locations: '2 sites', locationsDetail: '1 Indoor studio + 1 Outdoor site', originalPhotos: '800+' });
  await updatePkg('Seoul', '#4', 'Package C', { originalPhotos: '300+' });
  await updatePkg('Seoul', '#5', 'Package A', { locations: '2 sites', locationsDetail: 'Daytime+Sunset or Sunset+Night' });
  await updatePkg('Seoul', '#5', 'Package B', { locations: '3 sites', locationsDetail: 'Day+Sunset+Night' });
  await updatePkg('Seoul', '#5', 'Package C', { locations: '3 sites', locationsDetail: 'Day+Sunset+Night' });
  await updatePkg('Seoul', '#7', 'Package A', { retouchedDetail: 'Customer Selected: 10', shootingTimeDetail: 'Up to 2 outfits' });
  await updatePkg('Seoul', '#7', 'Package B', { retouchedDetail: 'Customer Selected: 10', shootingTimeDetail: 'Up to 2 outfits' });
  await updatePkg('Seoul', '#7', 'Package C', { retouchedDetail: 'Customer Selected: 20', shootingTimeDetail: 'Up to 3 outfits' });
  await updatePkg('Seoul', '#7', 'Package D', { retouchedDetail: 'Customer Selected: 10', shootingTimeDetail: 'Up to 1 outfit' });

  // 12) Seoul #7 Package D What's Included 문구 수정
  {
    const dir = await prisma.director.findFirst({ where: { number: '#7', location: 'Seoul' } });
    const pkg = dir && await prisma.package.findFirst({ where: { directorId: dir.id, name: 'Package D' } });
    if (pkg) {
      const inc = await prisma.inclusion.findFirst({ where: { name: 'Photography Session (2 hours)' } });
      if (inc) {
        const link = await prisma.packageInclusion.findFirst({ where: { packageId: pkg.id, inclusionId: inc.id } });
        if (link) {
          let plain = await prisma.inclusion.findFirst({ where: { name: 'Photography Session' } });
          if (!plain) plain = await prisma.inclusion.create({ data: { name: 'Photography Session' } });
          await prisma.packageInclusion.update({ where: { packageId_inclusionId: { packageId: pkg.id, inclusionId: inc.id } }, data: { inclusionId: plain.id } });
          console.log('Seoul #7 Package D: Photography Session 문구 수정');
        }
      }
    }
  }

  // 13) 어드민 addon 설명 줄바꿈 백필 (마침표 기준 문장 분리, Approx. 예외처리)
  function splitIntoLines(text: string): string {
    const sentences = text.split(/(?<!\bApprox)(?<!\bapprox)\.\s+/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length <= 1) return text;
    return sentences.map((s, i) => (i < sentences.length - 1 ? `${s}.` : s.endsWith('.') ? s : `${s}.`)).join('\n');
  }
  const allAddons = await prisma.addon.findMany({ where: { desc: { not: null } } });
  let descFixed = 0;
  for (const a of allAddons) {
    if (!a.desc || a.desc.includes('\n')) continue;
    const newDesc = splitIntoLines(a.desc);
    if (newDesc !== a.desc) {
      await prisma.addon.update({ where: { id: a.id }, data: { desc: newDesc } });
      descFixed++;
    }
  }
  console.log(`Addon 설명 줄바꿈 백필: ${descFixed}건`);

  // 14) isSinglePrice 백필
  const spRes = await prisma.$executeRaw`UPDATE "Package" SET "isSinglePrice" = true WHERE "priceSNS" = "priceNoSNS" AND "priceSNS" > 0`;
  console.log('isSinglePrice 백필:', spRes);

  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
