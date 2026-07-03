import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            section: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookmarks);
  } catch (e) {
    console.error('GET /api/bookmarks error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { productId } = await request.json();
    if (!productId || typeof productId !== 'number') {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });
    if (!existing) {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          productId: productId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    } else {
      await prisma.bookmark.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
      });
    }
    return NextResponse.json({ bookmarked: false });
  } catch (e) {
    console.error('POST /api/bookmarks error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
