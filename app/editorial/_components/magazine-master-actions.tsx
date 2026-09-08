'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

// 매거진 목록 페이지가 ISR로 캐싱될 수 있도록, master 권한 체크는 서버가 아닌
// 클라이언트에서 세션을 읽어 처리 (캐시된 HTML에 특정 유저 정보가 박히는 걸 방지)
export default function MagazineMasterActions() {
  const { data: session } = useSession();
  if (session?.user?.role !== 'master') return null;

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <Link
        href="/editorial/manage"
        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #000', fontSize: 12, color: '#000', textDecoration: 'none' }}
      >
        Manage
      </Link>
      <Link
        href="/editorial/write"
        style={{ padding: '8px 14px', borderRadius: 6, background: '#000', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
      >
        + Write
      </Link>
    </div>
  );
}
