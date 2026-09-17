'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { primaryButtonStyle, secondaryButtonStyle } from '@/lib/button-style';
export default function MagazineMasterActions() {
    const { data: session } = useSession();
    if (session?.user?.role !== 'master')
        return null;
    return (<div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <Link href="/editorial/manage" style={secondaryButtonStyle}>
        Manage
      </Link>
      <Link href="/editorial/write" style={primaryButtonStyle}>
        + Write
      </Link>
    </div>);
}
