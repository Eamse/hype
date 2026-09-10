'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
export default function MagazineMasterActions() {
    const { data: session } = useSession();
    if (session?.user?.role !== 'master')
        return null;
    return (<div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <Link href="/editorial/manage" style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #000', fontSize: 12, color: '#000', textDecoration: 'none' }}>
        Manage
      </Link>
      <Link href="/editorial/write" style={{ padding: '8px 14px', borderRadius: 6, background: '#000', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
        + Write
      </Link>
    </div>);
}
