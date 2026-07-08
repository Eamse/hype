export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/header';
import Link from 'next/link';
import type { Metadata } from 'next';
import MagazineManageList from './_components/magazine-manage-list';

export const metadata: Metadata = {
  title: 'Manage Magazine | HYPE WEDDING',
};

export default async function MagazineManagePage() {
  const session = await auth();
  const authorized = isMagazineMaster(session);

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header brand="hype-wedding" />
        <div style={{ padding: '160px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#666' }}>
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const magazines = await prisma.magazine.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding" />
      <div
        style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Manage Magazine
          </h1>
          <Link
            href="/magazine/write"
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: '#191919',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            + New Post
          </Link>
        </div>
        <MagazineManageList
          initialMagazines={magazines.map((m) => ({
            id: m.id,
            title: m.title,
            published: m.published,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
