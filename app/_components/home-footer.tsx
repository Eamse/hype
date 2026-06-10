'use client';

import { useState } from 'react';

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function HomeFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer
      style={{
        borderTop: '1px solid #e8e8e8',
        padding: '24px 20px',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <button
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#191919',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Terms of Service
          </button>
          <button
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#191919',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Privacy Policy
          </button>
          <button
            style={{
              fontSize: 12,
              color: '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Brand Partnership
          </button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: '#888',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Name A Corp. Business Info
          <ChevronDownIcon open={open} />
        </button>

        {open && (
          <div
            style={{
              fontSize: 11,
              color: '#aaa',
              lineHeight: 1.9,
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <p>CEO: Kim Do-hee &nbsp;|&nbsp; Business Reg: 807-81-03218</p>
            <p>Address: 1037 Cheonho-daero, Gangdong-gu, Seoul, 9F</p>
            <p>
              Support: 02-6104-2387 / 010-3597-4222 &nbsp;|&nbsp;
              cs@hypewedding.com
            </p>
            <p>Hours: Weekdays 10:00 – 18:00 (Closed weekends & holidays)</p>
          </div>
        )}

        <p style={{ fontSize: 11, color: '#ccc', marginTop: 16 }}>
          © 2024 Name A Corp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
