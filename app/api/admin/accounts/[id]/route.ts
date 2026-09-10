import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
export async function DELETE(request: NextRequest, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const adminId = await requireMaster(request);
    if (!adminId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    if (adminId === id) {
        return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
    }
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ message: 'Account deleted' });
}
