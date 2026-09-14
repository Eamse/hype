'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
type Director = {
    id: number;
    number: string;
    name: string;
    location: string | null;
};
function formatDirectorLabel(d: Director) {
    const locationLabel = d.location === 'Jeju' ? 'Jeju' : 'Seoul';
    const num = d.number.replace('#', '').split('-')[0].padStart(2, '0');
    return `${locationLabel} ${num} - ${d.name}`;
}
const selectStyle: React.CSSProperties = {
    width: 180,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #000',
    fontSize: 13,
    color: '#000',
    background: '#fff',
    boxSizing: 'border-box',
};
export default function ReviewFilters({ productType, location, directorId, }: {
    productType?: string;
    location?: string;
    directorId?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [directors, setDirectors] = useState<Director[]>([]);
    useEffect(() => {
        const url = location ? `/api/directors?location=${location}` : '/api/directors';
        fetch(url)
            .then((res) => res.json())
            .then((data) => setDirectors(Array.isArray(data) ? data : []));
    }, [location]);
    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value)
            params.set(key, value);
        else
            params.delete(key);
        if (key === 'location')
            params.delete('directorId');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }
    return (<div style={{
            position: 'sticky',
            top: 56,
            zIndex: 40,
            background: '#fff',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 12,
            padding: '16px 0',
            borderBottom: '1px solid #000',
            marginBottom: 24,
        }}>
      <div style={{
            display: 'flex',
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            justifyContent: isMobile ? 'space-between' : 'center',
            gap: isMobile ? 4 : 12,
            width: isMobile ? '100%' : undefined,
        }}>
        <select style={{ ...selectStyle, flex: isMobile ? '1 1 0' : undefined, minWidth: 0, width: isMobile ? 0 : selectStyle.width, padding: isMobile ? '6px 2px' : selectStyle.padding, fontSize: isMobile ? 11 : selectStyle.fontSize }} value={productType ?? ''} onChange={(e) => updateParam('productType', e.target.value)}>
          <option value="">All Products</option>
          <option value="wedding">Wedding</option>
          <option value="snap">Snap</option>
        </select>
        <select style={{ ...selectStyle, flex: isMobile ? '1 1 0' : undefined, minWidth: 0, width: isMobile ? 0 : selectStyle.width, padding: isMobile ? '6px 2px' : selectStyle.padding, fontSize: isMobile ? 11 : selectStyle.fontSize }} value={location ?? ''} onChange={(e) => updateParam('location', e.target.value)}>
          <option value="">All Locations</option>
          <option value="jeju">Jeju</option>
          <option value="seoul">Seoul</option>
        </select>
        <select style={{ ...selectStyle, flex: isMobile ? '1 1 0' : undefined, minWidth: 0, width: isMobile ? 0 : selectStyle.width, padding: isMobile ? '6px 2px' : selectStyle.padding, fontSize: isMobile ? 11 : selectStyle.fontSize }} value={directorId ?? ''} onChange={(e) => updateParam('directorId', e.target.value)}>
          <option value="">All Photographers</option>
          {directors.map((d) => (<option key={d.id} value={d.id}>
              {formatDirectorLabel(d)}
            </option>))}
        </select>
      </div>
      <Link href="/review/write" style={{
            padding: isMobile ? '10px 0' : '10px 18px',
            background: '#000',
            color: '#fff',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            width: isMobile ? '100%' : undefined,
            boxSizing: 'border-box',
        }}>
        Write a Review
      </Link>
    </div>);
}
