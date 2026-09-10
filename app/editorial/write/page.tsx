export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { isMagazineMaster } from '@/lib/magazine-auth';
import Header from '@/components/header';
import MagazineWriteForm from './_components/magazine-write-form';
import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Write Magazine | HYPE WEDDING',
};
export default async function MagazineWritePage() {
    const session = await auth();
    const authorized = isMagazineMaster(session);
    return (<div style={{ minHeight: '100vh' }}>
      <Header brand="hype-wedding"/>
      {authorized ? (<MagazineWriteForm />) : (<div style={{ padding: '160px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#000' }}>
            You don&apos;t have permission to access this page.
          </p>
        </div>)}
    </div>);
}
