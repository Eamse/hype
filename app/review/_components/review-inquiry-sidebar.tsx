'use client';

import Image from 'next/image';
import Link from 'next/link';

const WHATSAPP_URL = 'http://Wa.me/+821062695990';
const WECHAT_URL = 'https://u.wechat.com/kAo3Jp9jOyXemuB2BBeo6Vc?s=2';
const LINE_URL = 'https://line.me/ti/p/MxawLJXY5t';

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
      <h2
        style={{
          fontSize: 20,
          fontWeight: 800,
          fontStyle: 'italic',
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        Start your inquiry
      </h2>
      <p
        style={{
          fontSize: 13,
          color: '#cfe3d8',
          margin: '0 0 16px',
          textAlign: 'center',
        }}
      >
        We&apos;ll be in touch within 1–2 business days.
      </p>
      <Link
        href="/inquiry"
        style={{
          display: 'block',
          textAlign: 'center',
          background: '#fff',
          color: '#2d5a45',
          borderRadius: 8,
          padding: '10px 0',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Submit
      </Link>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.25)',
          margin: '20px 0 14px',
        }}
      />
      <p
        style={{
          fontSize: 12,
          color: '#cfe3d8',
          margin: '0 0 10px',
          textAlign: 'center',
        }}
      >
        Or contact us directly
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ContactButton
          href={WHATSAPP_URL}
          label="Whatsapp"
          icon="/icons/sns/whatsapp.svg"
        />
        <ContactButton
          href={WECHAT_URL}
          label="Wechat"
          icon="/icons/sns/wechat.svg"
        />
        <ContactButton
          href={LINE_URL}
          label="Line"
          icon="/icons/sns/line.png"
        />
      </div>
    </div>
  );
}

function ContactButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
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
      <Image src={icon} alt="" width={16} height={16} />
      {label}
    </a>
  );
}
