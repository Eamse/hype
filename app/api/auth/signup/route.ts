import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';
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
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
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
            },
        });
        return NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 });
    }
    catch (error) {
        if (error instanceof Error &&
            'code' in error &&
            (error as {
                code: string;
            }).code === 'P2002') {
            return NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 });
        }
        console.error('Signup error');
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
