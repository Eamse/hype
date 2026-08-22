import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { decrypt, encrypt } from '@/lib/encryption';

export async function GET() {
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      { status: 401 },
    );
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json({
    firstName: user.firstName ? decrypt(user.firstName) : '',
    middleName: user.middleName ? decrypt(user.middleName) : '',
    lastName: user.lastName ? decrypt(user.lastName) : '',
    email: user.email,
    gender: user.gender ?? '',
    country: user.country ?? '',
    phoneCountryCode: user.phoneCountryCode ?? '',
    phone: user.phone ? decrypt(user.phone) : '',
    birthYear: user.birthYear ? decrypt(user.birthYear) : '',
    birthMonth: user.birthMonth ? decrypt(user.birthMonth) : '',
    birthDay: user.birthDay ? decrypt(user.birthDay) : '',
    hasPassword: !!user.password,
  });
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    firstName,
    middleName,
    lastName,
    gender,
    country,
    phoneCountryCode,
    phone,
    birthYear,
    birthMonth,
    birthDay,
    password,
    confirmPassword,
    currentPassword,
  } = body;

  const strFields: Record<string, unknown> = {
    firstName,
    lastName,
    country,
    phoneCountryCode,
    phone,
    birthYear,
    birthMonth,
    birthDay,
  };
  const data: Record<string, string> = {};
  const displayNameParts: string[] = [];
  for (const [field, val] of Object.entries(strFields)) {
    if (val === undefined) continue;
    if (
      typeof val !== 'string' ||
      val.trim().length === 0 ||
      val.length > 100
    ) {
      return NextResponse.json(
        { error: `Invalid field: ${field}` },
        { status: 400 },
      );
    }
    if (['firstName', 'lastName', 'phone', 'birthYear', 'birthMonth', 'birthDay'].includes(field)) {
      if (field === 'firstName' || field === 'lastName') displayNameParts.push(val.trim());
      data[field] = encrypt(val.trim());
    } else {
      data[field] = val.trim();
    }
  }

  if (middleName !== undefined) {
    if (typeof middleName !== 'string' || middleName.length > 100) {
      return NextResponse.json({ error: 'Invalid field: middleName' }, { status: 400 });
    }
    data.middleName = middleName.trim() ? encrypt(middleName.trim()) : '';
  }

  if (
    gender !== undefined &&
    gender !== null &&
    gender !== '' &&
    (typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender))
  ) {
    return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 });
  }
  if (gender !== undefined) {
    data.gender = gender || '';
  }

  if (password) {
    if (typeof password !== 'string' || !PASSWORD_RULE.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
        },
        { status: 400 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // 세션 탈취만으로 비밀번호를 바꿔치기해 계정을 뺏을 수 없도록, 기존 비밀번호가
    // 설정돼 있는 계정은 현재 비밀번호 확인을 반드시 거치게 함
    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (existing?.password) {
      if (typeof currentPassword !== 'string' || !currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 },
        );
      }
      const isValid = await bcrypt.compare(currentPassword, existing.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 },
        );
      }
    }

    data.password = await bcrypt.hash(password, 12);
  }

  if (displayNameParts.length > 0) {
    data.name = displayNameParts.join(' ');
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  return NextResponse.json({
    ok: true,
  });
}
