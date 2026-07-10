import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canModifyReview } from '@/lib/review-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 댓글 수정
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> },
) {
  if (!checkRateLimit(`comment-modify:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { commentId } = await props.params;
  const id = parseId(commentId);
  if (id === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.deletedAt) {
    return NextResponse.json({ error: 'comment not found' }, { status: 404 });
  }

  const body = await request.json();
  const session = await auth();
  const allowed = await canModifyReview(comment, session, body.password);
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!body.content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  try {
    const updated = await prisma.comment.update({
      where: { id },
      data: { content: body.content },
    });
    const { password: _password, ...safeComment } = updated;
    return NextResponse.json(safeComment);
  } catch (e) {
    console.error('[PATCH /api/reviews/:id/comments/:commentId]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 댓글 삭제 (soft delete — 답글 유지, 내용만 "삭제된 댓글입니다"로 대체)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> },
) {
  if (!checkRateLimit(`comment-modify:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { commentId } = await props.params;
  const id = parseId(commentId);
  if (id === null) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment || comment.deletedAt) {
    return NextResponse.json({ error: 'comment not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const session = await auth();
  const allowed = await canModifyReview(comment, session, body.password);
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date(), content: '' },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[DELETE /api/reviews/:id/comments/:commentId]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
