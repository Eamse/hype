import 'dotenv/config';
import { writeFileSync } from 'fs';
import { prisma } from '@/lib/prisma';

// 반드시 스키마 push(= npx prisma db push) 하기 "전"에 실행해야 함.
// PackageAddon.price/desc 컬럼이 아직 살아있을 때 값을 백업해두는 스크립트.
async function main() {
  const rows = await prisma.packageAddon.findMany({ include: { addon: true } });
  const dump = rows.map((r: any) => ({
    packageId: r.packageId,
    addonId: r.addonId,
    order: r.order,
    price: r.price,
    desc: r.desc,
    addonName: r.addon.name,
  }));
  writeFileSync('/tmp/prod-package-addon-dump.json', JSON.stringify(dump, null, 2));
  console.log(`덤프 완료: ${dump.length}건 -> /tmp/prod-package-addon-dump.json`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
