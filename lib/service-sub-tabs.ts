import type { SubTab } from '@/components/sub-tab-bar';

// Service 서브탭 — 헤더 Service 드롭다운과 짝을 이룸
// 콘텐츠 종류(What We Offer / Packages)와 지역(Jeju / Seoul)을 별개의 두 그룹으로 분리

export function contentSubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
  const jejuSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Jeju'
      : 'Photographers%20in%20Jeju';
  const seoulSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Seoul'
      : 'Photographers%20in%20Seoul';

  return [
    { label: 'Jeju', href: `/products?section=${jejuSection}` },
    { label: 'Seoul', href: `/products?section=${seoulSection}` },
  ];
}

// /service 페이지 전용 — 페이지 내 섹션 핀포인트 스크롤(About Us와 동일한 패턴) +
// 마지막 하나만 /packages로 이동하는 링크
export function offerSubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
  const suffix = brand === 'hype-snap' ? '?brand=hype-snap' : '';

  return [
    { label: 'Why Us', id: 'why-us' },
    { label: 'Service Details', id: 'service-details' },
    { label: 'Shoot Timeline', id: 'shoot-timeline' },
    { label: 'Packages', href: `/packages${suffix}` },
  ];
}

export function regionSubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
  const jejuSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Jeju'
      : 'Photographers%20in%20Jeju';
  const seoulSection =
    brand === 'hype-snap'
      ? 'Casual%20Photoshoot%20in%20Seoul'
      : 'Photographers%20in%20Seoul';

  return [
    { label: 'Jeju', href: `/products?section=${jejuSection}` },
    { label: 'Seoul', href: `/products?section=${seoulSection}` },
  ];
}
