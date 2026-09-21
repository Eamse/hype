'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<'sent' | 'googleOnly' | null>(null);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
                return;
            }
            setResult(data.googleOnly ? 'googleOnly' : 'sent');
        }
        finally {
            setSubmitting(false);
        }
    }

    return (<div style={{ maxWidth: 400, margin: '0 auto', padding: '120px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Forgot your password?
      </h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {result === 'sent' && (<p style={{ fontSize: 14, color: '#166534' }}>
          If an account exists for this email, a reset link has been sent.
        </p>)}
      {result === 'googleOnly' && (<p style={{ fontSize: 14, color: '#333' }}>
          This email is registered with Google login. Please sign in with Google instead.
        </p>)}

      {!result && (<form onSubmit={handleSubmit}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                marginBottom: 12,
            }}/>
          {error && (<p style={{ fontSize: 13, color: '#d33', marginBottom: 12 }}>{error}</p>)}
          <button type="submit" disabled={submitting} style={{
                width: '100%',
                padding: '12px 0',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
            }}>
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>)}
    </div>);
}
