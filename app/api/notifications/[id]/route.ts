import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 알림 하나 읽음 처리
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const notificationId = parseId(id);
  if (notificationId === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
