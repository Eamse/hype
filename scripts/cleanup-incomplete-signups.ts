import 'dotenv/config';
import { prisma } from '@/lib/prisma';

const ONE_HOUR_MS = 60 * 60 * 1000;

async function main() {
  const cutoff = new Date(Date.now() - ONE_HOUR_MS);
  const result = await prisma.user.deleteMany({
    where: {
      isOnboarded: false,
      password: null,
      createdAt: { lt: cutoff },
    },
  });
  console.log(`Deleted ${result.count} incomplete signup(s) older than 1 hour.`);
}

main()
  .catch((error) => {
    console.error('cleanup-incomplete-signups failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
