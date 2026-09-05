'use client';

import { useRouter } from 'next/navigation';

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length <= 1) {
      router.push('/packages');
    } else {
      router.back();
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '16px 0',
        fontSize: 13,
        color: '#000',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <ChevronLeftIcon />
      Back
    </button>
  );
}
