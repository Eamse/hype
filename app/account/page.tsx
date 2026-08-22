import Header from '@/components/header';
import AccountClient from './_components/account-client';

export default function AccountPage() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 80 }}>
        <AccountClient />
      </main>
    </div>
  );
}
