import { PrismaClient } from '@/app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};
function createPrisma() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as never);
}
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
