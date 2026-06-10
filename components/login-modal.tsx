'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (!result?.ok) {
      setError('Please check your ID and password.');
    } else {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10,10,10,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          //   borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
      >
        {/* ── 상단 다크 헤더 ── */}
        <div
          style={{
            backgroundColor: '#111',
            padding: '36px 40px 32px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          <p
            style={{
              fontSize: 10,
              letterSpacing: '4px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            HYPE WEDDING & HYPE SNAP
          </p>

          {/* 장식선 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            />
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
              }}
            />
            <div
              style={{
                width: 32,
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '2px',
              //   textTransform: 'uppercase',
            }}
          >
            Welcome Back
          </h1>
        </div>

        {/* ── 하단 폼 영역 ── */}
        <div style={{ backgroundColor: '#fafafa', padding: '36px 40px 40px' }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 16px',
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'transparent',
                fontSize: 14,
                color: '#191919',
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 16px',
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'transparent',
                fontSize: 14,
                color: '#191919',
                outline: 'none',
              }}
            />

            {error && (
              <p
                style={{
                  fontSize: 12,
                  color: '#e53e3e',
                  textAlign: 'center',
                  marginTop: -4,
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '13px 0',
                  backgroundColor: loading ? '#999' : '#111',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '...' : 'Sign In'}
              </button>
              <a
                href="/signup"
                type="button"
                style={{
                  flex: 1,
                  padding: '13px 0',
                  backgroundColor: 'transparent',
                  color: '#111',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Sign Up
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '8px 0',
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: '#e8e8e8' }} />
              <span
                style={{ fontSize: 11, color: '#ccc', letterSpacing: '2px' }}
              >
                OR
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e8e8e8' }} />
            </div>

            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              style={{
                width: '100%',
                padding: '13px 0',
                backgroundColor: '#fff',
                color: '#444',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
