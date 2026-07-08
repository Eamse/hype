import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { encrypt } from '../lib/encryption';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

// 어드민 대시보드(/admin) 마스터 계정 목록 (.env에서 비밀번호 주입)
const ADMIN_MASTERS = [
  { loginId: 'Minju', password: process.env.MINJU_PASSWORD, name: 'Minju' },
  { loginId: 'Morgan', password: process.env.MORGAN_PASSWORD, name: 'Morgan' },
  { loginId: 'dev', password: process.env.DEV_PASSWORD, name: 'dev' },
];

// 매거진 작성(/magazine/write) 마스터 계정 목록 — User 테이블, NextAuth 세션 기반, 어드민 대시보드와 별개 시스템
const MAGAZINE_MASTERS = [
  { email: 'minju@admin.com', name: 'Minju', password: process.env.MAGAZINE_MINJU_PASSWORD },
  { email: 'morgan@admin.com', name: 'Morgan', password: process.env.MAGAZINE_MORGAN_PASSWORD },
  { email: 'dev@admin.com', name: 'dev', password: process.env.MAGAZINE_DEV_PASSWORD },
];

async function main() {
  for (const master of ADMIN_MASTERS) {
    // .env에 비밀번호 없으면 스킵
    if (!master.password) {
      console.error(`❌ ${master.loginId}: .env에 비밀번호 없음`);
      process.exit(1);
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
        name: encrypt(master.name),
        phone: '',
        role: 'master',
        isActive: true,
        isPasswordChanged: true, // 마스터는 초기 비번을 본인이 설정
      },
    });

    console.log(`✅ [admin] ${master.loginId} 생성 완료`);
  }

  for (const master of MAGAZINE_MASTERS) {
    if (!master.password) {
      console.error(`❌ ${master.email}: .env에 비밀번호 없음`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(master.password, 12);

    await prisma.user.upsert({
      where: { email: master.email },
      update: { role: 'master', password: hashed, isOnboarded: true },
      create: {
        email: master.email,
        name: master.name,
        password: hashed,
        role: 'master',
        isOnboarded: true,
      },
    });

    console.log(`✅ [magazine] ${master.email} 생성 완료`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
