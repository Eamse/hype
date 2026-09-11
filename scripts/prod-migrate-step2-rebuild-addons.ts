import 'dotenv/config';
import { readFileSync } from 'fs';
import { prisma } from '@/lib/prisma';

// 반드시 스키마 push(= npx prisma db push --accept-data-loss) 한 "후"에 실행.
// step1에서 백업한 덤프를 읽어 Addon.displayName/variant 구조로 재구성.
type Dumped = { packageId: number; addonId: number; order: number; price: number; desc: string | null; addonName: string };

async function main() {
  const dump: Dumped[] = JSON.parse(readFileSync('/tmp/prod-package-addon-dump.json', 'utf-8'));

  const byAddonId = new Map<number, Dumped[]>();
  for (const row of dump) {
    (byAddonId.get(row.addonId) ?? byAddonId.set(row.addonId, []).get(row.addonId)!).push(row);
  }

  let variantsCreated = 0;
  let linksMoved = 0;

  for (const [addonId, rows] of byAddonId) {
    const displayName = rows[0].addonName;

    const comboMap = new Map<string, Dumped[]>();
    for (const row of rows) {
      const key = `${row.price}|||${row.desc ?? ''}`;
      (comboMap.get(key) ?? comboMap.set(key, []).get(key)!).push(row);
    }
    const combos = [...comboMap.entries()];

    if (combos.length === 1) {
      const [, group] = combos[0];
      await prisma.addon.update({
        where: { id: addonId },
        data: { price: group[0].price, desc: group[0].desc },
      });
    } else {
      for (let i = 0; i < combos.length; i++) {
        const [, group] = combos[i];
        if (i === 0) {
          await prisma.addon.update({
            where: { id: addonId },
            data: { displayName, price: group[0].price, desc: group[0].desc },
          });
          continue;
        }
        const variant = await prisma.addon.create({
          data: {
            name: `${displayName} (버전 ${i + 1})`,
            displayName,
            price: group[0].price,
            desc: group[0].desc,
            order: group[0].order,
          },
        });
        variantsCreated++;
        for (const row of group) {
          await prisma.packageAddon.delete({
            where: { packageId_addonId: { packageId: row.packageId, addonId } },
          });
          await prisma.packageAddon.create({
            data: { packageId: row.packageId, addonId: variant.id, order: row.order },
          });
          linksMoved++;
        }
      }
    }
  }

  console.log(`variant Addon 생성: ${variantsCreated}건`);
  console.log(`PackageAddon 링크 이전: ${linksMoved}건`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
