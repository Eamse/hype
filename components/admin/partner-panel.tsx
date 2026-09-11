'use client';
import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';
type Partner = {
    id: number;
    role: string;
    name: string;
    displayName: string | null;
    instagramAccounts: { id: number; handle: string; order: number }[];
};
const ROLE_LABELS: Record<string, string> = {
    hmu: '헤어 & 메이크업',
    dress: '드레스',
    suit: '수트',
    bouquet: '부케',
    videographer: '영상작가',
};
type Form = { name: string; displayName: string; instagramHandles: string[] };
const emptyForm: Form = { name: '', displayName: '', instagramHandles: [''] };
function HandleListEditor({ handles, onChange }: {
    handles: string[];
    onChange: (handles: string[]) => void;
}) {
    return (<div>
      <label style={labelStyle}>인스타그램 (여러 개 등록 가능)</label>
      <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px' }}>
        @handle 형식으로만 입력하세요 (예: @k__salon). URL 전체를 넣지 않아도 자동으로 링크가 연결됩니다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {handles.map((h, i) => (<div key={i} style={{ display: 'flex', gap: 6 }}>
            <input style={inputStyle} placeholder="@instagram" value={h} onChange={(e) => {
                const next = [...handles];
                next[i] = e.target.value;
                onChange(next);
            }}/>
            <button type="button" style={btnStyle('#fff', '#7f7f7f', '#e7e7e7')} onClick={() => onChange(handles.filter((_, idx) => idx !== i))}>
              삭제
            </button>
          </div>))}
        <button type="button" style={btnStyle('#fff', '#252525', '#000')} onClick={() => onChange([...handles, ''])}>
          + 계정 추가
        </button>
      </div>
    </div>);
}
export default function PartnerPanel({ role }: {
    role: 'hmu' | 'dress' | 'suit' | 'bouquet' | 'videographer';
}) {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Form>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Form>(emptyForm);
    async function load() {
        const data = await fetch(`/api/admin/partners?role=${role}`).then((r) => r.json());
        setPartners(Array.isArray(data) ? data : []);
    }
    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [role]);
    async function handleCreate() {
        if (!form.name.trim()) {
            alert('관리명은 필수입니다.');
            return;
        }
        const res = await fetch('/api/admin/partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, name: form.name, displayName: form.displayName || null, instagramHandles: form.instagramHandles }),
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
            body: JSON.stringify({ name: editForm.name, displayName: editForm.displayName || null, instagramHandles: editForm.instagramHandles }),
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
        if (!confirm('삭제할까요?'))
            return;
        const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            alert((await res.json()).error);
            return;
        }
        setPartners((prev) => prev.filter((p) => p.id !== id));
    }
    const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(partners);
    async function handleBulkDelete() {
        await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })));
        await load();
        clearSelection();
    }
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#5a5a5a', fontWeight: 600, marginBottom: 6 }}>
          WEDDING
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000' }}>{ROLE_LABELS[role]} 관리</h2>
      </div>


      <div style={{ background: '#fff', border: '1px solid #000', borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#252525', marginBottom: 16 }}>새 등록</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>관리명 * (같은 이름끼리 구분할 땐 "버전 1"처럼 붙여서 등록)</label>
            <input style={inputStyle} placeholder="샵 이름" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}/>
          </div>
          <div>
            <label style={labelStyle}>공개 표시명 (비워두면 관리명 그대로 노출)</label>
            <input style={inputStyle} placeholder="고객 화면에 노출될 이름" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}/>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <HandleListEditor handles={form.instagramHandles} onChange={(instagramHandles) => setForm((f) => ({ ...f, instagramHandles }))}/>
          </div>
        </div>
        <button style={btnStyle('#000', '#fff')} onClick={handleCreate}>등록</button>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>}
        {!loading && partners.length === 0 && (<p style={{ fontSize: 13, color: '#000' }}>등록된 항목이 없습니다.</p>)}
        <BulkActions total={partners.length} selectedCount={selectedIds.size} allSelected={selectedIds.size === partners.length && partners.length > 0} onToggleAll={toggleAll} onDeleteSelected={handleBulkDelete}/>
        {partners.map((p) => (<div key={p.id} style={{ background: '#fff', border: '1px solid #000', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} style={{ flexShrink: 0, marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
            {editingId === p.id ? (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>관리명</label>
                  <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="관리명"/>
                </div>
                <div>
                  <label style={labelStyle}>공개 표시명</label>
                  <input style={inputStyle} value={editForm.displayName} onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="공개 표시명"/>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <HandleListEditor handles={editForm.instagramHandles} onChange={(instagramHandles) => setEditForm((f) => ({ ...f, instagramHandles }))}/>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button style={btnStyle('#000', '#fff')} onClick={() => handleUpdate(p.id)}>저장</button>
                  <button style={btnStyle('#fff', '#000', '#000')} onClick={() => setEditingId(null)}>취소</button>
                </div>
              </div>) : (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{p.name}</span>
                  {p.displayName && p.displayName !== p.name && (<span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                      (공개: {p.displayName})
                    </span>)}
                  {p.instagramAccounts.length > 0 && (<span style={{ fontSize: 12, color: '#000', marginLeft: 10 }}>
                      {p.instagramAccounts.map((a) => a.handle).join(' / ')}
                    </span>)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btnStyle('#fff', '#252525', '#000')} onClick={() => {
                    setEditingId(p.id);
                    setEditForm({
                        name: p.name,
                        displayName: p.displayName ?? '',
                        instagramHandles: p.instagramAccounts.length > 0 ? p.instagramAccounts.map((a) => a.handle) : [''],
                    });
                }}>수정</button>
                  <button style={btnStyle('#fff', '#7f7f7f', '#e7e7e7')} onClick={() => handleDelete(p.id)}>삭제</button>
                </div>
              </div>)}
            </div>
          </div>))}
      </div>
    </div>);
}
