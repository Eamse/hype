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
    const record = await prisma.emailVerification.findUnique({ where: { email } });
    if (!record || record.token !== token || record.expires < new Date()) {
        return NextResponse.redirect(`${siteUrl}/verify-email?status=error`);
    }
    await prisma.emailVerification.update({
        where: { email },
        data: { verified: true },
    });
    return NextResponse.redirect(`${siteUrl}/verify-email?status=success`);
}
