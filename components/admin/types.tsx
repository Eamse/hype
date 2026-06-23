import React from 'react';

export type Product = {
  id: number;
  section: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  images: { id: number; url: string; order: number }[];
  order: number;
  description: string | null;
  inclusions: string[];
};

export type Section =
  | 'dashboard'
  | 'hero'
  | 'Meet our Photographers in Jeju'
  | 'Meet our Photographer in Seoul'
  | 'Casual Photoshoot in Jeju'
  | 'Casual Photoshoot in Seoul'
  | 'Magazine'
  | 'users';

export type Magazine = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  images: Magazine[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export const INCLUSIONS = [
  '1 hour photoshoot session',
  '20 edited digital photos',
];

export function btnStyle(
  bg: string,
  color: string,
  border?: string,
): React.CSSProperties {
  const isPrimary = bg === '#191919';
  return {
    padding: '8px 18px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    background: isPrimary ? 'linear-gradient(135deg, #c9a96e, #b8965a)' : bg,
    color: isPrimary ? '#fff' : color,
    cursor: 'pointer',
    fontFamily: 'inherit',
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap' as const,
    boxShadow: isPrimary ? '0 2px 8px rgba(201,169,110,0.3)' : 'none',
    letterSpacing: '0.3px',
  };
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  color: '#c9a96e',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e8e0d0',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#1a1a1a',
  backgroundColor: '#fdfcfa',
};

export function isProductArray(data: unknown): data is Product[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === 'number' &&
        typeof (item as Record<string, unknown>).title === 'string',
    )
  );
}
