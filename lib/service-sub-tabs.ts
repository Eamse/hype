import type { SubTab } from '@/components/sub-tab-bar';

// Service 서브탭 — 헤더 Service 드롭다운과 짝을 이룸
export function serviceSubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
  const suffix = brand === 'hype-snap' ? '?brand=hype-snap' : '';
  const jejuSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Jeju'
      : 'Photographers%20in%20Jeju';
  const seoulSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Seoul'
      : 'Photographers%20in%20Seoul';

  return [
    { label: 'What We Offer', href: `/offer${suffix}` },
    // { label: 'Packages', href: `/packages${suffix}` },
    { label: 'Jeju', href: `/products?section=${jejuSection}` },
    { label: 'Seoul', href: `/products?section=${seoulSection}` },
  ];
}
