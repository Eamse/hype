'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelection } from '@/components/admin/use-selection';
import BulkActions from '@/components/admin/bulk-actions';

type MagazineRow = {
  id: number;
  title: string;
  published: boolean;
  isPinned: boolean;
  createdAt: string;
};

export default function MagazineManageList({
  initialMagazines,
}: {
  initialMagazines: MagazineRow[];
}) {
  const [magazines, setMagazines] = useState(initialMagazines);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pinningId, setPinningId] = useState<number | null>(null);
  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(magazines);

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

  async function handleTogglePin(id: number, isPinned: boolean) {
    setPinningId(id);
    try {
      const res = await fetch(`/api/magazine/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      if (!res.ok) {
        alert('Failed to update.');
        return;
      }
      setMagazines((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isPinned: !isPinned } : m));
        return [...next].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
      });
    } finally {
      setPinningId(null);
    }
  }

  async function handleBulkDelete() {
    await Promise.all(
      [...selectedIds].map((id) => fetch(`/api/magazine/${id}`, { method: 'DELETE' })),
    );
    setMagazines((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    clearSelection();
  }

  if (magazines.length === 0) {
    return <p style={{ fontSize: 13, color: '#000' }}>No posts yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <BulkActions
        total={magazines.length}
        selectedCount={selectedIds.size}
        allSelected={selectedIds.size === magazines.length && magazines.length > 0}
        onToggleAll={toggleAll}
        onDeleteSelected={handleBulkDelete}
      />
      {magazines.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            border: '1px solid #000',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <input
              type="checkbox"
              checked={selectedIds.has(m.id)}
              onChange={() => toggleSelect(m.id)}
              style={{ flexShrink: 0 }}
            />
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
            {m.isPinned && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  color: '#8a6d1e',
                  background: '#fdf3d9',
                  flexShrink: 0,
                }}
              >
                📌 Pinned
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => handleTogglePin(m.id, m.isPinned)}
              disabled={pinningId === m.id}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #000',
                fontSize: 12,
                color: '#000',
                background: m.isPinned ? '#fdf3d9' : 'none',
                cursor: 'pointer',
              }}
            >
              {m.isPinned ? 'Unpin' : 'Pin to Top'}
            </button>
            <Link
              href={`/editorial/edit/${m.id}`}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #000', fontSize: 12, color: '#000', textDecoration: 'none' }}
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
