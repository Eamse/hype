import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const adminId = await requireMaster(request);
  if (!adminId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const accounts = await prisma.admin.findMany({
    select: {
      id: true,
      loginId: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  const decrypted = accounts.map((u) => {
    const name = u.name ? decrypt(u.name) : null;

    return {
      id: u.id,
      loginId: u.loginId,
      name: name,
      phone: u.phone ? decrypt(u.phone) : null,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    };
  });

  return NextResponse.json(decrypted);
}

export async function POST(request: NextRequest) {
  const adminId = await requireMaster(request);
  if (!adminId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { loginId, name, phone, role, isActive, password } = body;
  if (!loginId || !name || !phone || !role || !password) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 },
    );
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    await prisma.admin.create({
      data: {
        loginId,
        name: encrypt(name.trim()),
        phone: encrypt(phone.trim()),
        role,
        isActive,
        password: hashedPassword,
      },
    });
    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (e) {
    if (
      e instanceof Error &&
      'code' in e &&
      (e as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        {
          message: 'Login ID already exists',
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
