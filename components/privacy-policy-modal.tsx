'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PrivacyPolicyContent from '@/components/privacy-policy-content';
export default function PrivacyPolicyModal({ onClose, }: {
    onClose: () => void;
}) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);
    return createPortal(<div onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
      <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 640,
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #eee',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Privacy Policy</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            fontSize: 20,
            lineHeight: 1,
            color: '#888',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
        }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>, document.body);
}
