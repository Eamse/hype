import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminId } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Both current and new password are required.' },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect.' },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashed },
  });

  // 비밀번호 변경 후 기존 토큰 무효화 — 재로그인 강제
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
