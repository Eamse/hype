'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const success = status === 'success';
    return (<div style={{ maxWidth: 420, margin: '0 auto', padding: '120px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        {success ? 'Sign up complete!' : 'Verification failed'}
      </h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        {success
            ? 'Your email has been verified and your account is ready. You can now sign in.'
            : 'This verification link is invalid or has expired.'}
      </p>
      <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: '#000',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
        }}>
        Go to Home
      </Link>
    </div>);
}

export default function VerifyEmailPage() {
    return (<Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>);
}
