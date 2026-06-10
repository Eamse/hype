import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
