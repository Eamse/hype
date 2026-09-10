import { NextRequest, NextResponse } from 'next/server';
import { getAdminId } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
export async function GET(request: NextRequest) {
    const adminId = await getAdminId(request);
    if (!adminId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
        return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    return NextResponse.json({ loginId: admin?.loginId, role: admin?.role });
}
