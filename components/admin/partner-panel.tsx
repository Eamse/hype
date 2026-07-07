'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';

type Partner = {
  id: number;
  role: string;
  name: string;
  instagram: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  hmu: '헤어 & 메이크업',
  dress: '드레스',
  suit: '수트',
  bouquet: '부케',
};

const emptyForm = { name: '', instagram: '' };

export default function PartnerPanel({ role }: { role: 'hmu' | 'dress' | 'suit' | 'bouquet' }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  async function load() {
    const data = await fetch(`/api/admin/partners?role=${role}`).then((r) => r.json());
    setPartners(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [role]);

  async function handleCreate() {
    if (!form.name.trim()) {
      alert('이름은 필수입니다.');
      return;
    }
    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, name: form.name, instagram: form.instagram || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    await load();
    setForm(emptyForm);
  }

  async function handleUpdate(id: number) {
    const res = await fetch(`/api/admin/partners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editForm.name, instagram: editForm.instagram || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    await load();
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('삭제할까요?')) return;
    const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert((await res.json()).error); return; }
    setPartners((prev) => prev.filter((p) => p.id !== id));
  }

  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(partners);

  async function handleBulkDelete() {
    await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })));
    await load();
    clearSelection();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#7a5520', fontWeight: 600, marginBottom: 6 }}>
          WEDDING
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{ROLE_LABELS[role]} 관리</h2>
      </div>

      {/* 등록 폼 */}
      <div style={{ background: '#fdfcfa', border: '1px solid #ede8de', borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a', marginBottom: 16 }}>새 등록</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>이름 *</label>
            <input
              style={inputStyle}
              placeholder="샵 이름"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>인스타그램</label>
            <input
              style={inputStyle}
              placeholder="@instagram"
              value={form.instagram}
              onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
            />
          </div>
        </div>
        <button style={btnStyle('#191919', '#fff')} onClick={handleCreate}>등록</button>
      </div>

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p style={{ fontSize: 13, color: '#999' }}>불러오는 중...</p>}
        {!loading && partners.length === 0 && (
          <p style={{ fontSize: 13, color: '#999' }}>등록된 항목이 없습니다.</p>
        )}
        <BulkActions
          total={partners.length}
          selectedCount={selectedIds.size}
          allSelected={selectedIds.size === partners.length && partners.length > 0}
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDelete}
        />
        {partners.map((p) => (
          <div key={p.id} style={{ background: '#fff', border: '1px solid #ede8de', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)}
              style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
            {editingId === p.id ? (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: 12 }}>
                <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="이름" />
                <input style={inputStyle} value={editForm.instagram} onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))} placeholder="인스타그램" />
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button style={btnStyle('#191919', '#fff')} onClick={() => handleUpdate(p.id)}>저장</button>
                  <button style={btnStyle('#fff', '#666', '#ddd')} onClick={() => setEditingId(null)}>취소</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{p.name}</span>
                  {p.instagram && <span style={{ fontSize: 12, color: '#888', marginLeft: 10 }}>{p.instagram}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btnStyle('#fff', '#3a1a2a', '#ddd')} onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, instagram: p.instagram ?? '' }); }}>수정</button>
                  <button style={btnStyle('#fff', '#e05555', '#fdd')} onClick={() => handleDelete(p.id)}>삭제</button>
                </div>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
