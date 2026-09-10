import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';
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
    const { firstName, middleName, lastName, birthYear, birthMonth, birthDay, gender, country, phoneCountryCode, phone, termsAgreement, } = body;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isOnboarded: true },
    });
    if (user?.isOnboarded) {
        return NextResponse.json({ message: 'Already onboarded' }, { status: 400 });
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
            return NextResponse.json({ message: `Invalid field: ${field}` }, { status: 400 });
        }
    }
    if (middleName !== undefined &&
        middleName !== null &&
        (typeof middleName !== 'string' || middleName.length > 100)) {
        return NextResponse.json({ message: 'Invalid field: middleName' }, { status: 400 });
    }
    if (gender !== undefined &&
        gender !== null &&
        gender !== '' &&
        (typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender))) {
        return NextResponse.json({ message: 'Invalid gender value' }, { status: 400 });
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
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
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
        },
    });
    return NextResponse.json({ ok: true });
}
