import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  // 1) 기존 문자열 instagram(" / "로 합쳐진 것)을 PartnerInstagram으로 이전
  const partners = await prisma.partner.findMany({ where: { instagram: { not: null } } });
  let created = 0;
  for (const p of partners) {
    const existing = await prisma.partnerInstagram.count({ where: { partnerId: p.id } });
    if (existing > 0) continue; // 이미 마이그레이션된 파트너는 건너뜀
    const handles = (p.instagram ?? '').split('/').map((h) => h.trim()).filter(Boolean);
    for (let i = 0; i < handles.length; i++) {
      await prisma.partnerInstagram.create({ data: { partnerId: p.id, handle: handles[i], order: i } });
      created++;
    }
  }
  console.log(`instagram 문자열 -> PartnerInstagram 이전: ${created}건`);

  // 2) K Salon류 등 2계정 이상 결합된 파트너를 개별로 분리
  async function splitPartner(oldId: number, newDefs: { name: string; displayName?: string | null; handle: string }[]) {
    const oldPartner = await prisma.partner.findUnique({ where: { id: oldId } });
    if (!oldPartner) { console.log(`  partner ${oldId} 없음, 건너뜀`); return; }
    const newPartners = await Promise.all(newDefs.map((def) => prisma.partner.create({
      data: { role: oldPartner.role, name: def.name, displayName: def.displayName ?? null, instagramAccounts: { create: [{ handle: def.handle, order: 0 }] } },
    })));
    const links = await prisma.packagePartner.findMany({ where: { partnerId: oldId } });
    for (const link of links) {
      for (const np of newPartners) {
        const exists = await prisma.packagePartner.findUnique({ where: { packageId_partnerId: { packageId: link.packageId, partnerId: np.id } } });
        if (!exists) await prisma.packagePartner.create({ data: { packageId: link.packageId, partnerId: np.id } });
      }
    }
    await prisma.partner.delete({ where: { id: oldId } });
    console.log(`  ${oldPartner.name}(id=${oldId}) -> ${newPartners.map((p) => `${p.name}(id=${p.id})`).join(', ')} (${links.length}개 패키지 재연결)`);
  }

  const whyBrushExisting = await prisma.partner.findFirst({ where: { role: 'hmu', name: 'Why Brush' } });
  const whyBrush = whyBrushExisting ?? await prisma.partner.create({
    data: { role: 'hmu', name: 'Why Brush', instagramAccounts: { create: [{ handle: '@why__brush', order: 0 }] } },
  });
  console.log('Why Brush(공용 hmu) id=', whyBrush.id);

  async function splitHmuWithSharedWhyBrush(matchName: string, kSalonHandle: string, versionLabel: string) {
    const oldPartner = await prisma.partner.findFirst({ where: { role: 'hmu', name: matchName, instagramAccounts: { some: {} } } });
    if (!oldPartner) { console.log(`  hmu "${matchName}" 없음, 건너뜀`); return; }
    const accounts = await prisma.partnerInstagram.findMany({ where: { partnerId: oldPartner.id } });
    if (accounts.length <= 1) { console.log(`  hmu "${matchName}"(id=${oldPartner.id}) 계정 1개뿐, 분리 불필요`); return; }
    const kSalon = await prisma.partner.create({
      data: { role: 'hmu', name: `K Salon (${versionLabel})`, displayName: 'K Salon', instagramAccounts: { create: [{ handle: kSalonHandle, order: 0 }] } },
    });
    const links = await prisma.packagePartner.findMany({ where: { partnerId: oldPartner.id } });
    for (const link of links) {
      for (const npId of [whyBrush.id, kSalon.id]) {
        const exists = await prisma.packagePartner.findUnique({ where: { packageId_partnerId: { packageId: link.packageId, partnerId: npId } } });
        if (!exists) await prisma.packagePartner.create({ data: { packageId: link.packageId, partnerId: npId } });
      }
    }
    await prisma.partner.delete({ where: { id: oldPartner.id } });
    console.log(`  hmu "${matchName}"(id=${oldPartner.id}) -> Why Brush + K Salon(${versionLabel}, id=${kSalon.id})  (${links.length}개 패키지 재연결)`);
  }

  await splitHmuWithSharedWhyBrush('K Salon', '@k__salon', '버전 1');
  await splitHmuWithSharedWhyBrush('K Salon (Seoul)', '@ksalon_seoul', '버전 2');
  await splitHmuWithSharedWhyBrush('K Salon (Jeju)', '@k__salon', '버전 1'); // 이름이 다를 수 있어 재시도(이미 처리됐으면 자동 스킵)

  // Ettera / Marshallbride 결합 파트너 분리
  const etteraCombo = await prisma.partner.findFirst({ where: { role: 'dress', name: { contains: 'Marshallbride' } } });
  if (etteraCombo) {
    const accounts = await prisma.partnerInstagram.findMany({ where: { partnerId: etteraCombo.id } });
    if (accounts.length > 1) {
      await splitPartner(etteraCombo.id, [
        { name: 'Ettera', handle: '@ettera__official' },
        { name: 'Marshallbride', handle: '@marshallbride_jeju' },
      ]);
    }
  } else {
    console.log('  Ettera/Marshallbride 결합 파트너 없음 (이미 분리됐거나 원래 없음)');
  }

  // K Salon dress 결합 파트너 분리
  const kSalonDressCombo = await prisma.partner.findFirst({
    where: { role: 'dress', name: { in: ['K Salon', 'K Salon (Jeju)'] } },
  });
  if (kSalonDressCombo) {
    const accounts = await prisma.partnerInstagram.findMany({ where: { partnerId: kSalonDressCombo.id } });
    if (accounts.length > 1) {
      await splitPartner(kSalonDressCombo.id, [
        { name: 'K Salon', handle: '@k__salon' },
        { name: 'K Salon Dress', displayName: 'K Salon', handle: '@k__salon_dress' },
      ]);
    } else {
      console.log(`  dress "${kSalonDressCombo.name}"(id=${kSalonDressCombo.id}) 계정 1개뿐, 분리 불필요`);
    }
  }

  // Ettera 오타 병합 (@ettera_official 오타 -> @ettera__official 정본으로)
  const etteraTypo = await prisma.partnerInstagram.findFirst({ where: { handle: '@ettera_official' } });
  const etteraCorrect = await prisma.partner.findFirst({ where: { role: 'dress', name: 'Ettera' }, include: { instagramAccounts: true } });
  if (etteraTypo && etteraCorrect && etteraTypo.partnerId !== etteraCorrect.id) {
    const typoPartnerId = etteraTypo.partnerId;
    const links = await prisma.packagePartner.findMany({ where: { partnerId: typoPartnerId } });
    for (const l of links) {
      const exists = await prisma.packagePartner.findUnique({ where: { packageId_partnerId: { packageId: l.packageId, partnerId: etteraCorrect.id } } });
      if (!exists) await prisma.packagePartner.create({ data: { packageId: l.packageId, partnerId: etteraCorrect.id } });
    }
    await prisma.partner.delete({ where: { id: typoPartnerId } });
    console.log(`Ettera 오타(@ettera_official) 파트너 병합 완료 (${links.length}개 패키지 -> id=${etteraCorrect.id})`);
  }

  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
