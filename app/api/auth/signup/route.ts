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
      { success: false, message: 'email and password are required' },
      { status: 400 },
    );
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email: email.toLowerCase().trim(), password: hashedPassword },
    });
    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (error) {
    // P2002 = unique constraint (이메일 중복) — 동일 응답으로 이메일 열거 방지
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { success: true, message: 'Account created successfully' },
        { status: 201 },
      );
    }
    console.error('Signup error');
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
