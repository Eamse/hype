import type { Metadata } from 'next';
import Header from '@/components/header';
import HomeFooter from '@/app/_components/home-footer';
import AccountClient from './_components/account-client';

export const metadata: Metadata = { title: 'My Account | HYPE WEDDING' };

export default function AccountPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ paddingTop: 80, flex: 1 }}>
        <AccountClient />
      </main>
      <HomeFooter />
    </div>
  );
}
