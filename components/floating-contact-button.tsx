'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
const WHATSAPP_URL = 'http://Wa.me/+821062695990';
const WECHAT_URL = 'https://u.wechat.com/kAo3Jp9jOyXemuB2BBeo6Vc?s=2';
const LINE_URL = 'https://line.me/ti/p/MxawLJXY5t';
export default function FloatingContactButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith('/gatekeeper-7f3k9')) return null;
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 65, zIndex: 9999 }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 72,
            width: 280,
            maxWidth: 'calc(100vw - 40px)',
            background: '#2d5a45',
            color: '#fff',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}
        >
          <h2
            style={{
              fontSize: 18,
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
              fontSize: 12,
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
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '문의 카드 닫기' : '문의 카드 열기'}
        style={{
          width: 65,
          height: 65,
          borderRadius: '24px',
          background: '#2d5a45',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {open ? (
          <X size={24} />
        ) : (
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              lineHeight: 1.2,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span>1:1</span>
            <span>CHAT</span>
          </span>
        )}
      </button>
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
