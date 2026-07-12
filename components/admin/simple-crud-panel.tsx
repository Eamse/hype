'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';

export type CrudField = {
  key: string;
  label: string;
  type?: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  /** 목록 행에서 이름 옆 뱃지로 보여줄지 (예: 금액) */
  showInSummary?: boolean;
  summaryPrefix?: string;
  /** 펼쳤을 때 보기 모드에서 본문 텍스트로 보여줄지 (예: 설명) */
  showInDetailView?: boolean;
};

type CrudItem = { id: number } & Record<string, string | number | null>;

export default function SimpleCrudPanel({
  category,
  title,
  createLabel,
  apiBase,
  fields,
  deleteConfirmText,
  emptyListText,
  gridColumns,
}: {
  category: string;
  title: string;
  createLabel: string;
  apiBase: string;
  fields: CrudField[];
  deleteConfirmText: string;
  emptyListText: string;
  gridColumns?: string;
}) {
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, ''])) as Record<string, string>;
  const [items, setItems] = useState<CrudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  async function load() {
    const data = await fetch(apiBase).then((r) => r.json());
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function buildBody(values: Record<string, string>) {
    const body: Record<string, string | number | null> = {};
    for (const f of fields) {
      if (f.type === 'number') {
        body[f.key] = values[f.key] ? Number(values[f.key]) : null;
      } else if (f.required) {
        body[f.key] = values[f.key];
      } else {
        body[f.key] = values[f.key] || null;
      }
    }
    return body;
  }

  async function handleCreate() {
    const primary = fields[0];
    if (primary.required && !form[primary.key]?.trim()) {
      alert(`${primary.label}은(는) 필수입니다.`);
      return;
    }
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(form)),
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    await load();
    setForm(emptyForm);
  }

  async function handleUpdate(id: number) {
    const res = await fetch(`${apiBase}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(editForm)),
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    await load();
    setEditingId(null);
    setExpandedId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm(deleteConfirmText)) return;
    const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(items);

  async function handleBulkDelete() {
    await Promise.all(
      [...selectedIds].map((id) => fetch(`${apiBase}/${id}`, { method: 'DELETE' })),
    );
    await load();
    clearSelection();
  }

  const primary = fields[0];
  const summaryFields = fields.filter((f) => f.showInSummary);
  const detailFields = fields.filter((f) => f.showInDetailView);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#7a5520', fontWeight: 600, marginBottom: 6 }}>
          {category}
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000' }}>{title}</h2>
      </div>

      {/* 등록 폼 */}
      <div style={{ background: '#fff', border: '1px solid #000', borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a', marginBottom: 16 }}>{createLabel}</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridColumns ?? `repeat(${fields.length}, 1fr)`,
            gap: 12,
            marginBottom: 16,
          }}
        >
          {fields.map((f) => (
            <div key={f.key}>
              <label style={labelStyle}>
                {f.label} {f.required && '*'}
              </label>
              <input
                style={inputStyle}
                type={f.type === 'number' ? 'number' : 'text'}
                placeholder={f.placeholder ?? f.label}
                value={form[f.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button style={btnStyle('#000', '#fff')} onClick={handleCreate}>
          등록
        </button>
      </div>

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>}
        {!loading && items.length === 0 && <p style={{ fontSize: 13, color: '#000' }}>{emptyListText}</p>}
        <BulkActions
          total={items.length}
          selectedCount={selectedIds.size}
          allSelected={selectedIds.size === items.length && items.length > 0}
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDelete}
        />
        {items.map((item) => (
          <div
            key={item.id}
            style={{ background: '#fff', border: '1px solid #000', borderRadius: 10, overflow: 'hidden' }}
          >
            <div
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleSelect(item.id)}
                style={{ flexShrink: 0 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
                  {item[primary.key]}
                </span>
                {summaryFields.map((f) => (
                  <span key={f.key} style={{ fontSize: 13, fontWeight: 700, color: '#c9a96e' }}>
                    {f.summaryPrefix ?? ''}
                    {Number(item[f.key] ?? 0).toLocaleString()}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#000' }}>{expandedId === item.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === item.id && (
              <div style={{ borderTop: '1px solid #000', padding: '16px 20px', background: '#fff' }}>
                {editingId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: gridColumns ?? `repeat(${fields.length}, 1fr)`,
                        gap: 12,
                      }}
                    >
                      {fields.map((f) => (
                        <div key={f.key}>
                          <label style={labelStyle}>{f.label}</label>
                          <input
                            style={inputStyle}
                            type={f.type === 'number' ? 'number' : 'text'}
                            value={editForm[f.key]}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={btnStyle('#000', '#fff')} onClick={() => handleUpdate(item.id)}>
                        저장
                      </button>
                      <button style={btnStyle('#fff', '#000', '#000')} onClick={() => setEditingId(null)}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detailFields.map(
                      (f) =>
                        item[f.key] && (
                          <p key={f.key} style={{ fontSize: 13, color: '#000' }}>
                            {item[f.key]}
                          </p>
                        ),
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={btnStyle('#fff', '#3a1a2a', '#000')}
                        onClick={() => {
                          setEditingId(item.id);
                          setEditForm(
                            Object.fromEntries(
                              fields.map((f) => [f.key, item[f.key] != null ? String(item[f.key]) : '']),
                            ) as Record<string, string>,
                          );
                        }}
                      >
                        수정
                      </button>
                      <button style={btnStyle('#fff', '#e05555', '#fdd')} onClick={() => handleDelete(item.id)}>
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
