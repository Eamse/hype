'use client';

import Link from 'next/link';

const WHATSAPP_URL = '#';
const WECHAT_URL = '#';
const LINE_URL = '#';

export default function ReviewInquirySidebar() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 100,
        background: '#2d5a45',
        padding: 24,
        color: '#fff',
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 800, fontStyle: 'italic', margin: '0 0 8px' }}>
        Start your inquiry
      </h2>
      <p style={{ fontSize: 13, color: '#cfe3d8', margin: '0 0 16px' }}>
        We&apos;ll be in touch within 1–2 business days.
      </p>
      <Link
        href="/inquiry"
        style={{
          display: 'block',
          textAlign: 'center',
          background: '#fff',
          color: '#2d5a45',
          borderRadius: 999,
          padding: '10px 0',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Submit
      </Link>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', margin: '20px 0 14px' }} />
      <p style={{ fontSize: 12, color: '#cfe3d8', margin: '0 0 10px' }}>Or contact us directly</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ContactButton href={WHATSAPP_URL} label="Whatsapp" />
        <ContactButton href={WECHAT_URL} label="Wechat" />
        <ContactButton href={LINE_URL} label="Line" />
      </div>
    </div>
  );
}

function ContactButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 8,
        padding: '9px 0',
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        textDecoration: 'none',
      }}
    >
      {label}
    </a>
  );
}
