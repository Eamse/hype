import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  const now = new Date();
  const [emailVerifications, passwordResets] = await Promise.all([
    prisma.emailVerification.deleteMany({
      where: { expires: { lt: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: now } },
    }),
  ]);
  console.log(
    `Deleted ${emailVerifications.count} expired EmailVerification row(s) and ${passwordResets.count} expired PasswordResetToken row(s).`,
  );
}

main()
  .catch((error) => {
    console.error('cleanup-expired-tokens failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
