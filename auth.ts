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
        token.id = user.id as string;
        token.isOnboarded = (user as { isOnboarded: boolean }).isOnboarded;
        token.role = (user as { role: string }).role;
        token.image = user.image;
        token.name = user.name;
        token.roleCheckedAt = Date.now();
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
      // 매 요청마다 role이 로그인 시점 이후로 바뀌었는지 확인 (권한 변경/회수를 즉시 반영)
      if (!user && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, updatedAt: true },
        });
        if (!dbUser) {
          // 계정이 삭제됨 — 세션 무효화
          return null;
        }
        const checkedAt = (token.roleCheckedAt as number | undefined) ?? 0;
        if (dbUser.updatedAt.getTime() > checkedAt) {
          token.role = dbUser.role;
          token.roleCheckedAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      // 토큰 → 세션으로 전달
      session.user.id = token.id as string;
      session.user.isOnboarded = token.isOnboarded as boolean;
      session.user.role = token.role as string;
      session.user.image = (token.image as string) ?? null;
      return session;
    },
  },
});
