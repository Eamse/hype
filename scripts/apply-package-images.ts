import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
type Group = {
    location: string;
    numberPrefix: string;
    images: {
        webUrl: string;
        originalUrl: string;
    }[];
};
async function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('사용법: npx tsx scripts/apply-package-images.ts <json 경로>');
        process.exit(1);
    }
    const groups: Group[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const group of groups) {
        const directors = await prisma.director.findMany({
            where: { location: group.location },
        });
        const matched = directors.filter((d) => d.number === group.numberPrefix || d.number.startsWith(`${group.numberPrefix}-`));
        if (matched.length === 0) {
            console.warn(`⚠️  매칭되는 작가 없음: ${group.location} ${group.numberPrefix}`);
            continue;
        }
        const packages = await prisma.package.findMany({
            where: { directorId: { in: matched.map((d) => d.id) } },
        });
        if (packages.length === 0) {
            console.warn(`⚠️  ${group.location} ${group.numberPrefix} — 패키지 없음`);
            continue;
        }
        for (const pkg of packages) {
            await prisma.packageImage.deleteMany({ where: { packageId: pkg.id } });
            await prisma.packageImage.createMany({
                data: group.images.map((img, order) => ({
                    packageId: pkg.id,
                    webUrl: img.webUrl,
                    originalUrl: img.originalUrl,
                    order,
                })),
            });
        }
        console.log(`✅ ${group.location} ${group.numberPrefix} — 패키지 ${packages.length}개, 사진 ${group.images.length}장 반영`);
    }
    console.log('🎉 완료');
}
main()
    .catch((err) => {
    console.error('❌ 실패:', err.message);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
