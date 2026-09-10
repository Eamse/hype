import type { SubTab } from '@/components/sub-tab-bar';
export function contentSubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
    const jejuSection = brand === 'hype-snap'
        ? 'Casual%20Photoshoot%20in%20Jeju'
        : 'Photographers%20in%20Jeju';
    const seoulSection = brand === 'hype-snap'
        ? 'Casual%20Photoshoot%20in%20Seoul'
        : 'Photographers%20in%20Seoul';
    return [
        { label: 'Jeju', href: `/products?section=${jejuSection}` },
        { label: 'Seoul', href: `/products?section=${seoulSection}` },
    ];
}
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
    const jejuSection = brand === 'hype-snap'
        ? 'Casual%20Photoshoot%20in%20Jeju'
        : 'Photographers%20in%20Jeju';
    const seoulSection = brand === 'hype-snap'
        ? 'Casual%20Photoshoot%20in%20Seoul'
        : 'Photographers%20in%20Seoul';
    return [
        { label: 'Jeju', href: `/products?section=${jejuSection}` },
        { label: 'Seoul', href: `/products?section=${seoulSection}` },
    ];
}
