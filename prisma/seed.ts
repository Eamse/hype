import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'path';
import { config } from 'dotenv';

config();

const adapter = new PrismaLibSql({
  url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
});
const prisma = new PrismaClient({ adapter } as never);

// 마스터 계정 목록 (.env에서 비밀번호 주입)
const MASTERS = [
  { loginId: 'master', password: process.env.MASTER_PASSWORD, name: 'Master' },
  { loginId: 'dev', password: process.env.DEV_PASSWORD, name: 'Dev' },
  {
    loginId: 'master0',
    password: process.env.MASTER0_PASSWORD,
    name: 'Master0',
  },
];

async function main() {
  for (const master of MASTERS) {
    // .env에 비밀번호 없으면 스킵
    if (!master.password) {
      console.error(`❌ ${master.loginId}: .env에 비밀번호 없음`);
      continue;
    }

    // bcrypt 해시 강도 12 (보안/성능 균형점)
    const hashed = await bcrypt.hash(master.password, 12);

    // upsert: 이미 있으면 스킵, 없으면 생성
    await prisma.admin.upsert({
      where: { loginId: master.loginId },
      update: {},
      create: {
        loginId: master.loginId,
        password: hashed,
        name: master.name,
        phone: '',
        role: 'master',
        isActive: true,
        isPasswordChanged: true, // 마스터는 초기 비번을 본인이 설정
      },
    });

    console.log(`✅ ${master.loginId} 생성 완료`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
