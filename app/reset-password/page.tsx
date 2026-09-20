'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') ?? '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Something went wrong.');
                return;
            }
            setDone(true);
            setTimeout(() => router.push('/'), 2000);
        }
        finally {
            setSubmitting(false);
        }
    }

    if (!token) {
        return (<div style={{ maxWidth: 400, margin: '0 auto', padding: '120px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#666' }}>Invalid or missing reset link.</p>
      </div>);
    }

    return (<div style={{ maxWidth: 400, margin: '0 auto', padding: '120px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Set a new password
      </h1>

      {done ? (<p style={{ fontSize: 14, color: '#166534', marginTop: 16 }}>
          Password updated. Redirecting you home...
        </p>) : (<form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                marginBottom: 10,
            }}/>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 14,
                marginBottom: 12,
            }}/>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
            At least 8 characters, including uppercase, lowercase, a number, and a special character.
          </p>
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
            {submitting ? 'Saving...' : 'Save New Password'}
          </button>
        </form>)}
    </div>);
}

export default function ResetPasswordPage() {
    return (<Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>);
}
