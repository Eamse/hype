import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`onboarding:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    firstName,
    middleName,
    lastName,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    country,
    phoneCountryCode,
    phone,
    termsAgreement,
  } = body;

  if (typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender)) {
    return NextResponse.json({ message: 'Invalid gender value' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      middleName,
      lastName,
      birthYear: Number(birthYear),
      birthMonth: Number(birthMonth),
      birthDay: Number(birthDay),
      gender,
      country,
      phoneCountryCode,
      phone,
      termsAgreedAt: termsAgreement ? new Date() : null,
      isOnboarded: true,
    },
  });
  return NextResponse.json({ ok: true });
}
