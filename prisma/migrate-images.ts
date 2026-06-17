/**
 * data/images.json → SiteConfig 마이그레이션 스크립트
 * R2 URL인 항목만 이전 (로컬 /uploads/ 경로는 스킵)
 *
 * 실행: npx tsx prisma/migrate-images.ts
 */

import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

const DATA: Record<string, string[]> = {
  hero: [
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622535853.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622542797.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622547389.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622551551.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622555306.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622561036.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622565893.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622570215.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622578517.webp',
    'https://pub-c271b5fcdcc34eca9be592092db31905.r2.dev/hero_1781622593287.webp',
  ],
};

async function main() {
  for (const [key, urls] of Object.entries(DATA)) {
    const dbKey = `images_${key}`;
    await prisma.siteConfig.upsert({
      where: { key: dbKey },
      update: { value: JSON.stringify(urls) },
      create: { key: dbKey, value: JSON.stringify(urls) },
    });
    console.log(`✅ ${dbKey} → ${urls.length}개 이전 완료`);
  }

  console.log('\n⚠️  /uploads/ 경로 항목은 로컬 파일이라 스킵됨.');
  console.log('   product_*, magazine_* 이미지는 어드민에서 R2로 다시 업로드 필요.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
