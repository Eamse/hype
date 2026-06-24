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
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 }, // 7일
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile, trigger }) {
      // 로그인 시 토큰에 id, isOnboarded 저장
      if (user) {
        token.id = user.id ?? undefined;
        token.isOnboarded = (user as { isOnboarded: boolean }).isOnboarded;
        token.image = user.image;
        token.name = user.name;
      }
      // 구글 로그인 시 프로필 이미지 저장
      if (account?.provider === 'google' && profile) {
        const picture = (profile as { picture?: string }).picture ?? null;
        token.image = picture;
        if (picture && token.id) {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { image: picture },
          });
        }
      }
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isOnboarded: true },
        });
        token.isOnboarded = dbUser?.isOnboarded ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      // 토큰 → 세션으로 전달
      session.user.id = token.id as string;
      session.user.isOnboarded = token.isOnboarded as boolean;
      session.user.image = (token.image as string) ?? null;
      return session;
    },
  },
});
