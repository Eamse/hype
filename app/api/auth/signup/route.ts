import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';
import { signIn } from '@/auth';
export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    if (!checkRateLimit(`signup:${ip}`, 5, 10 * 60 * 1000)) {
        return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }
    const body = await req.json();
    const { email, firstName, middleName, lastName, birthYear, birthMonth, birthDay, password, gender, country, phoneCountryCode, phone, termsAgreement, } = body;
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }
    const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (typeof password !== 'string' || !PASSWORD_RULE.test(password)) {
        return NextResponse.json({
            success: false,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
        }, { status: 400 });
    }
    const year = Number(birthYear);
    const month = Number(birthMonth);
    const day = Number(birthDay);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        return NextResponse.json({ message: 'Invalid birthYear' }, { status: 400 });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        return NextResponse.json({ message: 'Invalid birthMonth' }, { status: 400 });
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        return NextResponse.json({ message: 'Invalid birthDay' }, { status: 400 });
    }
    if (termsAgreement !== true) {
        return NextResponse.json({ message: 'Terms agreement is required' }, { status: 400 });
    }
    const strFields: Record<string, unknown> = {
        firstName,
        lastName,
        country,
        phoneCountryCode,
        phone,
    };
    for (const [field, val] of Object.entries(strFields)) {
        if (typeof val !== 'string' ||
            val.trim().length === 0 ||
            val.length > 100) {
            return NextResponse.json({
                success: false,
                message: `Invalid field: ${field}`,
            }, { status: 400 });
        }
    }
    if (gender !== undefined &&
        gender !== null &&
        gender !== '' &&
        (typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender))) {
        return NextResponse.json({
            success: false,
            message: 'Invalid gender value',
        }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const verification = await prisma.emailVerification.findUnique({
        where: { email: normalizedEmail },
    });
    if (!verification || !verification.verified || verification.expires < new Date()) {
        return NextResponse.json({ success: false, message: 'Please verify your email first' }, { status: 400 });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const data = {
            firstName: encrypt(firstName.trim()),
            middleName: middleName ? encrypt(middleName?.trim()) : null,
            lastName: encrypt(lastName.trim()),
            birthYear: encrypt(String(year)),
            birthMonth: encrypt(String(month)),
            birthDay: encrypt(String(day)),
            gender: gender || null,
            country: country.trim(),
            phoneCountryCode: phoneCountryCode.trim(),
            phone: encrypt(phone.trim()),
            termsAgreedAt: new Date(),
            isOnboarded: true,
            password: hashedPassword,
            emailVerified: new Date(),
        };
        const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });
        if (existing) {
            // 본인 확인 없이 기존 계정(유령 계정 포함)을 덮어쓰면 이메일만 알아도 계정을 가로챌 수 있어
            // 위험하므로 허용하지 않음. 미완료 유령 계정은 1시간 후 크론이 자동 삭제하므로
            // 그 이후 재시도하면 자연히 새로 가입됨.
            return NextResponse.json({ success: true, message: 'If this email is already registered, please sign in instead.' }, { status: 200 });
        }
        await prisma.user.create({ data: { email: normalizedEmail, ...data } });
        await prisma.emailVerification.delete({ where: { email: normalizedEmail } }).catch(() => {});
        // 계정 생성과 같은 요청 안에서 바로 로그인시켜서, 클라이언트가 별도로
        // signIn()을 호출하며 추가 왕복(CSRF+콜백)을 발생시키지 않게 함.
        try {
            await signIn('credentials', { email: normalizedEmail, password, redirect: false });
        }
        catch (e) {
            console.error('[signup] auto sign-in failed:', e);
        }
        return NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 });
    }
    catch (error) {
        if (error instanceof Error &&
            'code' in error &&
            (error as {
                code: string;
            }).code === 'P2002') {
            return NextResponse.json({ success: true, message: 'If this email is already registered, please sign in instead.' }, { status: 200 });
        }
        console.error('Signup error');
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
