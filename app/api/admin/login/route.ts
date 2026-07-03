import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`admin_login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { message: 'Too many login attempts. Please try again later.' },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { loginId, password } = body;

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
    secure: false,
    sameSite: 'strict',
    maxAge: 60 * 60 * 2,
    path: '/',
  });
  return response;
}
