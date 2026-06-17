import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`signup:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  let email: string, password: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: 'email and password are required',
      },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing)
    return NextResponse.json(
      { success: false, message: 'This email is already registered' },
      { status: 400 },
    );

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error(error, 'Server Error');
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 },
    );
  }
}
