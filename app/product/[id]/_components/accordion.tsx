'use client';

import { useState } from 'react';

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid #e8e8e8' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', fontSize: 14, fontWeight: 500, color: '#191919', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {title}
        <ChevronDownIcon open={open} />
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 13, color: '#666', lineHeight: 1.8 }}>
          {children}
        </div>
      )}
    </div>
  );
}
