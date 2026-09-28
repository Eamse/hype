import React from 'react';
export type Product = {
    id: number;
    section: string;
    title: string;
    imageUrl: string | null;
    images: {
        id: number;
        url: string;
        order: number;
        thumbUrl: string | null;
    }[];
    order: number;
};
export type Section = 'dashboard' | 'hero-wedding' | 'hero-snap' | 'Photographers' | 'Casual Photoshoot' | 'users' | 'accounts' | 'my-account' | 'audit-log';
export type Account = {
    id: string;
    loginId: string;
    name: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    locked: boolean;
};
export const INCLUSIONS = [
    '1 hour photoshoot session',
    '20 edited digital photos',
];
export function btnStyle(bg: string, color: string, border?: string): React.CSSProperties {
    const isPrimary = bg === '#000';
    return {
        padding: '7px 14px',
        borderRadius: 3,
        fontSize: 12,
        fontWeight: 600,
        background: isPrimary ? '#000' : bg,
        color: isPrimary ? '#fff' : color,
        cursor: 'pointer',
        border: border ? `1px solid ${border}` : isPrimary ? 'none' : '1px solid #ccc',
        whiteSpace: 'nowrap' as const,
        letterSpacing: '0.2px',
    };
}
export const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    color: '#888',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};
export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 3,
    border: '1px solid #ccc',
    fontSize: 13,
    outline: 'none',
    color: '#000',
    backgroundColor: '#fff',
};
export function isProductArray(data: unknown): data is Product[] {
    return (Array.isArray(data) &&
        data.every((item) => typeof item === 'object' &&
            item !== null &&
            typeof (item as Record<string, unknown>).id === 'number' &&
            typeof (item as Record<string, unknown>).title === 'string'));
}
