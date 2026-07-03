'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';

type Addon = {
  id: number;
  name: string;
  price: number;
  desc: string | null;
};

const emptyForm = { name: '', price: '', desc: '' };

export default function AddonPanel() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  async function load() {
    const data = await fetch('/api/admin/addons').then((r) => r.json());
    setAddons(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.name.trim()) {
      alert('제목은 필수입니다.');
      return;
    }
    const res = await fetch('/api/admin/addons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        price: form.price ? Number(form.price) : null,
        desc: form.desc || null,
      }),
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
    const res = await fetch(`/api/admin/addons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        price: editForm.price ? Number(editForm.price) : null,
        desc: editForm.desc || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    await load();
    setEditingId(null);
    setExpandedId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('이 애드온을 삭제할까요?')) return;
    const res = await fetch(`/api/admin/addons/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert((await res.json()).error); return; }
    setAddons((prev) => prev.filter((a) => a.id !== id));
  }

  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(addons);

  async function handleBulkDelete() {
    await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/addons/${id}`, { method: 'DELETE' })));
    await load();
    clearSelection();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#7a5520',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          WEDDING
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
          Addons 관리
        </h2>
      </div>

      {/* 등록 폼 */}
      <div
        style={{
          background: '#fdfcfa',
          border: '1px solid #ede8de',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#3a1a2a',
            marginBottom: 16,
          }}
        >
          새 Addon 등록
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 3fr',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <label style={labelStyle}>제목 *</label>
            <input
              style={inputStyle}
              placeholder="제목"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>금액</label>
            <input
              style={inputStyle}
              placeholder="금액"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={labelStyle}>설명</label>
            <input
              style={inputStyle}
              placeholder="설명"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
        </div>
        <button style={btnStyle('#191919', '#fff')} onClick={handleCreate}>
          등록
        </button>
      </div>

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p style={{ fontSize: 13, color: '#999' }}>불러오는 중...</p>}
        {!loading && addons.length === 0 && (
          <p style={{ fontSize: 13, color: '#999' }}>등록된 Addon이 없습니다.</p>
        )}
        <BulkActions
          total={addons.length}
          selectedCount={selectedIds.size}
          allSelected={selectedIds.size === addons.length && addons.length > 0}
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDelete}
        />
        {addons.map((a) => (
          <div
            key={a.id}
            style={{ background: '#fff', border: '1px solid #ede8de', borderRadius: 10, overflow: 'hidden' }}
          >
            {/* 항상 보이는 행 */}
            <div
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
            >
              <input type="checkbox" checked={selectedIds.has(a.id)}
                onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(a.id)}
                style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                <span
                  style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}
                >
                  {a.name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a96e' }}>
                  ${a.price.toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#aaa' }}>
                {expandedId === a.id ? '▲' : '▼'}
              </span>
            </div>

            {/* 드롭다운 */}
            {expandedId === a.id && (
              <div
                style={{
                  borderTop: '1px solid #ede8de',
                  padding: '16px 20px',
                  background: '#fafaf8',
                }}
              >
                {editingId === a.id ? (
                  /* 수정 모드 */
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 3fr',
                        gap: 12,
                      }}
                    >
                      <div>
                        <label style={labelStyle}>제목</label>
                        <input
                          style={inputStyle}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>금액</label>
                        <input
                          style={inputStyle}
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              price: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>설명</label>
                        <input
                          style={inputStyle}
                          value={editForm.desc}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, desc: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={btnStyle('#191919', '#fff')}
                        onClick={() => handleUpdate(a.id)}
                      >
                        저장
                      </button>
                      <button
                        style={btnStyle('#fff', '#666', '#ddd')}
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 보기 모드 */
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {a.desc && (
                      <p style={{ fontSize: 13, color: '#555' }}>{a.desc}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={btnStyle('#fff', '#3a1a2a', '#ddd')}
                        onClick={() => {
                          setEditingId(a.id);
                          setEditForm({
                            name: a.name,
                            price: a.price.toString(),
                            desc: a.desc ?? '',
                          });
                        }}
                      >
                        수정
                      </button>
                      <button
                        style={btnStyle('#fff', '#e05555', '#fdd')}
                        onClick={() => handleDelete(a.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
