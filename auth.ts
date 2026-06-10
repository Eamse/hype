import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // 로그인 시 토큰에 id, isOnboarded 저장
      if (user) {
        token.id = user.id;
        token.isOnboarded = (user as { isOnboarded: boolean }).isOnboarded;
      }
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isOnboarded: true },
        });
        token.isOnboarding = dbUser?.isOnboarded ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // 토큰 → 세션으로 전달
      session.user.id = token.id as string;
      session.user.isOnboarded = token.isOnboarded as boolean;
      return session;
    },
  },
});
