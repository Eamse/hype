import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getProductNumber } from '@/lib/product-number';
import BookmarkList from './_components/bookmark-list';
import Header from '@/components/header';
import HomeFooter from '@/app/_components/home-footer';

export default async function Bookmarks() {
  const session = await auth();
  if (!session) redirect('/');

  const bookmarksRaw = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          section: true,
          directors: { select: { director: { select: { number: true } } } },
        },
      },
    },
  });
  const bookmarks = bookmarksRaw.map((b) => ({
    ...b,
    product: { ...b.product, number: getProductNumber(b.product) },
  }));

  return (
    <>
      <Header />
      <BookmarkList bookmarks={bookmarks} />
      <HomeFooter />
    </>
  );
}
