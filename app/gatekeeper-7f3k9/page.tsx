'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_PANEL_PATH } from '@/lib/admin-paths';

export default function AdminSignIn() {
  const router = useRouter();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'id' | 'pw' | null>(null);
  const [btnHover, setBtnHover] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginId || !password) return;
    const result = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    });
    if (!result.ok) {
      if (result.status === 429) {
        setErrors('Too many attempts. Please try again later.');
      } else {
        setErrors('Please check your ID and password.');
      }
    } else {
      router.push(ADMIN_PANEL_PATH);
    }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    padding: '13px 16px',
    border: `1px solid ${focused ? '#c9956a' : '#4a2e20'}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    color: '#fff',
    backgroundColor: '#3a2018',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focused ? '0 0 0 3px rgba(184,134,90,0.18)' : 'none',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        ::placeholder { color: #6a4a38; }
      `}</style>

      {/* 카드 */}
      <div
        style={{
          position: 'relative',
          width: 400,
          borderRadius: 20,
          padding: '48px 36px',
          border: '1px solid rgba(184,134,90,0.3)',
          boxShadow:
            '0 24px 64px rgba(80,20,10,0.3), inset 0 1px 0 rgba(184,134,90,0.15)',
          backgroundColor: '#2c1a14',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}
      >
        {/* 카드 상단 로즈골드 라인 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #c9956a, #e8b88a, #c9956a, transparent)',
          }}
        />

        {/* 데코 라인 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(to right, transparent, #b8865a)',
            }}
          />
          <p
            style={{
              fontSize: 9,
              letterSpacing: '4px',
              color: '#b8865a',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            HYPE WEDDING
          </p>
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(to left, transparent, #b8865a)',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 300,
            color: '#fff',
            marginBottom: 8,
            letterSpacing: '0.5px',
          }}
        >
          Welcome Back
        </h1>
        <p style={{ fontSize: 12, color: '#7a5a4a', marginBottom: 32 }}>
          Admin Portal
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="text"
            value={loginId}
            placeholder="ID"
            onChange={(e) => setLoginId(e.target.value)}
            onFocus={() => setFocusedInput('id')}
            onBlur={() => setFocusedInput(null)}
            style={inputStyle(focusedInput === 'id')}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput('pw')}
            onBlur={() => setFocusedInput(null)}
            style={inputStyle(focusedInput === 'pw')}
          />
          {errors && (
            <p style={{ fontSize: 12, color: '#f87171', margin: '2px 0 0' }}>
              {errors}
            </p>
          )}
          <button
            type="submit"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              marginTop: 10,
              padding: '14px',
              background: btnHover
                ? 'linear-gradient(135deg, #dba878, #c9956a)'
                : 'linear-gradient(135deg, #c9956a, #b8865a)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
              transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: btnHover
                ? '0 8px 20px rgba(184,134,90,0.4)'
                : '0 4px 12px rgba(184,134,90,0.2)',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
