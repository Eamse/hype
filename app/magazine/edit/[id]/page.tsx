export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import MagazineWriteForm from '../../write/_components/magazine-write-form';

type Props = { params: Promise<{ id: string }> };

export default async function MagazineEditPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) notFound();

  const session = await auth();
  const authorized = isMagazineMaster(session);

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header brand="hype-wedding" />
        <div style={{ padding: '160px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#000' }}>
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const magazine = await prisma.magazine.findUnique({
    where: { id: idNum },
    include: { images: { orderBy: { order: 'asc' } } },
  });
  if (!magazine) notFound();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <MagazineWriteForm
        magazineId={magazine.id}
        initialTitle={magazine.title}
        initialContent={magazine.content}
        initialImageUrl={magazine.imageUrl}
        initialImages={magazine.images.map((img) => ({ id: img.id, url: img.url }))}
        initialPublished={magazine.published}
      />
    </div>
  );
}
