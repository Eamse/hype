import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { loginId, password } = body;

  if (typeof loginId !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  // 계정 기준으로도 제한 — 여러 IP를 돌려가며 한 계정을 노리는 것도 방어.
  // 마스터가 Account Setting에서 해당 계정 잠금을 풀어줄 수 있음(app/api/admin/accounts/[id]/unlock)
  if (!checkRateLimit(`admin_login_account:${loginId}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { message: 'Too many login attempts. Please try again later.' },
      { status: 429 },
    );
  }

  const login = await prisma.admin.findUnique({
    where: { loginId },
  });
  if (!login) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, login.password);
  if (!isValid) {
    return NextResponse.json({ message: 'invaild password' }, { status: 401 });
  }

  // 6. JWT 만들어서 쿠키에 담기
  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
  const token = await new SignJWT({
    id: login.id,
    loginId: login.loginId,
    role: login.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 2,
    path: '/',
  });
  return response;
}
