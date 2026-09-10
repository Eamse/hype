import { NextRequest, NextResponse } from 'next/server';
import { getAdminId } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const q = request.nextUrl.searchParams.get('q') ?? '';
    const users = await prisma.user.findMany({
        where: q
            ? {
                OR: [
                    { email: { contains: q, mode: 'insensitive' } },
                    { name: { contains: q, mode: 'insensitive' } },
                ],
            }
            : undefined,
        select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            country: true,
            phone: true,
            phoneCountryCode: true,
            birthYear: true,
            birthMonth: true,
            birthDay: true,
            createdAt: true,
            accounts: {
                select: {
                    provider: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    const decrypted = users.map((u) => {
        const firstName = u.firstName ? decrypt(u.firstName) : null;
        const middleName = u.middleName ? decrypt(u.middleName) : null;
        const lastName = u.lastName ? decrypt(u.lastName) : null;
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') ||
            u.name ||
            null;
        return {
            id: u.id,
            email: u.email,
            name: fullName,
            gender: u.gender,
            country: u.country,
            phone: u.phone ? decrypt(u.phone) : null,
            phoneCountryCode: u.phoneCountryCode,
            birthYear: u.birthYear ? decrypt(u.birthYear) : null,
            birthMonth: u.birthMonth ? decrypt(u.birthMonth) : null,
            birthDay: u.birthDay ? decrypt(u.birthDay) : null,
            createdAt: u.createdAt,
            provider: u.accounts[0]?.provider ?? 'credentials',
        };
    });
    return NextResponse.json(decrypted);
}
