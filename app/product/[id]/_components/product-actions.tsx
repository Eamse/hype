'use client';
import { useRouter } from 'next/navigation';
export function BackButton() {
    const router = useRouter();
    function handleBack() {
        if (window.history.length <= 1) {
            router.push('/packages');
        }
        else {
            router.back();
        }
    }
    return (<button onClick={handleBack} className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-[#666] no-underline hover:text-[#111]" style={{
            padding: '16px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
        }}>
      ← Back
    </button>);
}
