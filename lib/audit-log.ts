import { prisma } from '@/lib/prisma';

/** 값이 바뀐 필드만 골라서 AuditLog에 남김 (같은 값이면 기록 안 함) */
export async function logFieldChanges(
  adminId: string,
  model: string,
  recordId: string | number,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const entries = Object.keys(after)
    .filter((field) => field in before && before[field] !== after[field])
    .map((field) => ({
      adminId,
      model,
      recordId: String(recordId),
      field,
      oldValue: before[field] == null ? null : String(before[field]),
      newValue: after[field] == null ? null : String(after[field]),
    }));

  if (entries.length === 0) return;
  await prisma.auditLog.createMany({ data: entries });
}
