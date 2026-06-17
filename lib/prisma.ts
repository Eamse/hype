import { PrismaClient } from '@/app/generated/prisma/client';
import { neon } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const raw = process.env.DATABASE_URL ?? '';
  // @neondatabase/serverless uses HTTP — strip libpq-only params that break URL parsing
  const connectionString = raw.replace(/[?&]channel_binding=[^&]*/g, '').replace(/\?$/, '');
  const sql = neon(connectionString);
  const adapter = new PrismaNeon(sql);
  return new PrismaClient({ adapter } as never);
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
