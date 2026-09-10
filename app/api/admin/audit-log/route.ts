import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminId } from '@/lib/admin-auth';

// GET /api/admin/audit-log?model=Product&recordId=186&from=2026-01-01&to=2026-01-31&q=title&page=1&pageSize=50
// 조회 전용, 삭제 API는 의도적으로 없음
export async function GET(request: NextRequest) {
  const adminId = await getAdminId(request);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model');
  const recordId = searchParams.get('recordId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const q = searchParams.get('q')?.trim();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get('pageSize')) || 50));

  const where: Prisma.AuditLogWhereInput = {
    ...(model && { model }),
    ...(recordId && { recordId }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        // to는 날짜만 오면 그 날의 끝까지 포함되게 다음날 0시 미만으로 처리
        ...(to && { lt: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000) }),
      },
    }),
    ...(q && {
      OR: [
        { field: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { recordId: { contains: q, mode: 'insensitive' } },
        { oldValue: { contains: q, mode: 'insensitive' } },
        { newValue: { contains: q, mode: 'insensitive' } },
        { admin: { name: { contains: q, mode: 'insensitive' } } },
        { admin: { loginId: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { admin: { select: { name: true, loginId: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return NextResponse.json({ logs, total, page, pageSize });
  } catch (e) {
    console.error('[GET /api/admin/audit-log]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
