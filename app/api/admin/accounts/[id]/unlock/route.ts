import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { resetRateLimit } from '@/lib/rate-limit';
export async function POST(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await requireMaster(request);
    if (!adminId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) {
        return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    }
    if (target.role === 'master') {
        return NextResponse.json({ message: 'Cannot unlock a master account this way' }, { status: 400 });
    }
    resetRateLimit(`admin_login_account:${target.loginId}`);
    return NextResponse.json({ message: 'Account unlocked' });
}
