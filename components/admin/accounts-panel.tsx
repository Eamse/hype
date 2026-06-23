'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import type { Account } from './types';

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    loginId: '',
    name: '',
    phone: '',
    role: 'manager',
    isActive: true,
    password: '',
  });

  useEffect(() => {
    fetch('/api/admin/accounts')
      .then((res) => res.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }
    // 목록 새로고침
    const updated = await fetch('/api/admin/accounts').then((r) => r.json());
    setAccounts(Array.isArray(updated) ? updated : []);
    setForm({ loginId: '', name: '', phone: '', role: 'manager', isActive: true, password: '' });
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제할까요?')) return;
    const res = await fetch(`/api/admin/accounts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#7a5520', fontWeight: 600, marginBottom: 6 }}>
          SETTINGS
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          Account Setting
        </h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Manage admin accounts.
        </p>
      </div>

      {/* 생성 폼 */}
      <div style={{ background: '#fff', border: '1px solid #ede8de', borderRadius: 16, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Create Account</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={labelStyle}>Login ID</label>
            <input style={inputStyle} value={form.loginId} onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select style={{ ...inputStyle }} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="manager">Manager</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1a1a1a', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
              Active
            </label>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleCreate} style={btnStyle('#191919', '#fff')}>
            Create
          </button>
        </div>
      </div>

      {/* 계정 목록 */}
      <div style={{ background: '#fff', border: '1px solid #ede8de', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f2ec' }}>
          <p style={{ fontSize: 11, color: '#7a5520', fontWeight: 700, letterSpacing: '2px' }}>
            ACCOUNTS
            <span style={{ fontSize: 13, fontWeight: 400, color: '#999', marginLeft: 8 }}>
              {accounts.length}명
            </span>
          </p>
        </div>
        {loading ? (
          <p style={{ color: '#999', fontSize: 14, padding: 24 }}>불러오는 중...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#faf7f2' }}>
                  {['Login ID', 'Name', 'Phone', 'Role', 'Active', 'Joined At', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #f5f2ec' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1a1a1a' }}>{a.loginId}</td>
                    <td style={{ padding: '14px 16px', color: '#1a1a1a' }}>{a.name}</td>
                    <td style={{ padding: '14px 16px', color: '#1a1a1a' }}>{a.phone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: a.role === 'master' ? '#fff3e0' : '#e8f0fe',
                        color: a.role === 'master' ? '#e65100' : '#1a73e8',
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      }}>
                        {a.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: a.isActive ? '#e8f5e9' : '#fce4ec',
                        color: a.isActive ? '#2e7d32' : '#c62828',
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      }}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#999', whiteSpace: 'nowrap' }}>
                      {new Date(a.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleDelete(a.id)} style={btnStyle('#fff', '#e05555', '#e05555')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
