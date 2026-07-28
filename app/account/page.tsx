'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/header';

export default function AccountPage() {
  const { data: session } = useSession();

  return (
    <div>
      <Header />
      <main style={{ paddingTop: 80 }}>
        <h1>내정보 변경</h1>
      </main>
    </div>
  );
}
