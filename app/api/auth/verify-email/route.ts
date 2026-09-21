import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/site-url';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    const email = request.nextUrl.searchParams.get('email');
    const siteUrl = getSiteUrl();
    if (!token || !email) {
        return NextResponse.redirect(`${siteUrl}/verify-email?status=error`);
    }
    const record = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: email, token } },
    });
    if (!record || record.expires < new Date()) {
        return NextResponse.redirect(`${siteUrl}/verify-email?status=error`);
    }
    await prisma.$transaction([
        prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        }),
        prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token } },
        }),
    ]);
    return NextResponse.redirect(`${siteUrl}/verify-email?status=success`);
}
