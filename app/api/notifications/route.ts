import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id, isRead: false },
        orderBy: { createdAt: 'desc' },
        include: {
            review: { select: { id: true, title: true } },
            comment: { select: { id: true, content: true, authorName: true } },
        },
    });
    return NextResponse.json(notifications);
}
export async function PATCH() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
    });
    return NextResponse.json({ success: true });
}
