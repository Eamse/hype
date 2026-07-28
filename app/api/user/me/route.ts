import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
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
    name: user.name ?? '',
    email: user.email,
    country: user.country ?? '',
    phoneCountryCode: user.phoneCountryCode ?? '',
    phone: user.phone ? decrypt(user.phone) : '',
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, country, phoneCountryCode, phone } = body;

  const strFields: Record<string, unknown> = {
    name,
    country,
    phoneCountryCode,
    phone,
  };
  const data: Record<string, string> = {};
  for (const [field, val] of Object.entries(strFields)) {
    if (val === undefined) continue;
    if (
      typeof val !== 'string' ||
      val.trim().length === 0 ||
      val.length > 100
    ) {
      return NextResponse.json(
        {
          error: `Invalid field: ${field}`,
        },
        { status: 400 },
      );
    }
    if (field === 'phone') {
      data.phone = encrypt(val.trim());
    } else {
      data[field] = val.trim();
    }
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  return NextResponse.json({
    ok: true,
  });
}
