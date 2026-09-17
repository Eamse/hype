import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { buildCommentTree } from '@/lib/comment-tree';
import { isStrongGuestPassword } from '@/lib/guest-password';
import { badRequest } from '@/lib/api-errors';
function parseId(id: string): number | null {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0)
        return null;
    return n;
}
export async function GET(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await props.params;
    const reviewId = parseId(id);
    if (reviewId === null) {
        return badRequest('reviews/:id/comments', 'invalid id');
    }
    const comments = await prisma.comment.findMany({
        where: { reviewId },
        orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(buildCommentTree(comments));
}
export async function POST(request: NextRequest, props: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await props.params;
    const reviewId = parseId(id);
    if (reviewId === null) {
        return badRequest('reviews/:id/comments', 'invalid id');
    }
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { id: true, userId: true },
    });
    if (!review) {
        return NextResponse.json({ error: 'review not found' }, { status: 404 });
    }
    const ip = getClientIp(request);
    if (!checkRateLimit(`comment:${ip}`, 10, 10 * 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const session = await auth();
    const body = await request.json();
    const { content, parentId, authorName, password } = body;
    if (!content) {
        return badRequest('reviews/:id/comments', 'content is required');
    }
    let parent: {
        reviewId: number;
        userId: string | null;
    } | null = null;
    let parentIdNum: number | null = null;
    if (parentId !== undefined && parentId !== null) {
        parentIdNum = parseId(String(parentId));
        if (parentIdNum === null) {
            return badRequest('reviews/:id/comments', 'invalid parentId');
        }
        parent = await prisma.comment.findUnique({
            where: { id: parentIdNum },
            select: { reviewId: true, userId: true },
        });
        if (!parent || parent.reviewId !== reviewId) {
            return badRequest('reviews/:id/comments', 'invalid parentId');
        }
    }
    let finalUserId: string | null = null;
    let finalAuthorName: string;
    let hashedPassword: string | null = null;
    if (session?.user?.id) {
        finalUserId = session.user.id;
        finalAuthorName = session.user.name ?? '';
    }
    else {
        if (!authorName || !password) {
            return badRequest('reviews/:id/comments', 'authorName and password are required');
        }
        if (!isStrongGuestPassword(password)) {
            return badRequest('reviews/:id/comments', 'password must be at least 8 characters and include a special character');
        }
        finalAuthorName = authorName;
        hashedPassword = await bcrypt.hash(password, 12);
    }
    try {
        const comment = await prisma.comment.create({
            data: {
                reviewId,
                content,
                authorName: finalAuthorName,
                password: hashedPassword,
                userId: finalUserId,
                parentId: parentIdNum,
            },
        });
        const recipientId = parent ? parent.userId : review.userId;
        if (recipientId && recipientId !== finalUserId) {
            await prisma.notification.create({
                data: {
                    userId: recipientId,
                    type: parent ? 'reply' : 'comment',
                    reviewId,
                    commentId: comment.id,
                },
            });
        }
        const { password: _password, ...safeComment } = comment;
        return NextResponse.json(safeComment, { status: 201 });
    }
    catch (e) {
        console.error('[POST /api/reviews/:id/comments]', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
