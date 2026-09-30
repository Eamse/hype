const ALLOWED_SECTIONS = new Set([
    'Photographers in Jeju',
    'Photographers in Seoul',
    'Casual Photoshoot in Jeju',
    'Casual Photoshoot in Seoul',
]);
const ALLOWED_PARTNER_ROLES = new Set(['hmu', 'dress', 'suit', 'bouquet', 'videographer']);

export interface FullPackageImageInput {
    originalUrl: string;
    thumbUrl?: string | null;
    blurDataUrl?: string | null;
    order: number;
}

export interface FullAddonInput {
    displayName: string;
    price: number;
    desc?: string | null;
    order: number;
}

export interface FullInclusionInput {
    name: string;
    order: number;
}

export interface FullPartnerInput {
    role: string;
    displayName: string;
    instagramHandles: string[];
    order: number;
}

export interface FullPackageInput {
    name: string;
    isSinglePrice: boolean;
    priceSNS: number;
    priceNoSNS: number;
    shootingTime: string;
    shootingTimeDetail?: string | null;
    locations: string;
    locationsDetail?: string | null;
    originalPhotos: string;
    originalPhotosDetail?: string | null;
    retouched: number;
    retouchedDetail?: string | null;
    order: number;
    images: FullPackageImageInput[];
    addons: FullAddonInput[];
    inclusions: FullInclusionInput[];
    partners: FullPartnerInput[];
}

export interface FullDirectorInput {
    number: string;
    name: string;
    instagram?: string | null;
    location: string;
    category: string;
    order: number;
    packages: FullPackageInput[];
}

export interface FullProductInput {
    section: string;
    title: string;
    imageUrl?: string | null;
    directors: FullDirectorInput[];
}

export function validateFullProductInput(body: unknown): { error: string } | { data: FullProductInput } {
    if (typeof body !== 'object' || body === null) {
        return { error: 'Invalid request body' };
    }
    const b = body as Record<string, unknown>;
    if (typeof b.section !== 'string' || !ALLOWED_SECTIONS.has(b.section)) {
        return { error: 'Invalid section' };
    }
    if (typeof b.title !== 'string' || !b.title.trim()) {
        return { error: 'title is required' };
    }
    if (!Array.isArray(b.directors) || b.directors.length === 0) {
        return { error: 'At least one director is required' };
    }
    for (const dir of b.directors) {
        if (typeof dir !== 'object' || dir === null) {
            return { error: 'Invalid director' };
        }
        const d = dir as Record<string, unknown>;
        if (typeof d.number !== 'string' || !d.number.trim()) {
            return { error: 'Director number is required' };
        }
        if (typeof d.name !== 'string' || !d.name.trim()) {
            return { error: 'Director name is required' };
        }
        if (!Array.isArray(d.packages) || d.packages.length === 0) {
            return { error: 'Each director needs at least one package' };
        }
        for (const pkg of d.packages) {
            if (typeof pkg !== 'object' || pkg === null) {
                return { error: 'Invalid package' };
            }
            const p = pkg as Record<string, unknown>;
            if (typeof p.name !== 'string' || !p.name.trim()) {
                return { error: 'Package name is required' };
            }
            if (typeof p.priceSNS !== 'number' || typeof p.priceNoSNS !== 'number') {
                return { error: 'Package prices must be numbers' };
            }
            for (const partner of (Array.isArray(p.partners) ? p.partners : [])) {
                const role = (partner as Record<string, unknown>)?.role;
                if (typeof role !== 'string' || !ALLOWED_PARTNER_ROLES.has(role)) {
                    return { error: `Invalid partner role: ${String(role)}` };
                }
            }
        }
    }
    return { data: b as unknown as FullProductInput };
}
