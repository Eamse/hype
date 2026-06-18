import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// 1. body에서 loginId, password 꺼내기
// 2. DB에서 loginId로 어드민 조회
// 3. 없으면 401
// /4. bcrypt로 비밀번호 검증
// 5. 틀리면 401
// 6. 맞으면 쿠키 발급
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`admin_login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ message: 'Too many login attempts. Please try again later.' }, { status: 429 });
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 2,
    path: '/',
  });
  return response;
}
