import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const raw = process.env.DATABASE_URL ?? '';
  const connectionString = raw.replace(/[?&]channel_binding=[^&]*/g, '').replace(/\?$/, '');
  const adapter = new PrismaNeonHttp(connectionString, {});
  return new PrismaClient({ adapter } as never);
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
