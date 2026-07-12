'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Director = { id: number; number: string; name: string };

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #000',
  fontSize: 13,
  color: '#000',
  background: '#fff',
};

export default function ReviewFilters({
  productType,
  location,
  directorId,
}: {
  productType?: string;
  location?: string;
  directorId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [directors, setDirectors] = useState<Director[]>([]);

  useEffect(() => {
    if (!location) {
      setDirectors([]);
      return;
    }
    fetch(`/api/directors?location=${location}`)
      .then((res) => res.json())
      .then((data) => setDirectors(Array.isArray(data) ? data : []));
  }, [location]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === 'location') params.delete('directorId'); // 지역 바뀌면 작가 선택 초기화
    params.delete('page'); // 필터 바뀌면 1페이지로
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 100,
        zIndex: 40,
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '16px 0',
        borderBottom: '1px solid #000',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <select
          style={selectStyle}
          value={productType ?? ''}
          onChange={(e) => updateParam('productType', e.target.value)}
        >
          <option value="">All Products</option>
          <option value="wedding">Wedding</option>
          <option value="snap">Snap</option>
        </select>
        <select
          style={selectStyle}
          value={location ?? ''}
          onChange={(e) => updateParam('location', e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="jeju">Jeju</option>
          <option value="seoul">Seoul</option>
        </select>
        <select
          style={selectStyle}
          value={directorId ?? ''}
          disabled={!location}
          onChange={(e) => updateParam('directorId', e.target.value)}
        >
          <option value="">All Photographers</option>
          {directors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.number} {d.name}
            </option>
          ))}
        </select>
      </div>
      <Link
        href="/review/write"
        style={{
          padding: '10px 18px',
          background: '#000',
          color: '#fff',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Write a Review
      </Link>
    </div>
  );
}
