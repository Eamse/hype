'use client';

import { useState } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';

export default function MyAccountPanel() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/admin/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to change password.');
      return;
    }
    alert('Password changed successfully.');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#5a5a5a', fontWeight: 600, marginBottom: 6 }}>
          MY ACCOUNT
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000', letterSpacing: '-0.3px' }}>
          Change Password
        </h2>
        <p style={{ fontSize: 12, color: '#000', marginTop: 4 }}>
          After changing your password, you will be logged out automatically.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #000', borderRadius: 16, padding: 24, maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              style={inputStyle}
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              style={inputStyle}
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              style={inputStyle}
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: '#7f7f7f' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={handleSubmit} disabled={loading} style={btnStyle('#000', '#fff')}>
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
