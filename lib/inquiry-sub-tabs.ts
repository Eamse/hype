import type { SubTab } from '@/components/sub-tab-bar';
export function inquirySubTabs(brand: 'hype-wedding' | 'hype-snap'): SubTab[] {
    const suffix = brand === 'hype-snap' ? '?brand=hype-snap' : '';
    return [
        { label: 'Inquiry', href: `/inquiry${suffix}` },
        { label: 'Booking Process', href: `/booking-process${suffix}` },
        { label: 'FAQ', href: `/faq${suffix}` },
        { label: 'Partnership', href: `/partnership${suffix}` },
    ];
}
