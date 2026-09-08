'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PrivacyPolicyModal from '@/components/privacy-policy-modal';

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();

  return (
    <footer
      style={{
        borderTop: '1px solid silver',
        padding: '24px 40px',
        backgroundColor: '#fff',
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <button
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setShowPrivacyModal(true)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => router.push('/partnership')}
            style={{
              fontSize: 12,
              color: '#000',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Brand Partnership
          </button>
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#000',
            lineHeight: 1.9,
            marginTop: 10,
            paddingTop: 10,
          }}
        >
          <p>HYPE &nbsp;|&nbsp; CEO: Minju Lee, Saeyoung Lee</p>
          <p>Business Reg: 722-46-01107</p>
          <p>Email: hypepig227@gmail.com</p>
          <p>
            Address: 36 Dongtanjungsimsangga 1-gil, Dongtan-gu, Hwaseong-si,
            Gyeonggi-do, Republic of Korea
          </p>
        </div>
      </div>

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </footer>
  );
}
