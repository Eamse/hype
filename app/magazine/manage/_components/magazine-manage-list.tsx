'use client';

import { useState } from 'react';
import Link from 'next/link';

type MagazineRow = {
  id: number;
  title: string;
  published: boolean;
  createdAt: string;
};

export default function MagazineManageList({
  initialMagazines,
}: {
  initialMagazines: MagazineRow[];
}) {
  const [magazines, setMagazines] = useState(initialMagazines);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/magazine/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete.');
        return;
      }
      setMagazines((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (magazines.length === 0) {
    return <p style={{ fontSize: 13, color: '#888' }}>No posts yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {magazines.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            border: '1px solid #eee',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                color: m.published ? '#166534' : '#92400e',
                background: m.published ? '#dcfce7' : '#fef3c7',
                flexShrink: 0,
              }}
            >
              {m.published ? 'Published' : 'Draft'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#191919', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link
              href={`/magazine/edit/${m.id}`}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 12, color: '#191919', textDecoration: 'none' }}
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(m.id)}
              disabled={deletingId === m.id}
              style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
