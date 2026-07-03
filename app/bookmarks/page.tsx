import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BookmarkList from './_components/bookmark-list';
import Header from '@/components/header';

export default async function Bookmarks() {
  const session = await auth();
  if (!session) redirect('/');

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
  });

  return (
    <>
      <Header />
      <BookmarkList bookmarks={bookmarks} />
    </>
  );
}
