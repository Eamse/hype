import type { SubTab } from '@/components/sub-tab-bar';

// Inquiry/FAQ/Partnership 페이지 공용 서브탭 — 헤더 Inquiry 드롭다운과 짝을 이룸
export function inquirySubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
  const suffix = brand === 'hype-snap' ? '?brand=hype-snap' : '';
  return [
    { label: 'Inquiry', href: `/inquiry${suffix}` },
    { label: 'Booking Process', href: `/booking-process${suffix}` },
    { label: 'FAQ', href: `/faq${suffix}` },
    { label: 'Partnership', href: `/partnership${suffix}` },
  ];
}
